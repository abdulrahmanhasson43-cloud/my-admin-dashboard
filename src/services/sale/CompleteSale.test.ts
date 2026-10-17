import { describe, expect, it } from 'vitest';
import type { CartItem } from '@/types';
import { VAT_RATE, calcSaleTotals, calcSubtotal } from '@/lib/pricing';
import { buildSale, completeSale, generateInvoiceId, type CompleteSalePorts } from './CompleteSale';
import { QUICK_PAY_AMOUNTS, calcChange, evaluateTender, heldOrderLabel } from './posRules';

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

  it('stores whole-piastre amounts: a 99.99 item is subtotal 99.99, tax 14, total 113.99', () => {
    const sale = buildSale([item('a', 99.99, 1)], 'cash');
    expect([sale.subtotal, sale.tax, sale.total]).toEqual([99.99, 14, 113.99]);
  });

  it('gives the receipt a generated INV- number', () => {
    const at = new Date(2026, 9, 8, 14, 30, 5, 123);
    expect(buildSale([item('a', 1, 1)], 'cash', at).id).toMatch(/^INV-261008-[0-9A-Z]{8}$/);
  });
});

describe('generateInvoiceId', () => {
  /** A local date-time, so the test passes in any time zone. */
  const at = (h: number, m: number, s: number, ms = 0) => new Date(2026, 9, 8, h, m, s, ms).getTime();

  it('has the shape INV-YYMMDD-<6 time chars><2 salt chars>', () => {
    expect(generateInvoiceId(at(9, 0, 0))).toMatch(/^INV-261008-[0-9A-Z]{8}$/);
  });

  it('encodes the local date and the time of day; the salt is the last two chars', () => {
    expect(generateInvoiceId(at(14, 30, 5, 123), () => 0)).toBe('INV-261008-0V2XQB00');
    expect(generateInvoiceId(at(14, 30, 5, 123), () => 0.999999)).toBe('INV-261008-0V2XQBZZ');
  });

  it('two sales exactly 1,000,000 ms apart no longer share a number (the old clock-slice bug)', () => {
    const first = at(14, 30, 5, 123);
    expect(generateInvoiceId(first, () => 0)).toBe('INV-261008-0V2XQB00');
    expect(generateInvoiceId(first + 1_000_000, () => 0)).toBe('INV-261008-0VODC300');
  });

  it('sorts chronologically within a day', () => {
    const morning = generateInvoiceId(at(8, 59, 59, 999), () => 0.5);
    const noon = generateInvoiceId(at(12, 0, 0), () => 0.5);
    const night = generateInvoiceId(at(23, 59, 59, 999), () => 0.5);
    expect([night, morning, noon].sort()).toEqual([morning, noon, night]);
  });

  it('10,000 sales a second apart in one day are all unique', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 10_000; i++) ids.add(generateInvoiceId(at(0, 0, 0) + i * 1000));
    expect(ids.size).toBe(10_000);
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

describe('evaluateTender', () => {
  it('is short, and says by how much, when the cash does not cover the total', () => {
    expect(evaluateTender(285, 100)).toEqual({ kind: 'short', shortBy: 185 });
  });

  it('is exact when the cash equals the total', () => {
    expect(evaluateTender(285, 285)).toEqual({ kind: 'exact' });
  });

  it('owes change when the cash is more than the total', () => {
    expect(evaluateTender(285, 500)).toEqual({ kind: 'change', change: 215 });
  });

  it('agrees with calcChange whenever something was handed over', () => {
    const tender = evaluateTender(285, 500);
    expect(tender.kind === 'change' && tender.change).toBe(calcChange(285, 500));
  });
});

describe('evaluateTender with whole-piastre totals', () => {
  it('paying the displayed amount is exact (99.99 item: pay 113.99)', () => {
    const { total } = calcSaleTotals(calcSubtotal([{ price: 99.99, quantity: 1 }]));
    expect(evaluateTender(total, 113.99)).toEqual({ kind: 'exact' });
  });

  it('paying the displayed amount is exact (3 x 19.99: pay 68.37)', () => {
    const { total } = calcSaleTotals(calcSubtotal([{ price: 19.99, quantity: 3 }]));
    expect(evaluateTender(total, 68.37)).toEqual({ kind: 'exact' });
  });

  it('change and shortfall are whole piastres, with no float noise', () => {
    expect(evaluateTender(113.99, 500)).toEqual({ kind: 'change', change: 386.01 });
    expect(evaluateTender(113.99, 100)).toEqual({ kind: 'short', shortBy: 13.99 });
    expect(calcChange(113.99, 500)).toBe(386.01);
    expect(calcChange(113.99, 100)).toBe(-13.99);
  });
});
