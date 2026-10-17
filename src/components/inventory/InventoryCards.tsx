import { motion } from 'framer-motion';
import { PackageIcon, TransferIcon } from '@/components/icons';
import QRCodeButton from '@/components/QRCodeButton';
import { isLowStock, productQrValue } from '@/lib/inventory';
import type { Product } from '@/types';
import StockStatusBadge from './StockStatusBadge';

interface InventoryCardsProps {
  /** The products to show (after search and category). */
  products: Product[];
  lowStockThreshold: number;
  onTransfer: (product: Product) => void;
}

/** The phone layout: one card per product with its three stock numbers, a transfer button and a QR button. */
export default function InventoryCards({ products, lowStockThreshold, onTransfer }: InventoryCardsProps) {
  return (
    <div className="space-y-3">
      {products.map((item, i) => {
        const isLow = isLowStock(item, lowStockThreshold);
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.3) }}
            className="card-vuno p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PackageIcon size={18} className="text-[var(--vuno-primary)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--vuno-text)] truncate">{item.name}</p>
                  <p className="text-xs text-[var(--vuno-text-muted)]">{item.category}</p>
                </div>
              </div>
              <StockStatusBadge isLow={isLow} className="px-2 py-1 flex-shrink-0" />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="rounded-xl bg-[var(--vuno-bg)] p-2.5 text-center">
                <p className="text-[10px] text-[var(--vuno-text-muted)] mb-0.5">بالمتجر</p>
                <p className="text-sm font-bold text-[var(--vuno-text)]">{item.storeStock}</p>
              </div>
              <div className="rounded-xl bg-[var(--vuno-bg)] p-2.5 text-center">
                <p className="text-[10px] text-[var(--vuno-text-muted)] mb-0.5">بالمخزن</p>
                <p className="text-sm font-bold text-[var(--vuno-text)]">{item.warehouseStock}</p>
              </div>
              <div className="rounded-xl bg-[var(--vuno-bg)] p-2.5 text-center">
                <p className="text-[10px] text-[var(--vuno-text-muted)] mb-0.5">الإجمالي</p>
                <p className="text-sm font-bold text-[var(--vuno-text)]">{item.stock}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onTransfer(item)}
                disabled={item.warehouseStock === 0}
                className="flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-[var(--vuno-primary)] border border-[var(--vuno-primary)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--vuno-bg)] transition-colors text-sm font-medium"
                aria-label="نقل مخزون"
              >
                <TransferIcon size={16} />
                نقل مخزون
              </button>
              <QRCodeButton
                value={productQrValue(item)}
                label={`QR Code — ${item.name}`}
                iconSize={18}
                title="عرض QR Code"
              />
            </div>
          </motion.div>
        );
      })}
      {products.length === 0 && (
        <div className="card-vuno p-10 text-center text-[var(--vuno-text-muted)]">
          <PackageIcon size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">لا توجد منتجات مطابقة</p>
        </div>
      )}
    </div>
  );
}
