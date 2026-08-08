import { useState } from 'react';
import { motion } from 'framer-motion';
import { PurchaseOrdersIcon, PlusIcon, EyeIcon, EditIcon } from '@/components/icons';
import StatsRow from '@/components/StatsRow';
import SearchBar from '@/components/SearchBar';
import QRCodeButton from '@/components/QRCodeButton';
import { sampleOrders } from '@/services/mock';
import { formatArabicDate } from '@/lib/utils';

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');

  const filtered = sampleOrders.filter(o => {
    const matchSearch = o.supplier.includes(search) || o.id.includes(search);
    const matchStatus = statusFilter === 'الكل' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusButtons = (
    <div className="flex gap-2 overflow-x-auto scrollbar-hidden">
      {['الكل', 'pending', 'approved', 'received'].map(s => (
        <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${statusFilter === s ? 'gradient-btn text-white' : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-gray-50'}`}>
          {s === 'الكل' ? 'الكل' : s === 'pending' ? 'معلقة' : s === 'approved' ? 'معتمدة' : 'مستلمة'}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <StatsRow
        maxCols={4}
        items={[
          { label: 'إجمالي الطلبات', value: sampleOrders.length.toString(), icon: PurchaseOrdersIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
          { label: 'معلقة', value: sampleOrders.filter(o => o.status === 'pending').length.toString(), icon: PurchaseOrdersIcon, color: 'bg-amber-50 text-amber-500' },
          { label: 'معتمدة', value: sampleOrders.filter(o => o.status === 'approved').length.toString(), icon: PurchaseOrdersIcon, color: 'bg-emerald-50 text-emerald-500' },
          { label: 'إجمالي القيمة', value: `${(sampleOrders.reduce((s, o) => s + o.total, 0) / 1000).toFixed(1)}K EGP`, icon: PurchaseOrdersIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
        ]}
      />

      <div className="space-y-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="ابحث برقم الطلب أو المورد..."
          actions={
            <button className="px-5 py-2.5 rounded-xl gradient-btn text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0">
              <PlusIcon size={16} /> طلب جديد
            </button>
          }
          qrValue={`vuno:purchase-orders:${sampleOrders.length}`}
          qrLabel="رمز QR لصفحة أوامر الشراء"
        />
        {statusButtons}
      </div>

      {/* Desktop list */}
      <div className="hidden md:block card-vuno overflow-hidden">
        <div className="list-header">
          <span className="w-20 flex-shrink-0">رقم الطلب</span>
          <span className="flex-1 min-w-0">المورد</span>
          <span className="w-20 flex-shrink-0 text-center">المنتجات</span>
          <span className="w-28 flex-shrink-0">الإجمالي</span>
          <span className="w-28 flex-shrink-0">التاريخ</span>
          <span className="w-24 flex-shrink-0">الحالة</span>
          <span className="w-24 flex-shrink-0">إجراءات</span>
        </div>
        {filtered.map((order, i) => (
          <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.05, 0.3) }} className="list-row">
            <span className="w-20 flex-shrink-0 text-sm font-medium text-[var(--vuno-text)]">{order.id}</span>
            <span className="flex-1 min-w-0 text-sm font-medium text-[var(--vuno-text)] truncate">{order.supplier}</span>
            <span className="w-20 flex-shrink-0 text-sm text-[var(--vuno-text-muted)] text-center">{order.items}</span>
            <span className="w-28 flex-shrink-0 text-sm font-bold text-[var(--vuno-primary)]">{order.total.toLocaleString()} EGP</span>
            <span className="w-28 flex-shrink-0 text-xs text-[var(--vuno-text-muted)]">{formatArabicDate(order.date, false)}</span>
            <span className="w-24 flex-shrink-0"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${order.status === 'pending' ? 'bg-amber-100 text-amber-600' : order.status === 'approved' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>{order.status === 'pending' ? 'معلقة' : order.status === 'approved' ? 'معتمدة' : 'مستلمة'}</span></span>
            <span className="w-24 flex-shrink-0 flex items-center gap-1.5">
              <QRCodeButton value={`vuno:po:${order.id}`} label={`رمز QR للطلب ${order.id}`} iconSize={14} />
              <button className="p-1.5 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-primary)]"><EyeIcon size={14} /></button>
              <button className="p-1.5 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-primary)]"><EditIcon size={14} /></button>
            </span>
          </motion.div>
        ))}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((order, i) => (
          <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.3) }} className="card-vuno p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-mono font-bold text-[var(--vuno-text)]">{order.id}</p>
                <p className="text-xs text-[var(--vuno-text-muted)] mt-0.5">{order.supplier}</p>
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${order.status === 'pending' ? 'bg-amber-100 text-amber-600' : order.status === 'approved' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>{order.status === 'pending' ? 'معلقة' : order.status === 'approved' ? 'معتمدة' : 'مستلمة'}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[var(--vuno-border-light)]">
              <span className="text-xs text-[var(--vuno-text-muted)]">{order.items} منتج • {formatArabicDate(order.date, false)}</span>
              <p className="text-base font-bold text-[var(--vuno-primary)]">{order.total.toLocaleString()} EGP</p>
            </div>
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[var(--vuno-border-light)]">
              <QRCodeButton value={`vuno:po:${order.id}`} label={`رمز QR للطلب ${order.id}`} iconSize={14} />
              <button className="p-1.5 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-primary)]"><EyeIcon size={16} /></button>
              <button className="p-1.5 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-primary)]"><EditIcon size={16} /></button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="card-vuno p-8 text-center text-[var(--vuno-text-muted)] text-sm">لا توجد طلبات مطابقة</div>
        )}
      </div>
    </div>
  );
}
