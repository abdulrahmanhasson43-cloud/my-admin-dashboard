/**
 * components/analytics/SalesHeatmap.tsx
 * ============================================================
 *  الفكرة #31 — Sales Heatmap (الخريطة الحرارية للمبيعات)
 *  شبكة أيام الأسبوع × ساعات اليوم، كل خلية ملوّنة حسب كثافة المبيعات.
 *  تعرض الرؤى (الذروة + الأضعف + الإجماليات) بشكل ملخص.
 * ============================================================
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DAYS_AR,
  HOURS_RANGE,
  type HeatmapCell,
  type HeatmapData,
} from '@/types';
import {
  ZapIcon,
  ClockIcon,
  ReceiptIcon,
  TrendingUpIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';

interface SalesHeatmapProps {
  /** بيانات الخريطة الحرارية (cells + insights) */
  data: HeatmapData;
  /** عنوان اختياري للقسم */
  title?: string;
}

/** يحوّل قيمة الكثافة إلى لون خلفية (من شفاف إلى داكن) */
function heatColor(count: number, max: number): string {
  if (count === 0 || max === 0) return 'bg-[var(--vuno-surface-pearl)]';
  const ratio = count / max;
  if (ratio >= 0.8) return 'bg-[var(--vuno-primary)] text-white';
  if (ratio >= 0.6) return 'bg-[var(--vuno-primary-light)] text-white';
  if (ratio >= 0.4) return 'bg-[var(--vuno-text-muted)] text-white';
  if (ratio >= 0.2) return 'bg-[var(--vuno-border)] text-[var(--vuno-text)]';
  return 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-text-muted)]';
}

/** ينسّق رقم بالجنيه المصري */
function fmtEGP(n: number): string {
  return n.toLocaleString('en-US') + ' ج.م';
}

export default function SalesHeatmap({ data, title = 'الخريطة الحرارية للمبيعات' }: SalesHeatmapProps) {
  const [hovered, setHovered] = useState<HeatmapCell | null>(null);
  const { cells, insights } = data;

  // أعلى قيمة لمعايرة الألوان
  const maxCount = useMemo(() => {
    let max = 0;
    for (const row of cells) for (const cell of row) if (cell.count > max) max = cell.count;
    return max || 1;
  }, [cells]);

  return (
    <div className="p-1">
      {/* العنوان */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[var(--vuno-surface-pearl)] flex items-center justify-center">
            <ZapIcon size={18} className="text-[var(--vuno-primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--vuno-text)]">{title}</h3>
            <p className="text-[11px] text-[var(--vuno-text-muted)]">أوقات الذروة وأضعف الأوقات</p>
          </div>
        </div>
      </div>

      {/* الرؤى المختصرة */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <InsightChip
          icon={<ClockIcon size={14} />}
          label="أقوى وقت"
          value={`${DAYS_AR[insights.peak.day]} ${insights.peak.hour}:00`}
          color="bg-emerald-50 text-emerald-700"
        />
        <InsightChip
          icon={<ReceiptIcon size={14} />}
          label="إجمالي الفواتير"
          value={String(insights.totalInvoices)}
          color="bg-blue-50 text-blue-700"
        />
        <InsightChip
          icon={<TrendingUpIcon size={14} />}
          label="إجمالي الإيرادات"
          value={fmtEGP(insights.totalRevenue)}
          color="bg-purple-50 text-purple-700"
        />
      </div>

      {/* الشبكة الحرارية */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="min-w-[480px]">
          {/* رؤوس الأعمدة (الساعات) */}
          <div className="flex gap-1 mb-1" dir="rtl">
            <div className="w-16 flex-shrink-0" />
            {HOURS_RANGE.map((h) => (
              <div
                key={h}
                className="flex-1 text-center text-[10px] text-[var(--vuno-text-muted)] tabular-nums"
              >
                {h}
              </div>
            ))}
          </div>

          {/* الصفوف (الأيام) */}
          {cells.map((row, dayIdx) => (
            <div key={dayIdx} className="flex gap-1 mb-1 items-center" dir="rtl">
              <div className="w-16 flex-shrink-0 text-[11px] font-medium text-[var(--vuno-text-secondary)] truncate">
                {DAYS_AR[dayIdx]}
              </div>
              {row.map((cell) => (
                <motion.div
                  key={`${cell.day}-${cell.hour}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min((dayIdx * 15 + cell.hour) * 0.002, 0.4) }}
                  onMouseEnter={() => setHovered(cell)}
                  onMouseLeave={() => setHovered(null)}
                  className={cn(
                    'flex-1 aspect-square rounded-md flex items-center justify-center cursor-pointer transition-transform hover:scale-110 hover:z-10 relative',
                    heatColor(cell.count, maxCount),
                  )}
                  style={{ minHeight: 24 }}
                >
                  {cell.count > 0 && (
                    <span className="text-[10px] font-bold tabular-nums">{cell.count}</span>
                  )}
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* مفتاح الألوان + التلميح */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--vuno-border-light)]">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[var(--vuno-text-muted)]">أقل</span>
          <div className="flex gap-0.5">
            {['bg-[var(--vuno-surface-pearl)]', 'bg-[var(--vuno-border)]', 'bg-[var(--vuno-text-muted)]', 'bg-[var(--vuno-primary-light)]', 'bg-[var(--vuno-primary)]'].map((c, i) => (
              <div key={i} className={cn('w-3 h-3 rounded-sm', c)} />
            ))}
          </div>
          <span className="text-[10px] text-[var(--vuno-text-muted)]">أكثر</span>
        </div>
        {hovered && hovered.count > 0 ? (
          <div className="text-[11px] text-[var(--vuno-text-secondary)]">
            {DAYS_AR[hovered.day]} {hovered.hour}:00 — {hovered.count} فاتورة ({fmtEGP(hovered.revenue)})
          </div>
        ) : (
          <div className="text-[10px] text-[var(--vuno-text-muted)]">مرّر فوق خلية لرؤية التفاصيل</div>
        )}
      </div>
    </div>
  );
}

/** بطاقة رؤية صغيرة */
function InsightChip({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={cn('rounded-xl px-2.5 py-2', color)}>
      <div className="flex items-center gap-1 mb-0.5">
        {icon}
        <span className="text-[10px] font-medium opacity-80">{label}</span>
      </div>
      <p className="text-[12px] font-bold tabular-nums truncate">{value}</p>
    </div>
  );
}
