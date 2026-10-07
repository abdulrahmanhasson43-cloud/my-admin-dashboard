import { useState } from 'react';
import { ReceiptIcon, DownloadIcon, PlusIcon, CashIcon } from '@/components/icons';
import StatsRow from '@/components/StatsRow';
import SearchBar from '@/components/SearchBar';
import InvoiceDetailModal from '@/components/invoice/InvoiceDetailModal';
import InvoiceBuilderPanel from '@/components/invoice/InvoiceBuilderPanel';
import InvoiceListRows from '@/components/invoice/InvoiceListRows';
import InvoiceMobileCards from '@/components/invoice/InvoiceMobileCards';
import { exportToExcel } from '@/lib/export-utils';
import { invoiceStatusConfig } from '@/constants/invoice';
import type { Invoice } from '@/types';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/context/products-context-value';
import { useInvoices } from '@/hooks/useInvoices';
import { useInvoiceBuilder } from '@/hooks/useInvoiceBuilder';

export default function InvoicePage() {
  const { invoices, isLoading, error, refetch, createInvoice } = useInvoices();
  const { clients } = useClients();
  const { products } = useProducts();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);

  const builder = useInvoiceBuilder({
    products,
    clients,
    createInvoice,
    onSaved: () => setBuilderOpen(false),
  });
  const { resetBuilder } = builder;

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.customer.includes(search) || inv.id.includes(search);
    const matchStatus = statusFilter === 'الكل' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalSales = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalInvoices = invoices.length;
  const paidCount = invoices.filter(i => i.status === 'paid').length;
  const pendingCount = invoices.filter(i => i.status === 'pending').length;

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
          {status === 'الكل' ? 'الكل' : invoiceStatusConfig[status]?.label ?? status}
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

      {/* مؤشّر الخطأ والتحميل — يعرض أي فشل في القراءة أو المعالجة بدلاً من ابتلاعه صامتاً */}
      {error && (
        <div
          className="flex items-center justify-between gap-3 rounded-[12px] border px-4 py-3"
          style={{
            borderColor: 'color-mix(in srgb, var(--vuno-danger) 30%, transparent)',
            background: 'color-mix(in srgb, var(--vuno-danger) 6%, transparent)',
          }}
        >
          <p className="text-[13px] text-[var(--vuno-danger)]">{error}</p>
          <button
            onClick={() => { refetch().catch(() => {}); }}
            className="text-[13px] font-semibold text-[var(--vuno-danger)] underline whitespace-nowrap"
          >
            إعادة المحاولة
          </button>
        </div>
      )}
      {isLoading && invoices.length === 0 && (
        <p className="text-[13px] text-[var(--vuno-text-secondary)]">جارٍ التحميل…</p>
      )}

      {/* Controls — صف البحث والإجراء الأساسي أولاً، وصف تانٍ للفلاتر والتصدير
          تحته — عشان صف البحث ميتزحمش بعدد كبير من الأزرار جنبه. */}
      <div className="space-y-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="ابحث برقم الفاتورة أو العميل..."
          actions={
            <button
              onClick={() => { resetBuilder(); setBuilderOpen(true); }}
              className="self-start px-5 py-2.5 rounded-full btn-primary-pill text-white font-medium flex items-center gap-2 whitespace-nowrap flex-shrink-0"
            >
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
                'الحالة': invoiceStatusConfig[inv.status]?.label ?? inv.status,
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

      {selectedInvoice && (
        <InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}

      <InvoiceBuilderPanel
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        builder={builder}
        clients={clients}
      />

      <InvoiceListRows invoices={filtered} onSelect={setSelectedInvoice} />
      <InvoiceMobileCards invoices={filtered} onSelect={setSelectedInvoice} />
    </div>
  );
}
