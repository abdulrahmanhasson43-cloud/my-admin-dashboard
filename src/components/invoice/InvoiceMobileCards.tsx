import { motion } from 'framer-motion';
import { EyeIcon } from '@/components/icons';
import QRCodeButton from '@/components/QRCodeButton';
import WhatsAppShareButton from '@/components/WhatsAppShareButton';
import { formatEnglishDate } from '@/lib/utils';
import { getMethodIcon } from '@/components/invoice/paymentMethodIcon';
import InvoiceStatusBadge from '@/components/invoice/InvoiceStatusBadge';
import type { Invoice } from '@/types';

interface InvoiceMobileCardsProps {
  invoices: Invoice[];
  onSelect: (invoice: Invoice) => void;
}

/** Mobile list of invoices as cards (hidden on desktop — see InvoiceListRows). */
export default function InvoiceMobileCards({ invoices, onSelect }: InvoiceMobileCardsProps) {
  return (
  <div className="md:hidden space-y-3">
    {invoices.map((inv, i) => {
      const MethodIcon = getMethodIcon(inv.method);
      return (
        <motion.div
          key={inv.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.05, 0.3) }}
          className="card-vuno p-4"
          onClick={() => onSelect(inv)}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-mono font-bold text-[var(--vuno-text)]">{inv.id}</p>
              <p className="text-xs text-[var(--vuno-text-muted)] mt-0.5">{inv.customer}</p>
            </div>
            <InvoiceStatusBadge status={inv.status} className="px-2 py-1" />
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
              <WhatsAppShareButton invoice={inv} variant="icon" size="sm" />
              <button className="p-1.5 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-primary)]" onClick={() => onSelect(inv)}>
                <EyeIcon size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      );
    })}
    {invoices.length === 0 && (
      <div className="card-vuno p-8 text-center text-[var(--vuno-text-muted)] text-sm">لا توجد فواتير مطابقة</div>
    )}
  </div>
  );
}
