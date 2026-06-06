import { useState, useEffect, useRef } from "react";
import { CATEGORIES } from "../../utils/constants";

export default function EditExpenseModal({ expense, onSubmit, onClose }) {
  const [form, setForm] = useState({
    amount: "",
    category: "",
    date: "",
    note: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Refs for accessibility
  const firstFieldRef = useRef(null);
  const overlayRef = useRef(null);

  // ── Pre-populate form whenever expense changes ──────────────────────────
  useEffect(() => {
    if (expense) {
      setForm({
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        note: expense.note || "",
      });
      setErrors({});
    }
  }, [expense]);

  // ── Focus the first field when modal opens ──────────────────────────────
  useEffect(() => {
    if (expense) {
      // Timeout lets the modal finish rendering before stealing focus
      const timer = setTimeout(() => firstFieldRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [expense]);

  // ── Close on Escape key ─────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // ── Prevent background scroll while modal is open ──────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!expense) return null;

  // ── Validation — identical logic to ExpenseForm ─────────────────────────
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
    // Clear individual field error as user types
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
      // onClose is called by Dashboard after onSubmit resolves
    } catch (err) {
      const serverErrors = err?.response?.data?.fieldErrors;
      if (serverErrors) {
        setErrors(serverErrors);
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Click outside the card (on the overlay) to close ───────────────────
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      {/* Modal card — clicks here do NOT bubble to the overlay */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in">
        
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2
              id="edit-modal-title"
              className="text-lg font-semibold text-gray-800"
            >
              ✏️ Edit Expense
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {expense.category} &mdash; {expense.date}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit modal"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg w-8 h-8 flex items-center justify-center transition text-lg"
          >
            ✕
          </button>
        </div>

        {/* ── Form ────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {errors.general && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">
              {errors.general}
            </p>
          )}

          {/* Amount */}
          <div>
            <label
              htmlFor="edit-amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Amount (₹)
            </label>
            <input
              ref={firstFieldRef}
              id="edit-amount"
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
            <label
              htmlFor="edit-category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="edit-category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                errors.category ? "border-red-400" : "border-gray-200"
              }`}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="edit-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date
            </label>
            <input
              id="edit-date"
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
            <label
              htmlFor="edit-note"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Note{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="edit-note"
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

          {/* ── Action buttons ─────────────────────────────────────────── */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-sm font-medium transition disabled:opacity-60"
            >
              {submitting ? "Updating..." : "Update Expense"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-xl text-sm font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}