import { useDataServices } from './data-services-context-value';
import type { CategoryService } from '@/services/category';

/**
 * useCategoryService — gives any component the injected CategoryService from the single
 * composition root (DataServicesProvider), without knowing which
 * ICategoryRepository is behind it. Prefer the higher-level useCategories() hook for
 * reactive state; reach for this directly only for one-off imperative calls.
 */
export function useCategoryService(): CategoryService {
  return useDataServices().category;
}
