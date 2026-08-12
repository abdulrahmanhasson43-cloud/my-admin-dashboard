import { useState, useCallback, useMemo, type ReactNode } from 'react';
import { ActivityLogContext } from '@/context/activity-log-context-value';
import type { ActivityEntry } from '@/types';

const STORAGE_KEY = 'vuno_activity_log';
const MAX_ENTRIES = 200;

function loadActivities(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ActivityEntry[];
  } catch {
    // ignore
  }
  // Seed with a few example entries so the page isn't empty on first load
  return [
    {
      id: 'seed-1',
      type: 'sale',
      description: 'تم إتمام فاتورة بقيمة 2,450 EGP',
      amount: 2450,
      timestamp: new Date(Date.now() - 3600000).toLocaleString('ar-EG'),
    },
    {
      id: 'seed-2',
      type: 'product',
      description: 'تمت إضافة منتج جديد: سماعة بلوتوث',
      timestamp: new Date(Date.now() - 7200000).toLocaleString('ar-EG'),
    },
    {
      id: 'seed-3',
      type: 'stock',
      description: 'تنبيه: مخزون منخفض لشاحن سريع',
      timestamp: new Date(Date.now() - 10800000).toLocaleString('ar-EG'),
    },
  ];
}

export function ActivityLogProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<ActivityEntry[]>(loadActivities);

  const persist = useCallback((entries: ActivityEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
    } catch {
      // ignore
    }
  }, []);

  const logActivity = useCallback((
    type: ActivityEntry['type'],
    description: string,
    amount?: number,
  ) => {
    const entry: ActivityEntry = {
      id: 'ACT-' + Date.now().toString().slice(-6) + Math.random().toString(36).slice(2, 6),
      type,
      description,
      amount,
      timestamp: new Date().toLocaleString('ar-EG'),
    };
    setActivities(prev => {
      const next = [entry, ...prev].slice(0, MAX_ENTRIES);
      persist(next);
      return next;
    });
  }, [persist]);

  const clearActivities = useCallback(() => {
    setActivities([]);
    persist([]);
  }, [persist]);

  const value = useMemo(() => ({
    activities,
    logActivity,
    clearActivities,
  }), [activities, logActivity, clearActivities]);

  return (
    <ActivityLogContext.Provider value={value}>
      {children}
    </ActivityLogContext.Provider>
  );
}
