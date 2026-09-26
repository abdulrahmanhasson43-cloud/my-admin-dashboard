import { createContext, useContext } from 'react';
import type { ReturnService } from '@/services/return';

export const ReturnServiceContext = createContext<ReturnService | null>(null);

/**
 * useReturnService — gives any component access to the injected
 * ReturnService instance, without ever knowing which IReturnRepository is
 * behind it. Prefer the higher-level useReturns() hook for reactive state;
 * reach for this directly only for one-off imperative calls.
 */
export function useReturnService(): ReturnService {
  const service = useContext(ReturnServiceContext);
  if (!service) {
    throw new Error('useReturnService must be used within a ReturnServiceProvider');
  }
  return service;
}
