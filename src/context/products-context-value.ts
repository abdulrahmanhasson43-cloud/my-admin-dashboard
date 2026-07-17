import { createContext, useContext } from 'react';
import type { Product, CartItem } from '@/types';

export interface PendingTransfer {
  id: string;
  productId: string;
  quantity: number;
  createdAt: string;
}

export interface ProductsContextValue {
  products: Product[];
  sellProducts: (items: CartItem[]) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  transferToStore: (productId: string, quantity: number) => void;
  pendingTransfers: PendingTransfer[];
  requestTransfer: (productId: string, quantity: number) => void;
  confirmTransfer: (transferId: string) => void;
  cancelTransfer: (transferId: string) => void;
}

export const ProductsContext = createContext<ProductsContextValue | null>(null);

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return ctx;
}
