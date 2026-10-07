import { createContext, useContext } from 'react';
import type { Product, CartItem } from '@/types';
import type { PendingTransfer, TransferHistoryEntry } from '@/services/product';

// Re-export the transfer domain types (now owned by the service layer) so
// existing imports from this module keep working. The Dependency Rule holds:
// this context layer depends on the service layer, never the reverse.
export type { PendingTransfer, TransferHistoryEntry };

/**
 * The contract every useProducts() consumer codes against.
 *
 * Every mutating action returns a real Promise that REJECTS on failure — the
 * adapter (ProductsProvider) no longer swallows errors behind a
 * fire-and-forget `void x().then(refresh)`. Callers must therefore either
 * `await` the action inside an async function or attach a `.catch()` if they
 * genuinely intend to ignore the result. Anything else surfaces as an
 * unhandled promise rejection in the console.
 *
 * `isLoading`, `error` and `refresh` let a page render the loading state and
 * the error banner, and retry a failed snapshot read.
 */
export interface ProductsContextValue {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  sellProducts: (items: CartItem[]) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  transferToStore: (productId: string, quantity: number) => Promise<void>;
  pendingTransfers: PendingTransfer[];
  requestTransfer: (productId: string, quantity: number) => Promise<void>;
  confirmTransfer: (transferId: string) => Promise<void>;
  cancelTransfer: (transferId: string) => Promise<void>;
  transferHistory: TransferHistoryEntry[];
}

export const ProductsContext = createContext<ProductsContextValue | null>(null);

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return ctx;
}
