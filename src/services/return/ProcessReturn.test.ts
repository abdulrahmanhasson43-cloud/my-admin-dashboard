import { describe, expect, it } from 'vitest';
import type { Product } from '@/types';
import type { ReturnReason, ReturnRequest, ReturnStatus, ReturnType } from '@/types/return';
import { MockProductRepository, ProductService } from '@/services/product';
import { InvalidReturnError, ReturnService } from './ReturnService';
import { MockReturnRepository } from './MockReturnRepository';
import { NON_RESELLABLE_REASONS, processReturn, type ProcessReturnPorts } from './ProcessReturn';

const makeReturn = (overrides: Partial<ReturnRequest> = {}): ReturnRequest => ({
  id: 'RET-100',
  type: 'customer',
  partyName: 'أحمد',
  originalInvoiceId: 'INV-1',
  items: [
    { productId: '1', name: 'سماعة', quantity: 2, price: 100 },
    { productId: '2', name: 'شاحن', quantity: 1, price: 50 },
  ],
  reason: 'not_satisfied',
  status: 'approved',
  refundAmount: 250,
  date: '2026-01-01',
  ...overrides,
});

/** Fake ports over an in-memory list; every call is recorded in order. */
function fakePorts(initial: ReturnRequest, overrides: Partial<ProcessReturnPorts> = {}) {
  const calls: string[] = [];
  let current = initial;
  const ports: ProcessReturnPorts = {
    getReturn: async () => current,
    advance: async () => {
      calls.push('advance');
      const next: ReturnStatus = current.status === 'pending' ? 'approved' : 'refunded';
      current = { ...current, status: next };
      return current;
    },
    restock: async items => { calls.push(`restock:${items.map(i => `${i.productId}x${i.quantity}`).join(',')}`); return new Set(items.map(i => i.productId)).size; },
    withdraw: async items => { calls.push(`withdraw:${items.map(i => `${i.productId}x${i.quantity}`).join(',')}`); return new Set(items.map(i => i.productId)).size; },
    logActivity: (type, description) => { calls.push(`log:${type}:${description}`); },
    ...overrides,
  };
  return { ports, calls };
}

describe('processReturn: a customer return reaching "refunded"', () => {
  it('puts the items back in stock and logs it', async () => {
    const { ports, calls } = fakePorts(makeReturn());
    const result = await processReturn(ports, 'RET-100');

    expect(result.request.status).toBe('refunded');
    expect(result.stock).toBe('restocked');
    expect(calls).toEqual(['advance', 'restock:1x2,2x1', expect.stringContaining('log:stock:')]);
    expect(calls[2]).toContain('3 قطعة');
    expect(calls[2]).toContain('RET-100');
  });

  it.each([['defective'], ['expired']] as [ReturnReason][])(
    'does NOT put a "%s" return back in stock, but says so in the log',
    async (reason: ReturnReason) => {
      const { ports, calls } = fakePorts(makeReturn({ reason }));
      const result = await processReturn(ports, 'RET-100');

      expect(result.stock).toBe('not-resellable');
      expect(calls.some(c => c.startsWith('restock') || c.startsWith('withdraw'))).toBe(false);
      expect(calls[1]).toContain('log:stock:');
      expect(calls[1]).toContain('لم يُعاد للمخزون');
    },
  );

  it('puts back every other reason', async () => {
    for (const reason of ['wrong_item', 'not_satisfied', 'warranty', 'other'] as ReturnReason[]) {
      const { ports } = fakePorts(makeReturn({ reason }));
      expect((await processReturn(ports, 'RET-100')).stock).toBe('restocked');
    }
  });

  it('keeps the non-resellable reasons in one place', () => {
    expect([...NON_RESELLABLE_REASONS].sort()).toEqual(['defective', 'expired']);
  });
});

describe('processReturn: a supplier return reaching "refunded"', () => {
  it('takes the goods out of stock (even a defective one: it is leaving, not coming back)', async () => {
    const { ports, calls } = fakePorts(makeReturn({ type: 'supplier', reason: 'defective' }));
    const result = await processReturn(ports, 'RET-100');

    expect(result.stock).toBe('withdrawn');
    expect(calls).toEqual(['advance', 'withdraw:1x2,2x1', expect.stringContaining('log:supplier:')]);
  });
});

describe('processReturn: when nothing should happen to the stock', () => {
  it('pending to approved only moves the status', async () => {
    const { ports, calls } = fakePorts(makeReturn({ status: 'pending' }));
    const result = await processReturn(ports, 'RET-100');

    expect(result.request.status).toBe('approved');
    expect(result.stock).toBe('none');
    expect(calls).toEqual(['advance']);
  });

  it('a return that is already refunded is not applied a second time', async () => {
    const { ports, calls } = fakePorts(makeReturn({ status: 'refunded' }));
    const result = await processReturn(ports, 'RET-100');

    expect(result.stock).toBe('none');
    expect(calls).toEqual(['advance']);
  });

  it('an unknown return is an error and touches nothing', async () => {
    const { ports, calls } = fakePorts(makeReturn(), { getReturn: async () => null });
    await expect(processReturn(ports, 'nope')).rejects.toBeInstanceOf(InvalidReturnError);
    expect(calls).toEqual([]);
  });

  it('if the status cannot be saved, the stock and the log are not touched', async () => {
    const { ports, calls } = fakePorts(makeReturn(), { advance: async () => { throw new Error('disk full'); } });
    await expect(processReturn(ports, 'RET-100')).rejects.toThrow('disk full');
    expect(calls).toEqual([]);
  });
});

