import { describe, expect, it } from 'vitest';
import type { CartItem } from '@/types';
import { VAT_RATE } from '@/lib/pricing';
import { buildSale, completeSale, generateInvoiceId, type CompleteSalePorts } from './CompleteSale';
import { QUICK_PAY_AMOUNTS, calcChange, heldOrderLabel } from './posRules';

const item = (id: string, price: number, quantity: number): CartItem =>
  ({ id, name: `p-${id}`, price, quantity } as unknown as CartItem);

/** Fake ports that record the order in which things happened. */
function fakePorts(overrides: Partial<CompleteSalePorts> = {}) {
  const calls: string[] = [];
  const ports: CompleteSalePorts = {
    sellProducts: async () => { calls.push('sell'); },
    recordSale: (total) => { calls.push(`shift:${total}`); },
    addAchieved: (total) => { calls.push(`goal:${total}`); },
    logActivity: (_type, description) => { calls.push(`log:${description}`); },
    ...overrides,
  };
  return { ports, calls };
}

describe('buildSale', () => {
  it('computes subtotal, VAT and total from the cart and copies the lines', () => {
    const cart = [item('a', 100, 2), item('b', 50, 1)];
    const sale = buildSale(cart, 'cash');
    expect(sale.subtotal).toBe(250);
    expect(sale.tax).toBeCloseTo(250 * VAT_RATE);
    expect(sale.total).toBeCloseTo(250 * (1 + VAT_RATE));
    expect(sale.paymentMethod).toBe('cash');
    expect(sale.items).toEqual(cart);
    expect(sale.items).not.toBe(cart);
  });

  it('uses an INV- receipt number built from the clock', () => {
    expect(generateInvoiceId(1_760_000_123_456)).toBe('INV-123456');
    expect(buildSale([item('a', 1, 1)], 'cash', new Date(1_760_000_123_456)).id).toBe('INV-123456');
  });
});

describe('completeSale', () => {
  it('sells first, then books shift, goal and activity log — in that order', async () => {
    const { ports, calls } = fakePorts();
    const sale = await completeSale(ports, { cart: [item('a', 100, 1)], paymentMethod: 'card' });

    expect(sale).not.toBeNull();
    const total = sale!.total;
    expect(calls[0]).toBe('sell');
    expect(calls.slice(1)).toEqual([`shift:${total}`, `goal:${total}`, expect.stringContaining(sale!.id)]);
  });

  it('returns the receipt with the chosen payment method', async () => {
    const { ports } = fakePorts();
    const sale = await completeSale(ports, { cart: [item('a', 10, 3)], paymentMethod: 'wallet' });
    expect(sale?.paymentMethod).toBe('wallet');
    expect(sale?.subtotal).toBe(30);
  });

  it('when persisting fails: returns null and touches nothing else (the cart is kept for a retry)', async () => {
    const { ports, calls } = fakePorts({
      sellProducts: async () => { calls.push('sell'); throw new Error('out of stock'); },
    });
    const sale = await completeSale(ports, { cart: [item('a', 100, 1)], paymentMethod: 'cash' });
    expect(sale).toBeNull();
    expect(calls).toEqual(['sell']);
  });

  it('an empty cart sells nothing and calls no port', async () => {
    const { ports, calls } = fakePorts();
    expect(await completeSale(ports, { cart: [], paymentMethod: 'cash' })).toBeNull();
    expect(calls).toEqual([]);
  });

  it('hands the original cart to sellProducts', async () => {
    let received: CartItem[] | null = null;
    const { ports } = fakePorts({ sellProducts: async cart => { received = cart; } });
    const cart = [item('a', 5, 2)];
    await completeSale(ports, { cart, paymentMethod: 'cash' });
    expect(received).toBe(cart);
  });
});

describe('POS rules', () => {
  it('calcChange: change when paid enough, negative when short, 0 when nothing entered', () => {
    expect(calcChange(114, 200)).toBe(86);
    expect(calcChange(114, 100)).toBe(-14);
    expect(calcChange(114, 0)).toBe(0);
  });

  it('heldOrderLabel: the customer name, or a summary of the cart', () => {
    expect(heldOrderLabel('أحمد', 3, 500)).toBe('أحمد');
    expect(heldOrderLabel('', 3, 500)).toContain('3 منتج');
  });

  it('quick-pay amounts are ascending', () => {
    expect([...QUICK_PAY_AMOUNTS]).toEqual([...QUICK_PAY_AMOUNTS].sort((a, b) => a - b));
  });
});
