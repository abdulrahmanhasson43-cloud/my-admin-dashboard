import type { Expense, ExpenseCategoryMeta } from '@/types';
import { sampleExpenses, expenseCategories } from '@/services/mock/expenses';
import { ExpenseNotFoundError } from './IExpenseRepository';
import type { IExpenseRepository } from './IExpenseRepository';

/**
 * MockExpenseRepository — an in-memory implementation of IExpenseRepository.
 *
 * TODO(phase-3): replace with a real adapter (e.g. FirestoreExpenseRepository)
 * that implements the same interface. Swap it in one place —
 * src/context/ExpenseServiceContext.tsx — and nothing else changes.
 */
export class MockExpenseRepository implements IExpenseRepository {
  private expenses: Expense[];
  private readonly categories: ExpenseCategoryMeta[];

  constructor(
    seed: Expense[] = sampleExpenses,
    categorySeed: ExpenseCategoryMeta[] = expenseCategories,
  ) {
    // Copy so mutations here never reach back into the shared mock fixtures.
    this.expenses = seed.map(e => ({ ...e }));
    this.categories = categorySeed.map(c => ({ ...c }));
  }

  async findAll(): Promise<Expense[]> {
    return [...this.expenses];
  }

  async findById(id: string): Promise<Expense | null> {
    return this.expenses.find(e => e.id === id) ?? null;
  }

  async insert(expense: Expense): Promise<Expense> {
    this.expenses = [...this.expenses, expense];
    return expense;
  }

  async update(expense: Expense): Promise<Expense> {
    const index = this.expenses.findIndex(e => e.id === expense.id);
    if (index === -1) {
      throw new ExpenseNotFoundError(expense.id);
    }
    this.expenses = [
      ...this.expenses.slice(0, index),
      expense,
      ...this.expenses.slice(index + 1),
    ];
    return expense;
  }

  async remove(id: string): Promise<void> {
    this.expenses = this.expenses.filter(e => e.id !== id);
  }

  findCategories(): ExpenseCategoryMeta[] {
    return this.categories.map(c => ({ ...c }));
  }
}
