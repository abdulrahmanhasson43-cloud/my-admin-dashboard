import type { Expense, ExpenseCategoryMeta } from '@/types';

/**
 * IExpenseRepository — the abstraction (port) that ExpenseService depends on.
 *
 * Dependency Inversion: ExpenseService (high-level policy) depends on THIS
 * interface, never on a concrete storage technology. A real backend adapter
 * can replace MockExpenseRepository without touching any UI code.
 */
export interface IExpenseRepository {
  /** Returns every expense. Ordering is NOT guaranteed — callers sort as needed. */
  findAll(): Promise<Expense[]>;

  /** Returns a single expense by id, or null if it doesn't exist. */
  findById(id: string): Promise<Expense | null>;

  /** Persists a brand-new expense and returns the stored record. */
  insert(expense: Expense): Promise<Expense>;

  /** Persists a full replacement of an existing expense, or throws if the id is unknown. */
  update(expense: Expense): Promise<Expense>;

  /** Removes an expense by id. No-ops if it doesn't exist. */
  remove(id: string): Promise<void>;

  /** Category metadata (label + colour) used by the UI for legends and forms. */
  findCategories(): ExpenseCategoryMeta[];
}

/** Thrown by repository implementations when an expense id can't be found. */
export class ExpenseNotFoundError extends Error {
  constructor(id: string) {
    super(`Expense not found: ${id}`);
    this.name = 'ExpenseNotFoundError';
  }
}
