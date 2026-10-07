import { calcSaleTotals, calcSubtotal, type SaleTotals } from '@/lib/pricing';

/**
 * Invoice-builder rules — pure functions over a list of builder lines.
 * Every function returns a NEW array and never mutates its input.
 */

/** One line of the invoice being built. `uid` identifies the LINE (a product could be listed twice). */
export interface BuilderLine {
  uid: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
}

/** The product fields a line needs. */
export interface BuilderProduct {
  id: string;
  name: string;
  price: number;
}

let lineCounter = 0;

export function makeLine(productId: string, name: string, price: number, qty = 1): BuilderLine {
  lineCounter += 1;
  return { uid: `bl-${lineCounter}`, productId, name, price, qty };
}

/** Adds one unit of a product: bumps the existing line, or appends a new one. */
export function addProductLine(lines: BuilderLine[], product: BuilderProduct): BuilderLine[] {
  if (lines.some(l => l.productId === product.id)) {
    return lines.map(l => (l.productId === product.id ? { ...l, qty: l.qty + 1 } : l));
  }
  return [...lines, makeLine(product.id, product.name, product.price)];
}

/** Moves a line's quantity by `delta`; a line never goes below 1 (removing is explicit). */
export function changeLineQty(lines: BuilderLine[], uid: string, delta: number): BuilderLine[] {
  return lines.map(l => (l.uid === uid ? { ...l, qty: Math.max(1, l.qty + delta) } : l));
}

export function removeLine(lines: BuilderLine[], uid: string): BuilderLine[] {
  return lines.filter(l => l.uid !== uid);
}

export function countUnits(lines: ReadonlyArray<BuilderLine>): number {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

export interface BuilderTotals extends SaleTotals {
  /** Total number of units across all lines. */
  units: number;
}

/** Subtotal, discount, VAT and total for the lines with a percentage discount. */
export function calcBuilderTotals(lines: ReadonlyArray<BuilderLine>, discountPercent: number): BuilderTotals {
  const subtotal = calcSubtotal(lines.map(l => ({ price: l.price, quantity: l.qty })));
  return { ...calcSaleTotals(subtotal, { discountPercent }), units: countUnits(lines) };
}
