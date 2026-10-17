import { motion } from 'framer-motion';
import { EyeIcon, DownloadIcon } from '@/components/icons';
import QRCodeButton from '@/components/QRCodeButton';
import WhatsAppShareButton from '@/components/WhatsAppShareButton';
import { formatEnglishDate } from '@/lib/utils';
import { getMethodIcon } from '@/components/invoice/paymentMethodIcon';
import InvoiceStatusBadge from '@/components/invoice/InvoiceStatusBadge';
import type { Invoice } from '@/types';

interface InvoiceListRowsProps {
  invoices: Invoice[];
  onSelect: (invoice: Invoice) => void;
}

/** Desktop table of invoices (hidden on mobile — see InvoiceMobileCards). */
export default function InvoiceListRows({ invoices, onSelect }: InvoiceListRowsProps) {
  return (
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
    {invoices.map((inv, i) => {
      const MethodIcon = getMethodIcon(inv.method);
      return (
        <motion.div
          key={inv.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: Math.min(i * 0.05, 0.3) }}
          className="list-row cursor-pointer"
          onClick={() => onSelect(inv)}
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
            <InvoiceStatusBadge status={inv.status} className="px-2 py-1" />
          </span>
          <span className="w-24 flex-shrink-0 flex items-center gap-1">
            <div onClick={e => e.stopPropagation()}>
              <QRCodeButton value={`vuno:invoice:${inv.id}`} label={`رمز QR للفاتورة ${inv.id}`} iconSize={14} />
              <WhatsAppShareButton invoice={inv} variant="icon" size="sm" />
            </div>
            <button className="p-1.5 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-primary)]" onClick={e => { e.stopPropagation(); onSelect(inv); }}>
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
  );
}
