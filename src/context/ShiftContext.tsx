import { useState, useCallback, useMemo, type ReactNode } from 'react';
import { ShiftContext } from '@/context/shift-context-value';
import type { Shift } from '@/types';

const STORAGE_KEY = 'vuno_shifts';

function loadShifts(): Shift[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Shift[];
  } catch {
    // ignore
  }
  return [];
}

export function ShiftProvider({ children }: { children: ReactNode }) {
  const [shifts, setShifts] = useState<Shift[]>(loadShifts);

  const persist = useCallback((s: Shift[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      // ignore
    }
  }, []);

  const currentShift = useMemo(
    () => shifts.find(s => s.status === 'open') ?? null,
    [shifts],
  );

  const openShift = useCallback((cashierName: string, openingAmount: number): Shift => {
    // If there's already an open shift, don't open another
    const existing = shifts.find(s => s.status === 'open');
    if (existing) return existing;

    const newShift: Shift = {
      id: 'SHF-' + Date.now().toString().slice(-6),
      cashierName,
      openingAmount,
      closingAmount: null,
      startedAt: new Date().toLocaleString('ar-EG'),
      closedAt: null,
      status: 'open',
      totalSales: 0,
      invoiceCount: 0,
    };
    setShifts(prev => {
      const next = [newShift, ...prev];
      persist(next);
      return next;
    });
    return newShift;
  }, [shifts, persist]);

  const closeShift = useCallback((closingAmount: number) => {
    setShifts(prev => {
      const next = prev.map(s => {
        if (s.status !== 'open') return s;
        const expectedAmount = s.openingAmount + s.totalSales;
        return {
          ...s,
          status: 'closed' as const,
          closingAmount,
          closedAt: new Date().toLocaleString('ar-EG'),
          expectedAmount,
          variance: closingAmount - expectedAmount,
        };
      });
      persist(next);
      return next;
    });
  }, [persist]);

  const recordSale = useCallback((amount: number) => {
    setShifts(prev => {
      const next = prev.map(s =>
        s.status === 'open'
          ? { ...s, totalSales: s.totalSales + amount, invoiceCount: s.invoiceCount + 1 }
          : s,
      );
      persist(next);
      return next;
    });
  }, [persist]);

  const value = useMemo(() => ({
    shifts,
    currentShift,
    openShift,
    closeShift,
    recordSale,
  }), [shifts, currentShift, openShift, closeShift, recordSale]);

  return (
    <ShiftContext.Provider value={value}>
      {children}
    </ShiftContext.Provider>
  );
}
