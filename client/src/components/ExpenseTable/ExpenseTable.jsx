import { useState } from "react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { CATEGORY_COLORS } from "../../utils/constants";
import DeleteModal from "../DeleteModal/DeleteModal";

function CategoryBadge({ category }) {
  const color = CATEGORY_COLORS[category] || "#6b7280";
  return (
    <span
      className="text-xs font-medium px-2 py-1 rounded-full"
      style={{ backgroundColor: color + "20", color }}
    >
      {category}
    </span>
  );
}

export default function ExpenseTable({
  expenses,
  loading,
  error,
  onEdit,
  onDelete,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // Export to CSV
  const handleExport = () => {
    if (expenses.length === 0) return;
    const headers = ["Date", "Category", "Amount", "Note"];
    const rows = expenses.map((e) => [
      e.date,
      e.category,
      e.amount,
      e.note || "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-center text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            📋 Expenses{" "}
            <span className="text-sm font-normal text-gray-400">
              ({expenses.length})
            </span>
          </h2>
          <button
            onClick={handleExport}
            disabled={expenses.length === 0}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ↓ Export CSV
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            No expenses found. Add one above!
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="text-left px-5 py-3">Date</th>
                    <th className="text-left px-5 py-3">Category</th>
                    <th className="text-left px-5 py-3">Note</th>
                    <th className="text-right px-5 py-3">Amount</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition"
                    >
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-5 py-3">
                        <CategoryBadge category={expense.category} />
                      </td>
                      <td className="px-5 py-3 text-gray-500 max-w-xs truncate">
                        {expense.note || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-800 whitespace-nowrap">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => onEdit(expense)}
                            className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(expense)}
                            className="text-xs text-red-400 hover:text-red-600 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-100">
              {expenses.map((expense) => (
                <div key={expense.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CategoryBadge category={expense.category} />
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(expense.date)}
                      </p>
                      {expense.note && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {expense.note}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        {formatCurrency(expense.amount)}
                      </p>
                      <div className="flex gap-3 mt-1 justify-end">
                        <button
                          onClick={() => onEdit(expense)}
                          className="text-xs text-indigo-500 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(expense)}
                          className="text-xs text-red-400 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <DeleteModal
        expense={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  );
}