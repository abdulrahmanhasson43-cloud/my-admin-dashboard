import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';
import {
  TrendingUpIcon, ReceiptIcon, UsersIcon, CoinsIcon,
  PrintIcon, DownloadIcon, WhatsAppIcon, AlertTriangleIcon,
  PackageIcon, ClockIcon, XIcon,
} from '@/components/icons';
import { sampleInvoices, sampleExpenses, topProducts } from '@/services/mock';
import { exportToExcel } from '@/lib/export-utils';

const PAYMENT_COLORS: Record<string, string> = {
  'كاش': '#34C759',
  'بطاقة': '#1D1D1F',
  'محفظة': '#FF9500',
  'إنستاباي': '#5AC8FA',
  'cash': '#34C759',
  'card': '#1D1D1F',
  'wallet': '#FF9500',
  'instapay': '#5AC8FA',
};

/** Build hourly sales distribution (9 AM → 9 PM) from mock invoices. */
function buildHourlyData() {
  const hours = Array.from({ length: 12 }, (_, i) => {
    const h = i + 9; // 9 AM to 8 PM
    return { hour: `${h}:00`, hourLabel: `${h <= 12 ? h : h - 12}${h < 12 ? 'ص' : 'م'}`, sales: 0, count: 0 };
  });
  sampleInvoices.forEach(inv => {
    // inv.date format: "2025-01-15 14:30"
    const timePart = inv.date.split(' ')[1];
    if (timePart) {
      const hour = parseInt(timePart.split(':')[0], 10);
      const slot = hours.find(s => parseInt(s.hour, 10) === hour);
      if (slot) {
        slot.sales += inv.total;
        slot.count += 1;
      }
    }
  });
  return hours;
}

