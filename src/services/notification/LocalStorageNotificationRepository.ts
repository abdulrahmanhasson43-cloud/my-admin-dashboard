import type { AppNotification } from '@/types';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { readJson, writeJson } from '@/lib/storage';
import type { INotificationRepository } from './INotificationRepository';

/** Demo notifications shown until the merchant has real ones. */
function seedNotifications(): AppNotification[] {
  const now = Date.now();
  return [
    {
      id: 'seed-1',
      type: 'stock',
      title: 'تنبيه مخزون',
      message: 'منتج "شاحن سريع 65W" مخزونه وصل لـ 8 قطع',
      createdAt: new Date(now - 5 * 60 * 1000).toISOString(),
      read: false,
      link: '/inventory',
    },
    {
      id: 'seed-2',
      type: 'invoice',
      title: 'فاتورة مستحقة',
      message: 'فاتورة #INV-2025-003 مستحقة الدفع',
      createdAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      read: false,
      link: '/invoices',
    },
    {
      id: 'seed-3',
      type: 'goal',
      title: 'هدف المبيعات',
      message: 'وصلت إلى 72% من هدف المبيعات الشهري',
      createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      link: '/dashboard',
    },
  ];
}

/**
 * LocalStorageNotificationRepository — keeps notifications in the browser.
 *
 * Same behaviour the provider had before: an empty or missing list falls back
 * to the demo seed.
 *
 * TODO(phase-3): replace with a per-merchant backend adapter. Swap it in one
 * place — src/context/data-services-context.tsx.
 */
export class LocalStorageNotificationRepository implements INotificationRepository {
  load(): AppNotification[] {
    const stored = readJson<AppNotification[] | null>(STORAGE_KEYS.notifications, null);
    return Array.isArray(stored) && stored.length > 0 ? stored : seedNotifications();
  }

  save(notifications: AppNotification[]): void {
    writeJson(STORAGE_KEYS.notifications, notifications);
  }
}
