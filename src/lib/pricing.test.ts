import { describe, expect, it } from 'vitest';
import { VAT_PERCENT, VAT_RATE, calcSaleTotals, calcSubtotal } from './pricing';

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
