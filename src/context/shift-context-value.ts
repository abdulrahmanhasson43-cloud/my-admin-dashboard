import { createContext, useContext } from 'react';
import type { Shift } from '@/types';

export interface ShiftContextValue {
  shifts: Shift[];
  currentShift: Shift | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  /** فتح وردية جديدة بمبلغ افتتاحي — تمر عبر ShiftService الآن، لذا أصبحت async */
  openShift: (cashierName: string, openingAmount: number) => Promise<Shift>;
  /** إغلاق الوردية الحالية بمبلغ ختامي */
  closeShift: (closingAmount: number) => Promise<Shift>;
  /** إضافة مبيعة إلى الوردية الحالية (تُستدعى عند الدفع) */
  recordSale: (amount: number) => Promise<Shift | null>;
}

export const ShiftContext = createContext<ShiftContextValue | null>(null);

export function useShift() {
  const ctx = useContext(ShiftContext);
  if (!ctx) {
    throw new Error('useShift must be used within a ShiftProvider');
  }
  return ctx;
}
