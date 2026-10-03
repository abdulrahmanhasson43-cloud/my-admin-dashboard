/** Quick-pay buttons on the POS, in EGP. */
export const QUICK_PAY_AMOUNTS = [50, 100, 200, 500, 1000, 2000] as const;

/** Change owed to the customer; 0 when nothing was entered. Negative means "still short". */
export function calcChange(total: number, amountPaid: number): number {
  return amountPaid > 0 ? amountPaid - total : 0;
}

/** Name for a parked order: the customer's name, or a summary of the cart. */
export function heldOrderLabel(customerName: string, itemCount: number, total: number): string {
  return customerName || `طلب معلق · ${itemCount} منتج · ${total.toLocaleString()} EGP`;
}
