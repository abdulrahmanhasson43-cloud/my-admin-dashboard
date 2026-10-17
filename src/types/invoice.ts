/**
 * One product on an invoice: what was bought, how many, at what unit price.
 * The price is the one on the line, before the invoice's discount and tax — a return that
 * refunds at this price does not take either of them into account.
 */
export interface InvoiceLine {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  customer: string;
  amount: number;
  tax: number;
  total: number;
  method: string;
  date: string;
  status: 'paid' | 'pending' | 'cancelled';
  /** How many items the invoice shows (the screens display this number). */
  items: number;
  /**
   * The products themselves. Optional: invoices made before lines were kept (and the
   * sample ones) don't have them. A return reads these to name the real products.
   */
  lines?: InvoiceLine[];
}
