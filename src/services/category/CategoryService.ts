import type { Category } from '@/types';
import { generateId } from '@/lib/utils';
import type { ICategoryRepository } from './ICategoryRepository';

/** Input accepted when creating a category from the UI. */
export interface CreateCategoryInput {
  name: string;
  color?: string;
}

/** Thrown when a caller tries to create/update a category with invalid data. */
export class InvalidCategoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCategoryError';
  }
}

/**
 * CategoryService — all category business logic lives here, and ONLY here.
 *
 * High-level module in Dependency Inversion terms: it depends solely on the
 * ICategoryRepository abstraction injected through the constructor, never on
 * a concrete storage technology. The UI (pages/components) reaches this
 * service through useCategories() and never touches services/mock directly.
 */
export class CategoryService {
  private readonly repository: ICategoryRepository;

  constructor(repository: ICategoryRepository) {
    this.repository = repository;
  }

  async getAllCategories(): Promise<Category[]> {
    return this.repository.findAll();
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return this.repository.findById(id);
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    if (!input.name.trim()) {
      throw new InvalidCategoryError('Category name is required');
    }

    const category: Category = {
      id: generateId('CAT'),
      name: input.name.trim(),
      productCount: 0,
      color: input.color ?? 'var(--vuno-primary)',
    };

    return this.repository.insert(category);
  }

  async updateCategory(id: string, updates: Partial<Omit<Category, 'id'>>): Promise<Category> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new InvalidCategoryError(`Cannot update unknown category: ${id}`);
    }
    return this.repository.update({ ...existing, ...updates });
  }

  async deleteCategory(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
