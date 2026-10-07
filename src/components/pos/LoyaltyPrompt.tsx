import { CoinsIcon } from '@/components/icons';
import type { SelectedCustomer } from '@/components/CustomerSelection';

interface LoyaltyPromptProps {
  customer: SelectedCustomer;
  /** Points this sale earns the customer. */
  points: number;
  total: number;
}

/** #36 — LoyaltyPrompt: a reminder of the loyalty points the selected customer will earn. */
export default function LoyaltyPrompt({ customer, points, total }: LoyaltyPromptProps) {
  return (
    <div
      className="rounded-[14px] p-3 mb-4 flex items-center gap-3"
      style={{ background: 'var(--vuno-surface-pearl)', border: '1px solid var(--vuno-border)' }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--vuno-primary)' }}
      >
        <CoinsIcon size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--vuno-text)]">
          سيكسب العميل {points} نقطة ولاء
        </p>
        <p className="text-[11px] text-[var(--vuno-text-muted)]">
          {customer.client?.name || customer.tempName || 'العميل'} · {total.toLocaleString()} EGP × 0.1
        </p>
      </div>
    </div>
  );
}
