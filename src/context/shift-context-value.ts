import { createContext, useContext } from 'react';
import type { Shift } from '@/types';

export interface ShiftContextValue {
  shifts: Shift[];
  currentShift: Shift | null;
  /** فتح وردية جديدة بمبلغ افتتاحي */
  openShift: (cashierName: string, openingAmount: number) => Shift;
  /** إغلاق الوردية الحالية بمبلغ ختامي */
  closeShift: (closingAmount: number) => void;
  /** إضافة مبيعة إلى الوردية الحالية (تُستدعى عند الدفع) */
  recordSale: (amount: number) => void;
}

export const ShiftContext = createContext<ShiftContextValue | null>(null);

export function useShift() {
  const ctx = useContext(ShiftContext);
  if (!ctx) {
    throw new Error('useShift must be used within a ShiftProvider');
  }
  return ctx;
}
