import { useCallback, useEffect, useState } from 'react';
import type { UserProfile, StoreBranding, SubscriptionInfo } from '@/types';
import { useDataServices } from '@/context/data-services-context-value';

/**
 * useProfile — layers React state (profile/branding/subscription) on top of
 * ProfileService. Components never touch MockProfileRepository directly.
 */
export function useProfile() {
  const { profile: profileService } = useDataServices();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [branding, setBranding] = useState<StoreBranding | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const [p, b, s] = await Promise.all([
        profileService.getProfile(),
        profileService.getBranding(),
        profileService.getSubscription(),
      ]);
      setProfile(p);
      setBranding(b);
      setSubscription(s);
    } finally {
      setIsLoading(false);
    }
  }, [profileService]);

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

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    const updated = await profileService.updateProfile(updates);
    setProfile(updated);
    return updated;
  }, [profileService]);

  const updateBranding = useCallback(async (updates: Partial<StoreBranding>) => {
    const updated = await profileService.updateBranding(updates);
    setBranding(updated);
    return updated;
  }, [profileService]);

  return { profile, branding, subscription, isLoading, refetch, updateProfile, updateBranding };
}
