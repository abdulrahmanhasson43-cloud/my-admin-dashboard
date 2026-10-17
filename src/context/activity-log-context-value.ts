import { createContext, useContext } from 'react';
import type { ActivityEntry } from '@/types';

export interface ActivityLogContextValue {
  activities: ActivityEntry[];
  /** تسجيل نشاط جديد */
  logActivity: (type: ActivityEntry['type'], description: string, amount?: number) => void;
  /** مسح كل السجل */
  clearActivities: () => void;
}

export const ActivityLogContext = createContext<ActivityLogContextValue | null>(null);

export function useActivityLog() {
  const ctx = useContext(ActivityLogContext);
  if (!ctx) {
    throw new Error('useActivityLog must be used within an ActivityLogProvider');
  }
  return ctx;
}
