import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { BranchContext } from './branch-context-value';
import { useBranches } from '@/hooks/useBranches';
import type { Branch } from '@/types';

const STORAGE_KEY = 'vuno-active-branch-id';

/**
 * BranchProvider — now a thin adapter over useBranches() (which itself layers
 * reactive state over BranchService). All branch data access and business
 * logic lives in the service layer; this provider only owns the UI concern of
 * "which branch is currently active" plus its localStorage persistence.
 */
export function BranchProvider({ children }: { children: ReactNode }) {
  const {
    branches,
    createBranch,
    updateBranch: updateBranchService,
    toggleBranchStatus: toggleBranchStatusService,
    deleteBranch: deleteBranchService,
  } = useBranches();

  const [activeBranchId, setActiveBranchIdState] = useState<string>(() => {
    // restore from localStorage so a refresh keeps the selected branch
    try {
      return localStorage.getItem(STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  });

  // Keep the active branch valid once branches have loaded: fall back to the
  // first branch if nothing is selected or the saved id no longer exists.
  useEffect(() => {
    if (branches.length === 0) return;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setActiveBranchIdState(current =>
        current && branches.some(b => b.id === current) ? current : branches[0].id,
      );
    });
    return () => {
      cancelled = true;
    };
  }, [branches]);

  // persist the active branch id
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, activeBranchId); } catch { /* ignore */ }
  }, [activeBranchId]);

  const setActiveBranchId = useCallback((id: string) => {
    setActiveBranchIdState(id);
  }, []);

  const addBranch = useCallback(async (branch: Omit<Branch, 'id'>) => {
    await createBranch({
      name: branch.name,
      address: branch.address,
      employees: branch.employees,
      sales: branch.sales,
    });
  }, [createBranch]);

  const updateBranch = useCallback(async (id: string, patch: Partial<Branch>) => {
    await updateBranchService(id, patch);
  }, [updateBranchService]);

  const deleteBranch = useCallback(async (id: string) => {
    await deleteBranchService(id);
    // Never leave the app pointing at a branch that no longer exists.
    setActiveBranchIdState(current => (current === id ? '' : current));
  }, [deleteBranchService]);

  const toggleBranchStatus = useCallback(async (id: string) => {
    await toggleBranchStatusService(id);
  }, [toggleBranchStatusService]);

  const activeBranch = branches.find(b => b.id === activeBranchId) ?? null;

  return (
    <BranchContext.Provider
      value={{
        branches,
        activeBranchId,
        activeBranch,
        setActiveBranchId,
        addBranch,
        updateBranch,
        deleteBranch,
        toggleBranchStatus,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}