describe('processReturn: when the stock cannot be updated', () => {
  it('keeps the new status, reports "failed", and writes that to the log', async () => {
    const { ports, calls } = fakePorts(makeReturn(), { restock: async () => { throw new Error('boom'); } });
    const result = await processReturn(ports, 'RET-100');

    expect(result.request.status).toBe('refunded');
    expect(result.stock).toBe('failed');
    expect(calls[calls.length - 1]).toContain('log:stock:');
    expect(calls[calls.length - 1]).toContain('تعذّر تحديث المخزون');
  });
});

describe('processReturn: when some products are not in the stock list', () => {
  it('says "incomplete" and logs how many were updated, instead of claiming the whole return was restocked', async () => {
    const { ports, calls } = fakePorts(makeReturn(), { restock: async () => 1 }); // 1 of the 2 products found
    const result = await processReturn(ports, 'RET-100');

    expect(result.request.status).toBe('refunded');
    expect(result.stock).toBe('incomplete');
    const log = calls[calls.length - 1];
    expect(log).toContain('log:stock:');
    expect(log).toContain('1 من 2');
    expect(log).not.toContain('تم إرجاع');
  });

  it('the same for a supplier return', async () => {
    const { ports, calls } = fakePorts(makeReturn({ type: 'supplier' }), { withdraw: async () => 0 });
    const result = await processReturn(ports, 'RET-100');

    expect(result.stock).toBe('incomplete');
    expect(calls[calls.length - 1]).toContain('log:supplier:');
    expect(calls[calls.length - 1]).toContain('0 من 2');
  });

  it('lines of the same product count as one product', async () => {
    const twice = makeReturn({ items: [
      { productId: '1', name: 'سماعة', quantity: 1, price: 100 },
      { productId: '1', name: 'سماعة', quantity: 2, price: 100 },
    ] });
    const { ports } = fakePorts(twice, { restock: async () => 1 });
    expect((await processReturn(ports, 'RET-100')).stock).toBe('restocked');
  });

  it('lines with no quantity are not expected to be found', async () => {
    const zero = makeReturn({ items: [
      { productId: '1', name: 'سماعة', quantity: 2, price: 100 },
      { productId: '9', name: 'مجهول', quantity: 0, price: 100 },
    ] });
    const { ports } = fakePorts(zero, { restock: async () => 1 });
    expect((await processReturn(ports, 'RET-100')).stock).toBe('restocked');
  });
});

describe('processReturn with the real services (in-memory)', () => {
  const product = (id: string, storeStock: number, warehouseStock: number): Product => ({
    id, name: `p${id}`, category: 'c', price: 1, cost: 1, wholesalePrice: 1,
    stock: storeStock + warehouseStock, storeStock, warehouseStock, barcode: id, status: 'active',
  });

  function setup(type: ReturnType, reason: ReturnReason, status: ReturnStatus = 'approved') {
    const products = new ProductService(new MockProductRepository([product('1', 10, 5), product('2', 3, 0)]));
    const returns = new ReturnService(new MockReturnRepository([makeReturn({ type, reason, status })]));
    const log: string[] = [];
    const ports: ProcessReturnPorts = {
      getReturn: id => returns.getReturnById(id),
      advance: id => returns.advanceReturnStatus(id),
      restock: async items => (await products.restockProducts(items)).length,
      withdraw: async items => (await products.withdrawProducts(items)).length,
      logActivity: (t, d) => { log.push(`${t}:${d}`); },
    };
    return { products, returns, ports, log };
  }

  it('a customer return adds its quantities to the shelf, exactly once even if processed twice', async () => {
    const { products, ports, log } = setup('customer', 'wrong_item');

    await processReturn(ports, 'RET-100');
    await processReturn(ports, 'RET-100'); // already refunded: must not add again

    expect((await products.getProductById('1'))?.storeStock).toBe(12);
    expect((await products.getProductById('2'))?.storeStock).toBe(4);
    expect(log).toHaveLength(1);
  });

  it('a supplier return takes its quantities out of stock', async () => {
    const { products, ports } = setup('supplier', 'defective');

    await processReturn(ports, 'RET-100');

    expect((await products.getProductById('1'))?.storeStock).toBe(8);
    expect((await products.getProductById('2'))?.storeStock).toBe(2);
  });

  it('a return that mentions a product the shop does not have: the known one is restocked, the result says incomplete', async () => {
    const products = new ProductService(new MockProductRepository([product('1', 10, 5)]));
    const returns = new ReturnService(new MockReturnRepository([makeReturn()])); // lines: product 1 and product 2 (missing)
    const log: string[] = [];
    const ports: ProcessReturnPorts = {
      getReturn: id => returns.getReturnById(id),
      advance: id => returns.advanceReturnStatus(id),
      restock: async items => (await products.restockProducts(items)).length,
      withdraw: async items => (await products.withdrawProducts(items)).length,
      logActivity: (t, d) => { log.push(`${t}:${d}`); },
    };

    const result = await processReturn(ports, 'RET-100');

    expect(result.stock).toBe('incomplete');
    expect((await products.getProductById('1'))?.storeStock).toBe(12);
    expect(log).toHaveLength(1);
    expect(log[0]).toContain('1 من 2');
  });

  it('walking a pending return all the way: stock moves only on the last step', async () => {
    const { products, ports } = setup('customer', 'wrong_item', 'pending');

    await processReturn(ports, 'RET-100'); // pending -> approved
    expect((await products.getProductById('1'))?.storeStock).toBe(10);

    await processReturn(ports, 'RET-100'); // approved -> refunded
    expect((await products.getProductById('1'))?.storeStock).toBe(12);
  });
});
