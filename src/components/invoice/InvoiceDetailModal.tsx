import { motion } from 'framer-motion';
import { ReceiptIcon, PrintIcon } from '@/components/icons';
import { QRCodeInline } from '@/components/QRCodeButton';
import WhatsAppShareButton from '@/components/WhatsAppShareButton';
import { formatEnglishDate } from '@/lib/utils';
import type { Invoice } from '@/types';

interface InvoiceDetailModalProps {
  invoice: Invoice;
  onClose: () => void;
}

/** Full-screen details of one invoice: amounts, QR code, print and WhatsApp share. */
export default function InvoiceDetailModal({ invoice, onClose }: InvoiceDetailModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => onClose()}
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
          <h3 className="text-xl font-bold text-[var(--vuno-text)]">{invoice.id}</h3>
          <p className="text-sm text-[var(--vuno-text-muted)]">{formatEnglishDate(invoice.date)}</p>
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between"><span className="text-[var(--vuno-text-muted)]">العميل</span><span className="font-medium">{invoice.customer}</span></div>
          <div className="flex justify-between"><span className="text-[var(--vuno-text-muted)]">المبلغ</span><span className="font-medium">{invoice.amount.toLocaleString()} EGP</span></div>
          <div className="flex justify-between"><span className="text-[var(--vuno-text-muted)]">الضريبة</span><span className="font-medium">{invoice.tax.toLocaleString()} EGP</span></div>
          <div className="flex justify-between border-t pt-2"><span className="font-bold">الإجمالي</span><span className="font-bold text-[var(--vuno-primary)]">{invoice.total.toLocaleString()} EGP</span></div>
        </div>

        {/* QR code for invoice — يظهر مباشرة، بدون ضغطة إضافية */}
        <div className="flex justify-center mb-6">
          <QRCodeInline value={`vuno:invoice:${invoice.id}`} />
        </div>

        <button
          onClick={() => onClose()}
          className="w-full py-3 rounded-xl gradient-btn text-white font-semibold"
        >
          إغلاق
        </button>
        <button
          onClick={() => window.print()}
          className="w-full mt-2 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 print:hidden"
          style={{ border: '1px solid var(--vuno-border)', color: 'var(--vuno-text)' }}
        >
          <PrintIcon size={16} />
          طباعة الفاتورة
        </button>
        {/* WhatsApp Share (Idea #21) */}
        <div className="w-full mt-2 print:hidden">
          <WhatsAppShareButton
            invoice={invoice}
            variant="pill"
            label="مشاركة عبر واتساب"
            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 !text-white"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
