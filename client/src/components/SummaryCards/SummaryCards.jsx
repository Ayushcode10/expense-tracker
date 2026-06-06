import { formatCurrency } from "../../utils/formatters";

// Builds last 24 months as selectable options
function buildMonthOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: d.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      }),
      // Composite key for the <select> value
      value: `${d.getFullYear()}-${d.getMonth() + 1}`,
    });
  }
  return options;
}

const MONTH_OPTIONS = buildMonthOptions();

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

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse h-24" />
  );
}

export default function SummaryCards({
  summary,
  loading,
  selectedMonth,
  selectedYear,
  onMonthYearChange,
}) {
  const selectedOption = MONTH_OPTIONS.find(
    (o) => o.month === selectedMonth && o.year === selectedYear
  );
  const selectedLabel = selectedOption?.label ?? "This Month";
  const isCurrentMonth =
    selectedMonth === new Date().getMonth() + 1 &&
    selectedYear === new Date().getFullYear();

  const handlePickerChange = (e) => {
    const [year, month] = e.target.value.split("-").map(Number);
    onMonthYearChange(month, year);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const topCategory = summary?.totalPerCategory
    ? Object.entries(summary.totalPerCategory).sort((a, b) => b[1] - a[1])[0]
    : null;

  return (
    <div className="space-y-3">
      {/* Month selector row */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Summary
        </h2>
        <div className="flex items-center gap-2">
          {!isCurrentMonth && (
            <button
              onClick={() => {
                const now = new Date();
                onMonthYearChange(now.getMonth() + 1, now.getFullYear());
              }}
              className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition"
            >
              ↩ Back to current
            </button>
          )}
          <select
            value={`${selectedYear}-${selectedMonth}`}
            onChange={handlePickerChange}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
            aria-label="Select month for summary"
          >
            {MONTH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label={`Total Spent — ${selectedLabel}`}
          value={
            summary
              ? formatCurrency(summary.totalThisMonth)
              : "—"
          }
          color="text-indigo-600"
        />
        <StatCard
          label="Highest Single Expense"
          value={summary ? formatCurrency(summary.highestExpense) : "—"}
          sub={
            summary?.highestExpenseCategory
              ? `in ${summary.highestExpenseCategory}`
              : null
          }
          color="text-rose-500"
        />
        <StatCard
          label="Top Category (All Time)"
          value={topCategory ? topCategory[0] : "—"}
          sub={topCategory ? formatCurrency(topCategory[1]) : null}
          color="text-emerald-600"
        />
      </div>
    </div>
  );
}