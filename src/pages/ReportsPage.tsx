import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  TrendingUpIcon, TrendingDownIcon, DollarSignIcon, PackageIcon, ReceiptIcon,
} from '@/components/icons';
import { salesData, topProducts } from '@/services/mock';

/* ═══════════════════════════ Data ═══════════════════════════ */

// إيراد حسب الفئة
const categoryRevenueData = [
  { name: 'إلكترونيات', value: 145000 },
  { name: 'إكسسوارات', value: 68000 },
  { name: 'كمبيوتر', value: 92000 },
  { name: 'شاشات', value: 54000 },
  { name: 'شبكات', value: 31000 },
];

// مبيعات أسبوعية (آخر 7 أيام)
const weeklySalesData = [
  { name: 'السبت', sales: 8500 },
  { name: 'الأحد', sales: 12000 },
  { name: 'الإثنين', sales: 9800 },
  { name: 'الثلاثاء', sales: 15000 },
  { name: 'الأربعاء', sales: 11200 },
  { name: 'الخميس', sales: 18500 },
  { name: 'الجمعة', sales: 22000 },
];

// طرق الدفع
const paymentMethodData = [
  { name: 'كاش', value: 45, color: '#1D1D1F' },
  { name: 'بطاقة', value: 30, color: '#34C759' },
  { name: 'محفظة', value: 18, color: '#FF9500' },
  { name: 'إنستاباي', value: 7, color: '#AF52DE' },
];

// الربح حسب الشهر
const profitData = salesData.map(d => ({
  name: d.name,
  revenue: d.sales,
  profit: Math.round(d.sales * 0.35),
}));

/* ═══════════════════════════ Tooltip ═══════════════════════════ */
function ChartTooltip({ active, payload, label, suffix = ' EGP' }: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string;
  suffix?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white rounded-[12px] px-3 py-2 text-right" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.12)', border: '1px solid var(--vuno-border)' }}>
      {label && <p className="text-[12px] font-medium text-[var(--vuno-text-muted)] mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-[13px] font-semibold text-[var(--vuno-text)] flex items-center gap-1.5">
          {entry.color && <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />}
          {entry.name && <span className="text-[var(--vuno-text-secondary)] font-normal">{entry.name}:</span>}
          <span>{(entry.value ?? 0).toLocaleString()}{suffix}</span>
        </p>
      ))}
    </div>
  );
}

