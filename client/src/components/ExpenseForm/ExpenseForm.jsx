import { useState, useEffect } from "react";
import { CATEGORIES } from "../../utils/constants";
import { todayISO } from "../../utils/formatters";

const EMPTY_FORM = {
  amount: "",
  category: "",
  date: todayISO(),
  note: "",
};

export default function ExpenseForm({ onSubmit, editTarget, onCancelEdit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editTarget) {
      setForm({
        amount: editTarget.amount,
        category: editTarget.category,
        date: editTarget.date,
        note: editTarget.note || "",
      });
      setErrors({});
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editTarget]);

  const validate = () => {
    const newErrors = {};
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) {
      newErrors.amount = "Enter a valid amount greater than 0";
    }
    if (!form.category) {
      newErrors.category = "Please select a category";
    }
    if (!form.date) {
      newErrors.date = "Date is required";
    }
    if (form.note && form.note.length > 500) {
      newErrors.note = "Note must be under 500 characters";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        amount: parseFloat(form.amount),
        category: form.category,
        date: form.date,
        note: form.note || null,
      });
      setForm(EMPTY_FORM);
      setErrors({});
    } catch (err) {
      const serverErrors = err?.response?.data?.fieldErrors;
      if (serverErrors) setErrors(serverErrors);
      else setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = !!editTarget;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {isEditing ? "✏️ Edit Expense" : "➕ Add Expense"}
      </h2>

      {errors.general && (
        <p className="text-sm text-red-500 mb-3 bg-red-50 p-2 rounded-lg">
          {errors.general}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                errors.amount ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white ${
                errors.category ? "border-red-400" : "border-gray-200"
              }`}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                errors.date ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.date && (
              <p className="text-xs text-red-500 mt-1">{errors.date}</p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="What was this for?"
              maxLength={500}
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                errors.note ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.note && (
              <p className="text-xs text-red-500 mt-1">{errors.note}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition disabled:opacity-60"
          >
            {submitting ? "Saving..." : isEditing ? "Update Expense" : "Add Expense"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-5 py-2 rounded-xl text-sm font-medium transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}