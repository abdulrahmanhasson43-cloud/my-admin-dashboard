import { useMemo, type ReactNode } from 'react';
import { ProductService } from '@/services/product';
import { MockProductRepository } from '@/services/product/MockProductRepository';
import { ProductServiceContext } from './product-service-context';

/**
 * ProductServiceProvider — the composition root for the product module.
 *
 * This is the ONLY file in the entire app that is allowed to import
 * MockProductRepository. Every other component reaches ProductService through
 * useProductService() / useProducts() and has zero knowledge of what's behind
 * the IProductRepository interface.
 *
 * TODO(phase-3): once a real backend exists, this becomes:
 *   new ProductService(new FirestoreProductRepository(db))
 * — one line, here, and nowhere else in the app changes.
 */
export function ProductServiceProvider({ children }: { children: ReactNode }) {
  const service = useMemo(() => new ProductService(new MockProductRepository()), []);

  return (
    <ProductServiceContext.Provider value={service}>
      {children}
    </ProductServiceContext.Provider>
  );
}
