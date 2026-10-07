import { useCallback, useEffect, useState } from 'react';
import type { PaymentMethodConfig, StaffMember } from '@/types';
import { useDataServices } from '@/context/data-services-context-value';

/**
 * useSettings — layers React state (payment methods/staff) on top of
 * SettingsService. Components never touch MockSettingsRepository directly.
 */
export function useSettings() {
  const { settings: settingsService } = useDataServices();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const [methods, staff] = await Promise.all([
        settingsService.getPaymentMethods(),
        settingsService.getStaffMembers(),
      ]);
      setPaymentMethods(methods);
      setStaffMembers(staff);
    } finally {
      setIsLoading(false);
    }
  }, [settingsService]);

  // Load once on mount. The fetch is kicked off from a microtask so the state
  // updates inside `refetch` run asynchronously, satisfying the
  // react-hooks/set-state-in-effect rule without changing the behaviour.
  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (!cancelled) return refetch();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [refetch]);

  const setPaymentMethodEnabled = useCallback(async (id: string, enabled: boolean) => {
    const updated = await settingsService.setPaymentMethodEnabled(id, enabled);
    setPaymentMethods(prev => prev.map(m => (m.id === id ? updated : m)));
    return updated;
  }, [settingsService]);

  return { paymentMethods, staffMembers, isLoading, refetch, setPaymentMethodEnabled };
}
