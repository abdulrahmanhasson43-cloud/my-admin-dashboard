import { motion } from 'framer-motion';
import { TransferIcon, CheckCircleIcon, XIcon } from '@/components/icons';
import type { PendingTransfer } from '@/context/products-context-value';
import type { Product } from '@/types';

interface PendingTransfersCardProps {
  /** Moves waiting for a manager's OK. Nothing is drawn when the list is empty. */
  pendingTransfers: PendingTransfer[];
  products: Product[];
  onConfirm: (transferId: string) => void;
  onCancel: (transferId: string) => void;
}

/** Warehouse → shop moves that wait for confirmation, each with confirm / cancel. */
export default function PendingTransfersCard({ pendingTransfers, products, onConfirm, onCancel }: PendingTransfersCardProps) {
  if (pendingTransfers.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-vuno p-4">
      <h3 className="font-bold text-[var(--vuno-text)] mb-3 flex items-center gap-2">
        <TransferIcon size={16} className="text-[var(--vuno-primary)]" />
        نقلات مخزون معلّقة — محتاجة تأكيد
      </h3>
      <div className="space-y-2">
        {pendingTransfers.map(t => {
          const product = products.find(p => p.id === t.productId);
          return (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--vuno-bg)]">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--vuno-text)] truncate">{product?.name ?? 'منتج محذوف'}</p>
                <p className="text-xs text-[var(--vuno-text-muted)]">نقل {t.quantity} قطعة من المخزن للمتجر · {t.createdAt}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => { onConfirm(t.id); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50"
                  aria-label="تأكيد"
                >
                  <CheckCircleIcon size={16} />
                </button>
                <button
                  onClick={() => { onCancel(t.id); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50"
                  aria-label="إلغاء"
                >
                  <XIcon size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
