import { createContext, useContext } from 'react';
import type { AppNotification, NotificationType } from '@/types';

export interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  /** إضافة تنبيه جديد */
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  /** وضع علامة مقروء على تنبيه */
  markAsRead: (id: string) => void;
  /** وضع علامة مقروء على كل التنبيهات */
  markAllAsRead: () => void;
  /** مسح كل التنبيهات */
  clearAll: () => void;
  /** مسح التنبيهات المقروءة فقط */
  clearRead: () => void;
  /** حذف تنبيه واحد */
  removeNotification: (id: string) => void;
  /** توليد تنبيهات المخزون المنخفض تلقائيًا */
  notifyLowStock: (productNames: string[]) => void;
}

export const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return ctx;
}

/** مساعد لإنشاء تنبيه بنوع محدد — يُستخدم خارج المكونات */
export function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
): Omit<AppNotification, 'id' | 'createdAt' | 'read'> {
  return { type, title, message, link };
}
