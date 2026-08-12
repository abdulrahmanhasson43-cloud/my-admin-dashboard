/**
 * pages/AnalyticsPage.tsx
 * ============================================================
 *  صفحة التحليلات — الجزء 4 (Growth & Analytics)
 *  تستضيف 5 مكوّنات:
 *   #31 SalesHeatmap      — الخريطة الحرارية للمبيعات
 *   #32 TopPerformers     — أفضل وأسوأ المنتجات
 *   #33 PeriodComparison  — مقارنة الفترات
 *   #40 PriceHistoryChart — تاريخ أسعار المورّد
 *   #34 ActivityFeed      — الأنشطة الحيّة
 * ============================================================
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUpIcon, ActivityIcon, ZapIcon, PackageIcon, TagIcon, ReceiptIcon,
} from '@/components/icons';
import SalesHeatmap from '@/components/analytics/SalesHeatmap';
import TopPerformers from '@/components/analytics/TopPerformers';
import PeriodComparison from '@/components/analytics/PeriodComparison';
import PriceHistoryChart from '@/components/analytics/PriceHistoryChart';
import ActivityFeed from '@/components/analytics/ActivityFeed';
import StatsRow from '@/components/StatsRow';
import {
  heatmapCells,
  topPerformers,
  bottomPerformers,
  periodData,
  availablePeriods,
  priceSuppliers,
  mockPriceHistory,
} from '@/services/mock';
import { extractHeatmapInsights, findCheapestSupplier } from '@/lib/analytics';
import type { HeatmapData, PerformersData } from '@/types';

/* ─────────────────────────────────────────────────────────────
   Product selector for the Price History section
   ───────────────────────────────────────────────────────────── */
function ProductSelector({
  products,
  selected,
  onSelect,
}: {
  products: string[];
  selected: string;
  onSelect: (p: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-1">
      {products.map((p) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 border ${
            selected === p
              ? 'gradient-btn text-white border-transparent'
              : 'bg-white text-[var(--vuno-text-secondary)] border-[var(--vuno-border)] hover:bg-gray-50'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Page header
   ───────────────────────────────────────────────────────────── */
function PageHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3"
    >
      <div
        className="w-11 h-11 rounded-[14px] flex items-center justify-center"
        style={{ background: 'var(--vuno-surface-pearl)' }}
      >
        <ActivityIcon size={22} className="text-[var(--vuno-primary)]" />
      </div>
      <div>
        <h1 className="text-[22px] font-bold text-[var(--vuno-text)] tracking-tight leading-tight">
          التحليلات المتقدمة
        </h1>
        <p className="text-[13px] text-[var(--vuno-text-muted)] mt-0.5">
          رؤى عميقة عن أداء المبيعات والمنتجات والأسعار
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main page
   ───────────────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  // Build heatmap data once (extracts insights from the mock cells)
  const heatmapData = useMemo<HeatmapData>(
    () => ({
      cells: heatmapCells,
      insights: extractHeatmapInsights(heatmapCells),
    }),
    [],
  );

  // Build performers data
  const performersData = useMemo<PerformersData>(
    () => ({ top: topPerformers, bottom: bottomPerformers }),
    [],
  );

  // Price history — product selector
  const priceProducts = useMemo(() => Object.keys(mockPriceHistory), []);
  const [selectedProduct, setSelectedProduct] = useState(priceProducts[0] || '');
  const pricePoints = mockPriceHistory[selectedProduct] || [];
  const cheapest = useMemo(() => findCheapestSupplier(pricePoints), [pricePoints]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader />

      {/* Summary tiles */}
      <StatsRow
        maxCols={4}
        items={[
          {
            label: 'إجمالي الفواتير',
            value: heatmapData.insights.totalInvoices.toLocaleString('en-US'),
            icon: ReceiptIcon,
            color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]',
          },
          {
            label: 'إجمالي الإيرادات',
            value: `${(heatmapData.insights.totalRevenue / 1000).toFixed(1)}K ج.م`,
            icon: TrendingUpIcon,
            color: 'bg-emerald-50 text-emerald-600',
          },
          {
            label: 'أعلى ساعة مبيعًا',
            value: `${heatmapData.insights.peak.hour}:00`,
            icon: ZapIcon,
            color: 'bg-amber-50 text-amber-600',
          },
          {
            label: 'المنتجات النشطة',
            value: (topPerformers.length + bottomPerformers.length).toString(),
            icon: PackageIcon,
            color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]',
          },
        ]}
      />

      {/* #31 — Sales Heatmap */}
      <SalesHeatmap data={heatmapData} />

      {/* #32 — Top & Bottom Performers */}
      <TopPerformers data={performersData} />

      {/* #33 — Period Comparison */}
      <PeriodComparison availablePeriods={availablePeriods} periodData={periodData} />

      {/* #40 — Price History */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <TagIcon size={18} className="text-[var(--vuno-primary)]" />
          <h2 className="text-[16px] font-semibold text-[var(--vuno-text)]">
            تتبّع أسعار المورّدين
          </h2>
          {cheapest && (
            <span
              className="mr-auto text-[12px] font-medium px-3 py-1 rounded-full"
              style={{ background: 'var(--vuno-surface-pearl)', color: 'var(--vuno-primary)' }}
            >
              الأرخص: {cheapest.supplier}
            </span>
          )}
        </div>
        <ProductSelector
          products={priceProducts}
          selected={selectedProduct}
          onSelect={setSelectedProduct}
        />
        <PriceHistoryChart
          points={pricePoints}
          suppliers={priceSuppliers}
          productName={selectedProduct}
          key={selectedProduct}
        />
      </div>

      {/* #34 — Live Activity Feed */}
      <ActivityFeed maxItems={12} />
    </div>
  );
}
