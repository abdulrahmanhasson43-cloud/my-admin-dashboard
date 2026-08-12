import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { BranchContext } from './branch-context-value';
import { sampleBranches } from '@/services/mock/branches';
import type { Branch } from '@/types';

const STORAGE_KEY = 'vuno-active-branch-id';

export function BranchProvider({ children }: { children: ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>(sampleBranches);
  const [activeBranchId, setActiveBranchIdState] = useState<string>(() => {
    // restore from localStorage so a refresh keeps the selected branch
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && sampleBranches.some(b => b.id === saved)) return saved;
    } catch { /* ignore */ }
    return sampleBranches[0]?.id ?? '1';
  });

  // persist the active branch id
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, activeBranchId); } catch { /* ignore */ }
  }, [activeBranchId]);

  const setActiveBranchId = useCallback((id: string) => {
    setActiveBranchIdState(id);
  }, []);

  const addBranch = useCallback((branch: Omit<Branch, 'id'>) => {
    setBranches(prev => [
      ...prev,
      { ...branch, id: `br-${Date.now()}` },
    ]);
  }, []);

  const updateBranch = useCallback((id: string, patch: Partial<Branch>) => {
    setBranches(prev => prev.map(b => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  const toggleBranchStatus = useCallback((id: string) => {
    setBranches(prev =>
      prev.map(b =>
        b.id === id
          ? { ...b, status: b.status === 'active' ? 'inactive' : 'active' }
          : b,
      ),
    );
  }, []);

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
        toggleBranchStatus,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}
