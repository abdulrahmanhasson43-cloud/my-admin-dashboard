import { PackageIcon, StoreIcon } from '@/components/icons';
import { isLowStock } from '@/lib/inventory';
import type { Product } from '@/types';

interface StorePanelProps {
  /** The products currently shown (after search and category). */
  products: Product[];
  lowStockThreshold: number;
  /** The product being dragged, if any — lights the panel up as a drop target. */
  dragProduct: Product | null;
  onDrop: () => void;
}

/** Right panel of the visual transfer: what is on the shop floor, and where a dragged product is dropped. */
export default function StorePanel({ products, lowStockThreshold, dragProduct, onDrop }: StorePanelProps) {
  return (
    <div
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
      className={`card-vuno p-4 transition-all ${dragProduct ? 'ring-2 ring-[var(--vuno-primary)] border-[var(--vuno-primary)]' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <StoreIcon size={18} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--vuno-text)] text-sm">المتجر</h3>
            <p className="text-xs text-[var(--vuno-text-muted)]">
              {dragProduct ? 'أفلت هنا للنقل' : 'المنتجات المعروضة للبيع'}
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-[var(--vuno-text-muted)]">
          {products.length} منتج
        </span>
      </div>
      <div className="space-y-2 max-h-[420px] overflow-y-auto">
        {products.map(item => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-[var(--vuno-bg)]"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <PackageIcon size={14} className="text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--vuno-text)] truncate">{item.name}</p>
              <p className="text-xs text-[var(--vuno-text-muted)]">{item.price} EGP</p>
            </div>
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
              isLowStock(item, lowStockThreshold) ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {item.storeStock}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
