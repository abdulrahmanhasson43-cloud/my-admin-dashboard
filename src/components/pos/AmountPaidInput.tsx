import { CoinsIcon } from '@/components/icons';

interface AmountPaidInputProps {
  amountPaid: string;
  total: number;
  /** What the customer gets back; the "change" banner shows only when it is above zero. */
  change: number;
  onChange: (value: string) => void;
}

/** الفكرة #13 — AmountPaidInput: the custom amount field and the change display. */
export default function AmountPaidInput({ amountPaid, total, change, onChange }: AmountPaidInputProps) {
  return (
    <div className="mb-3">
      <label className="text-[12px] font-semibold text-[var(--vuno-text-secondary)] mb-1.5 block">
        المبلغ المدفوع
      </label>
      <input
        type="number"
        dir="ltr"
        inputMode="decimal"
        value={amountPaid}
        onChange={(e) => onChange(e.target.value)}
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
  );
}
