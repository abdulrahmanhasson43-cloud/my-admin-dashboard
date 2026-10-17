import type { AppNotification } from '@/types';

/**
 * INotificationRepository — the port NotificationService depends on.
 *
 * Synchronous on purpose: the notification centre is a small, per-device list
 * that React reads once when the app starts. A remote backend would turn this
 * into an async port (and the provider into a loading state) — that is a
 * deliberate, visible change, not something hidden behind this interface.
 */
export interface INotificationRepository {
  /** What the notification centre shows on start-up. */
  load(): AppNotification[];
  /** Replaces the stored list. */
  save(notifications: AppNotification[]): void;
}
