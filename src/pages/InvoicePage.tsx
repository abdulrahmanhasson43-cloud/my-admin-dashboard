import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon, ReceiptIcon, EyeIcon, DownloadIcon,
  CashIcon, CardIcon, WalletIcon, InstaPayIcon, ApplePayIcon
} from '@/components/icons';
import StatsRow from '@/components/StatsRow';
import SearchBar from '@/components/SearchBar';
import QRCodeButton, { QRCodeInline } from '@/components/QRCodeButton';
import { exportToExcel } from '@/lib/export-utils';
import { formatEnglishDate } from '@/lib/utils';
import type { Invoice } from '@/types';
import { sampleInvoices } from '@/services/mock';

const getMethodIcon = (method: string) => {
  switch (method) {
    case 'كاش': return CashIcon;
    case 'بطاقة': return CardIcon;
    case 'محفظة': return WalletIcon;
    case 'إنستاباي': return InstaPayIcon;
    case 'Apple Pay': return ApplePayIcon;
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

  const statusButtons = (
    <div className="flex gap-2 overflow-x-auto scrollbar-hidden">
      {['الكل', 'paid', 'pending', 'cancelled'].map(status => (
        <button
          key={status}
          onClick={() => setStatusFilter(status)}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
            statusFilter === status
              ? 'gradient-btn text-white'
              : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-gray-50'
          }`}
        >
          {status === 'الكل' ? 'الكل' : status === 'paid' ? 'مدفوعة' : status === 'pending' ? 'معلقة' : 'ملغاة'}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats — horizontal cards */}
      <StatsRow
        maxCols={4}
        items={[
          { label: 'إجمالي الفواتير', value: totalInvoices.toString(), icon: ReceiptIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
          { label: 'إجمالي المبيعات', value: `${(totalSales / 1000).toFixed(1)}K EGP`, icon: CashIcon, color: 'bg-emerald-50 text-emerald-500' },
          { label: 'المدفوعة', value: paidCount.toString(), icon: ReceiptIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
          { label: 'المعلقة', value: pendingCount.toString(), icon: ReceiptIcon, color: 'bg-amber-50 text-amber-500' },
        ]}
      />

      {/* Controls — صف البحث والإجراء الأساسي أولاً، وصف تانٍ للفلاتر والتصدير
          تحته — عشان صف البحث ميتزحمش بعدد كبير من الأزرار جنبه. */}
      <div className="space-y-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="ابحث برقم الفاتورة أو العميل..."
          actions={
            <button className="self-start px-5 py-2.5 rounded-full btn-primary-pill text-white font-medium flex items-center gap-2 whitespace-nowrap flex-shrink-0">
              <PlusIcon size={16} />
              فاتورة جديدة
            </button>
          }
          qrValue={`vuno:invoices:${totalInvoices}`}
          qrLabel="رمز QR لصفحة الفواتير"
        />

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hidden">
          {statusButtons}
          <button
            onClick={() => exportToExcel(
              filtered.map(inv => ({
                'رقم الفاتورة': inv.id,
                'العميل': inv.customer,
                'المبلغ': inv.amount,
                'الضريبة': inv.tax,
                'الإجمالي': inv.total,
                'طريقة الدفع': inv.method,
                'التاريخ': inv.date,
                'الحالة': inv.status === 'paid' ? 'مدفوعة' : inv.status === 'pending' ? 'معلقة' : 'ملغاة',
              })),
              'فواتير-Vuno',
              'الفواتير',
            )}
            className="px-4 py-2.5 rounded-full font-medium flex items-center gap-2 transition-transform active:scale-95 whitespace-nowrap flex-shrink-0"
            style={{ border: '1px solid var(--vuno-border)', color: 'var(--vuno-text)', background: 'var(--vuno-surface)' }}
          >
            <DownloadIcon size={16} />
            تصدير
          </button>
        </div>
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
            className="invoice-print-area bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[var(--vuno-surface-pearl)] flex items-center justify-center mx-auto mb-3">
                <ReceiptIcon size={28} className="text-[var(--vuno-primary)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--vuno-text)]">{selectedInvoice.id}</h3>
              <p className="text-sm text-[var(--vuno-text-muted)]">{formatEnglishDate(selectedInvoice.date)}</p>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between"><span className="text-[var(--vuno-text-muted)]">العميل</span><span className="font-medium">{selectedInvoice.customer}</span></div>
              <div className="flex justify-between"><span className="text-[var(--vuno-text-muted)]">المبلغ</span><span className="font-medium">{selectedInvoice.amount.toLocaleString()} EGP</span></div>
              <div className="flex justify-between"><span className="text-[var(--vuno-text-muted)]">الضريبة</span><span className="font-medium">{selectedInvoice.tax.toLocaleString()} EGP</span></div>
              <div className="flex justify-between border-t pt-2"><span className="font-bold">الإجمالي</span><span className="font-bold text-[var(--vuno-primary)]">{selectedInvoice.total.toLocaleString()} EGP</span></div>
            </div>

            {/* QR code for invoice — يظهر مباشرة، بدون ضغطة إضافية */}
            <div className="flex justify-center mb-6">
              <QRCodeInline value={`vuno:invoice:${selectedInvoice.id}`} />
            </div>

            <button
              onClick={() => setSelectedInvoice(null)}
              className="w-full py-3 rounded-xl gradient-btn text-white font-semibold"
            >
              إغلاق
            </button>
            <button
              onClick={() => window.print()}
              className="w-full mt-2 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 print:hidden"
              style={{ border: '1px solid var(--vuno-border)', color: 'var(--vuno-text)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect width="12" height="8" x="6" y="14" />
              </svg>
              طباعة الفاتورة
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Invoices — modern list rows on desktop, hidden on mobile (cards below) */}
      <div className="hidden md:block card-vuno overflow-hidden">
        <div className="list-header">
          <span className="w-24 flex-shrink-0">رقم الفاتورة</span>
          <span className="flex-1 min-w-0">العميل</span>
          <span className="w-20 flex-shrink-0 text-center">المنتجات</span>
          <span className="w-28 flex-shrink-0">المبلغ</span>
          <span className="w-28 flex-shrink-0">الإجمالي</span>
          <span className="w-28 flex-shrink-0">الدفع</span>
          <span className="w-36 flex-shrink-0">التاريخ</span>
          <span className="w-20 flex-shrink-0">الحالة</span>
          <span className="w-24 flex-shrink-0">إجراءات</span>
        </div>
        {filtered.map((inv, i) => {
          const MethodIcon = getMethodIcon(inv.method);
          return (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              className="list-row cursor-pointer"
              onClick={() => setSelectedInvoice(inv)}
            >
              <span className="w-24 flex-shrink-0 text-sm font-medium text-[var(--vuno-text)]">{inv.id}</span>
              <span className="flex-1 min-w-0 text-sm font-medium text-[var(--vuno-text)] truncate">{inv.customer}</span>
              <span className="w-20 flex-shrink-0 text-sm text-[var(--vuno-text-muted)] text-center">{inv.items}</span>
              <span className="w-28 flex-shrink-0 text-sm text-[var(--vuno-text)]">{inv.amount.toLocaleString()} EGP</span>
              <span className="w-28 flex-shrink-0 text-sm font-bold text-[var(--vuno-primary)]">{inv.total.toLocaleString()} EGP</span>
              <span className="w-28 flex-shrink-0 flex items-center gap-1.5">
                <MethodIcon size={14} className="text-[var(--vuno-text-muted)]" />
                <span className="text-xs text-[var(--vuno-text-secondary)]">{inv.method}</span>
              </span>
              <span className="w-36 flex-shrink-0 text-xs text-[var(--vuno-text-muted)]">{formatEnglishDate(inv.date)}</span>
              <span className="w-20 flex-shrink-0">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  inv.status === 'paid' ? 'bg-emerald-100 text-emerald-600' :
                  inv.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'pending' ? 'معلقة' : 'ملغاة'}
                </span>
              </span>
              <span className="w-24 flex-shrink-0 flex items-center gap-1">
                <div onClick={e => e.stopPropagation()}>
                  <QRCodeButton value={`vuno:invoice:${inv.id}`} label={`رمز QR للفاتورة ${inv.id}`} iconSize={14} />
                </div>
                <button className="p-1.5 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-primary)]" onClick={e => { e.stopPropagation(); setSelectedInvoice(inv); }}>
                  <EyeIcon size={14} />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-green-50 text-green-500" onClick={e => e.stopPropagation()}>
                  <DownloadIcon size={14} />
                </button>
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile invoice cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((inv, i) => {
          const MethodIcon = getMethodIcon(inv.method);
          return (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              className="card-vuno p-4"
              onClick={() => setSelectedInvoice(inv)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-mono font-bold text-[var(--vuno-text)]">{inv.id}</p>
                  <p className="text-xs text-[var(--vuno-text-muted)] mt-0.5">{inv.customer}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  inv.status === 'paid' ? 'bg-emerald-100 text-emerald-600' :
                  inv.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'pending' ? 'معلقة' : 'ملغاة'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[var(--vuno-border-light)]">
                <div className="flex items-center gap-1.5">
                  <MethodIcon size={14} className="text-[var(--vuno-text-muted)]" />
                  <span className="text-xs text-[var(--vuno-text-secondary)]">{inv.method}</span>
                  <span className="text-xs text-[var(--vuno-text-muted)]">• {inv.items} منتج</span>
                </div>
                <p className="text-base font-bold text-[var(--vuno-primary)]">{inv.total.toLocaleString()} EGP</p>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--vuno-border-light)]">
                <span className="text-xs text-[var(--vuno-text-muted)]">{formatEnglishDate(inv.date)}</span>
                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                  <QRCodeButton value={`vuno:invoice:${inv.id}`} label={`رمز QR للفاتورة ${inv.id}`} iconSize={14} />
                  <button className="p-1.5 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-primary)]" onClick={() => setSelectedInvoice(inv)}>
                    <EyeIcon size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card-vuno p-8 text-center text-[var(--vuno-text-muted)] text-sm">لا توجد فواتير مطابقة</div>
        )}
      </div>
    </div>
  );
}
