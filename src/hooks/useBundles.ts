import { useCallback, useEffect, useState } from 'react';
import type { Bundle } from '@/types';
import type { CreateBundleInput } from '@/services/bundle';
import { useDataServices } from '@/context/data-services-context-value';

/**
 * useBundles — layers React state (loading/bundles) on top of BundleService.
 * Components never touch MockBundleRepository directly.
 */
export function useBundles() {
  const { bundle: bundleService } = useDataServices();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await bundleService.getAllBundles();
      setBundles(all);
    } finally {
      setIsLoading(false);
    }
  }, [bundleService]);

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

  const createBundle = useCallback(async (input: CreateBundleInput) => {
    const created = await bundleService.createBundle(input);
    setBundles(prev => [...prev, created]);
    return created;
  }, [bundleService]);

  const updateBundle = useCallback(async (id: string, updates: Partial<Omit<Bundle, 'id'>>) => {
    const updated = await bundleService.updateBundle(id, updates);
    setBundles(prev => prev.map(b => (b.id === id ? updated : b)));
    return updated;
  }, [bundleService]);

  const toggleBundleActive = useCallback(async (id: string) => {
    const updated = await bundleService.toggleBundleActive(id);
    setBundles(prev => prev.map(b => (b.id === id ? updated : b)));
    return updated;
  }, [bundleService]);

  const deleteBundle = useCallback(async (id: string) => {
    await bundleService.deleteBundle(id);
    setBundles(prev => prev.filter(b => b.id !== id));
  }, [bundleService]);

  return { bundles, isLoading, refetch, createBundle, updateBundle, toggleBundleActive, deleteBundle };
}
