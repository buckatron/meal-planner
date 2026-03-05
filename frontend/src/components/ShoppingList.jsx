import React, { useState } from "react";

function ShoppingList({ shoppingList, servings, onStartOver }) {
  const [copied, setCopied] = useState(false);

  const categories = ["Protein", "Carb", "Sauce", "Veg", "Other"];

  const buildPlainText = () => {
    const lines = [];
    lines.push(`Shopping list · Servings per meal: ${servings}`);
    lines.push("");

    categories.forEach((category) => {
      const items = shoppingList[category] || [];
      if (!items.length) return;
      lines.push(category);
      items.forEach((item) => {
        lines.push(`- ${item}`);
      });
      lines.push("");
    });

    return lines.join("\n");
  };

  const handleCopy = async () => {
    try {
      const text = buildPlainText();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy shopping list", error);
    }
  };

  return (
    <div className="shopping-list">
      <div className="shopping-list__grid">
        {categories.map((category) => {
          const items = shoppingList[category] || [];
          if (!items.length) return null;
          return (
            <div key={category} className="shopping-list__group">
              <h3 className="shopping-list__heading">{category}</h3>
              <ul className="shopping-list__items">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="shopping-list__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={handleCopy}
        >
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
        <button
          type="button"
          className="button button--ghost"
          onClick={onStartOver}
        >
          Start Over
        </button>
      </div>
    </div>
  );
}

export default ShoppingList;