/* ═══════════════════════════ Stat Card ═══════════════════════════ */
function StatCard({ label, value, change, icon: Icon, positive = true, delay = 0 }: {
  label: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  positive?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-[18px] p-4 sm:p-5"
      style={{ border: '1px solid var(--vuno-border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-[10px] flex items-center justify-center"
          style={{ background: 'var(--vuno-surface-pearl)' }}
        >
          <Icon size={18} className="text-[var(--vuno-primary)]" />
        </div>
        <span
          className="flex items-center gap-1 text-[12px] font-semibold"
          style={{ color: positive ? 'var(--vuno-success)' : 'var(--vuno-danger)' }}
        >
          {positive ? <TrendingUpIcon size={13} /> : <TrendingDownIcon size={13} />}
          {change}
        </span>
      </div>
      <p className="text-[22px] font-semibold text-[var(--vuno-text)] tracking-tight leading-none">{value}</p>
      <p className="text-[13px] text-[var(--vuno-text-muted)] mt-1">{label}</p>
    </motion.div>
  );
}

/* ═══════════════════════════ Chart Card ═══════════════════════════ */
function ChartCard({ title, subtitle, children, delay = 0 }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-[18px] p-5 sm:p-6"
      style={{ border: '1px solid var(--vuno-border)' }}
    >
      <div className="mb-4">
        <h3 className="text-[16px] font-semibold text-[var(--vuno-text)] tracking-tight">{title}</h3>
        {subtitle && <p className="text-[13px] text-[var(--vuno-text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════ Main Page ═══════════════════════════ */
export default function ReportsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const periodData = period === 'week' ? weeklySalesData : profitData;
  const dataKey = period === 'week' ? 'sales' : 'revenue';

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl mx-auto">
      {/* Header + period toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-[var(--vuno-text)] tracking-tight">التقارير</h1>
          <p className="text-[15px] text-[var(--vuno-text-muted)] mt-0.5">نظرة شاملة على أداء متجرك</p>
        </div>
        {/* Period segmented control */}
        <div className="inline-flex p-1 rounded-full bg-[var(--vuno-surface-pearl)] self-start" style={{ border: '1px solid var(--vuno-border)' }}>
          {([
            { id: 'week', label: 'أسبوع' },
            { id: 'month', label: 'شهر' },
            { id: 'year', label: 'سنة' },
          ] as const).map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className="px-4 h-8 rounded-full text-[13px] font-medium transition-all"
              style={{
                background: period === p.id ? 'var(--vuno-primary)' : 'transparent',
                color: period === p.id ? '#fff' : 'var(--vuno-text-secondary)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="إجمالي المبيعات" value="96,500" change="+18%" icon={DollarSignIcon} delay={0} />
        <StatCard label="عدد الطلبات" value="353" change="+12%" icon={ReceiptIcon} delay={0.05} />
        <StatCard label="متوسط الطلب" value="273" change="+5%" icon={TrendingUpIcon} delay={0.1} />
        <StatCard label="صافي الربح" value="33,775" change="-3%" icon={PackageIcon} positive={false} delay={0.15} />
      </div>

      {/* Sales trend (Area) */}
      <ChartCard
        title="اتجاه المبيعات"
        subtitle={period === 'week' ? 'آخر 7 أيام' : 'آخر 7 أشهر'}
        delay={0.2}
      >
        <ResponsiveContainer width="100%" height={260} minWidth={200}>
          <AreaChart data={periodData} margin={{ top: 6, right: 8, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1D1D1F" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#1D1D1F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#A1A1A6' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#A1A1A6' }}
              axisLine={false}
              tickLine={false}
              width={50}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#1D1D1F', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey={dataKey}
              name="المبيعات"
              stroke="#1D1D1F"
              strokeWidth={2.5}
              fill="url(#salesGradient)"
              dot={{ fill: '#1D1D1F', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Two columns: Revenue by category (Bar) + Payment methods (Pie) */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="الإيراد حسب الفئة" subtitle="توزيع المبيعات على الفئات" delay={0.25}>
          <ResponsiveContainer width="100%" height={240} minWidth={200}>
            <BarChart data={categoryRevenueData} margin={{ top: 6, right: 8, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" stroke="#F0F0F0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#A1A1A6' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#A1A1A6' }}
                axisLine={false}
                tickLine={false}
                width={45}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(29,29,31,0.06)' }} />
              <Bar dataKey="value" name="الإيراد" radius={[6, 6, 0, 0]} fill="#1D1D1F" barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="طرق الدفع" subtitle="نسبة كل طريقة دفع من إجمالي المبيعات" delay={0.3}>
          <ResponsiveContainer width="100%" height={240} minWidth={200}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {paymentMethodData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip suffix="%" />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: 12, color: '#6E6E73' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Revenue vs Profit (Line) */}
      <ChartCard title="الإيراد مقابل الربح" subtitle="مقارنة شهرية بين الإيرادات وصافي الربح" delay={0.35}>
        <ResponsiveContainer width="100%" height={260} minWidth={200}>
          <LineChart data={profitData} margin={{ top: 6, right: 8, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#A1A1A6' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#A1A1A6' }}
              axisLine={false}
              tickLine={false}
              width={50}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#A1A1A6', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Legend
              verticalAlign="top"
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: '#6E6E73', paddingBottom: 12 }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              name="الإيراد"
              stroke="#1D1D1F"
              strokeWidth={2.5}
              dot={{ fill: '#1D1D1F', r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              name="الربح"
              stroke="#34C759"
              strokeWidth={2.5}
              dot={{ fill: '#34C759', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Top products table */}
      <ChartCard title="أفضل المنتجات" subtitle="الأكثر مبيعاً هذا الشهر" delay={0.4}>
        <div className="space-y-1">
          {topProducts.map((product, i) => {
            const maxSales = topProducts[0].sales;
            const pct = (product.sales / maxSales) * 100;
            return (
              <div key={i} className="flex items-center gap-3 py-2.5" style={{ borderTop: i > 0 ? '1px solid var(--vuno-border-light)' : 'none' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[14px] font-medium text-[var(--vuno-text)] truncate">{product.name}</p>
                    <p className="text-[14px] font-semibold text-[var(--vuno-primary)] flex-shrink-0">{product.revenue.toLocaleString()} EGP</p>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--vuno-surface-pearl)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: 'var(--vuno-primary)' }}
                    />
                  </div>
                </div>
                <span className="text-[13px] font-medium text-[var(--vuno-text-muted)] flex-shrink-0 w-12 text-left">
                  {product.sales} وحدة
                </span>
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
}
