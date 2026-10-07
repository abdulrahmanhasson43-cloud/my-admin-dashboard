import { useCallback } from 'react';
import { useProducts } from '@/context/products-context-value';
import { useShift } from '@/context/shift-context-value';
import { useSalesGoal } from '@/context/sales-goal-context-value';
import { useActivityLog } from '@/context/activity-log-context-value';
import { completeSale, type CompleteSaleInput } from '@/services/sale';

/**
 * useCompleteSale — plugs the real contexts into the CompleteSale use case.
 * This hook is the only wiring; the rules live in services/sale/CompleteSale.ts.
 */
export function useCompleteSale() {
  const { sellProducts } = useProducts();
  const { recordSale } = useShift();
  const { addAchieved } = useSalesGoal();
  const { logActivity } = useActivityLog();

  return useCallback(
    (input: CompleteSaleInput) =>
      completeSale({ sellProducts, recordSale, addAchieved, logActivity }, input),
    [sellProducts, recordSale, addAchieved, logActivity],
  );
}
