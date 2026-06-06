import { useState } from "react";
import { useExpenses } from "../hooks/useExpenses";
import { useBudgets } from "../hooks/useBudgets";
import SummaryCards    from "../components/SummaryCards/SummaryCards";
import ExpenseForm     from "../components/ExpenseForm/ExpenseForm";
import FilterPanel     from "../components/FilterPanel/FilterPanel";
import ExpenseTable    from "../components/ExpenseTable/ExpenseTable";
import ExpenseChart    from "../components/ExpenseChart/ExpenseChart";
import BudgetTracker   from "../components/BudgetTracker/BudgetTracker";
import EditExpenseModal from "../components/EditExpenseModal/EditExpenseModal";

export default function Dashboard() {
  const {
    expenses,
    summary,
    budgetSpending,
    filters,
    selectedMonth,
    selectedYear,
    changeMonth,
    loading,
    summaryLoading,
    error,
    addExpense,
    editExpense,
    removeExpense,
    applyFilters,
    clearFilters,
  } = useExpenses();

  const { budgets, saveBudget, removeBudget } = useBudgets();
  const [editTarget, setEditTarget] = useState(null);

  const handleEditSubmit = async (data) => {
    await editExpense(editTarget.id, data);
    setEditTarget(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">💸 Expense Tracker</h1>
            <p className="text-xs text-gray-400 mt-0.5">Track and manage your spending</p>
          </div>
          <span className="text-xs text-gray-400 hidden sm:block">
            Studio Graphene — Take Home
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <SummaryCards
          summary={summary}
          loading={summaryLoading}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthYearChange={changeMonth}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseForm onSubmit={addExpense} />
          <div className="space-y-6">
            <FilterPanel
              filters={filters}
              onApply={applyFilters}
              onClear={clearFilters}
            />
            <BudgetTracker
              budgets={budgets}
              onSave={saveBudget}
              onRemove={removeBudget}
              budgetSpending={budgetSpending}  
            />
          </div>
        </div>

        <ExpenseTable
          expenses={expenses}
          loading={loading}
          error={error}
          filters={filters}           
          onEdit={setEditTarget}
          onDelete={removeExpense}
        />

        <ExpenseChart summary={summary} />
      </main>

      {editTarget && (
        <EditExpenseModal
          expense={editTarget}
          onSubmit={handleEditSubmit}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}