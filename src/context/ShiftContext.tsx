import type { ReactNode } from 'react';
import { ShiftContext } from '@/context/shift-context-value';
import { useShifts } from '@/hooks/useShifts';

/**
 * ShiftProvider — thin reactive layer over ShiftService (via useShifts()).
 *
 * Before this fix, this component owned useState + localStorage directly,
 * so shift data never went through any Repository/Service abstraction —
 * one of the two entities (alongside PricingPlans) still missing the clean
 * 4-pattern used by the other 15. That logic now lives in
 * MockShiftRepository behind IShiftRepository, so this component (and every
 * consumer of useShift()) no longer knows or cares where shift data is
 * stored, and a real backend can replace it in one place later.
 */
export function ShiftProvider({ children }: { children: ReactNode }) {
  const value = useShifts();

  return (
    <ShiftContext.Provider value={value}>
      {children}
    </ShiftContext.Provider>
  );
}
