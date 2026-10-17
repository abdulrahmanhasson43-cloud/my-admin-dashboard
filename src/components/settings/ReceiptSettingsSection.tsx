import Field from '@/components/Field';
import SectionCard from '@/components/SectionCard';
import { receiptSwitches, receiptTextFields } from '@/constants/receiptFields';
import { useAppSettings } from '@/context/app-settings-context-value';
import { logoUrlFromInput, logoUrlToInput } from '@/lib/settings';
import type { SettingsSection } from '@/types';
import SectionHeader from './SectionHeader';
import SectionPanel from './SectionPanel';
import SettingToggle from './SettingToggle';
import ReceiptPreview from './ReceiptPreview';

/** The thermal receipt: what is printed on it, which parts show, and a live preview. These settings live in the app settings. */
export default function ReceiptSettingsSection({ section, onBack }: { section: SettingsSection; onBack: () => void }) {
  const { receiptSettings, updateReceiptField } = useAppSettings();

  return (
    <SectionPanel variant="slide" className="grid lg:grid-cols-[1fr_auto] gap-5 items-start">
      <div>
        <SectionHeader section={section} onBack={onBack} />

        {/* Store info fields for the receipt */}
        <SectionCard className="mb-4">
          <h3 className="text-[15px] font-semibold text-[var(--vuno-text)] mb-3">بيانات المتجر على الإيصال</h3>
          <div className="space-y-3">
            {receiptTextFields.map(field => (
              <Field
                key={field.key}
                label={field.label}
                value={receiptSettings[field.key]}
                onChange={v => updateReceiptField(field.key, v)}
              />
            ))}
          </div>
        </SectionCard>

        {/* Toggle which fields appear */}
        <SectionCard>
          <h3 className="text-[15px] font-semibold text-[var(--vuno-text)] mb-1">ما يظهر على الإيصال</h3>
          <p className="text-[13px] text-[var(--vuno-text-muted)] mb-2">فعّل أو أوقف الحقول التي تريد إظهارها</p>
          <div className="divide-y" style={{ borderColor: 'var(--vuno-border-light)' }}>
            {receiptSwitches.map((item, i) => (
              <div key={item.key} className={i === 0 ? undefined : 'border-t'} style={{ borderColor: 'var(--vuno-border-light)' }}>
                <SettingToggle
                  checked={receiptSettings[item.key]}
                  onChange={v => updateReceiptField(item.key, v)}
                  label={item.label}
                  hint={item.hint}
                />
              </div>
            ))}
          </div>

          {receiptSettings.showLogo && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--vuno-border-light)' }}>
              <Field
                label="رابط الشعار (URL)"
                value={logoUrlToInput(receiptSettings.logoUrl)}
                onChange={v => updateReceiptField('logoUrl', logoUrlFromInput(v))}
                placeholder="https://example.com/logo.png"
              />
            </div>
          )}
        </SectionCard>
      </div>

      <ReceiptPreview settings={receiptSettings} />
    </SectionPanel>
  );
}
