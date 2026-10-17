import { motion } from 'framer-motion';
import type { ComponentType } from 'react';

interface StatItem {
  label: string;
  value: string | number;
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string; // e.g. 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]'
}

interface StatsRowProps {
  items: StatItem[];
  /**
   * الحد الأقصى لعدد الأعمدة على الشاشات الكبيرة. افتراضياً يأخذ عدد العناصر (بحد أقصى 4).
   */
  maxCols?: number;
  /**
   * 'card' (default) — boxed white cards, unchanged existing look.
   * 'flat' — no box/border, sits directly on the page background with a
   * hairline divider between items instead. Used on pages that shouldn't
   * feel like "cards on a background".
   */
  variant?: 'card' | 'flat';
}

/**
 * صف إحصائي أفقي موحّد.
 * يعمل على عرض البطاقات بجانب بعضها (أفقياً) بدلاً من ترتيبها عمودياً،
 * مع التفاف نظيف على الشاشات الصغيرة جدًّا (أقل من 480px).
 * يحلّ مشكلة "البطاقات مرتبة تحت بعضها" الموجودة في عدة صفحات.
 */
export default function StatsRow({ items, maxCols, variant = 'card' }: StatsRowProps) {
  // حد أقصى للأعمدة بناءً على عدد العناصر أو القيمة الممرّرة
  const cap = Math.min(maxCols ?? items.length, 4);

  if (variant === 'flat') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
        {items.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.06, 0.24) }}
              className="flex items-center gap-2.5 min-w-0"
            >
              <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[var(--vuno-text-muted)] truncate">{stat.label}</p>
                <p className="text-[15px] font-bold text-[var(--vuno-text)] tabular-nums truncate">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="grid gap-3"
      style={{
        // auto-fit مع حد أدنى يضمن بقاء البطاقات بجانب بعضها أفقيًّا،
        // والحد الأقصى (cap) يمنع تمددها أكثر من اللازم على الشاشات الكبيرة.
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${Math.floor(100 / cap) - 1}%), 1fr))`,
      }}
    >
      {items.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.08, 0.3) }}
            className="card-vuno p-4 min-w-0"
          >
            <div
              className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3 flex-shrink-0`}
            >
              <Icon size={18} />
            </div>
            <p className="text-xs text-[var(--vuno-text-muted)] mb-1 truncate">
              {stat.label}
            </p>
            <p className="text-xl font-bold text-[var(--vuno-text)] truncate">
              {stat.value}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
