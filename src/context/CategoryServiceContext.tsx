import { useMemo, type ReactNode } from 'react';
import { CategoryService } from '@/services/category';
import { MockCategoryRepository } from '@/services/category/MockCategoryRepository';
import { CategoryServiceContext } from './category-service-context';

/**
 * CategoryServiceProvider — the composition root for the category module.
 *
 * This is the ONLY file in the entire app allowed to import
 * MockCategoryRepository. Every other component reaches CategoryService
 * through useCategoryService() / useCategories().
 *
 * TODO(phase-3): once a real backend exists, this becomes:
 *   new CategoryService(new FirestoreCategoryRepository(db))
 * — one line, here, and nowhere else in the app changes.
 */
export function CategoryServiceProvider({ children }: { children: ReactNode }) {
  const service = useMemo(() => new CategoryService(new MockCategoryRepository()), []);

  return (
    <CategoryServiceContext.Provider value={service}>
      {children}
    </CategoryServiceContext.Provider>
  );
}
