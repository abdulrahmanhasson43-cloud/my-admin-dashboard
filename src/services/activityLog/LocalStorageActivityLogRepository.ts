import type { ActivityEntry } from '@/types';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { readJson, writeJson } from '@/lib/storage';
import type { IActivityLogRepository } from './IActivityLogRepository';

/** A few example entries so the page isn't empty on first load. */
function seedEntries(): ActivityEntry[] {
  const now = Date.now();
  return [
    {
      id: 'seed-1',
      type: 'sale',
      description: 'تم إتمام فاتورة بقيمة 2,450 EGP',
      amount: 2450,
      timestamp: new Date(now - 3600000).toLocaleString('ar-EG'),
    },
    {
      id: 'seed-2',
      type: 'product',
      description: 'تمت إضافة منتج جديد: سماعة بلوتوث',
      timestamp: new Date(now - 7200000).toLocaleString('ar-EG'),
    },
    {
      id: 'seed-3',
      type: 'stock',
      description: 'تنبيه: مخزون منخفض لشاحن سريع',
      timestamp: new Date(now - 10800000).toLocaleString('ar-EG'),
    },
  ];
}

/**
 * LocalStorageActivityLogRepository — keeps the log in the browser. Nothing
 * saved yet means the demo seed; a saved EMPTY log stays empty (so "clear"
 * is respected after a reload).
 *
 * TODO(phase-3): replace with a backend adapter in data-services-context.tsx.
 */
export class LocalStorageActivityLogRepository implements IActivityLogRepository {
  load(): ActivityEntry[] {
    return readJson<ActivityEntry[] | null>(STORAGE_KEYS.activityLog, null) ?? seedEntries();
  }

  save(entries: ActivityEntry[]): void {
    writeJson(STORAGE_KEYS.activityLog, entries);
  }
}
