import { getPaymentIcon } from '@/components/payment-icons';
import type { PaymentMethodConfig } from '@/types/settings';

interface PaymentMethodPillsProps {
  /** Only the methods the merchant enabled in Settings. */
  methods: PaymentMethodConfig[];
  selected: string;
  onSelect: (methodId: string) => void;
}

/* Payment methods — pill buttons (issue #3 + #10): horizontal pills per
   DESIGN.md, fed by the methods enabled in the Settings page. */
export default function PaymentMethodPills({ methods, selected, onSelect }: PaymentMethodPillsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {methods.map(method => {
        const Icon = getPaymentIcon(method.id);
        const isSelected = selected === method.id;
        return (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-full transition-all active:scale-95"
            style={{
              background: isSelected ? 'var(--vuno-primary)' : 'var(--vuno-surface)',
              border: isSelected ? '1px solid var(--vuno-primary)' : '1px solid var(--vuno-border)',
              color: isSelected ? '#fff' : 'var(--vuno-text-secondary)',
            }}
          >
            <Icon size={14} className={isSelected ? 'text-white' : 'text-[var(--vuno-text-muted)]'} />
            <span className={`text-[12px] ${isSelected ? 'font-semibold' : 'font-medium'}`}>
              {method.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
