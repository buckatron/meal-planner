from pathlib import Path
from typing import List

import os
import random

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq

from meal_service import (
    load_meals,
    generate_plan,
    filter_meals,
    generate_shopping_list,
    suggest_meals,
    append_meals_to_csv,
)
from models import (
    Meal,
    PlanRequest,
    PlanResponse,
    PlanItem,
    RerollRequest,
    ShoppingListRequest,
    ShoppingListResponse,
    SuggestRequest,
    SuggestResponse,
    AppendMealsRequest,
    AppendMealsResponse,
    CsvMeal,
)


load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

app = FastAPI(title="Meal Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


DATA_PATH = Path(__file__).parent / "data" / "mealRepo.csv"
MEALS: List[Meal] = load_meals(DATA_PATH)

groq_client: Groq | None = None
if GROQ_API_KEY:
    groq_client = Groq(api_key=GROQ_API_KEY)


@app.get("/meals", response_model=List[Meal])
async def get_meals(energy: str | None = Query(default=None)):
    """
    Return all meals, optionally filtered by a single energy level.
    Example: /meals?energy=Low
    """
    if energy:
        return filter_meals(MEALS, [energy])
    return MEALS


@app.post("/plan", response_model=PlanResponse)
async def create_plan(request: PlanRequest) -> PlanResponse:
    """
    Generate an N‑day meal plan with no repeats.
    If not enough meals are available after filtering, return as many as possible and include a warning.
    """
    plan_meals, overlap_fallback_used = generate_plan(
        MEALS, request.days, request.energy_filter
    )

    warnings: list[str] = []
    if len(plan_meals) < request.days:
        warnings.append(
            f"Only {len(plan_meals)} meals available for the selected filters "
            f"(requested {request.days} days)."
        )
    if overlap_fallback_used:
        warnings.append(
            "Not enough meals to guarantee ingredient overlap — some meals selected randomly."
        )

    warning_text = " ".join(warnings) if warnings else None

    plan_items = [
        PlanItem(day=index + 1, meal=meal) for index, meal in enumerate(plan_meals)
    ]

    return PlanResponse(plan=plan_items, warning=warning_text)


@app.post("/reroll", response_model=Meal)
async def reroll(request: RerollRequest) -> Meal:
    """
    Return a single random meal that:
    - Matches the requested energy filter (if any)
    - Is not in the exclude_meals list
    """
    candidates = filter_meals(MEALS, request.energy_filter)
    exclude = {name.lower() for name in request.exclude_meals}
    candidates = [m for m in candidates if m.name.lower() not in exclude]

    if not candidates:
        raise HTTPException(
            status_code=400,
            detail="No meals available for reroll with the given constraints.",
        )

    return random.choice(candidates)


@app.post("/shopping-list", response_model=ShoppingListResponse)
async def shopping_list(request: ShoppingListRequest) -> ShoppingListResponse:
    """
    Build a consolidated shopping list for the given meals and servings.
    """
    requested_names = {name.lower() for name in request.meal_names}
    selected_meals = [m for m in MEALS if m.name.lower() in requested_names]

    grouped = generate_shopping_list(selected_meals, request.servings)
    return ShoppingListResponse(**grouped)


@app.post("/suggest", response_model=SuggestResponse)
async def suggest(request: SuggestRequest) -> SuggestResponse:
    """
    Use Groq to suggest new meals in the CSV schema.
    """
    if not GROQ_API_KEY or groq_client is None:
        raise HTTPException(
            status_code=401, detail="Groq API key not configured."
        )

    count = request.count or 5
    count = max(1, min(count, 10))

    # Always load from CSV so we have the latest meals.
    existing_meals = load_meals(DATA_PATH)
    existing_names = [m.name for m in existing_meals]

    try:
        raw_meals = suggest_meals(
            client=groq_client,
            count=count,
            existing_names=existing_names,
            prompt=request.prompt or "",
            energy_filter=request.energy_filter or "",
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=500,
            detail="AI returned an unexpected format. Please try again.",
        ) from exc
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(
            status_code=500,
            detail="Unable to generate meal suggestions right now.",
        ) from exc

    # Validate via CsvMeal model.
    meals = [CsvMeal(**item) for item in raw_meals]

    return SuggestResponse(suggested=meals, warning=None)


@app.post("/meals/append", response_model=AppendMealsResponse)
async def append_meals(request: AppendMealsRequest) -> AppendMealsResponse:
    """
    Append confirmed meals to the CSV file, skipping duplicates by MealName.
    """
    appended, skipped, total = append_meals_to_csv(DATA_PATH, request.meals)

    # Refresh in-memory MEALS so subsequent requests see the new meals.
    global MEALS
    MEALS = load_meals(DATA_PATH)

    return AppendMealsResponse(
        appended=appended,
        skipped_duplicates=skipped,
        total_meals=total,
    )

