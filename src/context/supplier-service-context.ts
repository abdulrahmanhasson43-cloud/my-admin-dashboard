import { useDataServices } from './data-services-context-value';
import type { SupplierService } from '@/services/supplier';

/**
 * useSupplierService — gives any component the injected SupplierService from the single
 * composition root (DataServicesProvider), without knowing which
 * ISupplierRepository is behind it. Prefer the higher-level useSuppliers() hook for
 * reactive state; reach for this directly only for one-off imperative calls.
 */
export function useSupplierService(): SupplierService {
  return useDataServices().supplier;
}
