import { formatCurrency } from "../../utils/formatters";

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || "text-gray-800"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function SummaryCards({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse h-24"
          />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const topCategory = summary.totalPerCategory
    ? Object.entries(summary.totalPerCategory).sort((a, b) => b[1] - a[1])[0]
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        label="Total Spent This Month"
        value={formatCurrency(summary.totalThisMonth)}
        color="text-indigo-600"
      />
      <StatCard
        label="Highest Single Expense"
        value={formatCurrency(summary.highestExpense)}
        sub={summary.highestExpenseCategory ? `in ${summary.highestExpenseCategory}` : null}
        color="text-rose-500"
      />
      <StatCard
        label="Top Category (All Time)"
        value={topCategory ? topCategory[0] : "—"}
        sub={topCategory ? formatCurrency(topCategory[1]) : null}
        color="text-emerald-600"
      />
    </div>
  );
}