/**
 * components/analytics/ActivityFeed.tsx
 * ============================================================
 *  الفكرة #34 — Live Activity Feed (تغذية الأنشطة الحية)
 *  عرض مباشر لآخر الأنشطة في النظام: مبيعات، منتجات، مخزون، إلخ.
 *  يستقبل الأنشطة من ActivityLogContext أو كـ prop مباشر.
 * ============================================================
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ActivityEntry } from '@/types';
import {
  ReceiptIcon,
  PackageIcon,
  InventoryIcon,
  SuppliersIcon,
  ShiftManagementIcon,
  SettingsIcon,
  ActivityIcon,
  ClockIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  /** قائمة الأنشطة (إذا لم تُمرر، يُستخدم ActivityLogContext) */
  activities?: ActivityEntry[];
  /** عدد الأنشطة المعروضة (افتراضي 10) */
  maxItems?: number;
  /** عنوان اختياري */
  title?: string;
  /** عرض في وضع مضغوط (للداشبورد) */
  compact?: boolean;
}

/** أيقونة ونوع لكل نوع نشاط */
const typeMeta: Record<
  ActivityEntry['type'],
  { icon: React.FC<{ className?: string; size?: number }>; color: string; bg: string; label: string }
> = {
  sale: { icon: ReceiptIcon, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'بيع' },
  product: { icon: PackageIcon, color: 'text-blue-600', bg: 'bg-blue-50', label: 'منتج' },
  stock: { icon: InventoryIcon, color: 'text-amber-600', bg: 'bg-amber-50', label: 'مخزون' },
  supplier: { icon: SuppliersIcon, color: 'text-purple-600', bg: 'bg-purple-50', label: 'مورد' },
  shift: { icon: ShiftManagementIcon, color: 'text-cyan-600', bg: 'bg-cyan-50', label: 'وردية' },
  settings: { icon: SettingsIcon, color: 'text-gray-600', bg: 'bg-gray-100', label: 'إعدادات' },
};

function fmtEGP(n: number): string {
  return n.toLocaleString('en-US') + ' ج.م';
}

/** يحسب "منذ كم" من نص timestamp */
function timeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} يوم`;
  return date.toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'short' });
}

export default function ActivityFeed({
  activities = [],
  maxItems = 10,
  title = 'الأنشطة الحية',
  compact = false,
}: ActivityFeedProps) {
  const [filter, setFilter] = useState<ActivityEntry['type'] | 'all'>('all');
  // تحديث دوري لإظهار "منذ كم" بشكل حي
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === 'all' ? activities : activities.filter((a) => a.type === filter);
  const displayed = filtered.slice(0, maxItems);

  // أنواع متاحة للتصفية
  const availableTypes = Array.from(new Set(activities.map((a) => a.type)));

  return (
    <div className={cn(compact ? 'p-1' : 'p-1')}>
      {/* العنوان + مؤشر حي */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[var(--vuno-surface-pearl)] flex items-center justify-center relative">
            <ActivityIcon size={18} className="text-[var(--vuno-primary)]" />
            {/* نقطة حية */}
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--vuno-text)]">{title}</h3>
            <p className="text-[11px] text-[var(--vuno-text-muted)]">آخر {maxItems} نشاط</p>
          </div>
        </div>
        <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          مباشر
        </span>
      </div>

      {/* فلاتر النوع */}
      {!compact && availableTypes.length > 1 && (
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="الكل" />
          {availableTypes.map((t) => (
            <FilterChip
              key={t}
              active={filter === t}
              onClick={() => setFilter(t)}
              label={typeMeta[t]?.label || t}
            />
          ))}
        </div>
      )}

      {/* قائمة الأنشطة */}
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {displayed.length === 0 ? (
            <div className="text-center py-8 text-[var(--vuno-text-muted)]">
              <ClockIcon size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs">لا توجد أنشطة بعد</p>
            </div>
          ) : (
            displayed.map((activity, idx) => {
              const meta = typeMeta[activity.type] || typeMeta.settings;
              const Icon = activity.icon || meta.icon;
              return (
                <motion.div
                  key={activity.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.15) }}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--vuno-surface-pearl)] transition-colors"
                >
                  {/* الأيقونة */}
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', meta.bg)}>
                    <Icon size={15} className={meta.color} />
                  </div>

                  {/* المحتوى */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[var(--vuno-text)] leading-relaxed">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded', meta.bg, meta.color)}>
                        {meta.label}
                      </span>
                      {activity.amount && (
                        <span className="text-[10px] font-bold text-emerald-600 tabular-nums">
                          {fmtEGP(activity.amount)}
                        </span>
                      )}
                      <span className="text-[10px] text-[var(--vuno-text-muted)]">
                        {timeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** شريحة فلتر */
function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors',
        active
          ? 'bg-[var(--vuno-primary)] text-white'
          : 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-text-muted)] hover:bg-[var(--vuno-border-light)]',
      )}
    >
      {label}
    </button>
  );
}
