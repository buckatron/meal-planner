import React from "react";

function PlannerConfig({
  days,
  onDaysChange,
  energyLevels,
  energyFilter,
  onToggleEnergy,
  servings,
  onServingsChange,
  onGeneratePlan,
  loading
}) {
  const handleDaysChange = (event) => {
    const value = Number(event.target.value) || 1;
    onDaysChange(Math.min(Math.max(value, 1), 7));
  };

  const handleServingsChange = (event) => {
    const value = Number(event.target.value) || 1;
    onServingsChange(Math.min(Math.max(value, 1), 8));
  };

  return (
    <div className="planner-grid">
      <div className="planner-field">
        <label className="field-label" htmlFor="days">
          Number of days
        </label>
        <input
          id="days"
          type="number"
          min="1"
          max="7"
          value={days}
          onChange={handleDaysChange}
          className="input input--number"
        />
        <p className="field-help">Plan anywhere from 1 to 7 dinners.</p>
      </div>

      <div className="planner-field">
        <span className="field-label">Energy level</span>
        <div className="energy-grid">
          {energyLevels.map((level) => (
            <label key={level} className="checkbox-pill">
              <input
                type="checkbox"
                checked={energyFilter.includes(level)}
                onChange={() => onToggleEnergy(level)}
              />
              <span className="checkbox-pill__label">{level}</span>
            </label>
          ))}
        </div>
        <p className="field-help">
          Mix and match cozy nights with bigger cooking projects.
        </p>
      </div>

      <div className="planner-field">
        <label className="field-label" htmlFor="servings">
          Servings per meal
        </label>
        <input
          id="servings"
          type="number"
          min="1"
          max="8"
          value={servings}
          onChange={handleServingsChange}
          className="input input--number"
        />
        <p className="field-help">
          Used as a simple multiplier in your shopping list.
        </p>
      </div>

      <div className="planner-actions">
        <button
          type="button"
          className="button button--primary"
          onClick={onGeneratePlan}
          disabled={loading}
        >
          {loading ? "Gathering recipes…" : "Generate Plan"}
        </button>
      </div>
    </div>
  );
}

export default PlannerConfig;

