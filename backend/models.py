from typing import List, Optional, Dict

from pydantic import BaseModel


class Meal(BaseModel):
    name: str
    protein: str
    carb: str
    sauce: str
    veg: str
    other: str
    energy: str


class PlanRequest(BaseModel):
    days: int
    energy_filter: List[str]
    servings: int


class PlanItem(BaseModel):
    day: int
    meal: Meal


class PlanResponse(BaseModel):
    plan: List[PlanItem]
    warning: Optional[str] = None


class RerollRequest(BaseModel):
    exclude_meals: List[str]
    energy_filter: List[str]
    servings: int


class ShoppingListRequest(BaseModel):
    meal_names: List[str]
    servings: int


class ShoppingListResponse(BaseModel):
    Protein: List[str] = []
    Carb: List[str] = []
    Sauce: List[str] = []
    Veg: List[str] = []
    Other: List[str] = []

    def to_dict(self) -> Dict[str, List[str]]:
        return {
            "Protein": self.Protein,
            "Carb": self.Carb,
            "Sauce": self.Sauce,
            "Veg": self.Veg,
            "Other": self.Other,
        }


class CsvMeal(BaseModel):
    MealName: str
    Protein: str
    Carb: str
    Sauce: str
    Veg: str
    Other: str
    Energy: str


class SuggestRequest(BaseModel):
    count: int = 5
    prompt: str = ""
    energy_filter: str = ""


class SuggestResponse(BaseModel):
    suggested: List[CsvMeal]
    warning: Optional[str] = None


class AppendMealsRequest(BaseModel):
    meals: List[CsvMeal]


class AppendMealsResponse(BaseModel):
    appended: int
    skipped_duplicates: int
    total_meals: int


