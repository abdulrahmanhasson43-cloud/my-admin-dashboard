import { useDataServices } from './data-services-context-value';
import type { InvoiceService } from '@/services/invoice';

/**
 * useInvoiceService — gives any component the injected InvoiceService from the single
 * composition root (DataServicesProvider), without knowing which
 * IInvoiceRepository is behind it. Prefer the higher-level useInvoices() hook for
 * reactive state; reach for this directly only for one-off imperative calls.
 */
export function useInvoiceService(): InvoiceService {
  return useDataServices().invoice;
}
