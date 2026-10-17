import type { CartItem, CompletedSale } from '@/types';
import { calcSaleTotals, calcSubtotal } from '@/lib/pricing';

/**
 * CompleteSale — the "ring up the cart" use case, lifted out of POSPage.
 *
 * It is a plain function over PORTS (small interfaces for what it needs), so it
 * runs and is tested in plain Node with fakes — no React, no contexts. The
 * `useCompleteSale` hook is the only place that plugs the real contexts in.
 */
export interface CompleteSalePorts {
  /** Persists the sale (takes stock out). Rejects when it cannot. */
  sellProducts(cart: CartItem[]): Promise<void>;
  /** Books the sale on the open shift. Fire-and-forget, as before. */
  recordSale(total: number): unknown;
  /** Moves the monthly sales goal forward. */
  addAchieved(total: number): void;
  /** Writes the activity-log line. */
  logActivity(type: 'sale', description: string): void;
}

export interface CompleteSaleInput {
  cart: CartItem[];
  paymentMethod: string;
}

/**
 * Receipt number: `INV-` + local date (YYMMDD) + `-` + time of day + a 2-char salt,
 * e.g. `INV-261008-0V2XQB7K`.
 *
 * The time of day is the milliseconds since midnight in base 36 (6 chars), so
 * numbers are unique per millisecond and sort chronologically inside a day. The
 * salt only separates two devices that ring up in the very same millisecond.
 * (The old `INV-` + last six digits of the clock repeated every 1,000,000 ms,
 * about 16.7 minutes.) It is unique, not gapless: a tax-authority sequence has to
 * come from the backend once there is one.
 */
export function generateInvoiceId(
  now: number = Date.now(),
  random: () => number = Math.random,
): string {
  const d = new Date(now);
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const date = `${pad2(d.getFullYear() % 100)}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
  const msOfDay = ((d.getHours() * 60 + d.getMinutes()) * 60 + d.getSeconds()) * 1000 + d.getMilliseconds();
  const time = msOfDay.toString(36).toUpperCase().padStart(6, '0');
  const salt = Math.floor(random() * 36 * 36).toString(36).toUpperCase().padStart(2, '0');
  return `INV-${date}-${time}${salt}`;
}

/** Totals and receipt data for a cart (pure — nothing is saved). */
export function buildSale(
  cart: CartItem[],
  paymentMethod: string,
  now: Date = new Date(),
): CompletedSale {
  const { subtotal, tax, total } = calcSaleTotals(calcSubtotal(cart));
  return {
    id: generateInvoiceId(now.getTime()),
    items: [...cart],
    subtotal,
    tax,
    total,
    paymentMethod,
    date: now.toLocaleString('ar-EG'),
  };
}

/**
 * Persists the sale FIRST; only when that succeeds are the shift, the goal and
 * the activity log updated. Returns the receipt, or `null` when there was
 * nothing to sell or persisting failed (the caller keeps the cart so the
 * cashier can retry — this is what prevents a double sale).
 */
export async function completeSale(
  ports: CompleteSalePorts,
  { cart, paymentMethod }: CompleteSaleInput,
): Promise<CompletedSale | null> {
  if (cart.length === 0) return null;

  const sale = buildSale(cart, paymentMethod);

  try {
    await ports.sellProducts(cart);
  } catch {
    // The products context has already surfaced the error to the cashier.
    return null;
  }

  void ports.recordSale(sale.total);
  ports.addAchieved(sale.total);
  ports.logActivity('sale', `تم إتمام بيع بقيمة ${sale.total.toLocaleString()} EGP · ${sale.id}`);
  return sale;
}
