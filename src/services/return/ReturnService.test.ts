import { describe, expect, it } from 'vitest';
import type { ReturnItem, ReturnRequest } from '@/types/return';
import { InvalidReturnError, ReturnService, type CreateReturnInput } from './ReturnService';
import { MockReturnRepository } from './MockReturnRepository';

const item = (price: number, quantity: number): ReturnItem => ({ productId: 'p1', name: 'سماعة', price, quantity });

const input = (overrides: Partial<CreateReturnInput> = {}): CreateReturnInput => ({
  type: 'customer',
  partyName: 'أحمد',
  originalInvoiceId: 'INV-1',
  items: [item(100, 2), item(50, 1)],
  reason: 'defective',
  ...overrides,
} as CreateReturnInput);

const saved = (overrides: Partial<ReturnRequest>): ReturnRequest =>
  ({ id: 'R', type: 'customer', partyName: 'x', originalInvoiceId: 'I', items: [], reason: 'defective', status: 'pending', refundAmount: 0, date: '2026-01-01', ...overrides } as ReturnRequest);

const service = (seed: ReturnRequest[] = []) => new ReturnService(new MockReturnRepository(seed));

describe('ReturnService', () => {
  it('creates a pending return and totals the refund from the items', async () => {
    const created = await service().createReturn(input());
    expect(created.status).toBe('pending');
    expect(created.refundAmount).toBe(250);
    expect(created.id).toMatch(/^RET-/);
  });

  it('trims the party name and drops blank optional fields', async () => {
    const created = await service().createReturn(input({ partyName: '  أحمد  ', partyPhone: '   ', reasonNote: ' ' }));
    expect(created.partyName).toBe('أحمد');
    expect(created.partyPhone).toBeUndefined();
    expect(created.reasonNote).toBeUndefined();
  });

  it('rejects a blank party name and an empty item list', async () => {
    await expect(service().createReturn(input({ partyName: '   ' }))).rejects.toThrow(InvalidReturnError);
    await expect(service().createReturn(input({ items: [] }))).rejects.toThrow(InvalidReturnError);
  });

  it('advances pending → approved → refunded and then stays refunded', async () => {
    const svc = service([saved({ id: 'R1' })]);
    expect((await svc.advanceReturnStatus('R1')).status).toBe('approved');
    expect((await svc.advanceReturnStatus('R1')).status).toBe('refunded');
    expect((await svc.advanceReturnStatus('R1')).status).toBe('refunded');
  });

  it('refuses to advance an unknown return', async () => {
    await expect(service().advanceReturnStatus('nope')).rejects.toThrow(InvalidReturnError);
  });

  it('lists newest first and filters by type', async () => {
    const svc = service([
      saved({ id: 'old', date: '2026-01-01', type: 'customer' }),
      saved({ id: 'new', date: '2026-03-01', type: 'supplier' }),
    ]);
    expect((await svc.getAllReturns()).map(r => r.id)).toEqual(['new', 'old']);
    expect((await svc.getReturnsByType('supplier')).map(r => r.id)).toEqual(['new']);
  });

  it('gives every return its own id, even past the 900 numeric slots', async () => {
    const svc = service();
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) ids.add((await svc.createReturn(input())).id);
    expect(ids.size).toBe(1000);
  });
});
