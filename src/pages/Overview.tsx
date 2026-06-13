import { motion } from 'framer-motion';
import { merchants, shipments, monthlyData, COMMISSION_RATE } from '../data';

const totalRevenue = merchants.reduce((s, m) => s + m.totalRevenue, 0);
const totalCommission = Math.round(totalRevenue * COMMISSION_RATE);
const totalShipments = merchants.reduce((s, m) => s + m.shipmentsCount, 0);
const activeMerchants = merchants.filter((m) => m.status === 'active').length;

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  'in-transit': { bg: 'bg-[#8B7CFF]/20', text: 'text-[#8B7CFF]', label: 'In Transit' },
  delivered: { bg: 'bg-[#34C759]/20', text: 'text-[#34C759]', label: 'Delivered' },
  delayed: { bg: 'bg-[#FF5757]/20', text: 'text-[#FF5757]', label: 'Delayed' },
  returned: { bg: 'bg-[#FF9F0A]/20', text: 'text-[#FF9F0A]', label: 'Returned' },
  pending: { bg: 'bg-[#8E8E93]/20', text: 'text-[#8E8E93]', label: 'Pending' },
};

const maxShipments = Math.max(...monthlyData.map((d) => d.shipments));

export default function Overview() {
  const stats = [
    { label: 'إجمالي الشحنات', value: totalShipments.toString(), sub: `${activeMerchants} تجار نشطين`, color: '#8B7CFF', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21 16-9 5-9-5" /><path d="m21 8-9 5-9-5" />
        <line x1="12" x2="12" y1="13" y2="21" />
        <polyline points="3 8 12 3 21 8" />
      </svg>
    )},
    { label: 'إجمالي التجار', value: merchants.length.toString(), sub: `${merchants.filter(m => m.status === 'pending').length} في الانتظار`, color: '#F5C443', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )},
    { label: 'إجمالي الإيرادات', value: `${totalRevenue.toLocaleString()} EGP`, sub: 'جميع التجار', color: '#34C759', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" />
      </svg>
    )},
    { label: 'عمولتي', value: `${totalCommission.toLocaleString()} EGP`, sub: `نسبة ${(COMMISSION_RATE * 100).toFixed(0)}%`, color: '#F5C443', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )},
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">Overview</h1>
        <p className="text-[#8E8E93] text-sm mt-1">مرحباً بك في لوحة تحكم Packsy</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-[#2C2C2E] rounded-2xl p-4"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <p className="text-white text-xl font-bold leading-tight">{stat.value}</p>
            <p className="text-white text-xs font-medium mt-0.5">{stat.label}</p>
            <p className="text-[#8E8E93] text-[11px] mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 bg-[#2C2C2E] rounded-2xl p-5"
        >
          <h2 className="text-white font-semibold text-sm mb-4">الشحنات الشهرية</h2>
          <div className="flex items-end gap-3 h-36">
            {monthlyData.map((d, i) => {
              const heightPct = (d.shipments / maxShipments) * 100;
              const isLast = i === monthlyData.length - 1;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                  <p className="text-[#8E8E93] text-[10px]">{d.shipments}</p>
                  <div className="w-full rounded-t-lg transition-all" style={{
                    height: `${heightPct}%`,
                    backgroundColor: isLast ? '#F5C443' : '#3A3A3C',
                    minHeight: 8,
                  }} />
                  <p className="text-[#8E8E93] text-[10px] text-center">{d.month}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top Merchants */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-[#2C2C2E] rounded-2xl p-5"
        >
          <h2 className="text-white font-semibold text-sm mb-4">أكثر التجار نشاطاً</h2>
          <div className="space-y-3">
            {[...merchants].sort((a, b) => b.shipmentsCount - a.shipmentsCount).slice(0, 4).map((m, i) => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#3A3A3C] flex items-center justify-center text-[#8E8E93] text-[10px] font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{m.store}</p>
                  <p className="text-[#8E8E93] text-[10px]">{m.shipmentsCount} شحنة</p>
                </div>
                <p className="text-[#F5C443] text-xs font-semibold flex-shrink-0">{m.commission.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Shipments */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#2C2C2E] rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-sm">أحدث الشحنات</h2>
          <span className="text-[#8E8E93] text-xs">{shipments.length} شحنة</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#3A3A3C]">
                {['رقم التتبع', 'التاجر', 'العميل', 'الحالة', 'التاريخ', 'المبلغ'].map((h) => (
                  <th key={h} className="text-[#8E8E93] text-xs font-medium text-right pb-3 pr-3 first:pr-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A3A3C]">
              {shipments.slice(0, 5).map((s) => {
                const st = statusColors[s.status] ?? statusColors['pending'];
                return (
                  <tr key={s.id} className="hover:bg-[#3A3A3C] transition-colors">
                    <td className="py-3 text-white text-xs font-mono">{s.trackingNumber}</td>
                    <td className="py-3 pr-3 text-[#8E8E93] text-xs">{s.merchantName}</td>
                    <td className="py-3 pr-3 text-[#8E8E93] text-xs">{s.customer}</td>
                    <td className="py-3 pr-3">
                      <span className={`${st.bg} ${st.text} text-[10px] font-medium px-2.5 py-1 rounded-full`}>{st.label}</span>
                    </td>
                    <td className="py-3 pr-3 text-[#8E8E93] text-xs">{s.date}</td>
                    <td className="py-3 pr-3 text-white text-xs font-semibold">{s.amount} EGP</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
