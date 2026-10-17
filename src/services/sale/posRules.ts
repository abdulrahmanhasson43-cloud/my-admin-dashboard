import { roundMoney } from '@/lib/pricing';

/** Quick-pay buttons on the POS, in EGP. */
export const QUICK_PAY_AMOUNTS = [50, 100, 200, 500, 1000, 2000] as const;

/** Change owed to the customer; 0 when nothing was entered. Negative means "still short". */
export function calcChange(total: number, amountPaid: number): number {
  return amountPaid > 0 ? roundMoney(amountPaid - total) : 0;
}

/** Name for a parked order: the customer's name, or a summary of the cart. */
export function heldOrderLabel(customerName: string, itemCount: number, total: number): string {
  return customerName || `طلب معلق · ${itemCount} منتج · ${total.toLocaleString()} EGP`;
}

/** What handing over `amountPaid` against `total` means for the sale. */
export type TenderResult =
  | { kind: 'short'; shortBy: number }
  | { kind: 'exact' }
  | { kind: 'change'; change: number };

/**
 * Compares the cash handed over with the total: still short, exactly right, or
 * change owed. Both sides are compared in whole piastres, so paying the amount
 * the screen shows is always "exact" and the change never carries float noise.
 */
export function evaluateTender(total: number, amountPaid: number): TenderResult {
  const due = roundMoney(total);
  const paid = roundMoney(amountPaid);
  if (paid < due) return { kind: 'short', shortBy: roundMoney(due - paid) };
  if (paid === due) return { kind: 'exact' };
  return { kind: 'change', change: roundMoney(paid - due) };
}

