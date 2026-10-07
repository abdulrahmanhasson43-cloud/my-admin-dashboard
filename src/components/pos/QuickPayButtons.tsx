import { ZapIcon } from '@/components/icons';

interface QuickPayButtonsProps {
  amounts: readonly number[];
  total: number;
  onQuickPay: (amount: number) => void;
}

/** الفكرة #13 — QuickPayButtons: fixed cash amounts; the ones below the total are disabled. */
export default function QuickPayButtons({ amounts, total, onQuickPay }: QuickPayButtonsProps) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-2">
        <ZapIcon size={13} className="text-[var(--vuno-primary)]" />
        <span className="text-[12px] font-semibold text-[var(--vuno-text-secondary)]">دفع سريع</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {amounts.map(amount => (
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
  );
}
