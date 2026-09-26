import { useMemo, type ReactNode } from 'react';
import { SupplierService } from '@/services/supplier';
import { MockSupplierRepository } from '@/services/supplier/MockSupplierRepository';
import { SupplierServiceContext } from './supplier-service-context';

/**
 * SupplierServiceProvider — the composition root for the supplier module.
 * The ONLY file allowed to import MockSupplierRepository.
 *
 * TODO(phase-3): swap to new SupplierService(new FirestoreSupplierRepository(db)).
 */
export function SupplierServiceProvider({ children }: { children: ReactNode }) {
  const service = useMemo(() => new SupplierService(new MockSupplierRepository()), []);

  return (
    <SupplierServiceContext.Provider value={service}>
      {children}
    </SupplierServiceContext.Provider>
  );
}
