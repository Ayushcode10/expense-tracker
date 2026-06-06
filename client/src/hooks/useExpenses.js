import { useState, useEffect, useCallback, useMemo } from "react";
import { expenseService } from "../services/expenseService";

export function useExpenses() {
  const [expenses, setExpenses]       = useState([]);
  const [allExpenses, setAllExpenses] = useState([]); // unfiltered, for budget
  const [summary, setSummary]         = useState(null);

  const [filters, setFilters] = useState({
    category:  "",
    startDate: "",
    endDate:   "",
  });

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear,  setSelectedYear]  = useState(today.getFullYear());

  const [loading,        setLoading]        = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error,          setError]          = useState(null);

  // ── 1. Filtered expenses → expense table ──────────────────────────────
  // `filters` is React state. Its reference only changes when setFilters()
  // is called (applyFilters / clearFilters). Using it as a dep is correct
  // and reliable — no need for primitive destructuring or useCallback chains.
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    expenseService
      .getAll(filters)
      .then((res) => {
        if (!cancelled) setExpenses(res.data);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load expenses. Is the server running?");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // If filters change before this request resolves, cancel it
    // so a stale response never overwrites a fresher one
    return () => {
      cancelled = true;
    };
  }, [filters]);

  // ── 2. All expenses → budget calculation ──────────────────────────────
  // Always unfiltered. Budget progress must show the full month's spending
  // regardless of what filter the user has on the expense table.
  const fetchAllExpenses = useCallback(async () => {
    try {
      const res = await expenseService.getAll({});
      setAllExpenses(res.data);
    } catch {
      // Non-blocking — budget tracker just shows 0 if this fails
    }
  }, []);

  useEffect(() => {
    fetchAllExpenses();
  }, [fetchAllExpenses]);

  // ── 3. Budget spending — computed, not fetched ────────────────────────
  // Derived from allExpenses so it's always in sync with real data.
  // Filtered to the current calendar month only.
  const budgetSpending = useMemo(() => {
    const now          = new Date();
    const thisMonth    = now.getMonth() + 1;
    const thisYear     = now.getFullYear();

    return allExpenses
      .filter((e) => {
        // Split the ISO date string to avoid timezone conversion issues.
        // new Date("2026-06-01") is interpreted as UTC midnight which can
        // shift to the previous day in UTC+5:30 when using .getMonth() etc.
        const [y, m] = e.date.split("-").map(Number);
        return m === thisMonth && y === thisYear;
      })
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
        return acc;
      }, {});
  }, [allExpenses]);

  // ── 4. Summary → summary cards + chart ───────────────────────────────
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await expenseService.getSummary(selectedMonth, selectedYear);
      setSummary(res.data);
    } catch {
      // Non-blocking
    } finally {
      setSummaryLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // ── Mutations ──────────────────────────────────────────────────────────
  // After every write: refresh the filtered table (already handled by
  // the filters effect since expenses state updates trigger re-render),
  // refresh allExpenses so budget numbers stay accurate, and refresh summary.
  const addExpense = async (data) => {
    const res = await expenseService.create(data);
    // Prepend to filtered list (visible immediately without re-fetch)
    setExpenses((prev) => [res.data, ...prev]);
    fetchAllExpenses();
    fetchSummary();
    return res.data;
  };

  const editExpense = async (id, data) => {
    const res = await expenseService.update(id, data);
    setExpenses((prev) => prev.map((e) => (e.id === id ? res.data : e)));
    fetchAllExpenses();
    fetchSummary();
    return res.data;
  };

  const removeExpense = async (id) => {
    await expenseService.remove(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    fetchAllExpenses();
    fetchSummary();
  };

  // ── Filter controls ───────────────────────────────────────────────────
  const applyFilters = (newFilters) => setFilters(newFilters);
  const clearFilters = () =>
    setFilters({ category: "", startDate: "", endDate: "" });

  // ── Month picker (summary cards) ──────────────────────────────────────
  const changeMonth = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  return {
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
  };
}