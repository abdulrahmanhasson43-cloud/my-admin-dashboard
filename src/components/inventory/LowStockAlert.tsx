import { motion } from 'framer-motion';
import { PackageIcon, AlertTriangleIcon } from '@/components/icons';
import type { Product } from '@/types';

interface LowStockAlertProps {
  /** Products low on the shop floor. Nothing is drawn when the list is empty. */
  lowStock: Product[];
  lowStockThreshold: number;
  isMobile: boolean;
  /** "نقل" next to a product that has stock in the warehouse. */
  onTransfer: (product: Product) => void;
}

/**
 * Quiet warning card: a white card with a light orange accent (not a loud red frame).
 * Phones get one row per product with a transfer button; wider screens get chips.
 */
export default function LowStockAlert({ lowStock, lowStockThreshold, isMobile, onTransfer }: LowStockAlertProps) {
  if (lowStock.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-vuno overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 sm:px-5 py-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--vuno-warning) 14%, transparent)' }}>
          <AlertTriangleIcon size={18} className="text-[var(--vuno-warning)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[var(--vuno-text)] text-[15px]">مخزون منخفض</h3>
          <p className="text-[12px] text-[var(--vuno-text-muted)]">يحتاج تجديد قريبًا · تحت حد {lowStockThreshold} قطعة</p>
        </div>
        <span
          className="flex-shrink-0 min-w-[26px] h-[26px] px-1.5 rounded-full text-xs font-bold flex items-center justify-center"
          style={{ background: 'var(--vuno-warning)', color: 'white' }}
        >
          {lowStock.length}
        </span>
      </div>

      <div className={`px-4 sm:px-5 pb-4 sm:pb-5 ${isMobile ? 'space-y-2' : 'flex flex-wrap gap-2'}`}>
        {lowStock.map(item => (
          isMobile ? (
            <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ background: 'var(--vuno-bg)' }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--vuno-warning) 14%, transparent)' }}>
                  <PackageIcon size={14} className="text-[var(--vuno-warning)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--vuno-text)] truncate">{item.name}</p>
                  <p className="text-[11px] text-[var(--vuno-text-muted)]">{item.storeStock} بالمتجر{item.warehouseStock > 0 ? ` · ${item.warehouseStock} بالمخزن` : ''}</p>
                </div>
              </div>
              {item.warehouseStock > 0 && (
                <button
                  onClick={() => onTransfer(item)}
                  className="flex-shrink-0 h-8 px-3 rounded-full text-[12px] font-medium text-white active:scale-95 transition-transform"
                  style={{ background: 'var(--vuno-primary)' }}
                >
                  نقل
                </button>
              )}
            </div>
          ) : (
            <span
              key={item.id}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'var(--vuno-bg)', color: 'var(--vuno-text-secondary)', border: '1px solid var(--vuno-border)' }}
            >
              <span style={{ color: 'var(--vuno-warning)' }}>●</span> {item.name} ({item.storeStock} بالمتجر{item.warehouseStock > 0 ? ` · ${item.warehouseStock} بالمخزن` : ''})
            </span>
          )
        ))}
      </div>
    </motion.div>
  );
}
