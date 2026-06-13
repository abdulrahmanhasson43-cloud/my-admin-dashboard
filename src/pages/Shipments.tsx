import { useState } from 'react';
import { motion } from 'framer-motion';
import { shipments } from '../data';
import type { ShipmentStatus } from '../types';

const statusConfig: Record<ShipmentStatus, { bg: string; text: string; label: string }> = {
  'in-transit': { bg: 'bg-[#8B7CFF]/20', text: 'text-[#8B7CFF]', label: 'In Transit' },
  delivered:    { bg: 'bg-[#34C759]/20', text: 'text-[#34C759]', label: 'Delivered' },
  delayed:      { bg: 'bg-[#FF5757]/20', text: 'text-[#FF5757]', label: 'Delayed' },
  returned:     { bg: 'bg-[#FF9F0A]/20', text: 'text-[#FF9F0A]', label: 'Returned' },
  pending:      { bg: 'bg-[#8E8E93]/20', text: 'text-[#8E8E93]', label: 'Pending' },
};

type FilterType = ShipmentStatus | 'all';

const filterTabs: { id: FilterType; label: string }[] = [
  { id: 'all',        label: 'الكل' },
  { id: 'in-transit', label: 'In Transit' },
  { id: 'delivered',  label: 'Delivered' },
  { id: 'delayed',    label: 'Delayed' },
  { id: 'returned',   label: 'Returned' },
  { id: 'pending',    label: 'Pending' },
];

export default function Shipments() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filtered = shipments.filter((s) => {
    const matchFilter = filter === 'all' || s.status === filter;
    const q = search.toLowerCase();
    const matchSearch = s.trackingNumber.toLowerCase().includes(q)
      || s.merchantName.toLowerCase().includes(q)
      || s.customer.includes(q)
      || s.agent.includes(q);
    return matchFilter && matchSearch;
  });

  const totalAmount = filtered.reduce((sum, s) => sum + s.amount, 0);
  const totalCommission = filtered.reduce((sum, s) => sum + s.commission, 0);

  const counts: Record<FilterType, number> = {
    all: shipments.length,
    'in-transit': shipments.filter(s => s.status === 'in-transit').length,
    delivered:    shipments.filter(s => s.status === 'delivered').length,
    delayed:      shipments.filter(s => s.status === 'delayed').length,
    returned:     shipments.filter(s => s.status === 'returned').length,
    pending:      shipments.filter(s => s.status === 'pending').length,
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">الشحنات</h1>
          <p className="text-[#8E8E93] text-sm mt-1">{shipments.length} شحنة إجمالاً</p>
        </div>
        {/* Quick Stats */}
        <div className="flex gap-3">
          <div className="bg-[#2C2C2E] rounded-xl px-4 py-2.5 text-right">
            <p className="text-white text-sm font-bold">{totalAmount.toLocaleString()} EGP</p>
            <p className="text-[#8E8E93] text-[10px]">إجمالي المعروض</p>
          </div>
          <div className="bg-[#2C2C2E] rounded-xl px-4 py-2.5 text-right">
            <p className="text-[#F5C443] text-sm font-bold">{totalCommission.toLocaleString()} EGP</p>
            <p className="text-[#8E8E93] text-[10px]">عمولتي</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-[#636366]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث برقم التتبع أو التاجر أو العميل..."
          className="w-full bg-[#2C2C2E] text-white text-sm rounded-xl pr-9 pl-4 py-2.5 outline-none border border-transparent focus:border-[#F5C443] transition-colors placeholder:text-[#636366]"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              filter === tab.id
                ? 'bg-[#F5C443] text-[#1C1C1E]'
                : 'bg-[#2C2C2E] text-[#8E8E93] hover:text-white'
            }`}
          >
            {tab.label} ({counts[tab.id]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#2C2C2E] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#3A3A3C]">
                {['رقم التتبع', 'التاجر', 'العميل', 'المندوب', 'من', 'إلى', 'الحالة', 'التاريخ', 'المبلغ', 'العمولة'].map((h) => (
                  <th key={h} className="text-[#8E8E93] text-xs font-medium text-right px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A3A3C]">
              {filtered.map((s, i) => {
                const sc = statusConfig[s.status];
                return (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-[#3A3A3C] transition-colors"
                  >
                    <td className="px-4 py-3 text-white text-xs font-mono font-semibold">{s.trackingNumber}</td>
                    <td className="px-4 py-3 text-[#8E8E93] text-xs">{s.merchantName}</td>
                    <td className="px-4 py-3 text-[#8E8E93] text-xs">{s.customer}</td>
                    <td className="px-4 py-3 text-[#8E8E93] text-xs">{s.agent}</td>
                    <td className="px-4 py-3 text-[#8E8E93] text-xs whitespace-nowrap">{s.from}</td>
                    <td className="px-4 py-3 text-[#8E8E93] text-xs whitespace-nowrap">{s.to}</td>
                    <td className="px-4 py-3">
                      <span className={`${sc.bg} ${sc.text} text-[10px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap`}>{sc.label}</span>
                    </td>
                    <td className="px-4 py-3 text-[#8E8E93] text-xs whitespace-nowrap">{s.date}</td>
                    <td className="px-4 py-3 text-white text-xs font-semibold whitespace-nowrap">{s.amount} EGP</td>
                    <td className="px-4 py-3 text-[#F5C443] text-xs font-bold whitespace-nowrap">{s.commission} EGP</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-[#8E8E93] text-sm">لا توجد شحنات</div>
          )}
        </div>
      </div>
    </div>
  );
}
