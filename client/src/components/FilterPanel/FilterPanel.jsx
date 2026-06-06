import { useState, useEffect } from "react";
import { CATEGORIES } from "../../utils/constants";

export default function FilterPanel({ filters, onApply, onClear }) {
  const [local, setLocal] = useState(filters);

  // ── THE BUG FIX ────────────────────────────────────────────────────────
  // Sync local state whenever the parent `filters` prop changes.
  // Without this, calling clearFilters() in the parent resets the applied
  // filters but the input fields still show the old stale values.
  // The next Apply click would re-send those stale dates.
  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocal((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    // Guard: if startDate is set, endDate must also be set (and vice versa)
    // Partial ranges confuse users and the backend needs both
    if (local.startDate && !local.endDate) {
      alert("Please select an end date.");
      return;
    }
    if (local.endDate && !local.startDate) {
      alert("Please select a start date.");
      return;
    }
    onApply(local);
  };

  const handleClear = () => {
    const empty = { category: "", startDate: "", endDate: "" };
    setLocal(empty);
    onClear();
  };

  const isActive = filters.category || filters.startDate || filters.endDate;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">🔍 Filters</h2>
        {isActive && (
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-medium">
            Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={local.category}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From
          </label>
          <input
            type="date"
            name="startDate"
            value={local.startDate}
            onChange={handleChange}
            max={local.endDate || undefined}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To
          </label>
          <input
            type="date"
            name="endDate"
            value={local.endDate}
            onChange={handleChange}
            min={local.startDate || undefined}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      {/* Active filter summary */}
      {isActive && (
        <div className="mt-3 text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">
          Showing:{" "}
          {filters.category && <span className="font-medium">{filters.category}</span>}
          {filters.category && (filters.startDate || filters.endDate) && " · "}
          {filters.startDate && filters.endDate && (
            <span className="font-medium">
              {filters.startDate} → {filters.endDate}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleApply}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
        >
          Apply
        </button>
        <button
          onClick={handleClear}
          disabled={!isActive}
          className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>
    </div>
  );
}