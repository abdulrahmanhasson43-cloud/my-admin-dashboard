import { describe, expect, it } from 'vitest';
import { expenseCategories, getCategoryMeta } from './expense';

describe('expense categories', () => {
  it('getCategoryMeta finds a category by id', () => {
    expect(getCategoryMeta('salaries').id).toBe('salaries');
  });

  it('falls back to the last category ("other") for an unknown id', () => {
    expect(getCategoryMeta('???').id).toBe('other');
    expect(expenseCategories[expenseCategories.length - 1].id).toBe('other');
  });

  it('gives every category an id, a label and a colour', () => {
    for (const category of expenseCategories) {
      expect(category.id).toBeTruthy();
      expect(category.label).toBeTruthy();
      expect(category.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
