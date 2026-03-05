import React, { useEffect, useState } from "react";

function energyClass(energy) {
  const value = (energy || "").toLowerCase();
  if (value === "low") return "badge--low";
  if (value === "medium") return "badge--medium";
  if (value === "high") return "badge--high";
  if (value === "extra high") return "badge--extra-high";
  return "";
}

function MealCard({ day, meal, onReroll, loading }) {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!meal) return;
    setAnimating(true);
    const timeout = setTimeout(() => setAnimating(false), 280);
    return () => clearTimeout(timeout);
  }, [meal?.name]);

  if (!meal) return null;

  return (
    <article
      className={
        "meal-card" + (animating ? " meal-card--rerolling" : "")
      }
    >
      <div className="meal-card__header">
        <div className="meal-card__day">
          <span className="meal-card__day-label">Day</span>
          <span className="meal-card__day-number">{day}</span>
        </div>
        <div className="meal-card__title-block">
          <h3 className="meal-card__name">{meal.name}</h3>
          <span className={`badge ${energyClass(meal.energy)}`}>
            {meal.energy}
          </span>
        </div>
      </div>

      <dl className="meal-card__summary">
        <div>
          <dt>Protein</dt>
          <dd>{meal.protein || "—"}</dd>
        </div>
        <div>
          <dt>Carb</dt>
          <dd>{meal.carb || "—"}</dd>
        </div>
        <div>
          <dt>Veg</dt>
          <dd>{meal.veg || "—"}</dd>
        </div>
      </dl>

      <div className="meal-card__footer">
        <button
          type="button"
          className="button button--ghost"
          onClick={onReroll}
          disabled={loading}
        >
          {loading ? "Re‑rolling…" : "🔀 Re‑roll"}
        </button>
      </div>
    </article>
  );
}

export default MealCard;

