import type { Expense, ExpenseCategory, ExpenseCategoryMeta } from '@/types';
import { generateId } from '@/lib/utils';
import type { IExpenseRepository } from './IExpenseRepository';

/** Input accepted when creating an expense from the UI. */
export interface CreateExpenseInput {
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  paymentMethod: Expense['paymentMethod'];
  notes?: string;
  createdBy: string;
}

/** Thrown when a caller tries to create/update an expense with invalid data. */
export class InvalidExpenseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidExpenseError';
  }
}

/**
 * ExpenseService — all expense business logic lives here, and ONLY here.
 *
 * High-level module in Dependency Inversion terms: it depends solely on the
 * IExpenseRepository abstraction injected through the constructor. The UI
 * reaches this service through useExpenses() and never touches services/mock.
 */
export class ExpenseService {
  private readonly repository: IExpenseRepository;

  constructor(repository: IExpenseRepository) {
    this.repository = repository;
  }

  async getAllExpenses(): Promise<Expense[]> {
    return this.repository.findAll();
  }

  async getExpenseById(id: string): Promise<Expense | null> {
    return this.repository.findById(id);
  }

  async createExpense(input: CreateExpenseInput): Promise<Expense> {
    if (!input.description.trim()) {
      throw new InvalidExpenseError('Expense description is required');
    }
    if (input.amount <= 0) {
      throw new InvalidExpenseError('Expense amount must be greater than zero');
    }

    const expense: Expense = {
      id: generateId('EXP'),
      description: input.description.trim(),
      amount: input.amount,
      category: input.category,
      date: input.date,
      paymentMethod: input.paymentMethod,
      notes: input.notes,
      createdBy: input.createdBy,
    };

    return this.repository.insert(expense);
  }

  async updateExpense(id: string, updates: Partial<Omit<Expense, 'id'>>): Promise<Expense> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new InvalidExpenseError(`Cannot update unknown expense: ${id}`);
    }
    return this.repository.update({ ...existing, ...updates });
  }

  async deleteExpense(id: string): Promise<void> {
    return this.repository.remove(id);
  }

  /** Category metadata (label + colour) for legends, filters and forms. */
  getCategories(): ExpenseCategoryMeta[] {
    return this.repository.findCategories();
  }

  /** Metadata for a single category, falling back to the "other" bucket. */
  getCategoryMeta(id: string): ExpenseCategoryMeta {
    const categories = this.repository.findCategories();
    return categories.find(c => c.id === id) ?? categories[categories.length - 1];
  }
}
