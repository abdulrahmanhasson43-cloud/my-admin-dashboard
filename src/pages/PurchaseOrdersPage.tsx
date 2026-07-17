import { useState } from 'react';
import { motion } from 'framer-motion';
import { PurchaseOrdersIcon, PlusIcon, SearchIcon, EyeIcon, EditIcon } from '@/components/icons';
import { sampleOrders } from '@/services/mock';

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');

  const filtered = sampleOrders.filter(o => {
    const matchSearch = o.supplier.includes(search) || o.id.includes(search);
    const matchStatus = statusFilter === 'الكل' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الطلبات', value: sampleOrders.length.toString(), color: 'bg-blue-50 text-blue-500' },
          { label: 'معلقة', value: sampleOrders.filter(o => o.status === 'pending').length.toString(), color: 'bg-amber-50 text-amber-500' },
          { label: 'معتمدة', value: sampleOrders.filter(o => o.status === 'approved').length.toString(), color: 'bg-emerald-50 text-emerald-500' },
          { label: 'إجمالي القيمة', value: `${(sampleOrders.reduce((s, o) => s + o.total, 0) / 1000).toFixed(1)}K EGP`, color: 'bg-orange-50 text-[var(--vuno-primary)]' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.1, 0.3) }} className="card-vuno p-4">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}><PurchaseOrdersIcon size={18} /></div>
            <p className="text-xs text-[var(--vuno-text-muted)] mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-[var(--vuno-text)]">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--vuno-text-muted)]" />
          <input type="text" placeholder="ابحث..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pr-10 pl-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-white text-sm focus:border-[var(--vuno-primary)] transition-colors" />
        </div>
        <div className="flex gap-2">
          {['الكل', 'pending', 'approved', 'received'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${statusFilter === s ? 'gradient-btn text-white' : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-gray-50'}`}>
              {s === 'الكل' ? 'الكل' : s === 'pending' ? 'معلقة' : s === 'approved' ? 'معتمدة' : 'مستلمة'}
            </button>
          ))}
        </div>
        <button className="self-start px-5 py-2.5 rounded-xl gradient-btn text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"><PlusIcon size={16} /> طلب جديد</button>
      </div>

      <div className="card-vuno overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-[var(--vuno-border)]">
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">رقم الطلب</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">المورد</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">المنتجات</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">الإجمالي</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">التاريخ</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">الحالة</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => (
                <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.05, 0.3) }} className="border-b border-[var(--vuno-border-light)] last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-sm font-mono text-[var(--vuno-text)]">{order.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[var(--vuno-text)]">{order.supplier}</td>
                  <td className="px-4 py-3 text-sm text-[var(--vuno-text-muted)]">{order.items}</td>
                  <td className="px-4 py-3 text-sm font-bold text-[var(--vuno-primary)]">{order.total.toLocaleString()} EGP</td>
                  <td className="px-4 py-3 text-xs text-[var(--vuno-text-muted)]">{order.date}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${order.status === 'pending' ? 'bg-amber-100 text-amber-600' : order.status === 'approved' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>{order.status === 'pending' ? 'معلقة' : order.status === 'approved' ? 'معتمدة' : 'مستلمة'}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1"><button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><EyeIcon size={14} /></button><button className="p-1.5 rounded-lg hover:bg-orange-50 text-[var(--vuno-primary)]"><EditIcon size={14} /></button></div></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
