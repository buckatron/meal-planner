import React, { useState } from "react";
import PlannerConfig from "./components/PlannerConfig.jsx";
import MealPlan from "./components/MealPlan.jsx";
import ShoppingList from "./components/ShoppingList.jsx";
import SuggestMealsPanel from "./components/SuggestMealsPanel.jsx";
import {
  generatePlan,
  rerollMeal,
  getShoppingList
} from "./api.js";

const ENERGY_LEVELS = ["Low", "Medium", "High", "Extra High"];

function App() {
  const [days, setDays] = useState(5);
  const [energyFilter, setEnergyFilter] = useState([...ENERGY_LEVELS]);
  const [servings, setServings] = useState(2);

  const [plan, setPlan] = useState([]);
  const [warning, setWarning] = useState(null);
  const [shoppingList, setShoppingList] = useState(null);

  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingRerollFor, setLoadingRerollFor] = useState(null);
  const [loadingShoppingList, setLoadingShoppingList] = useState(false);
  const [error, setError] = useState(null);
  const [suggestError, setSuggestError] = useState(null);
  const [showSuggest, setShowSuggest] = useState(false);

  const handleToggleEnergy = (level) => {
    setEnergyFilter((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const handleGeneratePlan = async () => {
    setError(null);
    setLoadingPlan(true);
    setShoppingList(null);

    try {
      const data = await generatePlan(days, energyFilter, servings);
      setPlan(data.plan || []);
      setWarning(data.warning || null);
    } catch (err) {
      console.error(err);
      setError("Unable to generate a plan. Please check that the backend is running.");
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleReroll = async (dayIndex) => {
    if (!plan.length) return;

    setError(null);
    setLoadingRerollFor(dayIndex);
    setShoppingList(null);

    try {
      const excludeMeals = plan.map((p) => p.meal.name);
      const newMeal = await rerollMeal(excludeMeals, energyFilter, servings);

      setPlan((prev) =>
        prev.map((item, index) =>
          index === dayIndex ? { ...item, meal: newMeal } : item
        )
      );
    } catch (err) {
      console.error(err);
      setError("Unable to re-roll this meal. Try adjusting your filters.");
    } finally {
      setLoadingRerollFor(null);
    }
  };

  const handleGenerateShoppingList = async () => {
    if (!plan.length) return;
    setError(null);
    setLoadingShoppingList(true);

    try {
      const mealNames = plan.map((p) => p.meal.name);
      const data = await getShoppingList(mealNames, servings);
      setShoppingList(data);
    } catch (err) {
      console.error(err);
      setError("Unable to generate a shopping list.");
    } finally {
      setLoadingShoppingList(false);
    }
  };

  const handleStartOver = () => {
    setPlan([]);
    setShoppingList(null);
    setWarning(null);
    setError(null);
    setDays(5);
    setEnergyFilter([...ENERGY_LEVELS]);
    setServings(2);
    setShowSuggest(false);
    setSuggestError(null);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__content">
          <div>
            <h1 className="app-title">Kitchen Notebook</h1>
            <p className="app-subtitle">
              Plan a week of dinners and gather a tidy market list in one place.
            </p>
          </div>
          <div className="app-header__actions">
            <button
              type="button"
              className="button button--ghost button--small"
              onClick={() => {
                setShowSuggest((prev) => !prev);
                setSuggestError(null);
              }}
            >
              ✨ Add Meals
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="section-card">
          <h2 className="section-title">Step 1 · Plan your week</h2>
          <PlannerConfig
            days={days}
            onDaysChange={setDays}
            energyLevels={ENERGY_LEVELS}
            energyFilter={energyFilter}
            onToggleEnergy={handleToggleEnergy}
            servings={servings}
            onServingsChange={setServings}
            onGeneratePlan={handleGeneratePlan}
            loading={loadingPlan}
          />
          {warning && <div className="banner banner--warning">{warning}</div>}
          {error && <div className="banner banner--error">{error}</div>}
          {suggestError && (
            <div className="banner banner--error">{suggestError}</div>
          )}

          {showSuggest && (
            <SuggestMealsPanel
              onError={setSuggestError}
              onClose={() => setShowSuggest(false)}
            />
          )}
        </section>

        {plan.length > 0 && (
          <section className="section-card section-card--stacked">
            <h2 className="section-title">Step 2 · This week&apos;s table</h2>
            <MealPlan
              plan={plan}
              onReroll={handleReroll}
              loadingRerollFor={loadingRerollFor}
              onGenerateShoppingList={handleGenerateShoppingList}
              loadingShoppingList={loadingShoppingList}
            />
          </section>
        )}

        {shoppingList && (
          <section className="section-card section-card--stacked">
            <h2 className="section-title">Step 3 · Market list</h2>
            <ShoppingList
              shoppingList={shoppingList}
              servings={servings}
              onStartOver={handleStartOver}
            />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;

