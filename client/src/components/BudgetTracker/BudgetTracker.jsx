import { useState } from "react";
import { CATEGORIES, CATEGORY_COLORS } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatters";

export default function BudgetTracker({ budgets, onSave, onRemove, summary }) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!selectedCategory) { setError("Please select a category"); return; }
    const val = parseFloat(budgetAmount);
    if (!budgetAmount || isNaN(val) || val <= 0) {
      setError("Enter a valid budget amount");
      return;
    }
    onSave(selectedCategory, val);
    setSelectedCategory("");
    setBudgetAmount("");
    setError("");
  };

  const spendingByCategory = summary?.totalPerCategory || {};
  const budgetEntries = Object.entries(budgets);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">🎯 Budget Tracker</h2>

      {/* Budget input */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setError(""); }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Budget (₹)
            </label>
            <input
              type="number"
              value={budgetAmount}
              onChange={(e) => { setBudgetAmount(e.target.value); setError(""); }}
              placeholder="e.g. 5000"
              min="1"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
        >
          Save Budget
        </button>
      </div>

      {/* Budget progress bars */}
      {budgetEntries.length > 0 && (
        <div className="mt-6 space-y-4">
          <p className="text-sm font-medium text-gray-600">Budget Progress</p>
          {budgetEntries.map(([category, budget]) => {
            const spent = Number(spendingByCategory[category] || 0);
            const pct = Math.min((spent / budget) * 100, 100);
            const over = spent > budget;
            const color = CATEGORY_COLORS[category] || "#6366f1";

            return (
              <div key={category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {category}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium ${over ? "text-red-500" : "text-gray-500"}`}>
                      {formatCurrency(spent)} / {formatCurrency(budget)}
                    </span>
                    <button
                      onClick={() => onRemove(category)}
                      className="text-xs text-gray-300 hover:text-red-400 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: over ? "#ef4444" : color,
                    }}
                  />
                </div>
                {over && (
                  <p className="text-xs text-red-500 mt-1">
                    Over budget by {formatCurrency(spent - budget)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {budgetEntries.length === 0 && (
        <p className="text-sm text-gray-400 mt-4">
          Set a budget above to start tracking your spending limits.
        </p>
      )}
    </div>
  );
}