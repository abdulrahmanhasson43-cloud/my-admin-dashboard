import { createContext, useContext } from 'react';
import type { ReceiptSettings } from '@/components/ThermalReceipt';
import type { PaymentMethodConfig } from '@/types/settings';

export interface AppSettingsValue {
  multiBranchEnabled: boolean;
  setMultiBranchEnabled: (value: boolean) => void;
  transferRequiresConfirmation: boolean;
  setTransferRequiresConfirmation: (value: boolean) => void;
  defaultBranchId: string;
  setDefaultBranchId: (value: string) => void;
  lowStockThreshold: number;
  setLowStockThreshold: (value: number) => void;
  receiptSettings: ReceiptSettings;
  setReceiptSettings: (value: ReceiptSettings) => void;
  updateReceiptField: <K extends keyof ReceiptSettings>(key: K, value: ReceiptSettings[K]) => void;
  /* ── Payment methods (issue #10) ──────────────────────────────
     Single source of truth for which payment methods are visible in
     POS. Settings toggles write here, POS reads here. No more hardcoded
     arrays. No bank/API info is stored — just an enabled flag. */
  paymentMethods: PaymentMethodConfig[];
  togglePaymentMethod: (id: string) => void;
  setPaymentMethodEnabled: (id: string, enabled: boolean) => void;
  /* ── Daily Summary WhatsApp (الفكرة #20) ──────────────────────── */
  dailySummaryEnabled: boolean;
  setDailySummaryEnabled: (value: boolean) => void;
  /** وقت الإرسال بصيغة HH:MM (افتراضي 21:00) */
  dailySummaryTime: string;
  setDailySummaryTime: (value: string) => void;
  /** رقم واتساب المستلِم */
  dailySummaryPhone: string;
  setDailySummaryPhone: (value: string) => void;
  /* ── Auto-backup (Idea #26) ─────────────────────────────────────────
     When enabled, the app auto-exports all data to a JSON file every
     24 hours and shows a toast notification. The last backup timestamp
     is stored so we can display "آخر نسخة احتياطية: …" in Settings. */
  autoBackupEnabled: boolean;
  setAutoBackupEnabled: (value: boolean) => void;
  lastBackupAt: string | null;
  setLastBackupAt: (value: string | null) => void;
}

export const AppSettingsContext = createContext<AppSettingsValue | null>(null);

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return ctx;
}
