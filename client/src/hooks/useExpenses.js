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
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await expenseService.getAll(filters);
      setExpenses(res.data);
    } catch (err) {
      setError("Failed to load expenses. Is the server running?");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await expenseService.getSummary();
      setSummary(res.data);
    } catch {
      // Summary failing shouldn't block the whole page
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

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

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({ category: "", startDate: "", endDate: "" });
  };

  return {
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
  };
}