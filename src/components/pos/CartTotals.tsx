interface CartTotalsProps {
  subtotal: number;
  tax: number;
  total: number;
}

/** CartTotals — subtotal, tax and the grand total at the bottom of the cart. */
export default function CartTotals({ subtotal, tax, total }: CartTotalsProps) {
  return (
    <div className="border-t border-[var(--vuno-border-light)] pt-3 space-y-1.5 mb-4">
      <div className="flex justify-between text-[13px]">
        <span className="text-[var(--vuno-text-muted)]">المجموع</span>
        <span className="font-semibold text-[var(--vuno-text)]">{subtotal.toLocaleString()} EGP</span>
      </div>
      <div className="flex justify-between text-[13px]">
        <span className="text-[var(--vuno-text-muted)]">الضريبة (14%)</span>
        <span className="font-semibold text-[var(--vuno-text)]">{tax.toLocaleString()} EGP</span>
      </div>
      <div className="flex justify-between text-[16px] font-semibold border-t border-[var(--vuno-border-light)] pt-2">
        <span className="text-[var(--vuno-text)]">الإجمالي</span>
        <span className="text-[var(--vuno-primary)]">{total.toLocaleString()} EGP</span>
      </div>
    </div>
  );
}
