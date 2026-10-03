/**
 * components/analytics/PeriodComparison.tsx
 * ============================================================
 *  الفكرة #33 — Compare Periods (مقارنة الفترات)
 *  مقارنة فترتين زمنيتين: المبيعات، الفواتير، الربح، المصروفات.
 *  عرض الفروقات مع نسب التغيير + المنتجات التي زادت/انخفضت مبيعاتها.
 * ============================================================
 */

import { useState, useMemo } from 'react';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  ReceiptIcon,
  DollarSignIcon,
  ExpenseIcon,
  CalendarIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';
import type { CompareResult, PeriodMetrics, PerformerProduct } from '@/types';
import { comparePeriods } from '@/lib/analytics';

interface PeriodComparisonProps {
  /** الفترات المتاحة للاختيار */
  availablePeriods: string[];
  /** بيانات الفترات (مفتاح = رمز الفترة) */
  periodData: Record<string, PeriodMetrics>;
  /** أداء المنتجات لكل فترة (اخياري) */
  productsByPeriod?: Record<string, PerformerProduct[]>;
  title?: string;
}

function fmtEGP(n: number): string {
  return n.toLocaleString('en-US') + ' ج.م';
}

/** يحوّل رمز الفترة (2026-07) إلى نص عربي مقروء */
function periodLabel(period: string): string {
  const [year, month] = period.split('-');
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const m = parseInt(month, 10);
  return `${months[m - 1] || month} ${year}`;
}

