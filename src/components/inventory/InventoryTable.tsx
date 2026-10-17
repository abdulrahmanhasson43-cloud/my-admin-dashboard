import { motion } from 'framer-motion';
import { PackageIcon, TransferIcon } from '@/components/icons';
import QRCodeButton from '@/components/QRCodeButton';
import { isLowStock, productQrValue } from '@/lib/inventory';
import type { Product } from '@/types';
import StockStatusBadge from './StockStatusBadge';

interface InventoryTableProps {
  /** The products to show (after search and category). */
  products: Product[];
  lowStockThreshold: number;
  onTransfer: (product: Product) => void;
}

/** The desktop / tablet layout: a table with a QR button and a transfer button per row. */
export default function InventoryTable({ products, lowStockThreshold, onTransfer }: InventoryTableProps) {
  return (
    <div className="card-vuno overflow-hidden">
      <div className="list-header">
        <span className="flex-1 min-w-0">المنتج</span>
        <span className="w-28 flex-shrink-0">الفئة</span>
        <span className="w-20 flex-shrink-0">بالمتجر</span>
        <span className="w-20 flex-shrink-0">بالمخزن</span>
        <span className="w-20 flex-shrink-0">الإجمالي</span>
        <span className="w-20 flex-shrink-0">الحالة</span>
        <span className="w-24 flex-shrink-0">إجراءات</span>
      </div>
      {products.map((item, i) => {
        const isLow = isLowStock(item, lowStockThreshold);
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(i * 0.05, 0.3) }}
            className="list-row"
          >
            <span className="flex-1 min-w-0 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                <PackageIcon size={14} className="text-[var(--vuno-primary)]" />
              </div>
              <span className="text-sm font-medium text-[var(--vuno-text)] truncate">{item.name}</span>
            </span>
            <span className="w-28 flex-shrink-0 text-sm text-[var(--vuno-text-secondary)]">{item.category}</span>
            <span className="w-20 flex-shrink-0 text-sm font-semibold text-[var(--vuno-text)]">{item.storeStock}</span>
            <span className="w-20 flex-shrink-0 text-sm text-[var(--vuno-text-secondary)]">{item.warehouseStock}</span>
            <span className="w-20 flex-shrink-0 text-sm text-[var(--vuno-text-muted)]">{item.stock}</span>
            <span className="w-20 flex-shrink-0">
              <StockStatusBadge isLow={isLow} className="px-2 py-1" />
            </span>
            <span className="w-24 flex-shrink-0 flex items-center gap-1.5">
              <QRCodeButton
                value={productQrValue(item)}
                label={`QR Code — ${item.name}`}
                iconSize={16}
                title="عرض QR Code"
              />
              <button
                onClick={() => onTransfer(item)}
                disabled={item.warehouseStock === 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--vuno-primary)] border border-[var(--vuno-primary)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--vuno-bg)] transition-colors"
                aria-label="نقل مخزون"
                title="نقل مخزون"
              >
                <TransferIcon size={14} />
              </button>
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
