import { useState, useCallback, type ReactNode } from 'react';
import { AppSettingsContext } from './app-settings-context-value';
import { defaultReceiptSettings } from '@/components/ThermalReceipt';
import type { ReceiptSettings } from '@/components/ThermalReceipt';
import { paymentMethodsList } from '@/services/mock/settings';

// TODO(phase-3): persist these to Firestore/Supabase per-merchant instead of
// in-memory React state, so settings survive a refresh and are scoped to
// the logged-in merchant's account.
export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [multiBranchEnabled, setMultiBranchEnabled] = useState(false);
  const [transferRequiresConfirmation, setTransferRequiresConfirmation] = useState(false);
  const [defaultBranchId, setDefaultBranchId] = useState('1');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>(defaultReceiptSettings);
  const [paymentMethods, setPaymentMethods] = useState(paymentMethodsList);
  // الفكرة #20: إعدادات الملخص اليومي عبر واتساب
  const [dailySummaryEnabled, setDailySummaryEnabled] = useState(false);
  const [dailySummaryTime, setDailySummaryTime] = useState('21:00');
  const [dailySummaryPhone, setDailySummaryPhone] = useState('');
  // الفكرة #26: النسخ الاحتياطي التلقائي كل 24 ساعة
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(null);

  const updateReceiptField = useCallback(
    <K extends keyof ReceiptSettings>(key: K, value: ReceiptSettings[K]) => {
      setReceiptSettings(prev => ({ ...prev, [key]: value }));
    },
    [],
  );

  const togglePaymentMethod = useCallback((id: string) => {
    setPaymentMethods(prev =>
      prev.map(m => (m.id === id ? { ...m, enabled: !m.enabled } : m)),
    );
  }, []);

  const setPaymentMethodEnabled = useCallback((id: string, enabled: boolean) => {
    setPaymentMethods(prev =>
      prev.map(m => (m.id === id ? { ...m, enabled } : m)),
    );
  }, []);

  return (
    <AppSettingsContext.Provider
      value={{
        multiBranchEnabled, setMultiBranchEnabled,
        transferRequiresConfirmation, setTransferRequiresConfirmation,
        defaultBranchId, setDefaultBranchId,
        lowStockThreshold, setLowStockThreshold,
        receiptSettings, setReceiptSettings, updateReceiptField,
        paymentMethods, togglePaymentMethod, setPaymentMethodEnabled,
        dailySummaryEnabled, setDailySummaryEnabled,
        dailySummaryTime, setDailySummaryTime,
        dailySummaryPhone, setDailySummaryPhone,
        autoBackupEnabled, setAutoBackupEnabled,
        lastBackupAt, setLastBackupAt,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}
