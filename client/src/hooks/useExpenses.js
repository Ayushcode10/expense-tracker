import { useState, useEffect, useCallback } from "react";
import { expenseService } from "../services/expenseService";

export function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
  });

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetch expenses ─────────────────────────────────────────────────────
  // Single useEffect reads filters directly — no useCallback chain.
  // The cancellation flag prevents setting state on an unmounted component
  // (e.g. if the user changes filters before the previous request finishes).
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await expenseService.getAll(filters);
        if (!cancelled) setExpenses(res.data);
      } catch {
        if (!cancelled) setError("Failed to load expenses. Is the server running?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    // Cleanup: if filters change before the request resolves,
    // discard the stale response instead of overwriting fresh data
    return () => { cancelled = true; };

  // Primitive string deps — value comparison, never stale
  }, [filters.category, filters.startDate, filters.endDate]);

  // ── Fetch summary ──────────────────────────────────────────────────────
  // Separate effect — runs when selected month/year changes
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await expenseService.getSummary(selectedMonth, selectedYear);
      setSummary(res.data);
    } catch {
      // Non-blocking — summary failure shouldn't break the whole page
    } finally {
      setSummaryLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // ── Mutations ──────────────────────────────────────────────────────────
  const addExpense = async (data) => {
    const res = await expenseService.create(data);
    setExpenses((prev) => [res.data, ...prev]);
    fetchSummary();
    return res.data;
  };

  const editExpense = async (id, data) => {
    const res = await expenseService.update(id, data);
    setExpenses((prev) => prev.map((e) => (e.id === id ? res.data : e)));
    fetchSummary();
    return res.data;
  };

  const removeExpense = async (id) => {
    await expenseService.remove(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    fetchSummary();
  };

  // ── Filter controls ────────────────────────────────────────────────────
  const applyFilters  = (newFilters) => setFilters(newFilters);
  const clearFilters  = () => setFilters({ category: "", startDate: "", endDate: "" });
  const changeMonth   = (month, year) => { setSelectedMonth(month); setSelectedYear(year); };

  return {
    expenses,
    summary,
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