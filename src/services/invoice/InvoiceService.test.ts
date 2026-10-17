import { describe, expect, it } from 'vitest';
import type { Invoice } from '@/types/invoice';
import { InvalidInvoiceError, InvoiceService, type CreateInvoiceInput } from './InvoiceService';
import { MockInvoiceRepository } from './MockInvoiceRepository';

const input = (overrides: Partial<CreateInvoiceInput> = {}): CreateInvoiceInput =>
  ({ customer: 'أحمد', amount: 100, tax: 14, total: 114, method: 'cash', items: 2, ...overrides });

const stored = (overrides: Partial<Invoice>): Invoice =>
  ({ id: 'INV-1', customer: 'x', amount: 0, tax: 0, total: 0, method: 'cash', date: '2026-01-01', status: 'paid', items: 1, ...overrides } as Invoice);

const service = (seed: Invoice[] = []) => new InvoiceService(new MockInvoiceRepository(seed));

describe('InvoiceService', () => {
  it('creates a paid invoice dated today with a trimmed customer', async () => {
    const invoice = await service().createInvoice(input({ customer: '  أحمد ' }));
    expect(invoice.status).toBe('paid');
    expect(invoice.customer).toBe('أحمد');
    expect(invoice.id).toMatch(/^INV-/);
    expect(invoice.date).toBe(new Date().toISOString().slice(0, 10));
  });

  it('rejects a blank customer and an invoice without items', async () => {
    await expect(service().createInvoice(input({ customer: ' ' }))).rejects.toThrow(InvalidInvoiceError);
    await expect(service().createInvoice(input({ items: 0 }))).rejects.toThrow(InvalidInvoiceError);
  });

  it('keeps the lines it was given (a copy), so a return can later name the real products', async () => {
    const lines = [
      { productId: '1', name: 'سماعة', quantity: 2, price: 250 },
      { productId: '3', name: 'كيبل', quantity: 1, price: 45 },
    ];
    const invoice = await service().createInvoice(input({ items: 3, lines }));

    expect(invoice.lines).toEqual(lines);
    expect(invoice.lines).not.toBe(lines);
    lines[0].quantity = 99; // the caller changing its own list afterwards must not reach the stored invoice
    expect(invoice.lines?.[0].quantity).toBe(2);
  });

  it('an invoice made without lines has none (older invoices and the sample ones)', async () => {
    const invoice = await service().createInvoice(input());
    expect(invoice.lines).toBeUndefined();
  });

  it('rejects a line with no quantity, a negative one, or no product', async () => {
    const bad = (over: object) => [{ productId: '1', name: 'x', quantity: 1, price: 1, ...over }];
    await expect(service().createInvoice(input({ lines: bad({ quantity: 0 }) }))).rejects.toThrow(InvalidInvoiceError);
    await expect(service().createInvoice(input({ lines: bad({ quantity: -2 }) }))).rejects.toThrow(InvalidInvoiceError);
    await expect(service().createInvoice(input({ lines: bad({ productId: '' }) }))).rejects.toThrow(InvalidInvoiceError);
  });

  it('lists newest first', async () => {
    const svc = service([stored({ id: 'a', date: '2026-01-01' }), stored({ id: 'b', date: '2026-02-01' })]);
    expect((await svc.getAllInvoices()).map(i => i.id)).toEqual(['b', 'a']);
  });

  it('summary: totals only paid invoices, counts paid and pending', async () => {
    const svc = service([
      stored({ id: 'a', status: 'paid', total: 100 }),
      stored({ id: 'b', status: 'paid', total: 50 }),
      stored({ id: 'c', status: 'pending', total: 999 }),
      stored({ id: 'd', status: 'cancelled', total: 999 }),
    ]);
    expect(await svc.getSummary()).toEqual({ totalPaid: 150, totalCount: 4, paidCount: 2, pendingCount: 1 });
  });

  it('markAsPaid and cancelInvoice change the status; unknown ids are rejected', async () => {
    const svc = service([stored({ id: 'a', status: 'pending' })]);
    expect((await svc.markAsPaid('a')).status).toBe('paid');
    expect((await svc.cancelInvoice('a')).status).toBe('cancelled');
    await expect(svc.markAsPaid('nope')).rejects.toThrow(InvalidInvoiceError);
    await expect(svc.cancelInvoice('nope')).rejects.toThrow(InvalidInvoiceError);
  });

  it('gives every invoice its own id, even past the 900 numeric slots', async () => {
    const svc = service();
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) ids.add((await svc.createInvoice(input())).id);
    expect(ids.size).toBe(1000);
  });
});
