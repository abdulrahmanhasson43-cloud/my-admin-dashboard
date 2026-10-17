import SectionCard from '@/components/SectionCard';
import { getPaymentIcon } from '@/components/payment-icons';
import { useAppSettings } from '@/context/app-settings-context-value';
import type { PaymentMethodConfig, SettingsSection } from '@/types';
import SectionHeader from './SectionHeader';
import SectionPanel from './SectionPanel';
import SettingToggle from './SettingToggle';

function PaymentMethodRow({ method, index, onToggle }: {
  method: PaymentMethodConfig;
  index: number;
  onToggle: (id: string) => void;
}) {
  const Icon = getPaymentIcon(method.id);
  return (
    <div
      className="flex items-center gap-4 p-4"
      style={{ borderTop: index > 0 ? '1px solid var(--vuno-border-light)' : 'none' }}
    >
      <div
        className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0"
        style={{ background: method.enabled ? 'color-mix(in srgb, var(--vuno-primary) 10%, transparent)' : 'var(--vuno-surface-pearl)' }}
      >
        <Icon size={20} className={method.enabled ? 'text-[var(--vuno-primary)]' : 'text-[var(--vuno-text-muted)]'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-[var(--vuno-text)] leading-snug">{method.name}</p>
        <p className="text-[13px] text-[var(--vuno-text-muted)]">{method.enabled ? 'مفعّل' : 'معطّل'}</p>
      </div>
      <SettingToggle checked={method.enabled} onChange={() => onToggle(method.id)} label="" />
    </div>
  );
}

/** Payment methods: one row per method with an on/off switch (kept in the app settings, which the cash register reads). */
export default function PaymentMethodsSection({ section, onBack }: { section: SettingsSection; onBack: () => void }) {
  const { paymentMethods, togglePaymentMethod } = useAppSettings();

  return (
    <SectionPanel variant="slide">
      <SectionHeader section={section} onBack={onBack} />
      <SectionCard className="p-0 overflow-hidden">
        {paymentMethods.map((method, i) => (
          <PaymentMethodRow key={method.id} method={method} index={i} onToggle={togglePaymentMethod} />
        ))}
      </SectionCard>
    </SectionPanel>
  );
}
