import SectionCard from '@/components/SectionCard';
import { useAppSettings } from '@/context/app-settings-context-value';
import { parseLowStockThreshold } from '@/lib/settings';
import type { Branch, SettingsSection } from '@/types';
import SectionHeader from './SectionHeader';
import SectionPanel from './SectionPanel';
import SettingToggle from './SettingToggle';
import SaveBar from './SaveBar';

/** Branches and stock: the multi-branch switch (and what depends on it) and the "low stock" limit. These live in the app settings. */
export default function BranchesInventorySection({ section, branches, onSave, onBack }: {
  section: SettingsSection;
  branches: ReadonlyArray<Branch>;
  onSave: () => void;
  onBack: () => void;
}) {
  const {
    multiBranchEnabled, setMultiBranchEnabled,
    transferRequiresConfirmation, setTransferRequiresConfirmation,
    defaultBranchId, setDefaultBranchId,
    lowStockThreshold, setLowStockThreshold,
  } = useAppSettings();

  return (
    <SectionPanel variant="slide" className="space-y-4">
      <SectionHeader section={section} onBack={onBack} />

      <SectionCard>
        <SettingToggle
          checked={multiBranchEnabled}
          onChange={setMultiBranchEnabled}
          label="لدي أكثر من فرع"
          hint="فعّلها لو عندك أكثر من فرع."
        />
      </SectionCard>

      {multiBranchEnabled && (
        <>
          <SectionCard>
            <SettingToggle
              checked={transferRequiresConfirmation}
              onChange={setTransferRequiresConfirmation}
              label="النقل بين الفروع يحتاج تأكيد"
              hint="لو مفعّلة، النقل هيبقى معلّق لحد ما توافق عليه."
            />
          </SectionCard>

          <SectionCard>
            <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-2">الفرع الافتراضي لنقطة البيع</label>
            <select
              value={defaultBranchId}
              onChange={e => setDefaultBranchId(e.target.value)}
              className="w-full h-12 px-4 rounded-[10px] text-[15px] text-[var(--vuno-text)] bg-white border-[1.5px] border-[var(--vuno-border)] outline-none transition-all duration-150 hover:border-[var(--vuno-text-muted)] focus:border-[var(--vuno-text)] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)]"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </SectionCard>
        </>
      )}

      <SectionCard>
        <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-2">حد تنبيه "المخزون المنخفض"</label>
        <p className="text-[13px] text-[var(--vuno-text-muted)] mb-3">تحت الرقم ده، المنتج يعتبر ناقص.</p>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={lowStockThreshold}
          onChange={e => setLowStockThreshold(parseLowStockThreshold(e.target.value))}
          className="w-full sm:w-48 h-12 px-4 rounded-[10px] text-[15px] text-[var(--vuno-text)] bg-white border-[1.5px] border-[var(--vuno-border)] outline-none transition-all duration-150 hover:border-[var(--vuno-text-muted)] focus:border-[var(--vuno-text)] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)]"
        />
      </SectionCard>

      <SaveBar onSave={onSave} />
    </SectionPanel>
  );
}
