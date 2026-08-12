import { createContext, useContext } from 'react';
import type { Branch } from '@/types';

export interface BranchContextValue {
  branches: Branch[];
  activeBranchId: string;
  activeBranch: Branch | null;
  setActiveBranchId: (id: string) => void;
  addBranch: (branch: Omit<Branch, 'id'>) => void;
  updateBranch: (id: string, patch: Partial<Branch>) => void;
  toggleBranchStatus: (id: string) => void;
}

export const BranchContext = createContext<BranchContextValue | null>(null);

export function useBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return ctx;
}
