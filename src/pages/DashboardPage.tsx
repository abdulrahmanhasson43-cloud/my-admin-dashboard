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
  NotificationIcon, AlertTriangleIcon, PackageIcon
} from '@/components/icons';
import { salesData, topProducts, sampleInvoices, sampleOrders } from '@/services/mock';
import { quickActionsRow1, quickActionsRow2 } from '@/constants/dashboardActions';
import { useProducts } from '@/context/products-context-value';
import { useAppSettings } from '@/context/app-settings-context-value';

const recentInvoices = sampleInvoices.slice(0, 5);
const totalPurchases = sampleOrders.reduce((sum, o) => sum + o.total, 0);
const totalSales = 72450;
const totalLosses = 1240;
const netProfit = totalSales - totalPurchases;

// TODO(phase-3): replace with real period-filtered queries. For now these
// give the period toggle something real to switch between.
const weekData = [
  { name: 'سبت', sales: 8200 }, { name: 'أحد', sales: 9400 }, { name: 'اثنين', sales: 7600 },
  { name: 'ثلاثاء', sales: 10200 }, { name: 'أربعاء', sales: 11500 }, { name: 'خميس', sales: 9800 },
  { name: 'جمعة', sales: 12450 },
];
const yearData = [
  { name: '2021', sales: 410000 }, { name: '2022', sales: 520000 }, { name: '2023', sales: 610000 },
  { name: '2024', sales: 705000 }, { name: '2025', sales: 780000 }, { name: '2026', sales: 72450 },
];

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
  const { lowStockThreshold } = useAppSettings();
  const [expanded, setExpanded] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('month');

  const chartData = chartPeriod === 'week' ? weekData : chartPeriod === 'year' ? yearData : salesData;

  const todayInvoiceCount = 12;
  const todayRevenue = 3450;
  const avgOrder = Math.round(todayRevenue / todayInvoiceCount);
  const lowStockProducts = products.filter(p => p.storeStock < lowStockThreshold).sort((a, b) => a.storeStock - b.storeStock);

  const statCards = [
    { label: 'المبيعات', value: totalSales, icon: TrendingUpIcon, tone: 'text' as const },
    { label: 'المشتريات', value: totalPurchases, icon: PackageIcon, tone: 'muted' as const },
    { label: 'صافي الربح', value: netProfit, icon: TrendingUpIcon, tone: 'success' as const },
    { label: 'الخسائر', value: totalLosses, icon: TrendingDownIcon, tone: 'danger' as const },
  ];

  return (
    <>
      {/* Hero — flat parchment canvas, no card, no border. */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="-mx-4 lg:-mx-6 -mt-4 lg:-mt-6 mb-0 relative"
        style={{ background: 'var(--vuno-bg)' }}
      >
        <div className="relative max-w-6xl mx-auto px-5 pt-5 pb-10 sm:px-10 sm:pt-6 sm:pb-14">
          <div className="flex items-center justify-between mb-6">
            <button className="relative p-2 -m-2 rounded-xl hover:bg-black/5 transition-colors" aria-label="الإشعارات">
              <NotificationIcon size={20} className="text-[var(--vuno-text-secondary)]" />
              <span className="absolute top-1.5 left-1.5 w-2 h-2 bg-[var(--vuno-primary)] rounded-full border-2 border-[var(--vuno-bg)]" />
            </button>
            <span className="text-[13px] text-[var(--vuno-text-secondary)]">أهلاً أحمد 👋</span>
            <div className="w-9" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[var(--vuno-text-secondary)]">إجمالي مبيعات يوليو</span>
            <button
              type="button"
              onClick={() => setHideBalance((v) => !v)}
              className="p-1.5 -m-1.5 rounded-full text-[var(--vuno-text-muted)] hover:text-[var(--vuno-text)] hover:bg-black/5 transition-colors"
              aria-label="إخفاء أو إظهار الرصيد"
            >
              {hideBalance ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
            </button>
          </div>
          <div className="flex flex-wrap items-baseline gap-3 mt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-[56px] sm:text-[72px] font-light text-[var(--vuno-text)] tracking-tight tabular-nums leading-none">
                {hideBalance ? '•••••' : totalSales.toLocaleString()}
              </span>
              {!hideBalance && <span className="text-base text-[var(--vuno-text-muted)]">EGP</span>}
            </div>
            {!hideBalance && (
              <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--vuno-success)] mb-2">
                <TrendingUpIcon size={13} />
                +18.4% عن الشهر اللي فات
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Signature moment — a dark tile, Apple's own "engineered spec" grammar. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="-mx-4 lg:-mx-6"
        style={{ background: 'var(--vuno-surface-tile-dark)' }}
      >
        <button
          onClick={() => navigate('/invoices')}
          className="w-full max-w-6xl mx-auto px-5 sm:px-10 py-7 sm:py-9 flex items-center gap-6 sm:gap-14 text-right"
        >
          <div>
            <div className="text-[11px] text-white/50 mb-1">فواتير اليوم</div>
            <div className="text-[28px] sm:text-[34px] font-light text-white tracking-tight tabular-nums leading-none">{todayInvoiceCount}</div>
          </div>
          <div className="w-px h-9 bg-white/15" />
          <div>
            <div className="text-[11px] text-white/50 mb-1">مبيعات اليوم</div>
            <div className="text-[28px] sm:text-[34px] font-light text-white tracking-tight tabular-nums leading-none">{todayRevenue.toLocaleString()}</div>
          </div>
          <div className="w-px h-9 bg-white/15 hidden sm:block" />
          <div className="hidden sm:block">
            <div className="text-[11px] text-white/50 mb-1">متوسط الفاتورة</div>
            <div className="text-[28px] sm:text-[34px] font-light text-white tracking-tight tabular-nums leading-none">{avgOrder}</div>
          </div>
          <ArrowLeftIcon size={16} className="text-white/40 mr-auto flex-shrink-0" />
        </button>
      </motion.div>

      <div className="max-w-6xl mx-auto pt-4 space-y-4">

        {/* Monthly stats summary — sales / purchases / net profit / losses */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const colorVar =
              stat.tone === 'success' ? 'var(--vuno-success)' :
              stat.tone === 'danger' ? 'var(--vuno-danger)' :
              stat.tone === 'muted' ? 'var(--vuno-text-secondary)' : 'var(--vuno-text)';
            return (
              <div key={stat.label} className="card-vuno p-4 lg:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: colorVar }}><Icon size={14} /></span>
                  <span className="text-[12px] text-[var(--vuno-text-muted)]">{stat.label}</span>
                </div>
                <div className="text-[18px] lg:text-[22px] font-semibold tabular-nums leading-none" style={{ color: colorVar }}>
                  {stat.value.toLocaleString()}
                  <span className="text-[11px] font-normal text-[var(--vuno-text-muted)] mr-1">EGP</span>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Quick actions — full width so icons have room; the collapse/blur
            preview only makes sense on mobile where space is tight. */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-vuno p-5 sm:p-6"
        >
          <div className="text-[15px] font-semibold text-[var(--vuno-text)] mb-4">إجراءات سريعة</div>

          <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 lg:gap-4 mb-4 lg:mb-0">
            {[...quickActionsRow1, ...quickActionsRow2].slice(0, 8).map((item, i) => {
              const Icon = item.icon;
              const isRow2 = i >= 4;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-2 group transition-all duration-300 ${
                    isRow2 && !expanded ? 'opacity-55 blur-[3px] pointer-events-none lg:opacity-100 lg:blur-0 lg:pointer-events-auto' : ''
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[var(--vuno-text)] group-hover:scale-105 transition-transform" style={{ background: 'var(--vuno-bg)' }}>
                    <Icon size={21} />
                  </div>
                  <span className="text-[11px] text-[var(--vuno-text-secondary)] text-center leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="lg:hidden flex items-center gap-1.5 mx-auto mt-3 bg-white border border-[var(--vuno-border)] rounded-full px-5 py-1.5 text-xs font-semibold text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)] transition-colors"
          >
            {expanded ? 'عرض أقل' : 'عرض المزيد'}
            <ChevronDownIcon size={13} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </motion.div>

        {/* Sales trend + category breakdown — two real charts side by side on desktop */}
        <div className="grid lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card-vuno p-5 lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--vuno-text)]">تحليل المبيعات</h3>
              <div className="flex items-center gap-1 bg-[var(--vuno-bg)] rounded-full p-1">
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
            </div>
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
          </motion.div>

          {/* Category breakdown — a second chart, real addition */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="card-vuno p-5"
          >
            <h3 className="font-semibold text-[var(--vuno-text)] mb-4">المبيعات حسب الفئة</h3>
            <ResponsiveContainer width="100%" height={180} minWidth={150}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={70}
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
            <div className="space-y-2 mt-2">
              {categoryBreakdown.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-2 text-[var(--vuno-text-secondary)]">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    {c.name}
                  </span>
                  <span className="font-semibold text-[var(--vuno-text)]">{c.value.toLocaleString()} EGP</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>


        {/* Recent invoices + Top products + Low stock alert — dense bento on desktop */}
        <div className="grid lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-vuno p-5 lg:col-span-2"
          >
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
          </motion.div>

          {/* Low stock alert — real data from the shared products store, updates as POS sells stock */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="card-vuno p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[var(--vuno-text)] flex items-center gap-1.5">
                <AlertTriangleIcon size={15} className="text-[var(--vuno-warning)]" />
                مخزون منخفض
              </h3>
              <button
                onClick={() => navigate('/inventory')}
                className="text-xs text-[var(--vuno-text-secondary)] flex items-center gap-1 hover:text-[var(--vuno-text)]"
              >
                عرض الكل
                <ArrowLeftIcon size={12} />
              </button>
            </div>
            {lowStockProducts.length === 0 ? (
              <p className="text-[12px] text-[var(--vuno-text-muted)] py-4 text-center">كل المنتجات بمخزون كافٍ</p>
            ) : (
              <div>
                {lowStockProducts.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-[var(--vuno-border-light)] last:border-0">
                    <div className="min-w-0 ml-2">
                      <span className="text-[13px] font-medium text-[var(--vuno-text)] truncate block">{p.name}</span>
                      {p.warehouseStock > 0 && (
                        <span className="text-[10px] text-[var(--vuno-text-muted)]">{p.warehouseStock} متاحة في المخزن للنقل</span>
                      )}
                    </div>
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        color: p.storeStock === 0 ? 'var(--vuno-danger)' : 'var(--vuno-warning)',
                        background: p.storeStock === 0 ? 'color-mix(in srgb, var(--vuno-danger) 12%, transparent)' : 'color-mix(in srgb, var(--vuno-warning) 12%, transparent)',
                      }}
                    >
                      {p.storeStock} بالمتجر
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Top products — redesigned as ranked leaderboard tiles instead of progress bars */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-vuno p-5"
        >
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {topProducts.map((prod, i) => {
              const isTop = i === 0;
              return (
                <div
                  key={prod.name}
                  className="relative rounded-2xl p-4 overflow-hidden"
                  style={{
                    background: isTop ? 'var(--vuno-surface-tile-dark)' : 'var(--vuno-bg)',
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
        </motion.div>
      </div>
    </>
  );
}
