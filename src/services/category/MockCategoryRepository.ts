import type { Category } from '@/types';
import { sampleCategories } from '@/services/mock/categories';
import { CategoryNotFoundError } from './ICategoryRepository';
import type { ICategoryRepository } from './ICategoryRepository';

/**
 * MockCategoryRepository — an in-memory implementation of ICategoryRepository.
 *
 * This is a low-level module: it implements the abstraction rather than
 * CategoryService depending on it directly. CategoryService never imports
 * this file.
 *
 * TODO(phase-3): replace with a real adapter (e.g. FirestoreCategoryRepository)
 * that implements the same interface. Swap it in one place —
 * src/context/CategoryServiceContext.tsx — and nothing else changes.
 */
export class MockCategoryRepository implements ICategoryRepository {
  private categories: Category[];

  constructor(seed: Category[] = sampleCategories) {
    // Copy so mutations here never reach back into the shared mock fixture.
    this.categories = seed.map(c => ({ ...c }));
  }

  async findAll(): Promise<Category[]> {
    return [...this.categories];
  }

  async findById(id: string): Promise<Category | null> {
    return this.categories.find(c => c.id === id) ?? null;
  }

  async insert(category: Category): Promise<Category> {
    this.categories = [...this.categories, category];
    return category;
  }

  async update(category: Category): Promise<Category> {
    const index = this.categories.findIndex(c => c.id === category.id);
    if (index === -1) {
      throw new CategoryNotFoundError(category.id);
    }
    this.categories = [
      ...this.categories.slice(0, index),
      category,
      ...this.categories.slice(index + 1),
    ];
    return category;
  }

  async remove(id: string): Promise<void> {
    this.categories = this.categories.filter(c => c.id !== id);
  }
}