/** Build payment-method breakdown from mock invoices. */
function buildPaymentBreakdown() {
  const map = new Map<string, number>();
  sampleInvoices.filter(i => i.status === 'paid').forEach(inv => {
    const current = map.get(inv.method) || 0;
    map.set(inv.method, current + inv.total);
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

/**
 * الفكرة #25 — تقرير إقفال اليوم.
 * تقرير شامل في نهاية اليوم يحتوي على:
 * - صف إحصائيات (إجمالي المبيعات، عدد الفواتير، عدد العملاء، تفصيل الدفع)
 * - مخطط دائري لطرق الدفع
 * - مخطط أعمدة للمبيعات حسب الساعة
 * - أكثر 5 منتجات مبيعاً
 * - تنبيهات (مخزون منخفض، مصاريف اليوم)
 * - تسوية الوردية (افتتاح/إغلاق/مبيعات/الفرق)
 * - إجراءات (طباعة، PDF، واتساب)
 */
export default function DailyClosingReport() {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const todayStr = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // --- Stats ---
  const paidInvoices = useMemo(() => sampleInvoices.filter(i => i.status === 'paid'), []);
  const totalSales = useMemo(() => paidInvoices.reduce((s, i) => s + i.total, 0), [paidInvoices]);
  const invoiceCount = paidInvoices.length;
  const customerCount = new Set(paidInvoices.map(i => i.customer)).size;

  const paymentBreakdown = useMemo(() => buildPaymentBreakdown(), []);
  const hourlyData = useMemo(() => buildHourlyData(), []);

  // Today's expenses
  const todayISO = new Date().toISOString().slice(0, 10);
  const todayExpenses = useMemo(
    () => sampleExpenses.filter(e => e.date === todayISO),
    [todayISO],
  );
  const totalExpenses = todayExpenses.reduce((s, e) => s + e.amount, 0);

  // Low stock alerts (mock — in production this reads from ProductsContext)
  const lowStockItems = useMemo(
    () => [
      { name: 'سماعة بلوتوث', stock: 3, threshold: 10 },
      { name: 'شاحن سريع', stock: 5, threshold: 10 },
      { name: 'جراب موبايل', stock: 2, threshold: 10 },
    ],
    [],
  );

  // Shift reconciliation (mock values)
  const openingCash = 1000;
  const expectedCash = openingCash + paymentBreakdown
    .filter(p => p.name === 'كاش' || p.name === 'cash')
    .reduce((s, p) => s + p.value, 0);
  const countedCash = expectedCash; // perfect reconciliation in mock
  const variance = countedCash - expectedCash;

  const stats = [
    { label: 'إجمالي المبيعات', value: `${totalSales.toLocaleString()} EGP`, icon: TrendingUpIcon, color: 'var(--vuno-success)' },
    { label: 'عدد الفواتير', value: invoiceCount.toString(), icon: ReceiptIcon, color: 'var(--vuno-primary)' },
    { label: 'عدد العملاء', value: customerCount.toString(), icon: UsersIcon, color: 'var(--vuno-primary)' },
    { label: 'مصاريف اليوم', value: `${totalExpenses.toLocaleString()} EGP`, icon: CoinsIcon, color: 'var(--vuno-warning)' },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // Export the report data as Excel (acts as PDF-substitute in mock)
    const rows = [
      { 'البند': 'إجمالي المبيعات', 'القيمة': totalSales },
      { 'البند': 'عدد الفواتير', 'القيمة': invoiceCount },
      { 'البند': 'عدد العملاء', 'القيمة': customerCount },
      { 'البند': 'مصاريف اليوم', 'القيمة': totalExpenses },
      { 'البند': 'صندوق الافتتاح', 'القيمة': openingCash },
      { 'البند': 'النقدية المتوقعة', 'القيمة': expectedCash },
      { 'البند': 'النقدية الفعلية', 'القيمة': countedCash },
      { 'البند': 'الفرق', 'القيمة': variance },
    ];
    exportToExcel(rows, 'تقرير الإقفال', `إقفال-${todayISO}`);
    toast.success('تم تصدير التقرير');
  };

  // Build a WhatsApp summary message
  const summaryMessage = useMemo(() => {
    const top5 = topProducts.slice(0, 5).map((p, i) => `${i + 1}. ${p.name} — ${p.sales} مبيعة`).join('\n');
    return (
      `📊 *تقرير إقفال اليوم*\n` +
      `📅 ${todayStr}\n\n` +
      `💰 إجمالي المبيعات: *${totalSales.toLocaleString()} EGP*\n` +
      `🧾 عدد الفواتير: *${invoiceCount}*\n` +
      `👥 عدد العملاء: *${customerCount}*\n` +
      `💸 مصاريف اليوم: *${totalExpenses.toLocaleString()} EGP*\n\n` +
      `🔥 أكثر المنتجات مبيعاً:\n${top5}\n\n` +
      `📦 مخزون منخفض: ${lowStockItems.length} منتج\n` +
      `🏦 تسوية الوردية:\n` +
      `  • افتتاح: ${openingCash} EGP\n` +
      `  • متوقع: ${expectedCash.toLocaleString()} EGP\n` +
      `  • فعلي: ${countedCash.toLocaleString()} EGP\n` +
      `  • الفرق: ${variance} EGP ✅`
    );
  }, [todayStr, totalSales, invoiceCount, customerCount, totalExpenses, lowStockItems.length, openingCash, expectedCash, countedCash, variance]);

  const handleWhatsAppSend = () => {
    const encoded = encodeURIComponent(summaryMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
    toast.success('تم فتح واتساب');
    setShowWhatsApp(false);
  };

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      {/* Report container — marked for printing */}
      <div ref={reportRef} className="invoice-print-area space-y-5">
        {/* Header */}
        <div className="card-vuno p-5 flex items-center justify-between no-print">
          <div>
            <h2 className="text-[20px] font-bold text-[var(--vuno-text)]">تقرير إقفال اليوم</h2>
            <p className="text-[13px] text-[var(--vuno-text-muted)] mt-0.5">{todayStr}</p>
          </div>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)' }}
          >
            <ReceiptIcon size={24} className="text-[var(--vuno-primary)]" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-vuno p-4"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `color-mix(in srgb, ${stat.color} 12%, transparent)` }}
                >
                  <Icon size={18} className="" />
                </div>
                <p className="text-[11px] text-[var(--vuno-text-muted)] mb-0.5">{stat.label}</p>
                <p className="text-[18px] font-bold text-[var(--vuno-text)] tabular-nums">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Payment methods pie chart */}
          <div className="card-vuno p-5">
            <h3 className="font-bold text-[15px] text-[var(--vuno-text)] mb-1">طرق الدفع</h3>
            <p className="text-[11px] text-[var(--vuno-text-muted)] mb-4">توزيع المبيعات حسب طريقة الدفع</p>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={40}
                    paddingAngle={2}
                  >
                    {paymentBreakdown.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={PAYMENT_COLORS[entry.name] || '#1D1D1F'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value.toLocaleString()} EGP`}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid var(--vuno-border)',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {paymentBreakdown.map(entry => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: PAYMENT_COLORS[entry.name] || '#1D1D1F' }}
                  />
                  <span className="text-[11px] text-[var(--vuno-text-secondary)]">
                    {entry.name} — {entry.value.toLocaleString()} EGP
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly sales bar chart */}
          <div className="card-vuno p-5">
            <h3 className="font-bold text-[15px] text-[var(--vuno-text)] mb-1">المبيعات حسب الساعة</h3>
            <p className="text-[11px] text-[var(--vuno-text-muted)] mb-4">أوقات الذروة خلال اليوم</p>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--vuno-border-light)" vertical={false} />
                  <XAxis
                    dataKey="hourLabel"
                    tick={{ fontSize: 10, fill: 'var(--vuno-text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--vuno-text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => `${value.toLocaleString()} EGP`}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid var(--vuno-border)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="sales" fill="var(--vuno-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top 5 products + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top products */}
          <div className="card-vuno p-5">
            <h3 className="font-bold text-[15px] text-[var(--vuno-text)] mb-3">أكثر 5 منتجات مبيعاً</h3>
            <div className="space-y-2">
              {topProducts.slice(0, 5).map((product, i) => (
                <div key={product.name} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'var(--vuno-surface-pearl)' }}>
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
                    style={{
                      background: i === 0 ? 'var(--vuno-primary)' : 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)',
                      color: i === 0 ? '#fff' : 'var(--vuno-text-secondary)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--vuno-text)] truncate">{product.name}</p>
                    <p className="text-[11px] text-[var(--vuno-text-muted)]">{product.sales} وحدة مبيعة</p>
                  </div>
                  <span className="text-[14px] font-bold text-[var(--vuno-primary)] flex-shrink-0">
                    {product.revenue.toLocaleString()} EGP
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="card-vuno p-5">
            <h3 className="font-bold text-[15px] text-[var(--vuno-text)] mb-3">تنبيهات</h3>

            {/* Low stock alerts */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangleIcon size={14} className="text-[var(--vuno-danger)]" />
                <span className="text-[12px] font-semibold text-[var(--vuno-text-secondary)]">مخزون منخفض</span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: 'var(--vuno-danger)' }}
                >
                  {lowStockItems.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {lowStockItems.map(item => (
                  <div key={item.name} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--vuno-danger) 6%, transparent)' }}>
                    <div className="flex items-center gap-2">
                      <PackageIcon size={14} className="text-[var(--vuno-danger)]" />
                      <span className="text-[12px] font-medium text-[var(--vuno-text)]">{item.name}</span>
                    </div>
                    <span className="text-[12px] font-bold text-[var(--vuno-danger)]">{item.stock} متبقي</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily expenses */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CoinsIcon size={14} className="text-[var(--vuno-warning)]" />
                <span className="text-[12px] font-semibold text-[var(--vuno-text-secondary)]">مصاريف اليوم</span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: 'var(--vuno-warning)' }}
                >
                  {todayExpenses.length}
                </span>
              </div>
              <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                {todayExpenses.map(exp => (
                  <div key={exp.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--vuno-warning) 6%, transparent)' }}>
                    <span className="text-[12px] font-medium text-[var(--vuno-text)] truncate">{exp.description}</span>
                    <span className="text-[12px] font-bold text-[var(--vuno-warning)] flex-shrink-0">{exp.amount.toLocaleString()} EGP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Shift reconciliation */}
        <div className="card-vuno p-5">
          <div className="flex items-center gap-2 mb-3">
            <ClockIcon size={16} className="text-[var(--vuno-primary)]" />
            <h3 className="font-bold text-[15px] text-[var(--vuno-text)]">تسوية الوردية</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl" style={{ background: 'var(--vuno-surface-pearl)' }}>
              <p className="text-[11px] text-[var(--vuno-text-muted)] mb-1">صندوق الافتتاح</p>
              <p className="text-[16px] font-bold text-[var(--vuno-text)] tabular-nums">{openingCash.toLocaleString()} EGP</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'var(--vuno-surface-pearl)' }}>
              <p className="text-[11px] text-[var(--vuno-text-muted)] mb-1">النقدية المتوقعة</p>
              <p className="text-[16px] font-bold text-[var(--vuno-text)] tabular-nums">{expectedCash.toLocaleString()} EGP</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'var(--vuno-surface-pearl)' }}>
              <p className="text-[11px] text-[var(--vuno-text-muted)] mb-1">النقدية الفعلية</p>
              <p className="text-[16px] font-bold text-[var(--vuno-text)] tabular-nums">{countedCash.toLocaleString()} EGP</p>
            </div>
            <div
              className="p-3 rounded-xl"
              style={{
                background: variance === 0
                  ? 'color-mix(in srgb, var(--vuno-success) 10%, transparent)'
                  : 'color-mix(in srgb, var(--vuno-danger) 10%, transparent)',
              }}
            >
              <p className="text-[11px] text-[var(--vuno-text-muted)] mb-1">الفرق</p>
              <p
                className="text-[16px] font-bold tabular-nums"
                style={{ color: variance === 0 ? 'var(--vuno-success)' : 'var(--vuno-danger)' }}
              >
                {variance === 0 ? '✓ مطابق' : `${variance} EGP`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions — hidden in print */}
      <div className="flex flex-wrap gap-2.5 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 h-11 px-5 rounded-full font-semibold text-[14px] transition-transform active:scale-95"
          style={{ border: '1px solid var(--vuno-border)', color: 'var(--vuno-text)', background: 'var(--vuno-surface)' }}
        >
          <PrintIcon size={16} />
          طباعة
        </button>
        <button
          onClick={handleExportPDF}
          className="flex items-center justify-center gap-2 h-11 px-5 rounded-full font-semibold text-[14px] transition-transform active:scale-95"
          style={{ border: '1px solid var(--vuno-border)', color: 'var(--vuno-text)', background: 'var(--vuno-surface)' }}
        >
          <DownloadIcon size={16} />
          تصدير
        </button>
        <button
          onClick={() => setShowWhatsApp(true)}
          className="flex items-center justify-center gap-2 h-11 px-5 rounded-full text-white font-semibold text-[14px] transition-transform active:scale-95"
          style={{ background: '#25D366' }}
        >
          <WhatsAppIcon size={16} className="text-white" />
          مشاركة واتساب
        </button>
      </div>

      {/* WhatsApp summary modal */}
      {showWhatsApp && (
        <WhatsAppSummaryModal
          message={summaryMessage}
          onClose={() => setShowWhatsApp(false)}
          onSend={handleWhatsAppSend}
        />
      )}
    </div>
  );
}

/** A lightweight inline modal that shows the daily summary message
    preview and lets the merchant send it via wa.me. */
function WhatsAppSummaryModal({
  message,
  onClose,
  onSend,
}: {
  message: string;
  onClose: () => void;
  onSend: () => void;
}) {
  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-[100] animate-in fade-in duration-200"
      />
      <div className="fixed bottom-0 inset-x-0 z-[101] bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200" dir="rtl">
        <div className="w-10 h-1 rounded-full bg-[var(--vuno-border)] mx-auto mt-3 mb-1" />
        <div className="flex items-center justify-between px-5 pt-2 pb-3 sticky top-0 bg-white border-b border-[var(--vuno-border)]">
          <div className="flex items-center gap-2">
            <WhatsAppIcon size={18} className="text-[#25D366]" />
            <h3 className="font-bold text-[15px] text-[var(--vuno-text)]">ملخص الإقفال</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--vuno-bg)]">
            <XIcon size={16} className="text-[var(--vuno-text-secondary)]" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div
            className="rounded-2xl p-4 max-h-[300px] overflow-y-auto"
            style={{ background: '#dcf8c6', border: '1px solid #c5f0a8' }}
          >
            <pre className="whitespace-pre-wrap text-[13px] text-[#075e54] font-sans leading-relaxed">
              {message}
            </pre>
          </div>
          <button
            onClick={onSend}
            className="w-full h-12 rounded-full text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-transform active:scale-95"
            style={{ background: '#25D366' }}
          >
            <WhatsAppIcon size={18} className="text-white" />
            إرسال عبر واتساب
          </button>
        </div>
      </div>
    </>
  );
}
