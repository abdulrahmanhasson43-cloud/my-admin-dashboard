import { createContext, useContext } from 'react';
import type { CategoryService } from '@/services/category';

export const CategoryServiceContext = createContext<CategoryService | null>(null);

/**
 * useCategoryService — gives any component access to the injected
 * CategoryService instance without that component ever knowing which
 * ICategoryRepository is behind it. Components should generally prefer the
 * higher-level useCategories() hook for reactive state.
 */
export function useCategoryService(): CategoryService {
  const service = useContext(CategoryServiceContext);
  if (!service) {
    throw new Error('useCategoryService must be used within a CategoryServiceProvider');
  }
  return service;
}
