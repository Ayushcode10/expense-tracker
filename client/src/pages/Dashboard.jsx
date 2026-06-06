import { useState } from "react";
import { useExpenses } from "../hooks/useExpenses";
import { useBudgets } from "../hooks/useBudgets";
import SummaryCards from "../components/SummaryCards/SummaryCards";
import ExpenseForm from "../components/ExpenseForm/ExpenseForm";
import FilterPanel from "../components/FilterPanel/FilterPanel";
import ExpenseTable from "../components/ExpenseTable/ExpenseTable";
import ExpenseChart from "../components/ExpenseChart/ExpenseChart";
import BudgetTracker from "../components/BudgetTracker/BudgetTracker";
import EditExpenseModal from "../components/EditExpenseModal/EditExpenseModal";

export default function Dashboard() {
  const {
    expenses,
    summary,
    filters,
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

  // editTarget drives the modal. null = closed. expense object = open.
  const [editTarget, setEditTarget] = useState(null);

  const handleEditSubmit = async (data) => {
    await editExpense(editTarget.id, data);
    setEditTarget(null); // close modal only after successful update
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">💸 Expense Tracker</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Track and manage your spending
            </p>
          </div>
          <span className="text-xs text-gray-400 hidden sm:block">
            Studio Graphene — Take Home
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Summary */}
        <SummaryCards summary={summary} loading={summaryLoading} />

        {/* Add form + Filters + Budgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ExpenseForm is now add-only — no edit props */}
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
              summary={summary}
            />
          </div>
        </div>

        {/* Table — onEdit sets editTarget, which opens the modal */}
        <ExpenseTable
          expenses={expenses}
          loading={loading}
          error={error}
          onEdit={setEditTarget}
          onDelete={removeExpense}
        />

        {/* Chart */}
        <ExpenseChart summary={summary} />
      </main>

      {/*
        Modal lives outside <main> so it's never clipped by any
        overflow:hidden parent and sits above all page content (z-50).
        Conditional render also fully unmounts the component on close,
        which resets all local form state automatically.
      */}
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