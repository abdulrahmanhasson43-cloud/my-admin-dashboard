import { useCallback, useMemo, type ReactNode } from 'react';
import { ActivityLogContext } from '@/context/activity-log-context-value';
import { useDataServices } from './data-services-context-value';
import { useServiceState } from '@/hooks/useServiceState';
import type { ActivityEntry } from '@/types';

/**
 * ActivityLogProvider — holds the activity list in React state. The ordering,
 * the 200-entry cap and the saving all live in ActivityLogService.
 */
export function ActivityLogProvider({ children }: { children: ReactNode }) {
  const { activityLog: service } = useDataServices();
  const [activities, update] = useServiceState<ActivityEntry[]>(() => service.getAll());

  const logActivity = useCallback(
    (type: ActivityEntry['type'], description: string, amount?: number) => {
      update(current => service.log(current, type, description, amount));
    },
    [service, update],
  );

  const clearActivities = useCallback(() => {
    update(() => service.clear());
  }, [service, update]);

  const value = useMemo(
    () => ({ activities, logActivity, clearActivities }),
    [activities, logActivity, clearActivities],
  );

  return <ActivityLogContext.Provider value={value}>{children}</ActivityLogContext.Provider>;
}
