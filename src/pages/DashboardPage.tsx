import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  ReceiptIcon, TrendingUpIcon, TrendingDownIcon,
  ArrowLeftIcon, ChevronDownIcon, EyeIcon, EyeOffIcon,
  PackageIcon, UserIcon, ZapIcon
} from '@/components/icons';
import { salesData, topProducts, sampleInvoices, sampleOrders } from '@/services/mock';
import { sampleExpenses } from '@/services/mock/expenses';
import { heroActions, quickActionsRow1, quickActionsRow2 } from '@/constants/dashboardActions';
import { useProducts } from '@/context/products-context-value';
import { useActivityLog } from '@/context/activity-log-context-value';
import NotificationCenter from '@/components/NotificationCenter';
import SalesGoalWidget from '@/components/SalesGoalWidget';
import LowStockAlertsWidget from '@/components/LowStockAlertsWidget';
import AIInsightsWidget from '@/components/AIInsightsWidget';
// الأفكار #31, #32, #34, #38 — Dashboard analytics widgets + flash sales banner
import SalesHeatmap from '@/components/analytics/SalesHeatmap';
import TopPerformers from '@/components/analytics/TopPerformers';
import ActivityFeed from '@/components/analytics/ActivityFeed';
import FlashSales from '@/components/flash/FlashSales';
import { heatmapCells, topPerformers, bottomPerformers, sampleFlashSales } from '@/services/mock';
import { extractHeatmapInsights } from '@/lib/analytics';
import type { HeatmapData, PerformersData } from '@/types';

const recentInvoices = sampleInvoices.slice(0, 5);
const totalPurchases = sampleOrders.reduce((sum, o) => sum + o.total, 0);
// TODO: Replace with real API data. الأرقام أدناه ثابتة (placeholder)
// ويجب استبدالها ببيانات فعلية من الـ backend عند توفره.
const totalSales = 72450; // TODO: Replace with real API data
const totalLosses = 1240; // TODO: Replace with real API data
const netProfit = totalSales - totalPurchases;

// TODO(phase-3): replace with real period-filtered queries. For now these
// give the period toggle something real to switch between.
const weekData = [
  { name: 'سبت', sales: 8200 }, { name: 'أحد', sales: 9400 }, { name: 'اثنين', sales: 7600 },
  { name: 'ثلاثاء', sales: 10200 }, { name: 'أربعاء', sales: 11500 }, { name: 'خميس', sales: 9800 },
  { name: 'جمعة', sales: 12450 },
];
// TODO: Replace with real API data (yearly aggregated sales).
const yearData = [
  { name: '2021', sales: 410000 }, { name: '2022', sales: 520000 }, { name: '2023', sales: 610000 },
  { name: '2024', sales: 705000 }, { name: '2025', sales: 780000 }, { name: '2026', sales: 72450 },
];

// TODO: Replace with real API data (sales grouped by product category).
const categoryBreakdown = [
  { name: 'إلكترونيات', value: 28650, color: '#3F3F46' },
  { name: 'كمبيوتر', value: 18900, color: '#6B6B70' },
  { name: 'إكسسوارات', value: 12400, color: '#A1A1A6' },
  { name: 'شاشات', value: 8900, color: '#D4D4D8' },
  { name: 'شبكات', value: 3600, color: '#E4E4E7' },
];

function SalesTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl bg-white border border-[var(--vuno-border)] px-3.5 py-2.5" dir="rtl">
      <div className="text-[11px] text-[var(--vuno-text-muted)] mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-[var(--vuno-text)]">
        المبيعات: <span className="text-[var(--vuno-primary)]">{payload[0].value.toLocaleString()} EGP</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { activities } = useActivityLog();
  const [expanded, setExpanded] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [salesView, setSalesView] = useState<'trend' | 'category'>('trend');

  const chartData = chartPeriod === 'week' ? weekData : chartPeriod === 'year' ? yearData : salesData;

  const todayRevenue = 18500; // TODO: Replace with real API data
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayExpenses = sampleExpenses
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);
  const todayProfit = todayRevenue - todayExpenses;

  // الأفكار #31, #32 — بيانات الخريطة الحرارية والأداء للوحة التحكم
  const heatmapData: HeatmapData = {
    cells: heatmapCells,
    insights: extractHeatmapInsights(heatmapCells),
  };
  const performersData: PerformersData = { top: topPerformers, bottom: bottomPerformers };

  const statCards = [
    { label: 'المبيعات', value: totalSales, icon: TrendingUpIcon, tone: 'text' as const },
    { label: 'المشتريات', value: totalPurchases, icon: PackageIcon, tone: 'muted' as const },
    { label: 'صافي الربح', value: netProfit, icon: TrendingUpIcon, tone: 'success' as const },
    { label: 'الخسائر', value: totalLosses, icon: TrendingDownIcon, tone: 'danger' as const },
  ];

  return (
    <>
      {/* Full width على الموبايل، max-width على الديسكتوب فقط — حتى لا
          يُحبس المحتوى في صندوق صغير ويبدو "مضغوطاً". */}
      <div className="w-full lg:max-w-6xl lg:mx-auto">
        {/* One continuous card, top to bottom — dark, elegant header up top
            (balance + greeting) flowing straight into the lighter content
            below it with just a hairline seam. No gap, no second surface. */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className=""
        >
          {/* Header — single consistent light background, no color-block
              split. Greeting + balance sit directly on the same surface as
              everything else below them. */}
          <div className="relative bg-[var(--vuno-bg)] px-5 py-5 sm:px-8 sm:py-7">
            <div className="relative flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'color-mix(in srgb, var(--vuno-text) 8%, transparent)' }}
                >
                  <UserIcon size={18} className="text-[var(--vuno-text)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-[var(--vuno-text)] truncate sf-display">
                    أهلاً أحمد محمد 👋
                  </p>
                  <p className="text-[12px] text-[var(--vuno-text-muted)] truncate">
                    إليك ملخّص أداء متجر Vuno اليوم
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <NotificationCenter />
                <div className="w-9 h-9 rounded-full bg-[var(--vuno-text)] flex items-center justify-center">
                  <span className="text-white font-bold text-[13px]">V</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] text-[var(--vuno-text-secondary)]">إجمالي مبيعات يوليو</span>
                <button
                  type="button"
                  onClick={() => setHideBalance((v) => !v)}
                  className="relative z-10 p-1.5 -m-1.5 rounded-full text-[var(--vuno-text-muted)] hover:text-[var(--vuno-text)] hover:bg-black/5 active:scale-90 transition-all"
                  aria-label="إخفاء أو إظهار الرصيد"
                >
                  {hideBalance ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                </button>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[42px] sm:text-[56px] font-bold text-[var(--vuno-text)] tracking-tight tabular-nums leading-none">
                  {hideBalance ? '*****' : totalSales.toLocaleString()}
                </span>
                {!hideBalance && <span className="text-base text-[var(--vuno-text-muted)]">EGP</span>}
              </div>
            </div>

            {/* Circular quick-action row, same structural idea as the
                reference (icon in a filled circle + label underneath) */}
            <div className="relative flex items-center justify-between mt-6">
              {heroActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: 'color-mix(in srgb, var(--vuno-text) 8%, transparent)' }}
                    >
                      <Icon size={26} className="text-[var(--vuno-text)]" />
                    </div>
                    <span className="text-[12px] font-medium text-[var(--vuno-text-secondary)]">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today */}
          <div className="border-t border-[var(--vuno-border-light)] bg-[var(--vuno-bg)] px-5 sm:px-8 py-5">
            <p className="text-[11px] font-semibold text-[var(--vuno-text-muted)] mb-3">اليوم</p>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => navigate('/invoices')} className="flex items-center gap-2.5 text-right">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--vuno-text) 8%, transparent)' }}>
                  <TrendingUpIcon size={14} className="text-[var(--vuno-text)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-[var(--vuno-text-muted)] truncate">مبيعات</p>
                  <p className="text-[15px] sm:text-[17px] font-semibold text-[var(--vuno-text)] tabular-nums leading-none">{todayRevenue.toLocaleString()}</p>
                </div>
              </button>
              <button onClick={() => navigate('/expenses')} className="flex items-center gap-2.5 text-right border-r border-[var(--vuno-border-light)] pr-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--vuno-warning) 12%, transparent)' }}>
                  <ReceiptIcon size={14} className="text-[var(--vuno-warning)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-[var(--vuno-text-muted)] truncate">مصاريف</p>
                  <p className="text-[15px] sm:text-[17px] font-semibold text-[var(--vuno-text)] tabular-nums leading-none">{todayExpenses.toLocaleString()}</p>
                </div>
              </button>
              <div className="flex items-center gap-2.5 text-right border-r border-[var(--vuno-border-light)] pr-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `color-mix(in srgb, ${todayProfit >= 0 ? 'var(--vuno-success)' : 'var(--vuno-danger)'} 12%, transparent)` }}
                >
                  {todayProfit >= 0 ? (
                    <TrendingUpIcon size={14} className="text-[var(--vuno-success)]" />
                  ) : (
                    <TrendingDownIcon size={14} className="text-[var(--vuno-danger)]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-[var(--vuno-text-muted)] truncate">ربح</p>
                  <p className="text-[15px] sm:text-[17px] font-semibold tabular-nums leading-none" style={{ color: todayProfit >= 0 ? 'var(--vuno-success)' : 'var(--vuno-danger)' }}>
                    {todayProfit.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* This month */}
          <div className="border-t border-[var(--vuno-border-light)] bg-[var(--vuno-bg)] px-5 sm:px-8 py-5">
            <p className="text-[11px] font-semibold text-[var(--vuno-text-muted)] mb-3">هذا الشهر</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 sm:gap-x-8">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                const colorVar =
                  stat.tone === 'success' ? 'var(--vuno-success)' :
                  stat.tone === 'danger' ? 'var(--vuno-danger)' :
                  stat.tone === 'muted' ? 'var(--vuno-text-secondary)' : 'var(--vuno-text)';
                return (
                  <div key={stat.label} className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'color-mix(in srgb, ' + colorVar + ' 10%, transparent)', color: colorVar }}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-[var(--vuno-text-muted)] truncate">{stat.label}</p>
                      <p className="text-[14px] font-semibold tabular-nums leading-tight" style={{ color: colorVar }}>
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sales Goal Widget — الفكرة #3: هدف المبيعات الشهري */}
          <div className="border-t border-[var(--vuno-border-light)] bg-[var(--vuno-bg)] px-5 sm:px-8 py-5">
            <SalesGoalWidget />
          </div>

          {/* Quick Stats Widget — الفكرة #35: إحصاءات سريعة */}
          <div className="border-t border-[var(--vuno-border-light)] bg-[var(--vuno-bg)] px-5 sm:px-8 py-5">
            <div className="flex items-center gap-1.5 mb-3">
              <ZapIcon size={15} className="text-[var(--vuno-primary)]" />
              <p className="text-[11px] font-semibold text-[var(--vuno-text-muted)]">إحصاءات سريعة</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl p-3.5" style={{ background: 'var(--vuno-border-light)' }}>
                <p className="text-[11px] text-[var(--vuno-text-muted)] mb-1">عدد المنتجات</p>
                <p className="text-[20px] font-bold text-[var(--vuno-text)] tabular-nums leading-none">{products.length}</p>
              </div>
              <div className="rounded-2xl p-3.5" style={{ background: 'color-mix(in srgb, var(--vuno-success) 8%, transparent)' }}>
                <p className="text-[11px] text-[var(--vuno-text-muted)] mb-1">فواتير اليوم</p>
                <p className="text-[20px] font-bold text-[var(--vuno-success)] tabular-nums leading-none">{recentInvoices.length}</p>
              </div>
              <div className="rounded-2xl p-3.5" style={{ background: 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)' }}>
                <p className="text-[11px] text-[var(--vuno-text-muted)] mb-1">نشاطات حديثة</p>
                <p className="text-[20px] font-bold text-[var(--vuno-primary)] tabular-nums leading-none">{activities.length}</p>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="border-t border-[var(--vuno-border-light)] bg-[var(--vuno-bg)] px-5 sm:px-8 py-5">
            <div className="text-[15px] font-semibold text-[var(--vuno-text)] mb-4">إجراءات سريعة</div>

            <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 lg:gap-4 mb-4 lg:mb-0">
              {[...quickActionsRow1, ...quickActionsRow2].slice(0, 9).map((item, i) => {
                const Icon = item.icon;
                const isRow2 = i >= 4;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.comingSoon) return;
                      navigate(item.path);
                    }}
                    className={`relative flex flex-col items-center gap-2 group transition-all duration-300 ${
                      isRow2 && !expanded ? 'opacity-55 blur-[3px] pointer-events-none lg:opacity-100 lg:blur-0 lg:pointer-events-auto' : ''
                    }`}
                  >
                    {item.comingSoon && (
                      <span className="absolute -top-1 right-1/2 translate-x-[22px] text-[9px] font-bold text-white bg-[var(--vuno-text)] rounded-full px-1.5 py-[1px] z-10">
                        قريباً
                      </span>
                    )}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[var(--vuno-text)] group-hover:scale-105 transition-transform" style={{ background: 'var(--vuno-border-light)' }}>
                      <Icon size={26} />
                    </div>
                    <span className="text-xs font-medium text-[var(--vuno-text-secondary)] text-center leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="lg:hidden w-full flex items-center justify-center gap-1.5 mx-auto mt-4 bg-white border border-[var(--vuno-border)] rounded-full px-5 py-2.5 text-sm font-semibold text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)] transition-colors"
            >
              {expanded ? 'عرض أقل' : 'عرض المزيد'}
              <ChevronDownIcon size={13} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Sales — trend / category toggle */}
          <div className="border-t border-[var(--vuno-border-light)] bg-[var(--vuno-bg)] px-5 sm:px-8 py-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-1 rounded-full p-1" style={{ background: 'var(--vuno-border-light)' }}>
                <button
                  onClick={() => setSalesView('trend')}
                  className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-colors"
                  style={{
                    background: salesView === 'trend' ? 'white' : 'transparent',
                    color: salesView === 'trend' ? 'var(--vuno-text)' : 'var(--vuno-text-muted)',
                  }}
                >
                  الاتجاه
                </button>
                <button
                  onClick={() => setSalesView('category')}
                  className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-colors"
                  style={{
                    background: salesView === 'category' ? 'white' : 'transparent',
                    color: salesView === 'category' ? 'var(--vuno-text)' : 'var(--vuno-text-muted)',
                  }}
                >
                  حسب الفئة
                </button>
              </div>

              {salesView === 'trend' && (
                <div className="flex items-center gap-1 rounded-full p-1" style={{ background: 'var(--vuno-border-light)' }}>
                  {(['week', 'month', 'year'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setChartPeriod(p)}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold transition-colors"
                      style={{
                        background: chartPeriod === p ? 'white' : 'transparent',
                        color: chartPeriod === p ? 'var(--vuno-text)' : 'var(--vuno-text-muted)',
                      }}
                    >
                      {p === 'week' ? 'أسبوع' : p === 'month' ? 'شهر' : 'سنة'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {salesView === 'trend' ? (
              <div dir="ltr">
                <ResponsiveContainer width="100%" height={300} minWidth={200}>
                  <AreaChart data={chartData} margin={{ top: 6, right: 8, left: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3F3F46" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#3F3F46" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" stroke="#F0F0F0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#A1A1A6' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#A1A1A6' }}
                      axisLine={false}
                      tickLine={false}
                      width={38}
                      tickFormatter={(value: number) => `${value / 1000}k`}
                    />
                    <Tooltip content={<SalesTooltip />} cursor={{ stroke: '#3F3F46', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#3F3F46"
                      strokeWidth={2}
                      fill="url(#salesGradient)"
                      activeDot={{ r: 5, fill: '#3F3F46', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6 items-center">
                <ResponsiveContainer width="100%" height={200} minWidth={150}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={78}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {categoryBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toLocaleString()} EGP`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2.5">
                  {categoryBreakdown.map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-[13px]">
                      <span className="flex items-center gap-2 text-[var(--vuno-text-secondary)]">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                        {c.name}
                      </span>
                      <span className="font-semibold text-[var(--vuno-text)]">{c.value.toLocaleString()} EGP</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent invoices */}
          <div className="border-t border-[var(--vuno-border-light)] bg-[var(--vuno-bg)] px-5 sm:px-8 py-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-[var(--vuno-text)]">آخر الفواتير</h3>
              <button
                onClick={() => navigate('/invoices')}
                className="text-xs text-[var(--vuno-text-secondary)] flex items-center gap-1 hover:text-[var(--vuno-text)]"
              >
                عرض الكل
                <ArrowLeftIcon size={12} />
              </button>
            </div>
            <div>
              {recentInvoices.map((inv, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-[var(--vuno-border-light)] last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      inv.status === 'paid' ? 'text-[var(--vuno-success)]' : 'text-[var(--vuno-warning)]'
                    }`} style={{ background: inv.status === 'paid' ? 'color-mix(in srgb, var(--vuno-success) 12%, transparent)' : 'color-mix(in srgb, var(--vuno-warning) 12%, transparent)' }}>
                      <ReceiptIcon size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--vuno-text)] truncate">{inv.customer}</p>
                      <p className="text-[11px] text-[var(--vuno-text-muted)]">{inv.id} · {inv.date}</p>
                    </div>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <p className="text-[13px] font-semibold text-[var(--vuno-text)]">{inv.amount.toLocaleString()} EGP</p>
                    <p className="text-[11px] text-[var(--vuno-text-muted)]">{inv.method}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* الأنشطة الحية — سجل واحد بس (كان فيه نسخة تانية مكررة اتشالت)،
              اتحط هنا جنب الفواتير لأن الاتنين "آخر حاجات حصلت في المتجر" */}
          <div className="border-t border-[var(--vuno-border-light)] bg-[var(--vuno-bg)] px-5 sm:px-8 py-5">
            <ActivityFeed activities={activities} maxItems={8} />
          </div>

          {/* Low Stock Alerts Widget — الفكرة #12 من NEW_IDEAS.md: تنبيهات المخزون الذكية
              مع توقع عدد الأيام قبل النفاد وزر إنشاء أمر شراء مباشر. */}
          <div className="border-t border-[var(--vuno-border-light)] bg-[var(--vuno-bg)] px-5 sm:px-8 py-5">
            <LowStockAlertsWidget maxItems={5} />
          </div>

          {/* AI Insights Widget — الفكرة #19: توصيات ذكية للمالك */}
          <div className="border-t border-[var(--vuno-border-light)] bg-[var(--vuno-bg)] px-5 sm:px-8 py-5">
            <AIInsightsWidget />
          </div>

          {/* ════ الجزء 4 — الأفكار #31, #32, #38 ════ */}

          {/* #38 — Flash Sales Banner (عروض الفلاش النشطة) */}
          {sampleFlashSales.some(s => s.active) && (
            <div className="border-t border-[var(--vuno-border-light)] bg-[var(--vuno-bg)] px-5 sm:px-8 py-5">
              <FlashSales sales={sampleFlashSales.filter(s => s.active)} variant="full" />
            </div>
          )}

          {/* #31 — Sales Heatmap (الخريطة الحرارية للمبيعات) */}
          <div className="border-t border-[var(--vuno-border-light)] bg-[var(--vuno-bg)] px-5 sm:px-8 py-5">
            <SalesHeatmap data={heatmapData} />
          </div>

          {/* #32 — Top Performers (أفضل وأسوأ المنتجات) */}
          <div className="border-t border-[var(--vuno-border-light)] bg-[var(--vuno-bg)] px-5 sm:px-8 py-5">
            <TopPerformers data={performersData} />
          </div>

          {/* Top products */}
          <div className="border-t border-[var(--vuno-border-light)] bg-[var(--vuno-bg)] px-5 sm:px-8 pt-5 pb-3 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--vuno-text)]">أكثر المنتجات مبيعاً</h3>
              <button
                onClick={() => navigate('/products')}
                className="text-xs text-[var(--vuno-text-secondary)] flex items-center gap-1 hover:text-[var(--vuno-text)]"
              >
                عرض الكل
                <ArrowLeftIcon size={12} />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {topProducts.map((prod, i) => {
                const isTop = i === 0;
                return (
                  <div
                    key={prod.name}
                    className={`relative rounded-2xl p-4 overflow-hidden ${isTop ? 'col-span-2 lg:col-span-1' : ''}`}
                    style={{
                      background: isTop ? 'var(--vuno-surface-tile-dark)' : 'var(--vuno-border-light)',
                    }}
                  >
                    <span
                      className="absolute -bottom-3 left-1 text-[56px] font-bold leading-none select-none"
                      style={{ color: isTop ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
                    >
                      {i + 1}
                    </span>
                    <div className="relative">
                      <p className={`text-[12px] mb-2 ${isTop ? 'text-white/50' : 'text-[var(--vuno-text-muted)]'}`}>
                        {isTop ? 'الأكثر مبيعاً' : `الترتيب #${i + 1}`}
                      </p>
                      <p className={`text-[14px] font-semibold mb-3 line-clamp-1 ${isTop ? 'text-white' : 'text-[var(--vuno-text)]'}`}>
                        {prod.name}
                      </p>
                      <p className={`text-[20px] font-semibold tabular-nums leading-none mb-1 ${isTop ? 'text-white' : 'text-[var(--vuno-text)]'}`}>
                        {prod.revenue.toLocaleString()}
                        <span className={`text-[11px] font-normal mr-1 ${isTop ? 'text-white/50' : 'text-[var(--vuno-text-muted)]'}`}>EGP</span>
                      </p>
                      <p className={`text-[11px] ${isTop ? 'text-white/50' : 'text-[var(--vuno-text-muted)]'}`}>{prod.sales} قطعة مباعة</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
