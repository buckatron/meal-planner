import React, { useState } from "react";
import { suggestMeals, appendMeals } from "../api.js";

const ENERGY_OPTIONS = ["", "Low", "Medium", "High", "Extra High"];

function SuggestMealsPanel({ onError }) {
  const [count, setCount] = useState(5);
  const [prompt, setPrompt] = useState("");
  const [energyFilter, setEnergyFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [suggested, setSuggested] = useState([]);
  const [savingIndex, setSavingIndex] = useState(null);
  const [addedNames, setAddedNames] = useState({});

  const handleGenerate = async () => {
    onError?.(null);
    setAddedNames({});
    setLoading(true);
    try {
      const data = await suggestMeals(count, prompt, energyFilter);
      setSuggested(data.suggested || []);
    } catch (err) {
      console.error(err);
      onError?.(
        err?.response?.data?.detail ||
          "Unable to generate meal suggestions. Check the Groq API configuration."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (index) => {
    setSuggested((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAppendOne = async (meal, index) => {
    if (!meal || addedNames[meal.MealName]) return;
    onError?.(null);
    setSavingIndex(index);
    try {
      await appendMeals([meal]);
      setAddedNames((prev) => ({
        ...prev,
        [meal.MealName]: true
      }));
    } catch (err) {
      console.error(err);
      onError?.(
        err?.response?.data?.detail ||
          "Unable to save suggested meals. Please try again."
      );
    } finally {
      setSavingIndex(null);
    }
  };

  const effectiveCount = Math.max(1, Math.min(Number(count) || 1, 10));

  return (
    <div className="suggest-panel">
      <div className="suggest-panel__controls">
        <div className="planner-field">
          <label className="field-label" htmlFor="suggest-count">
            How many meals?
          </label>
          <input
            id="suggest-count"
            type="number"
            min="1"
            max="10"
            value={effectiveCount}
            onChange={(e) => setCount(e.target.value)}
            className="input input--number"
          />
          <p className="field-help">AI will propose between 1 and 10 meals.</p>
        </div>

        <div className="planner-field suggest-panel__theme">
          <label className="field-label" htmlFor="suggest-theme">
            Theme or cuisine (optional)
          </label>
          <input
            id="suggest-theme"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="input"
            placeholder="e.g. Asian street food, comfort food, Mediterranean"
          />
        </div>

        <div className="planner-field">
          <label className="field-label" htmlFor="suggest-energy">
            Energy level (optional)
          </label>
          <select
            id="suggest-energy"
            className="input"
            value={energyFilter}
            onChange={(e) => setEnergyFilter(e.target.value)}
          >
            <option value="">Any</option>
            {ENERGY_OPTIONS.slice(1).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="planner-actions suggest-panel__actions">
          <button
            type="button"
            className="button button--secondary"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="suggest-panel__loading">
          <div className="suggest-skeleton" />
          <div className="suggest-skeleton" />
        </div>
      )}

      {suggested.length > 0 && (
        <div className="suggest-panel__results">
          <div className="suggest-panel__results-header">
            <span className="suggest-panel__results-title">
              Preview ({suggested.length} meals)
            </span>
          </div>

          <div className="suggest-grid">
            {suggested.map((meal, index) => (
              <article key={meal.MealName + index} className="suggest-card">
                <button
                  type="button"
                  className="suggest-card__remove"
                  onClick={() => handleRemove(index)}
                  aria-label="Remove meal from batch"
                >
                  ×
                </button>
                <h3 className="suggest-card__name">{meal.MealName}</h3>
                <span className="badge badge--medium suggest-card__badge">
                  {meal.Energy}
                </span>
                <dl className="suggest-card__summary">
                  <div>
                    <dt>Protein</dt>
                    <dd>{meal.Protein || "—"}</dd>
                  </div>
                  <div>
                    <dt>Carb</dt>
                    <dd>{meal.Carb || "—"}</dd>
                  </div>
                  <div>
                    <dt>Veg</dt>
                    <dd>{meal.Veg || "—"}</dd>
                  </div>
                </dl>
                <div className="suggest-card__actions">
                  <button
                    type="button"
                    className="button button--secondary button--small"
                    onClick={() => handleAppendOne(meal, index)}
                    disabled={
                      savingIndex === index || addedNames[meal.MealName]
                    }
                  >
                    {addedNames[meal.MealName]
                      ? "Added"
                      : savingIndex === index
                      ? "Saving…"
                      : "Add to Repo"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SuggestMealsPanel;

