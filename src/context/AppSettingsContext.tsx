import { useState, type ReactNode } from 'react';
import { AppSettingsContext } from './app-settings-context-value';

// TODO(phase-3): persist these to Firestore/Supabase per-merchant instead of
// in-memory React state, so settings survive a refresh and are scoped to
// the logged-in merchant's account.
export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [multiBranchEnabled, setMultiBranchEnabled] = useState(false);
  const [transferRequiresConfirmation, setTransferRequiresConfirmation] = useState(false);
  const [defaultBranchId, setDefaultBranchId] = useState('1');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  return (
    <AppSettingsContext.Provider
      value={{
        multiBranchEnabled, setMultiBranchEnabled,
        transferRequiresConfirmation, setTransferRequiresConfirmation,
        defaultBranchId, setDefaultBranchId,
        lowStockThreshold, setLowStockThreshold,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}
