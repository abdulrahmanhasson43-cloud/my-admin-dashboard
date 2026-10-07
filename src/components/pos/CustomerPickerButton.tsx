import { UsersIcon } from '@/components/icons';
import type { SelectedCustomer } from '@/components/CustomerSelection';

interface CustomerPickerButtonProps {
  customer: SelectedCustomer | null;
  onClick: () => void;
}

/** CustomerPickerButton — shows the selected customer (or a prompt) and opens the customer picker. */
export default function CustomerPickerButton({ customer, onClick }: CustomerPickerButtonProps) {
  return (
    <div className="mb-3">
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 rounded-2xl border border-[var(--vuno-border)] hover:border-[var(--vuno-primary)] transition-colors"
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)' }}
        >
          <UsersIcon size={17} className="text-[var(--vuno-primary)]" />
        </div>
        <div className="flex-1 min-w-0 text-right">
          {customer ? (
            <>
              <p className="text-[13px] font-semibold text-[var(--vuno-text)] truncate">
                {customer.type === 'registered'
                  ? customer.client?.name
                  : customer.tempName}
              </p>
              <p className="text-[11px] text-[var(--vuno-text-muted)] truncate">
                {customer.type === 'registered'
                  ? customer.client?.phone
                  : customer.tempPhone || 'عميل مؤقت'}
              </p>
            </>
          ) : (
            <>
              <p className="text-[13px] font-semibold text-[var(--vuno-text)]">اختيار العميل</p>
              <p className="text-[11px] text-[var(--vuno-text-muted)]">عميل مسجل أو مؤقت</p>
            </>
          )}
        </div>
        <span className="text-[11px] text-[var(--vuno-primary)] font-medium flex-shrink-0">تغيير</span>
      </button>
    </div>
  );
}
