import { CoinsIcon, ZapIcon } from '@/components/icons';
import { getPaymentIcon } from '@/components/payment-icons';
import { QUICK_PAY_AMOUNTS } from '@/services/sale';
import type { PaymentMethodConfig } from '@/types/settings';

interface CartPaymentPanelProps {
  methods: PaymentMethodConfig[];
  selectedMethod: string;
  onSelectMethod: (id: string) => void;
  total: number;
  amountPaid: string;
  onAmountPaidChange: (value: string) => void;
  /** Change owed for the typed amount (0 when nothing was typed). */
  change: number;
  onQuickPay: (amount: number) => void;
}

/** How the customer pays: method pills, quick-pay amounts, a typed amount and the change owed. */
export default function CartPaymentPanel({
  methods, selectedMethod, onSelectMethod, total, amountPaid, onAmountPaidChange, change, onQuickPay,
}: CartPaymentPanelProps) {
  return (
    <>
      {/* Payment Methods — pill buttons (issue #3 + #10)
          Converted from stacked rectangles to horizontal pill
          buttons per DESIGN.md. Reads from settings context. */}
      <div className="flex flex-wrap gap-2 mb-4">
        {methods.map(method => {
          const Icon = getPaymentIcon(method.id);
          const selected = selectedMethod === method.id;
          return (
            <button
              key={method.id}
              onClick={() => onSelectMethod(method.id)}
              className="flex items-center gap-1.5 h-9 px-4 rounded-full transition-all active:scale-95"
              style={{
                background: selected ? 'var(--vuno-primary)' : 'var(--vuno-surface)',
                border: selected ? '1px solid var(--vuno-primary)' : '1px solid var(--vuno-border)',
                color: selected ? '#fff' : 'var(--vuno-text-secondary)',
              }}
            >
              <Icon size={14} className={selected ? 'text-white' : 'text-[var(--vuno-text-muted)]'} />
              <span className={`text-[12px] ${selected ? 'font-semibold' : 'font-medium'}`}>
                {method.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Pay Buttons — الفكرة #13 (6 مبالغ + حساب الباقي) */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-2">
          <ZapIcon size={13} className="text-[var(--vuno-primary)]" />
          <span className="text-[12px] font-semibold text-[var(--vuno-text-secondary)]">دفع سريع</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_PAY_AMOUNTS.map(amount => (
            <button
              key={amount}
              onClick={() => onQuickPay(amount)}
              disabled={amount < total}
              className="h-11 rounded-xl text-[14px] font-bold transition-all active:scale-95 disabled:opacity-30"
              style={{
                background: 'var(--vuno-surface)',
                border: '1px solid var(--vuno-border)',
                color: 'var(--vuno-primary)',
              }}
            >
              {amount.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Custom amount input + change display — الفكرة #13 */}
      <div className="mb-3">
        <label className="text-[12px] font-semibold text-[var(--vuno-text-secondary)] mb-1.5 block">
          المبلغ المدفوع
        </label>
        <input
          type="number"
          dir="ltr"
          inputMode="decimal"
          value={amountPaid}
          onChange={(e) => onAmountPaidChange(e.target.value)}
          placeholder={total.toString()}
          className="w-full h-11 rounded-xl px-4 text-[15px] font-semibold text-left"
          style={{
            background: 'var(--vuno-surface)',
            border: '1px solid var(--vuno-border)',
            color: 'var(--vuno-text)',
          }}
        />
        {change > 0 && (
          <div
            className="mt-2 flex items-center justify-between rounded-xl px-3 py-2"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-green-600">
              <CoinsIcon size={15} /> الباقي للعميل
            </span>
            <span className="text-[15px] font-bold text-green-600" dir="ltr">
              {change.toLocaleString()} EGP
            </span>
          </div>
        )}
      </div>
    </>
  );
}
