import { useCallback, useMemo, type ReactNode } from 'react';
import { SalesGoalContext } from '@/context/sales-goal-context-value';
import { useNotifications } from '@/context/notifications-context-value';
import { useDataServices } from './data-services-context-value';
import { useServiceState } from '@/hooks/useServiceState';
import type { SalesGoal } from '@/types';

/**
 * SalesGoalProvider — holds the month's goal in React state. When a sale
 * carries the goal over the line, SalesGoalService says so (`justReached`) and
 * this provider raises the notification — AFTER the state change, not inside a
 * state updater, so no component is updated while another one renders.
 */
export function SalesGoalProvider({ children }: { children: ReactNode }) {
  const { salesGoal: service } = useDataServices();
  const { addNotification } = useNotifications();
  const [goal, update] = useServiceState<SalesGoal>(() => service.getCurrent());

  const setTarget = useCallback(
    (target: number) => {
      update(current => service.setTarget(current, target));
    },
    [service, update],
  );

  const addAchieved = useCallback(
    (amount: number) => {
      const result: { justReached: boolean; goal: SalesGoal | null } = { justReached: false, goal: null };
      update(current => {
        const outcome = service.addAchieved(current, amount);
        result.justReached = outcome.justReached;
        result.goal = outcome.goal;
        return outcome.goal;
      });
      if (result.justReached && result.goal) addNotification(service.reachedNotice(result.goal));
    },
    [service, update, addNotification],
  );

  const progressPercent = useMemo(() => service.progressPercent(goal), [service, goal]);
  const isGoalReached = service.isReached(goal);

  const value = useMemo(
    () => ({ currentGoal: goal, setTarget, addAchieved, progressPercent, isGoalReached }),
    [goal, setTarget, addAchieved, progressPercent, isGoalReached],
  );

  return <SalesGoalContext.Provider value={value}>{children}</SalesGoalContext.Provider>;
}
