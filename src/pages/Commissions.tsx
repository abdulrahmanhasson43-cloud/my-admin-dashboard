import { motion } from 'framer-motion';
import { merchants, shipments, monthlyData, COMMISSION_RATE } from '../data';

const totalRevenue = merchants.reduce((s, m) => s + m.totalRevenue, 0);
const totalCommission = Math.round(totalRevenue * COMMISSION_RATE);
const thisMonthRevenue = monthlyData[monthlyData.length - 1]?.revenue ?? 0;
const thisMonthCommission = Math.round(thisMonthRevenue * COMMISSION_RATE);

const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

const perMerchant = merchants.map((m) => ({
  id: m.id,
  name: m.name,
  store: m.store,
  status: m.status,
  shipments: m.shipmentsCount,
  revenue: m.totalRevenue,
  commission: m.commission,
  rate: COMMISSION_RATE,
}));

export default function Commissions() {
  const summaryCards = [
    {
      label: 'إجمالي الإيرادات',
      value: `${totalRevenue.toLocaleString()} EGP`,
      sub: 'جميع الفترات',
      color: '#34C759',
    },
    {
      label: 'إجمالي عمولتي',
      value: `${totalCommission.toLocaleString()} EGP`,
      sub: `نسبة ${(COMMISSION_RATE * 100).toFixed(0)}%`,
      color: '#F5C443',
    },
    {
      label: 'هذا الشهر',
      value: `${thisMonthCommission.toLocaleString()} EGP`,
      sub: `إيرادات ${thisMonthRevenue.toLocaleString()} EGP`,
      color: '#8B7CFF',
    },
    {
      label: 'نسبة العمولة',
      value: `${(COMMISSION_RATE * 100).toFixed(0)}%`,
      sub: `من كل شحنة`,
      color: '#5AC8FA',
    },
  ];

  const deliveredCount = shipments.filter(s => s.status === 'delivered').length;
  const commissionFromDelivered = shipments
    .filter(s => s.status === 'delivered')
    .reduce((sum, s) => sum + s.commission, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">العمولات</h1>
        <p className="text-[#8E8E93] text-sm mt-1">تتبع إيراداتك وعمولاتك</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-[#2C2C2E] rounded-2xl p-4"
          >
            <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: card.color }} />
            <p className="text-white text-xl font-bold">{card.value}</p>
            <p className="text-white text-xs font-medium mt-0.5">{card.label}</p>
            <p className="text-[#8E8E93] text-[11px] mt-1">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#2C2C2E] rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-sm">الإيرادات الشهرية</h2>
          <div className="flex items-center gap-4 text-[10px] text-[#8E8E93]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3A3A3C]" />إيرادات
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F5C443]" />عمولة (5%)
            </span>
          </div>
        </div>
        <div className="flex items-end gap-4 h-40">
          {monthlyData.map((d, i) => {
            const revPct = (d.revenue / maxRevenue) * 100;
            const comPct = ((d.revenue * COMMISSION_RATE) / maxRevenue) * 100;
            const isLast = i === monthlyData.length - 1;
            return (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <p className="text-[#8E8E93] text-[9px]">{d.revenue.toLocaleString()}</p>
                <div className="w-full flex gap-1 items-end" style={{ height: '100px' }}>
                  <div className="flex-1 rounded-t-md transition-all" style={{
                    height: `${revPct}%`,
                    backgroundColor: isLast ? '#F5C443' : '#3A3A3C',
                    minHeight: 4,
                  }} />
                  <div className="flex-1 rounded-t-md bg-[#F5C443]/30 transition-all" style={{
                    height: `${comPct}%`,
                    minHeight: 4,
                  }} />
                </div>
                <p className="text-[#8E8E93] text-[10px]">{d.month}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-[#2C2C2E] rounded-2xl p-4 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-[#34C759]/10 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <div>
            <p className="text-white text-lg font-bold">{deliveredCount}</p>
            <p className="text-[#8E8E93] text-xs">شحنة مسلّمة</p>
          </div>
          <div className="mr-auto text-right">
            <p className="text-[#34C759] text-sm font-bold">{commissionFromDelivered.toFixed(1)} EGP</p>
            <p className="text-[#8E8E93] text-[10px]">عمولة محققة</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#2C2C2E] rounded-2xl p-4 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-[#8B7CFF]/10 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B7CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21 16-9 5-9-5" /><path d="m21 8-9 5-9-5" />
              <line x1="12" x2="12" y1="13" y2="21" />
              <polyline points="3 8 12 3 21 8" />
            </svg>
          </div>
          <div>
            <p className="text-white text-lg font-bold">{shipments.filter(s => s.status === 'in-transit').length}</p>
            <p className="text-[#8E8E93] text-xs">شحنة في الطريق</p>
          </div>
          <div className="mr-auto text-right">
            <p className="text-[#8B7CFF] text-sm font-bold">
              {shipments.filter(s => s.status === 'in-transit').reduce((sum, s) => sum + s.commission, 0).toFixed(1)} EGP
            </p>
            <p className="text-[#8E8E93] text-[10px]">عمولة متوقعة</p>
          </div>
        </motion.div>
      </div>

      {/* Per Merchant Table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-[#2C2C2E] rounded-2xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-[#3A3A3C]">
          <h2 className="text-white font-semibold text-sm">العمولة لكل تاجر</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#3A3A3C]">
                {['التاجر', 'المتجر', 'الشحنات', 'الإيرادات', 'النسبة', 'عمولتي'].map((h) => (
                  <th key={h} className="text-[#8E8E93] text-xs font-medium text-right px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A3A3C]">
              {perMerchant.sort((a, b) => b.commission - a.commission).map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-[#3A3A3C] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#F5C443]/20 flex items-center justify-center text-[#F5C443] text-xs font-bold flex-shrink-0">
                        {m.name.charAt(0)}
                      </div>
                      <p className="text-white text-xs">{m.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#8E8E93] text-xs">{m.store}</td>
                  <td className="px-4 py-3 text-white text-xs font-semibold">{m.shipments}</td>
                  <td className="px-4 py-3 text-white text-xs font-semibold">{m.revenue.toLocaleString()} EGP</td>
                  <td className="px-4 py-3 text-[#8E8E93] text-xs">{(m.rate * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3 text-[#F5C443] text-xs font-bold">{m.commission.toLocaleString()} EGP</td>
                </motion.tr>
              ))}
              {/* Total Row */}
              <tr className="bg-[#3A3A3C]">
                <td className="px-4 py-3 text-white text-xs font-bold" colSpan={3}>الإجمالي</td>
                <td className="px-4 py-3 text-white text-xs font-bold">{totalRevenue.toLocaleString()} EGP</td>
                <td className="px-4 py-3 text-[#8E8E93] text-xs">{(COMMISSION_RATE * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-[#F5C443] text-xs font-bold">{totalCommission.toLocaleString()} EGP</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
