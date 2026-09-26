import { createContext, useContext } from 'react';
import type { SupplierService } from '@/services/supplier';

export const SupplierServiceContext = createContext<SupplierService | null>(null);

/**
 * useSupplierService — access to the injected SupplierService without knowing
 * which ISupplierRepository is behind it. Prefer useSuppliers() for reactive
 * state; reach for this only for one-off imperative calls.
 */
export function useSupplierService(): SupplierService {
  const service = useContext(SupplierServiceContext);
  if (!service) {
    throw new Error('useSupplierService must be used within a SupplierServiceProvider');
  }
  return service;
}
