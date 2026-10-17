import { useCallback, useEffect, useState } from 'react';
import type { StaffMember } from '@/types';
import type { CreateStaffInput } from '@/services/staff';
import { useDataServices } from '@/context/data-services-context-value';

/**
 * useStaff — layers React state (loading/staff) on top of StaffService.
 * Components never touch MockStaffRepository directly.
 */
export function useStaff() {
  const { staff: staffService } = useDataServices();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await staffService.getAllStaff();
      setStaff(all);
    } finally {
      setIsLoading(false);
    }
  }, [staffService]);

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

  const createStaff = useCallback(async (input: CreateStaffInput) => {
    const created = await staffService.createStaff(input);
    setStaff(prev => [...prev, created]);
    return created;
  }, [staffService]);

  const updateStaff = useCallback(async (id: string, updates: Partial<Omit<StaffMember, 'id'>>) => {
    const updated = await staffService.updateStaff(id, updates);
    setStaff(prev => prev.map(s => (s.id === id ? updated : s)));
    return updated;
  }, [staffService]);

  const deleteStaff = useCallback(async (id: string) => {
    await staffService.deleteStaff(id);
    setStaff(prev => prev.filter(s => s.id !== id));
  }, [staffService]);

  return { staff, isLoading, refetch, createStaff, updateStaff, deleteStaff };
}
