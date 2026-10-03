import { useDataServices } from './data-services-context-value';
import type { ReturnService } from '@/services/return';

/**
 * useReturnService — gives any component the injected ReturnService from the single
 * composition root (DataServicesProvider), without knowing which
 * IReturnRepository is behind it. Prefer the higher-level useReturns() hook for
 * reactive state; reach for this directly only for one-off imperative calls.
 */
export function useReturnService(): ReturnService {
  return useDataServices().return;
}
