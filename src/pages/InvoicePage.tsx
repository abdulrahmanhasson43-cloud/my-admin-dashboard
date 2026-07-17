import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  SearchIcon, PlusIcon, ReceiptIcon, EyeIcon, DownloadIcon,
  CashIcon, CardIcon, WalletIcon, InstaPayIcon
} from '@/components/icons';
import type { Invoice } from '@/types';
import { sampleInvoices } from '@/services/mock';

const getMethodIcon = (method: string) => {
  switch (method) {
    case 'كاش': return CashIcon;
    case 'بطاقة': return CardIcon;
    case 'محفظة': return WalletIcon;
    case 'إنستاباي': return InstaPayIcon;
    default: return CashIcon;
  }
};

export default function InvoicePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filtered = sampleInvoices.filter(inv => {
    const matchSearch = inv.customer.includes(search) || inv.id.includes(search);
    const matchStatus = statusFilter === 'الكل' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalSales = sampleInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalInvoices = sampleInvoices.length;
  const paidCount = sampleInvoices.filter(i => i.status === 'paid').length;
  const pendingCount = sampleInvoices.filter(i => i.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الفواتير', value: totalInvoices.toString(), icon: ReceiptIcon, color: 'bg-blue-50 text-blue-500' },
          { label: 'إجمالي المبيعات', value: `${(totalSales / 1000).toFixed(1)}K EGP`, icon: CashIcon, color: 'bg-emerald-50 text-emerald-500' },
          { label: 'المدفوعة', value: paidCount.toString(), icon: ReceiptIcon, color: 'bg-orange-50 text-[var(--vuno-primary)]' },
          { label: 'المعلقة', value: pendingCount.toString(), icon: ReceiptIcon, color: 'bg-amber-50 text-amber-500' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.1, 0.3) }}
              className="card-vuno p-4"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <Icon size={18} />
              </div>
              <p className="text-xs text-[var(--vuno-text-muted)] mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-[var(--vuno-text)]">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--vuno-text-muted)]" />
          <input
            type="text"
            placeholder="ابحث برقم الفاتورة أو العميل..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-white text-sm focus:border-[var(--vuno-primary)] transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {['الكل', 'paid', 'pending', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'gradient-btn text-white'
                  : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-gray-50'
              }`}
            >
              {status === 'الكل' ? 'الكل' : status === 'paid' ? 'مدفوعة' : status === 'pending' ? 'معلقة' : 'ملغاة'}
            </button>
          ))}
        </div>
        <button className="self-start px-5 py-2.5 rounded-xl gradient-btn text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <PlusIcon size={16} />
          فاتورة جديدة
        </button>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedInvoice(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
                <ReceiptIcon size={28} className="text-[var(--vuno-primary)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--vuno-text)]">{selectedInvoice.id}</h3>
              <p className="text-sm text-[var(--vuno-text-muted)]">{selectedInvoice.date}</p>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between"><span className="text-[var(--vuno-text-muted)]">العميل</span><span className="font-medium">{selectedInvoice.customer}</span></div>
              <div className="flex justify-between"><span className="text-[var(--vuno-text-muted)]">المبلغ</span><span className="font-medium">{selectedInvoice.amount.toLocaleString()} EGP</span></div>
              <div className="flex justify-between"><span className="text-[var(--vuno-text-muted)]">الضريبة</span><span className="font-medium">{selectedInvoice.tax.toLocaleString()} EGP</span></div>
              <div className="flex justify-between border-t pt-2"><span className="font-bold">الإجمالي</span><span className="font-bold text-[var(--vuno-primary)]">{selectedInvoice.total.toLocaleString()} EGP</span></div>
            </div>
            <button
              onClick={() => setSelectedInvoice(null)}
              className="w-full py-3 rounded-xl gradient-btn text-white font-semibold"
            >
              إغلاق
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Invoices Table */}
      <div className="card-vuno overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-[var(--vuno-border)]">
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">رقم الفاتورة</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">العميل</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">المنتجات</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">المبلغ</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">الإجمالي</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">الدفع</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">التاريخ</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">الحالة</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, i) => {
                const MethodIcon = getMethodIcon(inv.method);
                return (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.05, 0.3) }}
                    className="border-b border-[var(--vuno-border-light)] last:border-0 hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-[var(--vuno-text)]">{inv.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[var(--vuno-text)]">{inv.customer}</td>
                    <td className="px-4 py-3 text-sm text-[var(--vuno-text-muted)]">{inv.items}</td>
                    <td className="px-4 py-3 text-sm text-[var(--vuno-text)]">{inv.amount.toLocaleString()} EGP</td>
                    <td className="px-4 py-3 text-sm font-bold text-[var(--vuno-primary)]">{inv.total.toLocaleString()} EGP</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <MethodIcon size={14} className="text-[var(--vuno-text-muted)]" />
                        <span className="text-xs text-[var(--vuno-text-secondary)]">{inv.method}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--vuno-text-muted)]">{inv.date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        inv.status === 'paid' ? 'bg-emerald-100 text-emerald-600' :
                        inv.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'pending' ? 'معلقة' : 'ملغاة'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500" onClick={e => { e.stopPropagation(); setSelectedInvoice(inv); }}>
                          <EyeIcon size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-green-50 text-green-500" onClick={e => e.stopPropagation()}>
                          <DownloadIcon size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
