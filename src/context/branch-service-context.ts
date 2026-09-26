import { createContext, useContext } from 'react';
import type { BranchService } from '@/services/branch';

export const BranchServiceContext = createContext<BranchService | null>(null);

/**
 * useBranchService — access to the injected BranchService without knowing
 * which IBranchRepository is behind it. Prefer useBranches() for reactive
 * state; reach for this only for one-off imperative calls.
 */
export function useBranchService(): BranchService {
  const service = useContext(BranchServiceContext);
  if (!service) {
    throw new Error('useBranchService must be used within a BranchServiceProvider');
  }
  return service;
}
