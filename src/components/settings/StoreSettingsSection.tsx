import Field from '@/components/Field';
import SectionCard from '@/components/SectionCard';
import type { SettingsSection } from '@/types';
import type { StoreDraft } from '@/lib/settings';
import SectionHeader from './SectionHeader';
import SectionPanel from './SectionPanel';
import SaveBar from './SaveBar';

/** The store form: name, phone, address, tax number. The values live in the page (see useDraft). */
export default function StoreSettingsSection({ section, draft, onChange, onSave, onBack }: {
  section: SettingsSection;
  draft: StoreDraft;
  onChange: <K extends keyof StoreDraft>(key: K, value: StoreDraft[K]) => void;
  onSave: () => void;
  onBack: () => void;
}) {
  return (
    <SectionPanel variant="slide">
      <SectionHeader section={section} onBack={onBack} />
      <SectionCard>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="اسم المتجر" value={draft.name} onChange={v => onChange('name', v)} />
          <Field label="رقم الهاتف" value={draft.phone} onChange={v => onChange('phone', v)} />
          <div className="sm:col-span-2">
            <Field label="العنوان" value={draft.address} onChange={v => onChange('address', v)} />
          </div>
          <Field label="الرقم الضريبي" value={draft.taxNumber} onChange={v => onChange('taxNumber', v)} />
        </div>
        <SaveBar onSave={onSave} />
      </SectionCard>
    </SectionPanel>
  );
}
