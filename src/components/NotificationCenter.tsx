import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useNotifications } from '@/context/notifications-context-value';
import { notificationTypeLabel } from '@/context/NotificationsContext';
import {
  NotificationIcon, XIcon, CheckIcon, TrashIcon,
  AlertTriangleIcon, ReceiptIcon, SuppliersIcon, TargetIcon,
  ArchiveIcon, SettingsIcon,
} from '@/components/icons';
import type { NotificationType } from '@/types';

const typeIconMap: Record<NotificationType, React.FC<{ className?: string; size?: number }>> = {
  stock: AlertTriangleIcon,
  invoice: ReceiptIcon,
  supplier: SuppliersIcon,
  goal: TargetIcon,
  shift: ArchiveIcon,
  system: SettingsIcon,
};

const typeColorMap: Record<NotificationType, string> = {
  stock: 'var(--vuno-danger)',
  invoice: 'var(--vuno-primary)',
  supplier: 'var(--vuno-primary)',
  goal: 'var(--vuno-success)',
  shift: 'var(--vuno-warning)',
  system: 'var(--vuno-text-muted)',
};

type FilterTab = 'all' | 'unread' | 'stock' | 'invoice';

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'unread', label: 'غير مقروء' },
  { id: 'stock', label: 'مخزون' },
  { id: 'invoice', label: 'فواتير' },
];

export default function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, clearRead, removeNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Filtered notifications based on active tab (Idea #28)
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'stock') return n.type === 'stock';
    if (activeFilter === 'invoice') return n.type === 'invoice';
    return true;
  });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) {
      navigate(link);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="الإشعارات"
      >
        <NotificationIcon size={22} className="text-[var(--vuno-text-secondary)]" />
        {unreadCount > 0 && (
          <span
            className="absolute top-0.5 left-0.5 min-w-[16px] h-[16px] px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center border-2 border-[var(--vuno-surface)]"
            style={{ background: 'var(--vuno-danger)' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-12 z-50 w-[340px] max-w-[calc(100vw-2rem)] bg-[var(--vuno-surface)] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-[var(--vuno-border)] overflow-hidden"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--vuno-border)]">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[15px] text-[var(--vuno-text)]">الإشعارات</h3>
                {unreadCount > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: 'var(--vuno-danger)' }}
                  >
                    {unreadCount} جديد
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--vuno-bg)] transition-colors"
              >
                <XIcon size={16} className="text-[var(--vuno-text-muted)]" />
              </button>
            </div>

            {/* Actions bar */}
            {notifications.length > 0 && (
              <div className="flex items-center gap-1 px-4 py-2 border-b border-[var(--vuno-border-light)] bg-[var(--vuno-surface-pearl)]">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[11px] font-medium text-[var(--vuno-primary)] hover:opacity-70 transition-opacity px-2 py-1 rounded-lg"
                  >
                    <CheckIcon size={12} />
                    تعليم الكل كمقروء
                  </button>
                )}
                <button
                  onClick={clearRead}
                  className="text-[11px] font-medium text-[var(--vuno-text-muted)] hover:text-[var(--vuno-text)] transition-colors px-2 py-1 rounded-lg"
                >
                  مسح المقروء
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-[11px] font-medium text-[var(--vuno-danger)] hover:opacity-70 transition-opacity px-2 py-1 rounded-lg mr-auto"
                >
                  <TrashIcon size={12} />
                  مسح الكل
                </button>
              </div>
            )}

            {/* Filter tabs (Idea #28) */}
            {notifications.length > 0 && (
              <div className="flex items-center gap-1 px-4 py-2 border-b border-[var(--vuno-border-light)] bg-[var(--vuno-surface)] overflow-x-auto">
                {filterTabs.map((tab) => {
                  const count =
                    tab.id === 'all'
                      ? notifications.length
                      : tab.id === 'unread'
                        ? unreadCount
                        : notifications.filter((n) => n.type === tab.id).length;
                  const isActive = activeFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'text-white'
                          : 'text-[var(--vuno-text-muted)] hover:text-[var(--vuno-text)] hover:bg-[var(--vuno-bg)]'
                      }`}
                      style={isActive ? { background: 'var(--vuno-primary)' } : undefined}
                    >
                      {tab.label}
                      {count > 0 && (
                        <span
                          className={`text-[9px] font-bold px-1 py-0.5 rounded-full ${
                            isActive ? 'bg-white/20' : 'bg-[var(--vuno-bg)]'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Notifications list */}
            <div className="max-h-[300px] overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: 'color-mix(in srgb, var(--vuno-primary) 6%, transparent)' }}
                  >
                    <NotificationIcon size={24} className="text-[var(--vuno-text-muted)]" />
                  </div>
                  <p className="text-[14px] font-medium text-[var(--vuno-text-secondary)]">
                    {activeFilter === 'all' ? 'لا توجد إشعارات' : 'لا توجد إشعارات في هذا التصنيف'}
                  </p>
                  <p className="text-[12px] text-[var(--vuno-text-muted)] mt-1">
                    {activeFilter === 'all' ? 'ستظهر التنبيهات الجديدة هنا' : 'جرّب تصنيفًا آخر'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((n) => {
                  const Icon = typeIconMap[n.type];
                  const color = typeColorMap[n.type];
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleClick(n.id, n.link)}
                      className={`relative flex items-start gap-3 px-4 py-3 border-b border-[var(--vuno-border-light)] last:border-0 cursor-pointer hover:bg-[var(--vuno-surface-pearl)] transition-colors group ${!n.read ? 'bg-[color-mix(in_srgb,var(--vuno-primary)_3%,transparent)]' : ''}`}
                    >
                      {/* Unread indicator */}
                      {!n.read && (
                        <span
                          className="absolute top-4 right-1.5 w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: 'var(--vuno-primary)' }}
                        />
                      )}

                      {/* Icon */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
                      >
                        <Icon size={16} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`text-[13px] text-[var(--vuno-text)] truncate ${!n.read ? 'font-semibold' : 'font-medium'}`}>
                            {n.title}
                          </p>
                        </div>
                        <p className="text-[12px] text-[var(--vuno-text-secondary)] line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-[var(--vuno-text-muted)]">
                            {notificationTypeLabel[n.type]}
                          </span>
                          <span className="text-[10px] text-[var(--vuno-text-muted)]">·</span>
                          <span className="text-[10px] text-[var(--vuno-text-muted)]">{n.createdAt}</span>
                        </div>
                      </div>

                      {/* Delete button (appears on hover) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(n.id);
                        }}
                        className="p-1.5 rounded-lg text-[var(--vuno-text-muted)] hover:text-[var(--vuno-danger)] hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                        aria-label="حذف"
                      >
                        <XIcon size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
