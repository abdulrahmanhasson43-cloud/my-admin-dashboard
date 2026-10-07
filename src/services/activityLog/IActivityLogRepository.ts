import type { ActivityEntry } from '@/types';

/**
 * IActivityLogRepository — the port ActivityLogService depends on.
 * Synchronous for the same reason as INotificationRepository: it is a small
 * per-device list read once at start-up.
 */
export interface IActivityLogRepository {
  /** What the activity page shows on start-up. */
  load(): ActivityEntry[];
  /** Replaces the stored log. */
  save(entries: ActivityEntry[]): void;
}
