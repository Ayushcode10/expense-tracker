import { useState } from "react";
import { CATEGORIES } from "../../utils/constants";

export default function FilterPanel({ filters, onApply, onClear }) {
  const [local, setLocal] = useState(filters);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocal((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => onApply(local);

  const handleClear = () => {
    const empty = { category: "", startDate: "", endDate: "" };
    setLocal(empty);
    onClear();
  };

  const isActive =
    filters.category || filters.startDate || filters.endDate;

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From
          </label>
          <input
            type="date"
            name="startDate"
            value={local.startDate}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To
          </label>
          <input
            type="date"
            name="endDate"
            value={local.endDate}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleApply}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
        >
          Apply
        </button>
        <button
          onClick={handleClear}
          className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
}