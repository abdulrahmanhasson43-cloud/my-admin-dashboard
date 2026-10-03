/**
 * Pricing rules — pure functions, no React, no storage.
 *
 * Before this file the 14% VAT rate was hard-coded in three places
 * (POSPage, InvoicePage, ThermalReceipt label) and the totals maths was
 * copy-pasted inside the page components. Keeping it here means one rule,
 * one place to change, and code that can be unit-tested without a browser.
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

/** Sum of `price × quantity` over all lines. */
export function calcSubtotal(lines: ReadonlyArray<PricedLine>): number {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

/**
 * Full totals for a sale: discount comes off first, tax is charged on the
 * discounted amount (the same order InvoicePage always used).
 */
export function calcSaleTotals(
  subtotal: number,
  { discountPercent = 0, taxRate = VAT_RATE }: SaleTotalsOptions = {},
): SaleTotals {
  const discount = subtotal * (discountPercent / 100);
  const taxable = subtotal - discount;
  const tax = taxable * taxRate;
  return { subtotal, discount, taxable, tax, total: taxable + tax };
}
