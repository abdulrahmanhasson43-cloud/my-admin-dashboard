import Field from '@/components/Field';
import SectionCard from '@/components/SectionCard';
import type { SettingsSection } from '@/types';
import type { InvoiceDraft } from '@/lib/settings';
import SectionHeader from './SectionHeader';
import SectionPanel from './SectionPanel';
import SaveBar from './SaveBar';

/** The invoice form: number prefix, tax rate, footer. The values live in the page (see useDraft). */
export default function InvoiceSettingsSection({ section, draft, onChange, onSave, onBack }: {
  section: SettingsSection;
  draft: InvoiceDraft;
  onChange: <K extends keyof InvoiceDraft>(key: K, value: InvoiceDraft[K]) => void;
  onSave: () => void;
  onBack: () => void;
}) {
  return (
    <SectionPanel variant="slide">
      <SectionHeader section={section} onBack={onBack} />
      <SectionCard>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="بادئة الفاتورة" value={draft.prefix} onChange={v => onChange('prefix', v)} />
          <Field label="نسبة الضريبة (%)" value={draft.taxRate} onChange={v => onChange('taxRate', v)} type="number" />
          <div className="sm:col-span-2">
            <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">تذييل الفاتورة</label>
            <textarea
              value={draft.footer}
              onChange={e => onChange('footer', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-[10px] text-[15px] text-[var(--vuno-text)] bg-white border-[1.5px] border-[var(--vuno-border)] outline-none transition-all duration-150 placeholder:text-[var(--vuno-text-muted)] hover:border-[var(--vuno-text-muted)] focus:border-[var(--vuno-text)] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] resize-none"
            />
          </div>
        </div>
        <SaveBar onSave={onSave} />
      </SectionCard>
    </SectionPanel>
  );
}
