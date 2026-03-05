import React from "react";
import MealCard from "./MealCard.jsx";

function MealPlan({
  plan,
  onReroll,
  loadingRerollFor,
  onGenerateShoppingList,
  loadingShoppingList
}) {
  return (
    <div className="meal-plan">
      <div className="meal-plan__grid">
        {plan.map((item, index) => (
          <MealCard
            key={item.day}
            day={item.day}
            meal={item.meal}
            onReroll={() => onReroll(index)}
            loading={loadingRerollFor === index}
          />
        ))}
      </div>

      <div className="meal-plan__actions">
        <button
          type="button"
          className="button button--primary"
          onClick={onGenerateShoppingList}
          disabled={loadingShoppingList}
        >
          {loadingShoppingList ? "Drafting your list…" : "Generate Shopping List"}
        </button>
      </div>
    </div>
  );
}

export default MealPlan;

