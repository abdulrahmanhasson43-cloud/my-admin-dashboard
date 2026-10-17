import type { AppNotification } from '@/types';
import type { INotificationRepository } from './INotificationRepository';

/** Most notifications kept (older ones are dropped). */
export const MAX_NOTIFICATIONS = 50;

export type NewNotification = Omit<AppNotification, 'id' | 'createdAt' | 'read'>;

/**
 * NotificationService — the rules of the notification centre.
 *
 * Every method takes the CURRENT list and returns the NEXT one (never mutating
 * the input), saving it through the repository. The React provider only holds
 * the list in state; it never decides what "mark as read" or "keep 50" mean.
 */
export class NotificationService {
  private readonly repository: INotificationRepository;

  constructor(repository: INotificationRepository) {
    this.repository = repository;
  }

  getAll(): AppNotification[] {
    return this.repository.load();
  }

  add(current: AppNotification[], input: NewNotification): AppNotification[] {
    const entry: AppNotification = {
      ...input,
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    return this.commit([entry, ...current].slice(0, MAX_NOTIFICATIONS));
  }

  markAsRead(current: AppNotification[], id: string): AppNotification[] {
    return this.commit(current.map(n => (n.id === id ? { ...n, read: true } : n)));
  }

  markAllAsRead(current: AppNotification[]): AppNotification[] {
    return this.commit(current.map(n => ({ ...n, read: true })));
  }

  clearAll(): AppNotification[] {
    return this.commit([]);
  }

  clearRead(current: AppNotification[]): AppNotification[] {
    return this.commit(current.filter(n => !n.read));
  }

  remove(current: AppNotification[], id: string): AppNotification[] {
    return this.commit(current.filter(n => n.id !== id));
  }

  countUnread(current: ReadonlyArray<AppNotification>): number {
    return current.filter(n => !n.read).length;
  }

  /** The notification to raise for low-stock products, or null when there are none. */
  lowStockNotice(productNames: string[]): NewNotification | null {
    if (productNames.length === 0) return null;
    const message =
      productNames.length === 1
        ? `منتج "${productNames[0]}" مخزونه منخفض`
        : `${productNames.length} منتجات مخزونها منخفض`;
    return { type: 'stock', title: 'تنبيه مخزون', message, link: '/inventory' };
  }

  private commit(next: AppNotification[]): AppNotification[] {
    this.repository.save(next);
    return next;
  }
}
