import { useState } from "react";
import { CATEGORIES, CATEGORY_COLORS } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatters";

// Formats "June 2025" from month (1-indexed) and year
function monthLabel(month, year) {
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export default function BudgetTracker({
  budgets,
  onSave,
  onRemove,
  summary,
  selectedMonth,
  selectedYear,
}) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [budgetAmount, setBudgetAmount]         = useState("");
  const [error, setError]                       = useState("");

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

  // ── KEY FIX ────────────────────────────────────────────────────────────
  // Use totalPerCategoryThisMonth (scoped to selected month)
  // instead of totalPerCategory (all-time).
  const spendingByCategory = summary?.totalPerCategoryThisMonth || {};

  const budgetEntries  = Object.entries(budgets);
  const currentLabel   = monthLabel(selectedMonth, selectedYear);
  const isCurrentMonth =
    selectedMonth === new Date().getMonth() + 1 &&
    selectedYear  === new Date().getFullYear();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">🎯 Budget Tracker</h2>
        {budgetEntries.length > 0 && (
          <span className="text-xs text-gray-400">
            Tracking: <span className="font-medium text-gray-600">{currentLabel}</span>
          </span>
        )}
      </div>

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
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">
              Progress — {currentLabel}
            </p>
            {!isCurrentMonth && (
              <p className="text-xs text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
                Viewing historical month
              </p>
            )}
          </div>

          {budgetEntries.map(([category, budget]) => {
            const spent = Number(spendingByCategory[category] || 0);
            const pct   = Math.min((spent / budget) * 100, 100);
            const over  = spent > budget;
            const color = CATEGORY_COLORS[category] || "#6366f1";

            return (
              <div key={category}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium ${over ? "text-red-500" : "text-gray-500"}`}>
                      {formatCurrency(spent)}
                      <span className="text-gray-400 font-normal">
                        {" "}/ {formatCurrency(budget)}
                      </span>
                    </span>
                    <span className={`text-xs font-semibold ${over ? "text-red-500" : "text-gray-400"}`}>
                      {pct.toFixed(0)}%
                    </span>
                    <button
                      onClick={() => onRemove(category)}
                      aria-label={`Remove ${category} budget`}
                      className="text-gray-300 hover:text-red-400 transition text-xs w-4 h-4 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: over ? "#ef4444" : color,
                    }}
                  />
                </div>

                {/* Status text */}
                {over ? (
                  <p className="text-xs text-red-500 mt-1">
                    Over budget by {formatCurrency(spent - budget)} this month
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">
                    {formatCurrency(budget - spent)} remaining
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {budgetEntries.length === 0 && (
        <p className="text-sm text-gray-400 mt-4">
          Set a monthly budget per category above to track your limits.
        </p>
      )}
    </div>
  );
}