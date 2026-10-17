import { motion } from 'framer-motion';
import { PackageIcon, TruckIcon, ArrowLeftIcon } from '@/components/icons';
import type { Product } from '@/types';

interface WarehousePanelProps {
  /** The products currently shown (after search and category). Only those with warehouse stock are listed. */
  products: Product[];
  onDragStart: (product: Product) => void;
  onDragEnd: () => void;
  /** The small arrow: move one piece to the shop. */
  onQuickTransfer: (product: Product, quantity: number) => void;
}

/** Left panel of the visual transfer: what is in the warehouse, draggable, with a one-tap move. */
export default function WarehousePanel({ products, onDragStart, onDragEnd, onQuickTransfer }: WarehousePanelProps) {
  const inWarehouse = products.filter(p => p.warehouseStock > 0);

  return (
    <div className="card-vuno p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <TruckIcon size={18} className="text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--vuno-text)] text-sm">المستودع</h3>
            <p className="text-xs text-[var(--vuno-text-muted)]">اسحب المنتجات لنقلها</p>
          </div>
        </div>
        <span className="text-xs font-medium text-[var(--vuno-text-muted)]">
          {inWarehouse.length} منتج
        </span>
      </div>
      <div className="space-y-2 max-h-[420px] overflow-y-auto">
        {inWarehouse.map(item => (
          <motion.div
            key={item.id}
            layout
            draggable
            onDragStart={() => onDragStart(item)}
            onDragEnd={() => onDragEnd()}
            className="flex items-center gap-3 p-3 rounded-xl border border-[var(--vuno-border)] bg-white cursor-grab active:cursor-grabbing hover:border-[var(--vuno-primary)] transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--vuno-surface-pearl)] flex items-center justify-center flex-shrink-0">
              <PackageIcon size={14} className="text-[var(--vuno-primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--vuno-text)] truncate">{item.name}</p>
              <p className="text-xs text-[var(--vuno-text-muted)]">{item.price} EGP</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-600 text-xs font-bold">
                {item.warehouseStock}
              </span>
              <button
                onClick={() => { onQuickTransfer(item, 1); }}
                className="w-7 h-7 rounded-lg bg-[var(--vuno-primary)] text-white flex items-center justify-center active:scale-90 transition-transform"
                title="نقل قطعة واحدة"
              >
                <ArrowLeftIcon size={14} />
              </button>
            </div>
          </motion.div>
        ))}
        {inWarehouse.length === 0 && (
          <div className="py-8 text-center text-sm text-[var(--vuno-text-muted)]">
            المستودع فارغ — لا توجد منتجات قابلة للنقل
          </div>
        )}
      </div>
    </div>
  );
}
