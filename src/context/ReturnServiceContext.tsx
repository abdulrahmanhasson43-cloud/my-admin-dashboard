import { useMemo, type ReactNode } from 'react';
import { ReturnService } from '@/services/return';
import { MockReturnRepository } from '@/services/return/MockReturnRepository';
import { ReturnServiceContext } from './return-service-context';

/**
 * ReturnServiceProvider — the composition root for the returns module.
 *
 * This is the ONLY file in the entire app allowed to import
 * MockReturnRepository. Every other component reaches ReturnService
 * through useReturnService() / useReturns() and has zero knowledge of
 * what's behind the IReturnRepository interface.
 *
 * TODO(phase-3): once a real backend exists, this becomes:
 *   new ReturnService(new FirestoreReturnRepository(db))
 * — one line, here, and nowhere else in the app changes.
 */
export function ReturnServiceProvider({ children }: { children: ReactNode }) {
  const service = useMemo(() => new ReturnService(new MockReturnRepository()), []);

  return (
    <ReturnServiceContext.Provider value={service}>
      {children}
    </ReturnServiceContext.Provider>
  );
}
