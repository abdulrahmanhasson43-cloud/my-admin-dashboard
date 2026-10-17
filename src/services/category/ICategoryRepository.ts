import type { Category } from '@/types';

/**
 * ICategoryRepository — the abstraction (port) that CategoryService depends on.
 *
 * Dependency Inversion: CategoryService (high-level policy) depends on THIS
 * interface, never on a concrete storage technology. Concrete adapters
 * (MockCategoryRepository today; a FirestoreCategoryRepository tomorrow)
 * implement this same interface, so swapping storage touches exactly one
 * file — the composition root — and nothing else in the app.
 */
export interface ICategoryRepository {
  /** Returns every category. Ordering is NOT guaranteed — callers sort as needed. */
  findAll(): Promise<Category[]>;

  /** Returns a single category by id, or null if it doesn't exist. */
  findById(id: string): Promise<Category | null>;

  /** Persists a brand-new category and returns the stored record. */
  insert(category: Category): Promise<Category>;

  /** Persists a full replacement of an existing category, or throws if the id is unknown. */
  update(category: Category): Promise<Category>;

  /** Removes a category by id. No-ops if it doesn't exist. */
  remove(id: string): Promise<void>;
}

/** Thrown by repository implementations when a category id can't be found. */
export class CategoryNotFoundError extends Error {
  constructor(id: string) {
    super(`Category not found: ${id}`);
    this.name = 'CategoryNotFoundError';
  }
}
