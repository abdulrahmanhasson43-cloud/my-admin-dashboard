import { useState, useCallback, type ReactNode } from 'react';
import type { Product, CartItem } from '@/types';
import { sampleProducts } from '@/services/mock';
import { ProductsContext, type PendingTransfer } from './products-context-value';

function generateProductId(existing: Product[]): string {
  const maxId = existing.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
  return String(maxId + 1);
}

// TODO(phase-3): back this with real Firestore/Supabase reads+writes instead
// of in-memory React state. For now, adding/editing/selling/transferring
// products here updates state immediately, and any page reading from
// useProducts() sees it.
export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransfer[]>([]);

  // A sale only ever comes off the shop-floor quantity — a customer can't
  // buy what's still sitting in the warehouse. Total stock is kept in sync.
  const sellProducts = useCallback((items: CartItem[]) => {
    setProducts(prev => prev.map(product => {
      const sold = items.find(item => item.id === product.id);
      if (!sold) return product;
      const newStoreStock = Math.max(0, product.storeStock - sold.quantity);
      return { ...product, storeStock: newStoreStock, stock: newStoreStock + product.warehouseStock };
    }));
  }, []);

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...product, id: generateProductId(prev) }]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Omit<Product, 'id'>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...updates, id } : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // Moves quantity from the warehouse into the store immediately, making it
  // sellable. Total stock doesn't change — only where it physically sits.
  const transferToStore = useCallback((productId: string, quantity: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const moved = Math.max(0, Math.min(quantity, p.warehouseStock));
      return { ...p, storeStock: p.storeStock + moved, warehouseStock: p.warehouseStock - moved };
    }));
  }, []);

  // Used when Settings > "النقل بين الفروع يحتاج تأكيد" is on: queues the
  // move instead of executing it right away.
  const requestTransfer = useCallback((productId: string, quantity: number) => {
    setPendingTransfers(prev => [
      ...prev,
      { id: String(Date.now()), productId, quantity, createdAt: new Date().toLocaleString('ar-EG') },
    ]);
  }, []);

  const confirmTransfer = useCallback((transferId: string) => {
    setPendingTransfers(prev => {
      const transfer = prev.find(t => t.id === transferId);
      if (transfer) {
        setProducts(prods => prods.map(p => {
          if (p.id !== transfer.productId) return p;
          const moved = Math.max(0, Math.min(transfer.quantity, p.warehouseStock));
          return { ...p, storeStock: p.storeStock + moved, warehouseStock: p.warehouseStock - moved };
        }));
      }
      return prev.filter(t => t.id !== transferId);
    });
  }, []);

  const cancelTransfer = useCallback((transferId: string) => {
    setPendingTransfers(prev => prev.filter(t => t.id !== transferId));
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        products, sellProducts, addProduct, updateProduct, deleteProduct, transferToStore,
        pendingTransfers, requestTransfer, confirmTransfer, cancelTransfer,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}
