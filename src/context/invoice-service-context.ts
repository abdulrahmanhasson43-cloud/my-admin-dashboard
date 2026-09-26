import { createContext, useContext } from 'react';
import type { InvoiceService } from '@/services/invoice';

export const InvoiceServiceContext = createContext<InvoiceService | null>(null);

export function useInvoiceService(): InvoiceService {
  const service = useContext(InvoiceServiceContext);
  if (!service) {
    throw new Error('useInvoiceService must be used within an InvoiceServiceProvider');
  }
  return service;
}
