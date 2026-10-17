/**
 * Pricing rules — pure functions, no React, no storage.
 *
 * Before this file the 14% VAT rate was hard-coded in three places
 * (POSPage, InvoicePage, ThermalReceipt label) and the totals maths was
 * copy-pasted inside the page components. Keeping it here means one rule,
 * one place to change, and code that can be unit-tested without a browser.
 *
 * Every amount that leaves this file is a whole number of piastres (2 decimals).
 * Without that, 99.99 + 14% VAT was stored as 113.9886 while the screen showed
 * 113.99, so a customer paying the displayed amount was "owed" 0.0014 in change.
 */

/** Egyptian VAT, as a whole-number percent (for labels and settings inputs). */
export const VAT_PERCENT = 14;

/** Egyptian VAT as a multiplier (for maths). */
export const VAT_RATE = VAT_PERCENT / 100;

export interface PricedLine {
  price: number;
  quantity: number;
}

export interface SaleTotals {
  subtotal: number;
  /** Amount taken off the subtotal by the discount. */
  discount: number;
  /** Amount left after the discount, before tax (what tax is charged on). */
  taxable: number;
  tax: number;
  total: number;
}

export interface SaleTotalsOptions {
  /** Discount as a percent of the subtotal (0–100). Defaults to 0. */
  discountPercent?: number;
  /** Tax multiplier. Defaults to the standard VAT rate. */
  taxRate?: number;
}

/**
 * Rounds an amount to whole piastres (2 decimals), halves away from zero.
 *
 * It rounds the decimal text of the number, so binary floating-point noise can
 * not flip a tie: roundMoney(1.005) is 1.01, where Math.round(1.005 * 100) / 100
 * gives 1.00. Negative amounts (refunds) round symmetrically and 0 is never -0.
 */
export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return value;
  if (value === 0) return 0;
  const abs = Math.abs(value);
  const viaText = Number(`${Math.round(Number(`${abs}e2`))}e-2`);
  const rounded = Number.isFinite(viaText) ? viaText : Math.round(abs * 100) / 100;
  return rounded === 0 ? 0 : (value < 0 ? -rounded : rounded);
}

/** Sum of `price × quantity` over all lines; each line is rounded to the piastre first. */
export function calcSubtotal(lines: ReadonlyArray<PricedLine>): number {
  return roundMoney(lines.reduce((sum, line) => sum + roundMoney(line.price * line.quantity), 0));
}

/**
 * Full totals for a sale: discount comes off first, tax is charged on the
 * discounted amount (the same order InvoicePage always used).
 */
export function calcSaleTotals(
  subtotal: number,
  { discountPercent = 0, taxRate = VAT_RATE }: SaleTotalsOptions = {},
): SaleTotals {
  const base = roundMoney(subtotal);
  const discount = roundMoney(base * (discountPercent / 100));
  const taxable = roundMoney(base - discount);
  const tax = roundMoney(taxable * taxRate);
  return { subtotal: base, discount, taxable, tax, total: roundMoney(taxable + tax) };
}
