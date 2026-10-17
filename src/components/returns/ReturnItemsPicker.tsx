import type { ReturnableItem } from '@/lib/returns';

interface ReturnItemsPickerProps {
  items: ReadonlyArray<ReturnableItem>;
  isSelected: (productId: string) => boolean;
  quantityFor: (productId: string) => number;
  onToggle: (productId: string, selected: boolean) => void;
  onQuantityChange: (productId: string, raw: number, maxQty: number) => void;
}

/** The products of the new-return form: a tick and a quantity box for each. */
export default function ReturnItemsPicker({ items, isSelected, quantityFor, onToggle, onQuantityChange }: ReturnItemsPickerProps) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">المنتجات المرتجعة</label>
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-[13px] text-[var(--vuno-text-muted)]">لا توجد منتجات متاحة للإرجاع</p>
        )}
        {items.map(p => (
          <div key={p.productId} className="flex items-center gap-2 bg-[var(--vuno-surface)] rounded-xl px-3 py-2.5">
            <input
              type="checkbox"
              checked={isSelected(p.productId)}
              onChange={(e) => onToggle(p.productId, e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--vuno-primary)]"
            />
            <span className="flex-1 text-[13px] text-[var(--vuno-text)]">{p.name}</span>
            <input
              type="number"
              min={1}
              max={p.maxQty}
              value={quantityFor(p.productId)}
              onChange={(e) => onQuantityChange(p.productId, Number(e.target.value), p.maxQty)}
              disabled={!isSelected(p.productId)}
              className="w-16 h-8 px-2 rounded-lg border border-[var(--vuno-border)] text-[13px] disabled:opacity-40 focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
