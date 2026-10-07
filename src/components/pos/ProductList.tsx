import { PlusIcon, PackageIcon } from '@/components/icons';
import VariantCard from '@/components/VariantCard';
import type { Product } from '@/types';

interface ProductListProps {
  products: Product[];
  /** How many units of a product are already in the cart. */
  quantityFor: (productId: string) => number;
  onAdd: (product: Product) => void;
}

/* Products — full-width horizontal rows (user request C).
   Mobile-first: each product is a full-width horizontal row.
   Desktop scales the same row layout (wider, more padding). */
export default function ProductList({ products, quantityFor, onAdd }: ProductListProps) {
  return (
    <div className="space-y-2 lg:space-y-2.5 select-none-touch">
      {products.map((product) => {
        const qty = quantityFor(product.id);
        const hasVariants = product.variants && product.variants.length > 0;
        return (
          <button
            key={product.id}
            onClick={() => onAdd(product)}
            className="w-full flex items-center gap-3 lg:gap-4 bg-white border border-[var(--vuno-border)] rounded-2xl p-3 lg:p-4 text-right transition-transform active:scale-[0.98] min-w-0 select-none"
          >
            {/* Quantity/Icon badge */}
            <div
              className="w-11 h-11 lg:w-14 lg:h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
              style={{
                background: qty > 0 ? 'var(--vuno-primary)' : 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)',
              }}
            >
              {qty > 0 ? (
                <span className="text-white text-[16px] lg:text-[18px] font-bold tabular-nums">{qty}</span>
              ) : (
                <PackageIcon className="text-[var(--vuno-primary)]" size={20} />
              )}
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0 text-right">
              <h4 className="text-[14px] lg:text-[16px] font-semibold text-[var(--vuno-text)] truncate leading-tight mb-0.5">{product.name}</h4>
              {hasVariants ? (
                <VariantCard variants={product.variants!} compact />
              ) : (
                <span className="text-[11px] lg:text-[12px] text-[var(--vuno-text-muted)]">{product.category}</span>
              )}
            </div>

            {/* Price + large add button */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-left">
                <div className="text-[16px] lg:text-[18px] font-bold text-[var(--vuno-primary)] leading-none">{product.price}</div>
                <div className="text-[10px] lg:text-[11px] text-[var(--vuno-text-muted)] leading-none mt-0.5">EGP</div>
              </div>
              {/* Large touch-friendly + button (Idea #22) */}
              <div
                className="w-11 h-11 lg:w-12 lg:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90"
                style={{
                  background: qty > 0 ? 'color-mix(in srgb, var(--vuno-success) 15%, transparent)' : 'var(--vuno-primary)',
                }}
              >
                <PlusIcon size={22} className={qty > 0 ? 'text-[var(--vuno-success)]' : 'text-white'} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
