import { describe, expect, it } from 'vitest';
import type { Expense } from '@/types';
import { ExpenseService, InvalidExpenseError, type CreateExpenseInput } from './ExpenseService';
import { MockExpenseRepository } from './MockExpenseRepository';

const input = (overrides: Partial<CreateExpenseInput> = {}): CreateExpenseInput =>
  ({ description: 'إيجار', amount: 5000, category: 'rent', date: '2026-01-01', paymentMethod: 'cash', createdBy: 'M', ...overrides } as CreateExpenseInput);

const service = (seed: Expense[] = []) => new ExpenseService(new MockExpenseRepository(seed));

describe('ExpenseService', () => {
  it('creates an expense with a trimmed description', async () => {
    const created = await service().createExpense(input({ description: '  إيجار  ' }));
    expect(created.description).toBe('إيجار');
    expect(created.amount).toBe(5000);
    expect(created.id).toMatch(/^EXP-/);
  });

  it('rejects a blank description and a zero or negative amount', async () => {
    const svc = service();
    await expect(svc.createExpense(input({ description: ' ' }))).rejects.toThrow(InvalidExpenseError);
    await expect(svc.createExpense(input({ amount: 0 }))).rejects.toThrow(InvalidExpenseError);
    await expect(svc.createExpense(input({ amount: -5 }))).rejects.toThrow(InvalidExpenseError);
  });

  it('update merges the changes; unknown ids are rejected', async () => {
    const svc = service();
    const created = await svc.createExpense(input());
    const updated = await svc.updateExpense(created.id, { amount: 6000 });
    expect(updated.amount).toBe(6000);
    expect(updated.description).toBe('إيجار');
    await expect(svc.updateExpense('nope', {})).rejects.toThrow(InvalidExpenseError);
  });

  it('delete removes the expense', async () => {
    const svc = service();
    const created = await svc.createExpense(input());
    await svc.deleteExpense(created.id);
    expect(await svc.getExpenseById(created.id)).toBeNull();
  });
});
