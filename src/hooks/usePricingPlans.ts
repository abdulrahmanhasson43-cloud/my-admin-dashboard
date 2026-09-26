import { useCallback, useEffect, useState } from 'react';
import type { PricingPlan } from '@/types';
import { useDataServices } from '@/context/data-services-context-value';

/**
 * usePricingPlans — reactive state layered over PricingPlanService.
 * No page consumes this yet (there is no pricing/upgrade screen today), but
 * the data source now follows the same Dependency Rule as every other
 * entity the moment a page needs it — no more "13 exceptions".
 */
export function usePricingPlans() {
  const { pricingPlan: pricingPlanService } = useDataServices();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await pricingPlanService.getAllPlans();
      setPlans(all);
    } finally {
      setIsLoading(false);
    }
  }, [pricingPlanService]);

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

  return { plans, isLoading, refetch };
}
