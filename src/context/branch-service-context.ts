import { useDataServices } from './data-services-context-value';
import type { BranchService } from '@/services/branch';

/**
 * useBranchService — gives any component the injected BranchService from the single
 * composition root (DataServicesProvider), without knowing which
 * IBranchRepository is behind it. Prefer the higher-level useBranches() hook for
 * reactive state; reach for this directly only for one-off imperative calls.
 */
export function useBranchService(): BranchService {
  return useDataServices().branch;
}
