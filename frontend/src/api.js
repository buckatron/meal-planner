import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000"
});

export async function getMeals(energyFilter = []) {
  const params = {};
  if (energyFilter && energyFilter.length === 1) {
    params.energy = energyFilter[0];
  }
  const response = await api.get("/meals", { params });
  return response.data;
}

export async function generatePlan(days, energyFilter, servings) {
  const response = await api.post("/plan", {
    days,
    energy_filter: energyFilter,
    servings
  });
  return response.data;
}

export async function rerollMeal(excludeMeals, energyFilter, servings) {
  const response = await api.post("/reroll", {
    exclude_meals: excludeMeals,
    energy_filter: energyFilter,
    servings
  });
  return response.data;
}

export async function getShoppingList(mealNames, servings) {
  const response = await api.post("/shopping-list", {
    meal_names: mealNames,
    servings
  });
  return response.data;
}

export async function suggestMeals(count, prompt, energyFilter) {
  const response = await api.post("/suggest", {
    count,
    prompt,
    energy_filter: energyFilter || ""
  });
  return response.data;
}

export async function appendMeals(meals) {
  const response = await api.post("/meals/append", {
    meals
  });
  return response.data;
}

