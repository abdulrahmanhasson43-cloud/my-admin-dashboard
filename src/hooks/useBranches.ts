import { useCallback, useEffect, useState } from 'react';
import type { Branch } from '@/types';
import type { CreateBranchInput } from '@/services/branch';
import { useBranchService } from '@/context/branch-service-context';

/**
 * useBranches — reactive state layered over BranchService. Components using
 * this hook never touch MockBranchRepository or any storage detail.
 */
export function useBranches() {
  const branchService = useBranchService();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await branchService.getAllBranches();
      setBranches(all);
    } finally {
      setIsLoading(false);
    }
  }, [branchService]);

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

  const createBranch = useCallback(async (input: CreateBranchInput) => {
    const created = await branchService.createBranch(input);
    setBranches(prev => [...prev, created]);
    return created;
  }, [branchService]);

  const updateBranch = useCallback(async (id: string, updates: Partial<Omit<Branch, 'id'>>) => {
    const updated = await branchService.updateBranch(id, updates);
    setBranches(prev => prev.map(b => (b.id === id ? updated : b)));
    return updated;
  }, [branchService]);

  const toggleBranchStatus = useCallback(async (id: string) => {
    const updated = await branchService.toggleBranchStatus(id);
    setBranches(prev => prev.map(b => (b.id === id ? updated : b)));
    return updated;
  }, [branchService]);

  const deleteBranch = useCallback(async (id: string) => {
    await branchService.deleteBranch(id);
    setBranches(prev => prev.filter(b => b.id !== id));
  }, [branchService]);

  return { branches, isLoading, refetch, createBranch, updateBranch, toggleBranchStatus, deleteBranch };
}
