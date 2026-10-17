import { describe, expect, it } from 'vitest';
import { VAT_RATE } from './pricing';
import {
  addProductLine, calcBuilderTotals, changeLineQty, countUnits, makeLine, removeLine,
} from './invoiceBuilder';

const product = (id: string, price = 100) => ({ id, name: `p-${id}`, price });

describe('invoice builder lines', () => {
  it('adding a product twice bumps one line instead of creating two', () => {
    const lines = addProductLine(addProductLine([], product('a')), product('a'));
    expect(lines).toHaveLength(1);
    expect(lines[0].qty).toBe(2);
  });

  it('different products get their own lines with unique uids', () => {
    const lines = addProductLine(addProductLine([], product('a')), product('b'));
    expect(lines.map(l => l.productId)).toEqual(['a', 'b']);
    expect(new Set(lines.map(l => l.uid)).size).toBe(2);
  });

  it('never mutates the lines it is given', () => {
    const before = [makeLine('a', 'A', 10, 2)];
    const snapshot = JSON.stringify(before);
    addProductLine(before, product('a'));
    changeLineQty(before, before[0].uid, 5);
    removeLine(before, before[0].uid);
    expect(JSON.stringify(before)).toBe(snapshot);
  });

  it('changeLineQty moves a line up and down but never below 1', () => {
    const [line] = [makeLine('a', 'A', 10, 2)];
    expect(changeLineQty([line], line.uid, 3)[0].qty).toBe(5);
    expect(changeLineQty([line], line.uid, -1)[0].qty).toBe(1);
    expect(changeLineQty([line], line.uid, -10)[0].qty).toBe(1);
  });

  it('changeLineQty only touches the line with that uid', () => {
    const a = makeLine('a', 'A', 10);
    const b = makeLine('b', 'B', 10);
    const next = changeLineQty([a, b], b.uid, 2);
    expect(next.map(l => l.qty)).toEqual([1, 3]);
  });

  it('removeLine drops just that line; countUnits adds the quantities', () => {
    const a = makeLine('a', 'A', 10, 2);
    const b = makeLine('b', 'B', 10, 3);
    expect(removeLine([a, b], a.uid).map(l => l.productId)).toEqual(['b']);
    expect(countUnits([a, b])).toBe(5);
    expect(countUnits([])).toBe(0);
  });
});

describe('calcBuilderTotals', () => {
  const lines = [makeLine('a', 'A', 100, 2), makeLine('b', 'B', 50, 1)]; // subtotal 250

  it('with no discount: VAT is added on the subtotal', () => {
    const totals = calcBuilderTotals(lines, 0);
    expect(totals.subtotal).toBe(250);
    expect(totals.discount).toBe(0);
    expect(totals.tax).toBeCloseTo(250 * VAT_RATE);
    expect(totals.total).toBeCloseTo(250 * (1 + VAT_RATE));
    expect(totals.units).toBe(3);
  });

  it('a percentage discount comes off BEFORE the VAT', () => {
    const totals = calcBuilderTotals(lines, 10);
    expect(totals.discount).toBe(25);
    expect(totals.taxable).toBe(225);
    expect(totals.tax).toBeCloseTo(225 * VAT_RATE);
    expect(totals.total).toBeCloseTo(225 * (1 + VAT_RATE));
  });

  it('an empty invoice totals zero', () => {
    expect(calcBuilderTotals([], 0)).toMatchObject({ subtotal: 0, total: 0, units: 0 });
  });
});
