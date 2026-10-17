import { useDataServices } from './data-services-context-value';
import type { ProductService } from '@/services/product';

/**
 * useProductService — gives any component the injected ProductService from the single
 * composition root (DataServicesProvider), without knowing which
 * IProductRepository is behind it. Prefer the higher-level useProducts() hook for
 * reactive state; reach for this directly only for one-off imperative calls.
 */
export function useProductService(): ProductService {
  return useDataServices().product;
}
