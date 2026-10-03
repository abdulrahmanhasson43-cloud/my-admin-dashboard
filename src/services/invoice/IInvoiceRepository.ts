import type { Invoice } from '@/types/invoice';

/**
 * IInvoiceRepository — the abstraction (port) InvoiceService depends on.
 * Same seam as IOrderRepository / IReturnRepository: InvoiceService never
 * knows what's behind this interface.
 */
export interface IInvoiceRepository {
  findAll(): Promise<Invoice[]>;
  findById(id: string): Promise<Invoice | null>;
  insert(invoice: Invoice): Promise<Invoice>;
  update(invoice: Invoice): Promise<Invoice>;
}

export class InvoiceNotFoundError extends Error {
  constructor(id: string) {
    super(`Invoice not found: ${id}`);
    this.name = 'InvoiceNotFoundError';
  }
}
