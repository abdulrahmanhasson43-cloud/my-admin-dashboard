import { createContext, useContext } from 'react';
import type { HeldOrder, CartItem } from '@/types';

export interface HeldOrdersContextValue {
  heldOrders: HeldOrder[];
  /** تعليق طلب — يحفظ محتوى السلة الحالية. reason اختياري (الفكرة #12) */
  holdOrder: (label: string, items: CartItem[], subtotal: number, tax: number, total: number, reason?: string) => void;
  /** استرجاع طلب معلق — يرجّع عناصره ويحذفه من القائمة */
  resumeOrder: (id: string) => HeldOrder | null;
  /** حذف طلب معلق */
  deleteHeldOrder: (id: string) => void;
  heldCount: number;
}

export const HeldOrdersContext = createContext<HeldOrdersContextValue | null>(null);

export function useHeldOrders() {
  const ctx = useContext(HeldOrdersContext);
  if (!ctx) {
    throw new Error('useHeldOrders must be used within a HeldOrdersProvider');
  }
  return ctx;
}
