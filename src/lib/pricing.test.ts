import { describe, expect, it } from 'vitest';
import { VAT_PERCENT, VAT_RATE, calcSaleTotals, calcSubtotal, roundMoney } from './pricing';

describe('VAT constants', () => {
  it('keeps the percent and the multiplier in sync', () => {
    expect(VAT_PERCENT).toBe(14);
    expect(VAT_RATE).toBeCloseTo(0.14, 10);
  });
});

describe('calcSubtotal', () => {
  it('sums price x quantity across lines', () => {
    const lines = [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 3 },
    ];
    expect(calcSubtotal(lines)).toBe(350);
  });

  it('returns 0 for an empty cart', () => {
    expect(calcSubtotal([])).toBe(0);
  });
});

describe('calcSaleTotals', () => {
  it('adds 14% VAT by default and no discount', () => {
    const totals = calcSaleTotals(100);
    expect(totals.discount).toBe(0);
    expect(totals.taxable).toBe(100);
    expect(totals.tax).toBeCloseTo(14, 10);
    expect(totals.total).toBeCloseTo(114, 10);
  });

  it('applies the discount BEFORE tax', () => {
    const totals = calcSaleTotals(200, { discountPercent: 10 });
    expect(totals.discount).toBeCloseTo(20, 10);
    expect(totals.taxable).toBeCloseTo(180, 10);
    expect(totals.tax).toBeCloseTo(25.2, 10);
    expect(totals.total).toBeCloseTo(205.2, 10);
  });

  it('supports a custom tax rate, including zero', () => {
    const totals = calcSaleTotals(100, { taxRate: 0 });
    expect(totals.tax).toBe(0);
    expect(totals.total).toBe(100);
  });

  it('handles an empty cart', () => {
    expect(calcSaleTotals(0)).toEqual({ subtotal: 0, discount: 0, taxable: 0, tax: 0, total: 0 });
  });
});

describe('roundMoney', () => {
  it('rounds to whole piastres (2 decimals)', () => {
    expect(roundMoney(113.9886)).toBe(113.99);
    expect(roundMoney(68.3658)).toBe(68.37);
    expect(roundMoney(10)).toBe(10);
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });

  it('rounds halves away from zero and ignores binary noise (1.005 is 1.01, not 1.00)', () => {
    expect(roundMoney(1.005)).toBe(1.01);
    expect(roundMoney(1000.005)).toBe(1000.01);
    expect(roundMoney(2.675)).toBe(2.68);
  });

  it('is symmetric for negatives (refunds) and never returns -0', () => {
    expect(roundMoney(-1.005)).toBe(-1.01);
    expect(roundMoney(-13.9886)).toBe(-13.99);
    expect(roundMoney(-0.001)).toBe(0);
    expect(roundMoney(0)).toBe(0);
  });

  it('passes non-finite values through untouched', () => {
    expect(Number.isNaN(roundMoney(Number.NaN))).toBe(true);
    expect(roundMoney(Infinity)).toBe(Infinity);
  });
});

describe('totals are whole piastres', () => {
  it('rounds each line, so 1.1 x 3 is exactly 3.3 and 4.35 x 100 is exactly 435', () => {
    expect(calcSubtotal([{ price: 1.1, quantity: 3 }])).toBe(3.3);
    expect(calcSubtotal([{ price: 4.35, quantity: 100 }])).toBe(435);
  });

  it('99.99 + 14% VAT: tax 14.00 and total 113.99 (not 113.9886)', () => {
    const t = calcSaleTotals(calcSubtotal([{ price: 99.99, quantity: 1 }]));
    expect(t).toEqual({ subtotal: 99.99, discount: 0, taxable: 99.99, tax: 14, total: 113.99 });
  });

  it('rounds the discount before tax is charged on what is left', () => {
    const t = calcSaleTotals(33.33, { discountPercent: 15 });
    expect(t.discount).toBe(5);
    expect(t.taxable).toBe(28.33);
    expect(t.tax).toBe(3.97);
    expect(t.total).toBe(32.3);
  });

  it('for many amounts: every figure is a whole piastre and total = taxable + tax', () => {
    const wholePiastre = (n: number) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6;
    for (let amount = 0.01; amount < 1000; amount += 0.37) {
      for (const discountPercent of [0, 5, 12.5]) {
        const t = calcSaleTotals(roundMoney(amount), { discountPercent });
        expect([t.discount, t.taxable, t.tax, t.total].every(wholePiastre)).toBe(true);
        expect(t.total).toBe(roundMoney(t.taxable + t.tax));
      }
    }
  });
});
