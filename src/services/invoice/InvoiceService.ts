import type { Invoice } from '@/types/invoice';
import type { IInvoiceRepository } from './IInvoiceRepository';

export interface CreateInvoiceInput {
  customer: string;
  amount: number;
  tax: number;
  total: number;
  method: string;
  items: number;
}

export class InvalidInvoiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidInvoiceError';
  }
}

/**
 * InvoiceService — invoice business logic (summary totals, status
 * transitions), decoupled from storage exactly like OrderService and
 * ReturnService. Depends only on IInvoiceRepository, injected via the
 * constructor.
 */
export class InvoiceService {
  private readonly repository: IInvoiceRepository;

  constructor(repository: IInvoiceRepository) {
    this.repository = repository;
  }

  async getAllInvoices(): Promise<Invoice[]> {
    const invoices = await this.repository.findAll();
    return [...invoices].sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    return this.repository.findById(id);
  }

  /** Summary stats used by InvoicePage's header cards — computed once, here. */
  async getSummary(): Promise<{ totalPaid: number; totalCount: number; paidCount: number; pendingCount: number }> {
    const invoices = await this.getAllInvoices();
    return {
      totalPaid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
      totalCount: invoices.length,
      paidCount: invoices.filter(i => i.status === 'paid').length,
      pendingCount: invoices.filter(i => i.status === 'pending').length,
    };
  }

  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    if (!input.customer.trim()) {
      throw new InvalidInvoiceError('customer is required');
    }
    if (input.items <= 0) {
      throw new InvalidInvoiceError('An invoice must contain at least one item');
    }

    const invoice: Invoice = {
      id: `INV-${Math.floor(2050 + Math.random() * 900)}`,
      customer: input.customer.trim(),
      amount: input.amount,
      tax: input.tax,
      total: input.total,
      method: input.method,
      date: new Date().toISOString().slice(0, 10),
      status: 'paid',
      items: input.items,
    };

    return this.repository.insert(invoice);
  }

  async markAsPaid(id: string): Promise<Invoice> {
    const invoice = await this.repository.findById(id);
    if (!invoice) throw new InvalidInvoiceError(`Cannot update unknown invoice: ${id}`);
    return this.repository.update({ ...invoice, status: 'paid' });
  }

  async cancelInvoice(id: string): Promise<Invoice> {
    const invoice = await this.repository.findById(id);
    if (!invoice) throw new InvalidInvoiceError(`Cannot cancel unknown invoice: ${id}`);
    return this.repository.update({ ...invoice, status: 'cancelled' });
  }
}
