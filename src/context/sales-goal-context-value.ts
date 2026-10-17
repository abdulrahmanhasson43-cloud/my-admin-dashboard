import { createContext, useContext } from 'react';
import type { SalesGoal } from '@/types';

export interface SalesGoalContextValue {
  /** الهدف للشهر الحالي */
  currentGoal: SalesGoal | null;
  /** تحديد/تعديل هدف الشهر الحالي */
  setTarget: (target: number) => void;
  /** تحديث المبلغ المحقق (يُستدعى عند كل بيع) */
  addAchieved: (amount: number) => void;
  /** النسبة المئوية للتقدم (0-100) */
  progressPercent: number;
  /** هل تم بلوغ الهدف؟ */
  isGoalReached: boolean;
}

export const SalesGoalContext = createContext<SalesGoalContextValue | null>(null);

export function useSalesGoal() {
  const ctx = useContext(SalesGoalContext);
  if (!ctx) {
    throw new Error('useSalesGoal must be used within a SalesGoalProvider');
  }
  return ctx;
}
