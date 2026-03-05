from __future__ import annotations

import random
from pathlib import Path
from typing import Iterable, List, Dict, Set

import pandas as pd

from models import Meal


def load_meals(path: Path) -> List[Meal]:
    """Load meals from a CSV file into a list of Meal models."""
    df = pd.read_csv(path)
    df = df.fillna("")

    meals: List[Meal] = []
    for _, row in df.iterrows():
        meals.append(
            Meal(
                name=str(row["MealName"]).strip(),
                protein=str(row["Protein"]).strip(),
                carb=str(row["Carb"]).strip(),
                sauce=str(row["Sauce"]).strip(),
                veg=str(row["Veg"]).strip(),
                other=str(row["Other"]).strip(),
                energy=str(row["Energy"]).strip(),
            )
        )
    return meals


def filter_meals(meals: Iterable[Meal], energy_filter: Iterable[str]) -> List[Meal]:
    """Filter meals by energy level. Empty filter list returns all meals."""
    meals_list = list(meals)
    filters = [e.lower() for e in energy_filter] if energy_filter else []

    if not filters:
        return meals_list

    return [m for m in meals_list if m.energy.lower() in filters]


def _split_ingredients(value: str) -> List[str]:
    if not value:
        return []
    parts = [part.strip() for part in value.split(",")]
    return [p for p in parts if p]


def get_all_ingredients(meal: Meal) -> List[str]:
    """Flatten all ingredient columns into a single list of individual ingredients."""
    raw = [meal.protein, meal.carb, meal.sauce, meal.veg, meal.other]
    ingredients: List[str] = []
    for field in raw:
        if field:
            for item in _split_ingredients(field):
                ingredients.append(item.strip().lower())
    return ingredients


def _score_meal(meal: Meal, anchor_ingredients: Set[str]) -> int:
    meal_ingredients = get_all_ingredients(meal)
    return sum(1 for i in meal_ingredients if i in anchor_ingredients)


def generate_plan(
    meals: Iterable[Meal], days: int, energy_filter: Iterable[str]
) -> tuple[List[Meal], bool]:
    """
    Generate a random meal plan of up to `days` meals.
    No repeats, filtered by energy levels if provided.

    The last 1–2 meals are selected with a preference for
    overlapping ingredients from earlier meals.
    Returns (plan, overlap_fallback_used).
    """
    filtered = filter_meals(meals, energy_filter)
    if not filtered or days <= 0:
        return [], False

    available = list(filtered)
    total_days = min(days, len(available))

    # Determine how many anchor vs overlap meals to select.
    # For 3 or fewer days, only 1 overlap meal; otherwise 2.
    if total_days <= 3:
        overlap_count = 1
    else:
        overlap_count = 2
    overlap_count = min(overlap_count, total_days)
    anchor_count = max(total_days - overlap_count, 0)

    # Select anchor meals randomly.
    anchors: List[Meal] = []
    if anchor_count > 0:
        anchors = random.sample(available, k=anchor_count)
        # Remove anchors from the pool of candidates for overlap meals.
        anchor_ids = {id(m) for m in anchors}
        available = [m for m in available if id(m) not in anchor_ids]

    # Build anchor ingredient pool.
    anchor_ingredients: Set[str] = set()
    for meal in anchors:
        anchor_ingredients.update(get_all_ingredients(meal))

    overlaps: List[Meal] = []
    overlap_fallback_used = False

    # Weighted random selection for overlap meals.
    while len(overlaps) < overlap_count and available:
        scores = [_score_meal(m, anchor_ingredients) for m in available]
        if scores and max(scores) == 0:
            # No ingredient overlap possible – fall back to random.
            chosen = random.choice(available)
            overlap_fallback_used = True
        else:
            weights = [s + 1 for s in scores]
            chosen = random.choices(available, weights=weights, k=1)[0]

        overlaps.append(chosen)
        available = [m for m in available if m is not chosen]

    plan = anchors + overlaps
    return plan, overlap_fallback_used


def generate_shopping_list(meals: Iterable[Meal], servings: int) -> Dict[str, List[str]]:
    """
    Build a grouped shopping list from the given meals.

    - Splits comma‑separated ingredients
    - Deduplicates case‑insensitively within each category
    - Adds an `x{servings}` multiplier suffix to each item
    """
    categories = {
        "Protein": "protein",
        "Carb": "carb",
        "Sauce": "sauce",
        "Veg": "veg",
        "Other": "other",
    }

    grouped: Dict[str, Dict[str, str]] = {cat: {} for cat in categories.keys()}

    for meal in meals:
        for display_cat, attr in categories.items():
            raw_value = getattr(meal, attr, "") or ""
            for ingredient in _split_ingredients(raw_value):
                key = ingredient.lower()
                if key not in grouped[display_cat]:
                    grouped[display_cat][key] = ingredient

    # Build final list with servings multiplier
    result: Dict[str, List[str]] = {}
    for cat, items in grouped.items():
        # Preserve insertion order; could sort alphabetically if desired
        result[cat] = [f"{name} x{servings}" for name in items.values()]

    return result

