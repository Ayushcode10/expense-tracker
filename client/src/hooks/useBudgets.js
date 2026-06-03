import { useState, useEffect } from "react";

const STORAGE_KEY = "expense_tracker_budgets";

export function useBudgets() {
  const [budgets, setBudgets] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  }, [budgets]);

  const saveBudget = (category, amount) => {
    const parsed = parseFloat(amount);
    if (!category || isNaN(parsed) || parsed <= 0) return;
    setBudgets((prev) => ({ ...prev, [category]: parsed }));
  };

  const removeBudget = (category) => {
    setBudgets((prev) => {
      const updated = { ...prev };
      delete updated[category];
      return updated;
    });
  };

  return { budgets, saveBudget, removeBudget };
}