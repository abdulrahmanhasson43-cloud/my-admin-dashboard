import { toast } from 'sonner';
import { ZapIcon } from '@/components/icons';
import { calcDiscountPercent, calcSavings, type Bundle } from '@/types/bundle';
import type { Product } from '@/types';

interface BundleOffersProps {
  bundles: Bundle[];
  products: Product[];
  /** Called once per unit of every product in the bundle. */
  onAddProduct: (product: Product) => void;
}

/** Idea #37: active bundle offers — one tap adds every product in the bundle to the cart. */
export default function BundleOffers({ bundles, products, onAddProduct }: BundleOffersProps) {
  const activeBundles = bundles.filter(b => b.active);
  if (activeBundles.length === 0) return null;

  return (
    <div className="card-vuno p-4">
      <div className="flex items-center gap-2 mb-3">
        <ZapIcon size={18} className="text-[var(--vuno-primary)]" />
        <h3 className="text-[14px] font-semibold text-[var(--vuno-text)]">عروض الباقات المجمّعة</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hidden pb-1">
        {activeBundles.map((bundle) => (
          <button
            key={bundle.id}
            onClick={() => {
              // أضف جميع منتجات الباقة للسلة
              bundle.items.forEach((item) => {
                const prod = products.find(p => p.id === item.productId);
                if (prod) {
                  for (let q = 0; q < item.quantity; q++) {
                    onAddProduct(prod);
                  }
                }
              });
              toast.success('تمت إضافة الباقة', {
                description: `${bundle.name} — وفّرت ${calcSavings(bundle).toLocaleString('en-US')} ج.م`,
              });
            }}
            className="flex-shrink-0 w-56 text-right rounded-[14px] p-3 transition-transform active:scale-95"
            style={{ background: 'var(--vuno-surface-pearl)', border: '1px solid var(--vuno-border)' }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: 'var(--vuno-primary)' }}
              >
                خصم {calcDiscountPercent(bundle)}%
              </span>
              <p className="text-[13px] font-semibold text-[var(--vuno-text)] line-clamp-1">{bundle.name}</p>
            </div>
            <p className="text-[11px] text-[var(--vuno-text-muted)] line-clamp-1 mb-2">
              {bundle.items.length} منتجات
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--vuno-text-muted)] line-through">
                {bundle.originalPrice.toLocaleString('en-US')} ج.م
              </span>
              <span className="text-[14px] font-bold text-[var(--vuno-primary)]">
                {bundle.discountedPrice.toLocaleString('en-US')} ج.م
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
