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

  // Month/year for the summary panel — defaults to current month
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetch expenses ─────────────────────────────────────────────────────
  // Use primitive string values as deps, NOT the filters object.
  // String comparison is value-based; object comparison is reference-based.
  // This prevents stale closures and missed re-fetches.
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await expenseService.getAll(filters);
      setExpenses(res.data);
    } catch {
      setError("Failed to load expenses. Is the server running?");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.startDate, filters.endDate]);

  // ── Fetch summary for the selected month/year ──────────────────────────
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await expenseService.getSummary(selectedMonth, selectedYear);
      setSummary(res.data);
    } catch {
      // Summary failure is non-blocking
    } finally {
      setSummaryLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);
  useEffect(() => { fetchSummary(); }, [fetchSummary]);

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
  const applyFilters = (newFilters) => setFilters(newFilters);

  const clearFilters = () =>
    setFilters({ category: "", startDate: "", endDate: "" });

  // ── Month/year picker control ──────────────────────────────────────────
  const changeMonth = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

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