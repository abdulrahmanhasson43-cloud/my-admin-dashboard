import { useMemo, type ReactNode } from 'react';
import { BranchService } from '@/services/branch';
import { MockBranchRepository } from '@/services/branch/MockBranchRepository';
import { BranchServiceContext } from './branch-service-context';

/**
 * BranchServiceProvider — the composition root for the branch module.
 * The ONLY file allowed to import MockBranchRepository.
 *
 * TODO(phase-3): swap to new BranchService(new FirestoreBranchRepository(db)).
 */
export function BranchServiceProvider({ children }: { children: ReactNode }) {
  const service = useMemo(() => new BranchService(new MockBranchRepository()), []);

  return (
    <BranchServiceContext.Provider value={service}>
      {children}
    </BranchServiceContext.Provider>
  );
}
