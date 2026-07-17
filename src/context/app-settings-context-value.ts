import { createContext, useContext } from 'react';

export interface AppSettingsValue {
  multiBranchEnabled: boolean;
  setMultiBranchEnabled: (value: boolean) => void;
  transferRequiresConfirmation: boolean;
  setTransferRequiresConfirmation: (value: boolean) => void;
  defaultBranchId: string;
  setDefaultBranchId: (value: string) => void;
  lowStockThreshold: number;
  setLowStockThreshold: (value: number) => void;
}

export const AppSettingsContext = createContext<AppSettingsValue | null>(null);

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return ctx;
}
