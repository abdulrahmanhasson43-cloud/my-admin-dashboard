import { useState, useCallback, useMemo, type ReactNode } from 'react';
import { HeldOrdersContext } from '@/context/held-orders-context-value';
import type { HeldOrder, CartItem } from '@/types';

const STORAGE_KEY = 'vuno_held_orders';

function loadHeld(): HeldOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as HeldOrder[];
  } catch {
    // ignore
  }
  return [];
}

export function HeldOrdersProvider({ children }: { children: ReactNode }) {
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>(loadHeld);

  const persist = useCallback((orders: HeldOrder[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, []);

  const holdOrder = useCallback((
    label: string,
    items: CartItem[],
    subtotal: number,
    tax: number,
    total: number,
    reason?: string,
  ) => {
    const order: HeldOrder = {
      id: 'HLD-' + Date.now().toString().slice(-6),
      label: label || `طلب معلق #${Date.now().toString().slice(-4)}`,
      reason,
      items: items.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      subtotal,
      tax,
      total,
      createdAt: new Date().toLocaleString('ar-EG'),
    };
    setHeldOrders(prev => {
      const next = [order, ...prev];
      persist(next);
      return next;
    });
  }, [persist]);

  const resumeOrder = useCallback((id: string): HeldOrder | null => {
    let found: HeldOrder | null = null;
    setHeldOrders(prev => {
      found = prev.find(o => o.id === id) ?? null;
      const next = prev.filter(o => o.id !== id);
      persist(next);
      return next;
    });
    return found;
  }, [persist]);

  const deleteHeldOrder = useCallback((id: string) => {
    setHeldOrders(prev => {
      const next = prev.filter(o => o.id !== id);
      persist(next);
      return next;
    });
  }, [persist]);

  const heldCount = heldOrders.length;

  const value = useMemo(() => ({
    heldOrders,
    holdOrder,
    resumeOrder,
    deleteHeldOrder,
    heldCount,
  }), [heldOrders, holdOrder, resumeOrder, deleteHeldOrder, heldCount]);

  return (
    <HeldOrdersContext.Provider value={value}>
      {children}
    </HeldOrdersContext.Provider>
  );
}
