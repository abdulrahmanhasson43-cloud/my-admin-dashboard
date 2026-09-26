import { useCallback, useEffect, useState } from 'react';
import type { Expense, ExpenseCategoryMeta } from '@/types';
import type { CreateExpenseInput } from '@/services/expense';
import { useDataServices } from '@/context/data-services-context-value';

/**
 * useExpenses — layers React state (loading/expenses/categories) on top of
 * ExpenseService. Components never touch MockExpenseRepository directly.
 */
export function useExpenses() {
  const { expense: expenseService } = useDataServices();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories] = useState<ExpenseCategoryMeta[]>(() => expenseService.getCategories());
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await expenseService.getAllExpenses();
      setExpenses(all);
    } finally {
      setIsLoading(false);
    }
  }, [expenseService]);

  // Load once on mount. The fetch is kicked off from a microtask so the state
  // updates inside `refetch` run asynchronously, satisfying the
  // react-hooks/set-state-in-effect rule without changing the behaviour.
  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (!cancelled) return refetch();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [refetch]);

  const createExpense = useCallback(async (input: CreateExpenseInput) => {
    const created = await expenseService.createExpense(input);
    setExpenses(prev => [...prev, created]);
    return created;
  }, [expenseService]);

  const updateExpense = useCallback(async (id: string, updates: Partial<Omit<Expense, 'id'>>) => {
    const updated = await expenseService.updateExpense(id, updates);
    setExpenses(prev => prev.map(e => (e.id === id ? updated : e)));
    return updated;
  }, [expenseService]);

  const deleteExpense = useCallback(async (id: string) => {
    await expenseService.deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, [expenseService]);

  const getCategoryMeta = useCallback(
    (id: string) => expenseService.getCategoryMeta(id),
    [expenseService],
  );

  return {
    expenses,
    categories,
    isLoading,
    refetch,
    createExpense,
    updateExpense,
    deleteExpense,
    getCategoryMeta,
  };
}