export default function PeriodComparison({
  availablePeriods,
  periodData,
  productsByPeriod,
  title = 'مقارنة الفترات',
}: PeriodComparisonProps) {
  // اختيار الفترتين: الحالية = الأحدث، السابقة = التي قبلها
  const [currentKey, setCurrentKey] = useState(availablePeriods[0] || '');
  const [previousKey, setPreviousKey] = useState(availablePeriods[1] || '');

  const result: CompareResult | null = useMemo(() => {
    const current = periodData[currentKey];
    const previous = periodData[previousKey];
    if (!current || !previous) return null;
    const currentProducts = productsByPeriod?.[currentKey] ?? [];
    const previousProducts = productsByPeriod?.[previousKey] ?? [];
    return comparePeriods(current, previous, currentProducts, previousProducts);
  }, [currentKey, previousKey, periodData, productsByPeriod]);

  if (!result) {
    return (
      <div className="card-vuno p-5 text-center text-sm text-[var(--vuno-text-muted)]">
        اختر فترتين للمقارنة
      </div>
    );
  }

  return (
    <div className="card-vuno p-5">
      {/* العنوان */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[var(--vuno-surface-pearl)] flex items-center justify-center">
          <CalendarIcon size={18} className="text-[var(--vuno-primary)]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--vuno-text)]">{title}</h3>
          <p className="text-[11px] text-[var(--vuno-text-muted)]">قارن بين فترتين زمنيتين</p>
        </div>
      </div>

      {/* اختيار الفترات */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="text-[10px] text-[var(--vuno-text-muted)] mb-1 block">الفترة الحالية</label>
          <select
            value={currentKey}
            onChange={(e) => setCurrentKey(e.target.value)}
            className="w-full rounded-lg border border-[var(--vuno-border)] bg-white px-3 py-2 text-xs font-medium text-[var(--vuno-text)] focus:outline-none focus:ring-1 focus:ring-[var(--vuno-primary)]"
          >
            {availablePeriods.map((p) => (
              <option key={p} value={p}>{periodLabel(p)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-[var(--vuno-text-muted)] mb-1 block">الفترة السابقة</label>
          <select
            value={previousKey}
            onChange={(e) => setPreviousKey(e.target.value)}
            className="w-full rounded-lg border border-[var(--vuno-border)] bg-white px-3 py-2 text-xs font-medium text-[var(--vuno-text)] focus:outline-none focus:ring-1 focus:ring-[var(--vuno-primary)]"
          >
            {availablePeriods.map((p) => (
              <option key={p} value={p}>{periodLabel(p)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* مقارنة المقاييس */}
      <div className="space-y-2 mb-5">
        <MetricRow
          icon={<DollarSignIcon size={14} />}
          label="المبيعات"
          current={result.current.sales}
          previous={result.previous.sales}
          delta={result.deltas.sales}
          isCurrency
        />
        <MetricRow
          icon={<ReceiptIcon size={14} />}
          label="الفواتير"
          current={result.current.invoices}
          previous={result.previous.invoices}
          delta={result.deltas.invoices}
        />
        <MetricRow
          icon={<TrendingUpIcon size={14} />}
          label="الأرباح"
          current={result.current.profit}
          previous={result.previous.profit}
          delta={result.deltas.profit}
          isCurrency
        />
        <MetricRow
          icon={<ExpenseIcon size={14} />}
          label="المصروفات"
          current={result.current.expenses}
          previous={result.previous.expenses}
          delta={result.deltas.expenses}
          isCurrency
          inverted
        />
      </div>

      {/* المنتجات: زادت / انخفضت */}
      {(result.increased.length > 0 || result.decreased.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[var(--vuno-border-light)]">
          {result.increased.length > 0 && (
            <ProductDeltaList
              title="منتجات زادت مبيعاتها"
              icon={<TrendingUpIcon size={14} className="text-emerald-600" />}
              items={result.increased.slice(0, 5)}
              positive
            />
          )}
          {result.decreased.length > 0 && (
            <ProductDeltaList
              title="منتجات انخفضت مبيعاتها"
              icon={<TrendingDownIcon size={14} className="text-red-500" />}
              items={result.decreased.slice(0, 5)}
              positive={false}
            />
          )}
        </div>
      )}
    </div>
  );
}

/** صف مقارنة مقياس واحد */
function MetricRow({
  icon,
  label,
  current,
  previous,
  delta,
  isCurrency,
  inverted = false,
}: {
  icon: React.ReactNode;
  label: string;
  current: number;
  previous: number;
  delta: number;
  isCurrency?: boolean;
  inverted?: boolean;
}) {
  const fmt = (n: number) => (isCurrency ? fmtEGP(n) : n.toLocaleString('en-US'));
  const percent = previous === 0 ? 0 : Math.round((delta / previous) * 100);
  const isPositive = inverted ? delta < 0 : delta > 0;
  const isZero = delta === 0;

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--vuno-surface-pearl)]">
      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-[var(--vuno-primary)]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-[var(--vuno-text-muted)]">{label}</p>
        <p className="text-[14px] font-bold text-[var(--vuno-text)] tabular-nums">{fmt(current)}</p>
      </div>
      <div className="text-left flex-shrink-0">
        <p className="text-[10px] text-[var(--vuno-text-muted)]">السابقة: {fmt(previous)}</p>
        <div className={cn(
          'flex items-center gap-0.5 justify-end',
          isZero ? 'text-[var(--vuno-text-muted)]' : isPositive ? 'text-emerald-600' : 'text-red-500',
        )}>
          {!isZero && (isPositive ? <TrendingUpIcon size={11} /> : <TrendingDownIcon size={11} />)}
          <span className="text-[11px] font-bold tabular-nums">
            {isZero ? '0%' : `${delta > 0 ? '+' : ''}${percent}%`}
          </span>
        </div>
      </div>
    </div>
  );
}

/** قائمة المنتجات التي تغيّرت */
function ProductDeltaList({
  title,
  icon,
  items,
  positive,
}: {
  title: string;
  icon: React.ReactNode;
  items: { id: string; name: string; currentSold: number; previousSold: number; delta: number; deltaPercent: number }[];
  positive: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-[11px] font-semibold text-[var(--vuno-text-secondary)]">{title}</span>
      </div>
      <div className="space-y-1.5">
        {items.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="flex items-center justify-between text-[11px]">
            <span className="text-[var(--vuno-text)] truncate flex-1">{item.name}</span>
            <span className={cn(
              'font-bold tabular-nums flex-shrink-0',
              positive ? 'text-emerald-600' : 'text-red-500',
            )}>
              {item.deltaPercent > 0 ? '+' : ''}{item.deltaPercent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
