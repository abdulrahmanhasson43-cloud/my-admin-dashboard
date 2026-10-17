import { useCallback, useMemo, type ReactNode } from 'react';
import { NotificationsContext } from './notifications-context-value';
import { useDataServices } from './data-services-context-value';
import { useServiceState } from '@/hooks/useServiceState';
import type { AppNotification, NotificationType } from '@/types';

/**
 * NotificationsProvider — holds the notification list in React state. What a
 * notification is, how many are kept and what "mark as read" means all live in
 * NotificationService; saving goes through its repository.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { notification: service } = useDataServices();
  const [notifications, update] = useServiceState<AppNotification[]>(() => service.getAll());

  const addNotification = useCallback(
    (input: Parameters<typeof service.add>[1]) => update(current => service.add(current, input)),
    [service, update],
  );
  const markAsRead = useCallback((id: string) => update(current => service.markAsRead(current, id)), [service, update]);
  const markAllAsRead = useCallback(() => update(current => service.markAllAsRead(current)), [service, update]);
  const clearAll = useCallback(() => update(() => service.clearAll()), [service, update]);
  const clearRead = useCallback(() => update(current => service.clearRead(current)), [service, update]);
  const removeNotification = useCallback((id: string) => update(current => service.remove(current, id)), [service, update]);

  /** Raises a low-stock notification — called when the app opens. */
  const notifyLowStock = useCallback(
    (productNames: string[]) => {
      const notice = service.lowStockNotice(productNames);
      if (notice) addNotification(notice);
    },
    [service, addNotification],
  );

  const unreadCount = useMemo(() => service.countUnread(notifications), [service, notifications]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      clearRead,
      removeNotification,
      notifyLowStock,
    }),
    [notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll, clearRead, removeNotification, notifyLowStock],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

/** Arabic label for each notification type — exported for the components. */
// eslint-disable-next-line react-refresh/only-export-components
export const notificationTypeLabel: Record<NotificationType, string> = {
  stock: 'مخزون',
  invoice: 'فاتورة',
  supplier: 'مورد',
  goal: 'هدف',
  shift: 'وردية',
  system: 'نظام',
};
