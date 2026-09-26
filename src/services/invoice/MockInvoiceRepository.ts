import type { Invoice } from '@/types/invoice';
import { sampleInvoices } from '@/services/mock';
import { InvoiceNotFoundError } from './IInvoiceRepository';
import type { IInvoiceRepository } from './IInvoiceRepository';

/**
 * MockInvoiceRepository — in-memory adapter. TODO(phase-3): replace with
 * a real backend adapter implementing IInvoiceRepository; swap it in
 * InvoiceServiceContext.tsx only.
 */
export class MockInvoiceRepository implements IInvoiceRepository {
  private invoices: Invoice[];

  constructor(seed: Invoice[] = sampleInvoices) {
    this.invoices = [...seed];
  }

  async findAll(): Promise<Invoice[]> {
    return [...this.invoices];
  }

  async findById(id: string): Promise<Invoice | null> {
    return this.invoices.find(i => i.id === id) ?? null;
  }

  async insert(invoice: Invoice): Promise<Invoice> {
    this.invoices = [invoice, ...this.invoices];
    return invoice;
  }

  async update(invoice: Invoice): Promise<Invoice> {
    const index = this.invoices.findIndex(i => i.id === invoice.id);
    if (index === -1) {
      throw new InvoiceNotFoundError(invoice.id);
    }
    this.invoices = [
      ...this.invoices.slice(0, index),
      invoice,
      ...this.invoices.slice(index + 1),
    ];
    return invoice;
  }
}
