import { formatCurrency } from "../../utils/formatters";

export default function DeleteModal({ expense, onConfirm, onCancel, loading }) {
  if (!expense) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold text-gray-800">Delete Expense?</h3>
        <p className="text-sm text-gray-500 mt-2">
          You're about to delete{" "}
          <span className="font-medium text-gray-700">
            {formatCurrency(expense.amount)}
          </span>{" "}
          in <span className="font-medium text-gray-700">{expense.category}</span>.
          This cannot be undone.
        </p>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-sm font-medium transition disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-xl text-sm font-medium transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}