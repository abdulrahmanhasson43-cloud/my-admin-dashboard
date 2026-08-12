import { useState, useCallback, useMemo, type ReactNode } from 'react';
import { NotificationsContext } from './notifications-context-value';
import type { AppNotification, NotificationType } from '@/types';

// TODO(phase-3): persist notifications to Firestore/Supabase per-merchant.
// For now they live in React state (with localStorage persistence) so the
// notification center stays populated across page navigations.
const STORAGE_KEY = 'vuno-notifications';

function loadStored(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedNotifications();
    const parsed = JSON.parse(raw) as AppNotification[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedNotifications();
  } catch {
    return seedNotifications();
  }
}

/** تنبيهات أولية للعرض التوضيحي */
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
      message: 'وصلت إلى 72% من هدف المبيعات الشهري 🎉',
      createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      link: '/dashboard',
    },
  ];
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(loadStored);

  // Persist to localStorage whenever notifications change
  const persist = useCallback((next: AppNotification[]) => {
    setNotifications(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 50)));
    } catch {
      /* ignore quota errors */
    }
  }, []);

  const addNotification = useCallback(
    (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
      const entry: AppNotification = {
        ...notification,
        id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => {
        const next = [entry, ...prev].slice(0, 50);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const markAsRead = useCallback((id: string) => {
    persist(
      // use functional update against the latest state
      // (persist uses setNotifications internally)
      [],
    );
    setNotifications(prev => {
      const next = prev.map(n => (n.id === id ? { ...n, read: true } : n));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      persist(next);
      return next;
    });
  }, [persist]);

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  const clearRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.filter(n => !n.read);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  /** توليد تنبيه مخزون منخفض — يُستدعى عند فتح التطبيق */
  const notifyLowStock = useCallback(
    (productNames: string[]) => {
      if (productNames.length === 0) return;
      const message =
        productNames.length === 1
          ? `منتج "${productNames[0]}" مخزونه منخفض`
          : `${productNames.length} منتجات مخزونها منخفض`;
      addNotification({
        type: 'stock',
        title: 'تنبيه مخزون',
        message,
        link: '/inventory',
      });
    },
    [addNotification],
  );

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications],
  );

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        clearRead,
        removeNotification,
        notifyLowStock,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

/** أيقونة لكل نوع تنبيه — يُصدَّر للاستخدام في المكونات */
// eslint-disable-next-line react-refresh/only-export-components
export const notificationTypeLabel: Record<NotificationType, string> = {
  stock: 'مخزون',
  invoice: 'فاتورة',
  supplier: 'مورد',
  goal: 'هدف',
  shift: 'وردية',
  system: 'نظام',
};
