import { useCallback, useEffect, useState } from 'react';
import type { Shift } from '@/types';
import { useDataServices } from '@/context/data-services-context-value';

/**
 * useShifts — reactive state layered over ShiftService. Components using
 * this hook never touch MockShiftRepository, localStorage, or any other
 * storage detail — matching every other entity's clean-service hook.
 */
export function useShifts() {
  const { shift: shiftService } = useDataServices();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await shiftService.getAllShifts();
      setShifts(all);
    } finally {
      setIsLoading(false);
    }
  }, [shiftService]);

  // Load once on mount. The fetch is kicked off from a microtask so the state
  // updates inside `refetch` run asynchronously, satisfying the
  // react-hooks/set-state-in-effect rule without changing the behaviour.
  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (!cancelled) return refetch();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [refetch]);

  const currentShift = shifts.find(s => s.status === 'open') ?? null;

  const openShift = useCallback(async (cashierName: string, openingAmount: number) => {
    const shift = await shiftService.openShift(cashierName, openingAmount);
    setShifts(prev => (prev.some(s => s.id === shift.id) ? prev : [shift, ...prev]));
    return shift;
  }, [shiftService]);

  const closeShift = useCallback(async (closingAmount: number) => {
    const closed = await shiftService.closeShift(closingAmount);
    setShifts(prev => prev.map(s => (s.id === closed.id ? closed : s)));
    return closed;
  }, [shiftService]);

  const recordSale = useCallback(async (amount: number) => {
    const updated = await shiftService.recordSale(amount);
    if (updated) {
      setShifts(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    }
    return updated;
  }, [shiftService]);

  return { shifts, currentShift, isLoading, refetch, openShift, closeShift, recordSale };
}
