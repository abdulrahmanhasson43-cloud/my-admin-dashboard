import { createContext, useContext } from 'react';
import type { ProductService } from '@/services/product';

export const ProductServiceContext = createContext<ProductService | null>(null);

/**
 * useProductService — gives any component access to the injected
 * ProductService instance, without that component ever knowing which
 * IProductRepository is behind it. Components should generally prefer the
 * higher-level useProducts() hook for reactive state; reach for this directly
 * only when you need one-off imperative calls.
 */
export function useProductService(): ProductService {
  const service = useContext(ProductServiceContext);
  if (!service) {
    throw new Error('useProductService must be used within a ProductServiceProvider');
  }
  return service;
}
