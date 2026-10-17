/** Payment methods offered when building an invoice (the labels printed on it). */
export const INVOICE_PAYMENT_METHODS = ['كاش', 'بطاقة', 'محفظة', 'إنستاباي', 'Apple Pay'];

/** Invoice status → Arabic label and badge colours. */
export const invoiceStatusConfig: Record<string, { label: string; badgeClass: string }> = {
  paid: { label: 'مدفوعة', badgeClass: 'bg-emerald-100 text-emerald-600' },
  pending: { label: 'معلقة', badgeClass: 'bg-amber-100 text-amber-600' },
  cancelled: { label: 'ملغاة', badgeClass: 'bg-red-100 text-red-600' },
};
