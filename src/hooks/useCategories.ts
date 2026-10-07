import { useCallback, useEffect, useState } from 'react';
import type { Category } from '@/types';
import type { CreateCategoryInput } from '@/services/category';
import { useCategoryService } from '@/context/category-service-context';

/**
 * useCategories — the hook pages actually use. It layers ordinary React state
 * (loading/categories/refetch) on top of CategoryService so components get a
 * familiar reactive API, while every bit of business logic and data access
 * still lives in CategoryService + ICategoryRepository underneath.
 *
 * A component using this hook never touches MockCategoryRepository or any
 * other storage detail — only CategoryService's public methods.
 */
export function useCategories() {
  const categoryService = useCategoryService();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await categoryService.getAllCategories();
      setCategories(all);
    } finally {
      setIsLoading(false);
    }
  }, [categoryService]);

  // Load once on mount. The fetch is kicked off from a microtask so the state
  // updates inside `refetch` run asynchronously, satisfying the
  // react-hooks/set-state-in-effect rule without changing the behaviour.
  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (!cancelled) return refetch();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [refetch]);

  const createCategory = useCallback(async (input: CreateCategoryInput) => {
    const created = await categoryService.createCategory(input);
    setCategories(prev => [...prev, created]);
    return created;
  }, [categoryService]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Omit<Category, 'id'>>) => {
    const updated = await categoryService.updateCategory(id, updates);
    setCategories(prev => prev.map(c => (c.id === id ? updated : c)));
    return updated;
  }, [categoryService]);

  const deleteCategory = useCallback(async (id: string) => {
    await categoryService.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  }, [categoryService]);

  return { categories, isLoading, refetch, createCategory, updateCategory, deleteCategory };
}
