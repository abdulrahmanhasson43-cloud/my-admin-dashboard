import type { RefObject } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, PlusIcon } from '@/components/icons';
import { ThermalReceipt, ShareReceiptButton, PrintReceiptButton, defaultReceiptSettings } from '@/components/ThermalReceipt';
import type { CompletedSale } from '@/types';

interface SaleCompleteViewProps {
  sale: CompletedSale;
  /** Owned by the page (the print shortcut reads it), shared with the receipt. */
  receiptRef: RefObject<HTMLDivElement | null>;
  onNewSale: () => void;
}

/** The screen shown after a successful sale: confirmation, receipt, share/print/new sale. */
export default function SaleCompleteView({ sale, receiptRef, onNewSale }: SaleCompleteViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-[340px] mx-auto"
    >
      {/* Success header — minimal, Apple-style */}
      <div className="text-center mb-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: 'color-mix(in srgb, var(--vuno-success) 14%, transparent)' }}
        >
          <CheckCircleIcon size={28} className="text-[var(--vuno-success)]" />
        </motion.div>
        <h2 className="text-[20px] font-semibold text-[var(--vuno-text)] tracking-tight">تم الدفع بنجاح</h2>
        <p className="text-[13px] text-[var(--vuno-text-muted)] mt-0.5">
          فاتورة رقم {sale.id} · {sale.total.toLocaleString()} EGP
        </p>
      </div>

      {/* Thermal receipt preview — looks like a real receipt */}
      <div className="flex justify-center mb-5">
        <div
          className="rounded-[6px] overflow-hidden"
          style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}
        >
          <ThermalReceipt
            ref={receiptRef}
            invoice={sale}
            settings={defaultReceiptSettings}
          />
        </div>
      </div>

      {/* Actions — share as image (WhatsApp) + print + new invoice */}
      <div className="flex gap-2.5">
        <ShareReceiptButton receiptRef={receiptRef} />
        <PrintReceiptButton receiptRef={receiptRef} />
        <button
          onClick={onNewSale}
          className="flex-1 h-11 rounded-full font-semibold text-[15px] transition-transform active:scale-95 flex items-center justify-center gap-2"
          style={{
            border: '1px solid var(--vuno-border)',
            color: 'var(--vuno-text)',
            background: 'var(--vuno-surface)',
          }}
        >
          <PlusIcon size={16} />
          فاتورة جديدة
        </button>
      </div>
    </motion.div>
  );
}
