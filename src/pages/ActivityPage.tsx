import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useActivityLog } from '@/context/activity-log-context-value';
import {
  ActivityIcon, ReceiptIcon, ProductsIcon, InventoryIcon,
  SuppliersIcon, ArchiveIcon, SettingsIcon, TrashIcon,
} from '@/components/icons';
import type { ActivityEntry } from '@/types';

const typeIconMap: Record<ActivityEntry['type'], React.FC<{ className?: string; size?: number }>> = {
  sale: ReceiptIcon,
  product: ProductsIcon,
  stock: InventoryIcon,
  supplier: SuppliersIcon,
  shift: ArchiveIcon,
  settings: SettingsIcon,
};

const typeColorMap: Record<ActivityEntry['type'], string> = {
  sale: 'var(--vuno-success)',
  product: 'var(--vuno-primary)',
  stock: 'var(--vuno-warning)',
  supplier: 'var(--vuno-primary)',
  shift: 'var(--vuno-warning)',
  settings: 'var(--vuno-text-muted)',
};

const typeLabelMap: Record<ActivityEntry['type'], string> = {
  sale: 'مبيعة',
  product: 'منتج',
  stock: 'مخزون',
  supplier: 'مورد',
  shift: 'وردية',
  settings: 'إعدادات',
};

export default function ActivityPage() {
  const { activities, clearActivities } = useActivityLog();

  const handleClear = () => {
    if (window.confirm('هل أنت متأكد من مسح سجل النشاطات بالكامل؟')) {
      clearActivities();
      toast.success('تم مسح سجل النشاطات');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)' }}
          >
            <ActivityIcon size={24} className="text-[var(--vuno-primary)]" />
          </div>
          <div>
            <h2 className="font-bold text-[18px] text-[var(--vuno-text)]">سجل النشاطات</h2>
            <p className="text-[13px] text-[var(--vuno-text-muted)]">{activities.length} نشاط مسجل</p>
          </div>
        </div>
        {activities.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-medium text-[var(--vuno-danger)] border border-red-200 hover:bg-red-50 transition-colors"
          >
            <TrashIcon size={14} />
            مسح السجل
          </button>
        )}
      </div>

      {/* Activity Timeline */}
      {activities.length === 0 ? (
        <div className="card-vuno p-12 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'color-mix(in srgb, var(--vuno-primary) 6%, transparent)' }}
          >
            <ActivityIcon size={28} className="text-[var(--vuno-text-muted)]" />
          </div>
          <p className="text-[15px] font-medium text-[var(--vuno-text-secondary)] mb-1">لا توجد نشاطات مسجلة</p>
          <p className="text-[13px] text-[var(--vuno-text-muted)]">ستظهر هنا كل العمليات التي تقوم بها في النظام</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute right-5 top-2 bottom-2 w-0.5"
            style={{ background: 'var(--vuno-border)' }}
          />
          <div className="space-y-3">
            {activities.map((activity, i) => {
              const Icon = typeIconMap[activity.type];
              const color = typeColorMap[activity.type];
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="relative flex items-start gap-4 pr-2"
                >
                  {/* Timeline dot */}
                  <div
                    className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-[var(--vuno-bg)]"
                    style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
                  >
                    <Icon size={16} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 card-vuno p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
                      >
                        {typeLabelMap[activity.type]}
                      </span>
                      <span className="text-[10px] text-[var(--vuno-text-muted)]">{activity.timestamp}</span>
                    </div>
                    <p className="text-[14px] text-[var(--vuno-text)] leading-relaxed">{activity.description}</p>
                    {activity.amount !== undefined && activity.amount > 0 && (
                      <p className="text-[13px] font-semibold text-[var(--vuno-primary)] mt-1 tabular-nums">
                        {activity.amount.toLocaleString()} EGP
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
