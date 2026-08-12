/**
 * components/analytics/PriceHistoryChart.tsx
 * ============================================================
 *  الفكرة #40 — Price History Chart (تاريخ السعر)
 *  رسم بياني خطي يعرض تغيّر سعر المنتج عبر الأشهر من كل مورد.
 *  يعرض الرؤى: أقل/أعلى سعر، المتوسط، نسبة التغيير، أرخص مورد.
 * ============================================================
 */

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { PriceHistoryPoint, PriceHistoryData, PriceInsight } from '@/types';
import { buildPriceHistory, filterPriceBySupplier, findCheapestSupplier } from '@/lib/analytics';
import {
  TrendingDownIcon,
  TrendingUpIcon,
  DollarSignIcon,
  SuppliersIcon,
  TagIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';

interface PriceHistoryChartProps {
  /** نقاط تاريخ السعر لمنتج */
  points: PriceHistoryPoint[];
  /** قائمة الموردين المتاحين */
  suppliers: string[];
  /** اسم المنتج (للعنوان) */
  productName?: string;
  title?: string;
}

function fmtEGP(n: number): string {
  return n.toLocaleString('en-US') + ' ج.م';
}

/** يحوّل تاريخ 2026-01-15 إلى نص شهر قصير */
function monthLabel(date: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  const months = ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'];
  return months[d.getMonth()] || '';
}

/** ألوان الموردين */
const SUPPLIER_COLORS = ['#1D1D1F', '#6B6B70', '#A1A1A6', '#D4D4D8', '#E4E4E7'];

export default function PriceHistoryChart({
  points,
  suppliers,
  productName,
  title = 'تاريخ السعر',
}: PriceHistoryChartProps) {
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>(suppliers);

  // بناء البيانات + الرؤى
  const { chartData, insight, cheapestSupplier } = useMemo(() => {
    const filtered = points.filter((p) => selectedSuppliers.includes(p.supplier));
    const historyData = buildPriceHistory(filtered);
    const cheapest = findCheapestSupplier(points);

    // تحويل البيانات لصيغة recharts (كل شهر = كائن بمفتاح لكل مورد)
    const byMonth = new Map<string, Record<string, number | string>>();
    for (const point of historyData.points) {
      const month = point.date.slice(0, 7);
      if (!byMonth.has(month)) {
        byMonth.set(month, { month: monthLabel(point.date) });
      }
      const entry = byMonth.get(month)!;
      entry[point.supplier] = point.price;
    }
    const sorted = Array.from(byMonth.values()).sort((a, b) => {
      return String(a.month).localeCompare(String(b.month));
    });

    return { chartData: sorted, insight: historyData.insight, cheapestSupplier: cheapest };
  }, [points, selectedSuppliers]);

  const toggleSupplier = (supplier: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(supplier) ? prev.filter((s) => s !== supplier) : [...prev, supplier],
    );
  };

  return (
    <div className="card-vuno p-5">
      {/* العنوان */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[var(--vuno-surface-pearl)] flex items-center justify-center">
          <TagIcon size={18} className="text-[var(--vuno-primary)]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--vuno-text)]">{title}</h3>
          <p className="text-[11px] text-[var(--vuno-text-muted)]">
            {productName ? `${productName} · ` : ''}تغيّر السعر عبر الأشهر
          </p>
        </div>
      </div>

      {/* الرؤى */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <InsightTile
          icon={<TrendingDownIcon size={13} className="text-emerald-600" />}
          label="أقل سعر"
          value={fmtEGP(insight.lowest.price)}
          sub={insight.lowest.supplier}
          color="bg-emerald-50"
        />
        <InsightTile
          icon={<TrendingUpIcon size={13} className="text-red-500" />}
          label="أعلى سعر"
          value={fmtEGP(insight.highest.price)}
          sub={insight.highest.supplier}
          color="bg-red-50"
        />
        <InsightTile
          icon={<DollarSignIcon size={13} className="text-blue-600" />}
          label="المتوسط"
          value={fmtEGP(insight.average)}
          sub="لجميع الموردين"
          color="bg-blue-50"
        />
        <InsightTile
          icon={
            <span className={cn(
              'text-[11px] font-bold',
              insight.changePercent > 0 ? 'text-red-500' : insight.changePercent < 0 ? 'text-emerald-600' : 'text-[var(--vuno-text-muted)]',
            )}>
              {insight.changePercent > 0 ? '+' : ''}{insight.changePercent}%
            </span>
          }
          label="نسبة التغيير"
          value={insight.changePercent > 0 ? 'ارتفاع' : insight.changePercent < 0 ? 'انخفاض' : 'ثابت'}
          sub="عبر الفترة"
          color={insight.changePercent > 0 ? 'bg-red-50' : insight.changePercent < 0 ? 'bg-emerald-50' : 'bg-gray-50'}
        />
      </div>

      {/* أرخص مورد */}
      {cheapestSupplier && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 mb-4">
          <SuppliersIcon size={16} className="text-emerald-600" />
          <span className="text-[11px] text-emerald-700">
            أرخص مورد حالياً: <strong>{cheapestSupplier.supplier}</strong> بسعر{' '}
            <strong className="tabular-nums">{fmtEGP(cheapestSupplier.price)}</strong>
          </span>
        </div>
      )}

      {/* فلاتر الموردين */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {suppliers.map((supplier, idx) => (
          <button
            key={supplier}
            onClick={() => toggleSupplier(supplier)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-colors',
              selectedSuppliers.includes(supplier)
                ? 'bg-white border-[var(--vuno-border)] text-[var(--vuno-text)]'
                : 'bg-[var(--vuno-surface-pearl)] border-transparent text-[var(--vuno-text-muted)]',
            )}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: SUPPLIER_COLORS[idx % SUPPLIER_COLORS.length] }}
            />
            {supplier}
          </button>
        ))}
      </div>

      {/* الرسم البياني */}
      <div className="w-full h-[280px]" dir="ltr">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--vuno-text-muted)] text-sm">
            لا توجد بيانات
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#A1A1A6' }}
                tickLine={false}
                axisLine={{ stroke: '#E0E0E0' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#A1A1A6' }}
                tickLine={false}
                axisLine={{ stroke: '#E0E0E0' }}
                tickFormatter={(v) => `${v}`}
                width={50}
              />
              <Tooltip
                content={<PriceTooltip />}
                cursor={{ stroke: '#E0E0E0', strokeWidth: 1 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                formatter={(value) => <span style={{ color: '#6E6E73' }}>{value}</span>}
              />
              {suppliers
                .filter((s) => selectedSuppliers.includes(s))
                .map((supplier) => (
                  <Line
                    key={supplier}
                    type="monotone"
                    dataKey={supplier}
                    stroke={SUPPLIER_COLORS[suppliers.indexOf(supplier) % SUPPLIER_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: SUPPLIER_COLORS[suppliers.indexOf(supplier) % SUPPLIER_COLORS.length] }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/** تلميح مخصص للرسم */
function PriceTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl bg-white border border-[var(--vuno-border)] px-3 py-2 shadow-md" dir="rtl">
      <p className="text-[11px] font-semibold text-[var(--vuno-text)] mb-1.5">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-[10px]">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[var(--vuno-text-secondary)] truncate">{entry.name}</span>
            <span className="font-bold text-[var(--vuno-text)] tabular-nums mr-auto">{fmtEGP(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** بطاقة رؤية صغيرة */
function InsightTile({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className={cn('rounded-xl p-2.5', color)}>
      <div className="flex items-center gap-1 mb-0.5">
        {icon}
        <span className="text-[10px] text-[var(--vuno-text-muted)]">{label}</span>
      </div>
      <p className="text-[13px] font-bold text-[var(--vuno-text)] tabular-nums truncate">{value}</p>
      <p className="text-[9px] text-[var(--vuno-text-muted)] truncate">{sub}</p>
    </div>
  );
}

export { buildPriceHistory, filterPriceBySupplier, findCheapestSupplier };
export type { PriceHistoryData, PriceInsight };
