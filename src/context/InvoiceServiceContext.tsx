import { useMemo, type ReactNode } from 'react';
import { InvoiceService } from '@/services/invoice';
import { MockInvoiceRepository } from '@/services/invoice/MockInvoiceRepository';
import { InvoiceServiceContext } from './invoice-service-context';

/**
 * InvoiceServiceProvider — the only file allowed to import
 * MockInvoiceRepository. TODO(phase-3): swap in a real repository here.
 */
export function InvoiceServiceProvider({ children }: { children: ReactNode }) {
  const service = useMemo(() => new InvoiceService(new MockInvoiceRepository()), []);

  return (
    <InvoiceServiceContext.Provider value={service}>
      {children}
    </InvoiceServiceContext.Provider>
  );
}
