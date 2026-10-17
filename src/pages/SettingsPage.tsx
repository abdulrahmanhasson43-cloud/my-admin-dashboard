import { useState } from 'react';
import { settingsSections } from '@/constants/settingsSections';
import { useSettings } from '@/hooks/useSettings';
import { useBranches } from '@/hooks/useBranches';
import { useDraft } from '@/hooks/useDraft';
import { useSavedNotice } from '@/hooks/useSavedNotice';
import { defaultInvoiceDraft, defaultStoreDraft } from '@/lib/settings';
import type { SettingsSection, SettingsSectionId } from '@/types';
import SettingsMenu from '@/components/settings/SettingsMenu';
import SavedNotice from '@/components/settings/SavedNotice';
import SectionHeader from '@/components/settings/SectionHeader';
import SectionPanel from '@/components/settings/SectionPanel';
import StoreSettingsSection from '@/components/settings/StoreSettingsSection';
import InvoiceSettingsSection from '@/components/settings/InvoiceSettingsSection';
import ReceiptSettingsSection from '@/components/settings/ReceiptSettingsSection';
import StaffSettingsSection from '@/components/settings/StaffSettingsSection';
import PaymentMethodsSection from '@/components/settings/PaymentMethodsSection';
import BranchesInventorySection from '@/components/settings/BranchesInventorySection';
import ShiftsSettingsSection from '@/components/settings/ShiftsSettingsSection';
import AppearanceSection from '@/components/settings/AppearanceSection';
import DailySummarySection from '@/components/DailySummarySection';
import DataBackupSection from '@/components/DataBackupSection';

/**
 * Settings: a menu of ten sections; picking one opens it in place, and its back button returns to the menu.
 * The page keeps what must outlive a section — which section is open, the store and invoice forms (so what was typed is
 * still there after going back), the "saved" notice — and the staff and branches lists, loaded once when the screen opens.
 * The sections read the rest (receipt, payment methods, branches switch, theme) from their own contexts.
 * The sections are in components/settings/; the rules (low-stock field, logo address, form defaults) in lib/settings.ts.
 */
export default function SettingsPage() {
  const { staffMembers } = useSettings();
  const { branches } = useBranches();
  const [activeId, setActiveId] = useState<SettingsSectionId | null>(null);
  const [store, setStoreField] = useDraft(defaultStoreDraft);
  const [invoice, setInvoiceField] = useDraft(defaultInvoiceDraft);
  const savedNotice = useSavedNotice();

  const goBack = () => setActiveId(null);
  const active = settingsSections.find(s => s.id === activeId);

  const renderSection = (section: SettingsSection) => {
    switch (section.id) {
      case 'store':
        return <StoreSettingsSection section={section} draft={store} onChange={setStoreField} onSave={savedNotice.show} onBack={goBack} />;
      case 'invoice':
        return <InvoiceSettingsSection section={section} draft={invoice} onChange={setInvoiceField} onSave={savedNotice.show} onBack={goBack} />;
      case 'receipt':
        return <ReceiptSettingsSection section={section} onBack={goBack} />;
      case 'staff':
        return <StaffSettingsSection section={section} members={staffMembers} onBack={goBack} />;
      case 'payments':
        return <PaymentMethodsSection section={section} onBack={goBack} />;
      case 'branches-inventory':
        return <BranchesInventorySection section={section} branches={branches} onSave={savedNotice.show} onBack={goBack} />;
      case 'shifts':
        return <ShiftsSettingsSection section={section} onBack={goBack} />;
      case 'daily-summary':
        return (
          <SectionPanel variant="rise" className="space-y-4">
            <SectionHeader section={section} onBack={goBack} />
            <DailySummarySection />
          </SectionPanel>
        );
      case 'appearance':
        return <AppearanceSection section={section} onBack={goBack} />;
      case 'data-backup':
        return (
          <SectionPanel variant="rise" className="space-y-4">
            <SectionHeader section={section} onBack={goBack} />
            <DataBackupSection />
          </SectionPanel>
        );
    }
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl mx-auto">
      {savedNotice.visible && <SavedNotice />}
      {active ? renderSection(active) : <SettingsMenu sections={settingsSections} onOpen={setActiveId} />}
    </div>
  );
}
