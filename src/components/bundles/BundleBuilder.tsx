/**
 * components/bundles/BundleBuilder.tsx
 * ============================================================
 *  الفكرة #37 — Bundle Builder (منشئ الباقات)
 *  عرض الباقات المتاحة + إنشاء باقة جديدة بتجمع المنتجات.
 *  كل باقة تعرض: المنتجات، السعر الأصلي، السعر المخفّض، التوفير، نسبة الخصم.
 *  يمكن تفعيل/إلغاء تفعيل الباقات.
 * ============================================================
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Bundle, BundleItem } from '@/types';
import { calcOriginalPrice, calcSavings, calcDiscountPercent } from '@/types';
import type { Product } from '@/types';
import {
  PackageIcon,
  TagIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  CloseIcon,
  TrendingDownIcon,
} from '@/components/icons';
import { cn, generateId } from '@/lib/utils';

interface BundleBuilderProps {
  /** الباقات الحالية */
  bundles: Bundle[];
  /** المنتجات المتاحة للاختيار */
  products: Product[];
  /** إضافة باقة جديدة (اختياري) */
  onCreate?: (bundle: Bundle) => void;
  /** حذف باقة (اختياري) */
  onDelete?: (id: string) => void;
  /** تفعيل/إلغاء باقة (اختياري) */
  onToggle?: (id: string) => void;
  title?: string;
}

function fmtEGP(n: number): string {
  return n.toLocaleString('en-US') + ' ج.م';
}

export default function BundleBuilder({
  bundles,
  products,
  onCreate,
  onDelete,
  onToggle,
  title = 'الباقات والخصومات',
}: BundleBuilderProps) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderItems, setBuilderItems] = useState<BundleItem[]>([]);
  const [bundleName, setBundleName] = useState('');
  const [bundleDesc, setBundleDesc] = useState('');
  const [discountPercent, setDiscountPercent] = useState(15);

  const originalPrice = useMemo(() => calcOriginalPrice(builderItems), [builderItems]);
  const discountedPrice = useMemo(
    () => Math.round(originalPrice * (1 - discountPercent / 100)),
    [originalPrice, discountPercent],
  );
  const savings = originalPrice - discountedPrice;

  const addProduct = (product: Product) => {
    const existing = builderItems.find((i) => i.productId === product.id);
    if (existing) {
      setBuilderItems((prev) =>
        prev.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)),
      );
    } else {
      setBuilderItems((prev) => [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      }]);
    }
  };

  const removeItem = (productId: string) => {
    setBuilderItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQty = (productId: string, delta: number) => {
    setBuilderItems((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0),
    );
  };

  const handleCreate = () => {
    if (builderItems.length === 0 || !bundleName.trim()) return;
    const newBundle: Bundle = {
      id: generateId('bundle'),
      name: bundleName.trim(),
      description: bundleDesc.trim() || 'باقة مخصصة',
      items: builderItems,
      originalPrice,
      discountedPrice,
      active: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    onCreate?.(newBundle);
    // إعادة تعيين
    setBuilderItems([]);
    setBundleName('');
    setBundleDesc('');
    setDiscountPercent(15);
    setShowBuilder(false);
  };

  return (
    <div className="card-vuno p-5">
      {/* العنوان + زر إنشاء */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[var(--vuno-surface-pearl)] flex items-center justify-center">
            <PackageIcon size={18} className="text-[var(--vuno-primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--vuno-text)]">{title}</h3>
            <p className="text-[11px] text-[var(--vuno-text-muted)]">{bundles.length} باقة متاحة</p>
          </div>
        </div>
        {onCreate && (
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
              showBuilder
                ? 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-text-muted)]'
                : 'bg-[var(--vuno-primary)] text-white hover:bg-[var(--vuno-primary-light)]',
            )}
          >
            {showBuilder ? <CloseIcon size={14} /> : <PlusIcon size={14} />}
            {showBuilder ? 'إلغاء' : 'باقة جديدة'}
          </button>
        )}
      </div>

      {/* منشئ الباقة */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="rounded-2xl border border-[var(--vuno-border)] p-4 space-y-3">
              {/* الاسم والوصف */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="اسم الباقة"
                  value={bundleName}
                  onChange={(e) => setBundleName(e.target.value)}
                  className="rounded-lg border border-[var(--vuno-border)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--vuno-primary)]"
                />
                <input
                  type="text"
                  placeholder="وصف الباقة (اختياري)"
                  value={bundleDesc}
                  onChange={(e) => setBundleDesc(e.target.value)}
                  className="rounded-lg border border-[var(--vuno-border)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--vuno-primary)]"
                />
              </div>

              {/* المنتجات المختارة */}
              {builderItems.length > 0 && (
                <div className="space-y-1.5">
                  {builderItems.map((item) => (
                    <div key={item.productId} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--vuno-surface-pearl)]">
                      <span className="text-[12px] text-[var(--vuno-text)] flex-1 truncate">{item.name}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQty(item.productId, -1)} className="w-6 h-6 rounded bg-white border border-[var(--vuno-border)] flex items-center justify-center text-xs">−</button>
                        <span className="text-xs font-bold w-6 text-center tabular-nums">{item.quantity}</span>
                        <button onClick={() => updateQty(item.productId, 1)} className="w-6 h-6 rounded bg-white border border-[var(--vuno-border)] flex items-center justify-center text-xs">+</button>
                      </div>
                      <span className="text-[11px] text-[var(--vuno-text-muted)] tabular-nums w-16 text-left">{fmtEGP(item.price * item.quantity)}</span>
                      <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600">
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* اختيار المنتجات */}
              <div>
                <p className="text-[10px] text-[var(--vuno-text-muted)] mb-1.5">اختر المنتجات:</p>
                <div className="flex gap-1.5 flex-wrap max-h-32 overflow-y-auto">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addProduct(p)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-colors',
                        builderItems.some((i) => i.productId === p.id)
                          ? 'bg-[var(--vuno-primary)] text-white border-[var(--vuno-primary)]'
                          : 'bg-white text-[var(--vuno-text-secondary)] border-[var(--vuno-border)] hover:border-[var(--vuno-primary)]',
                      )}
                    >
                      + {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* الخصم + الملخص */}
              {builderItems.length > 0 && (
                <div className="flex items-center gap-3 pt-2 border-t border-[var(--vuno-border-light)]">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--vuno-text-muted)]">نسبة الخصم:</span>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="5"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-24 accent-[var(--vuno-primary)]"
                    />
                    <span className="text-xs font-bold text-[var(--vuno-primary)] w-8 tabular-nums">{discountPercent}%</span>
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-[10px] text-[var(--vuno-text-muted)] line-through tabular-nums">{fmtEGP(originalPrice)}</span>
                    <span className="text-sm font-bold text-emerald-600 mr-2 tabular-nums">{fmtEGP(discountedPrice)}</span>
                    <span className="text-[10px] text-emerald-600">وفّر {fmtEGP(savings)}</span>
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={!bundleName.trim()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--vuno-primary)] text-white text-xs font-semibold disabled:opacity-50 hover:bg-[var(--vuno-primary-light)]"
                  >
                    <CheckIcon size={14} />
                    حفظ الباقة
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* قائمة الباقات */}
      <div className="space-y-3">
        {bundles.length === 0 ? (
          <div className="text-center py-8 text-[var(--vuno-text-muted)]">
            <PackageIcon size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs">لا توجد باقات بعد</p>
          </div>
        ) : (
          bundles.map((bundle, idx) => (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              index={idx}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

/** بطاقة باقة واحدة */
function BundleCard({
  bundle,
  index,
  onToggle,
  onDelete,
}: {
  bundle: Bundle;
  index: number;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const savings = calcSavings(bundle);
  const discount = calcDiscountPercent(bundle);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.3) }}
      className={cn(
        'rounded-2xl border p-4 transition-all',
        bundle.active
          ? 'border-[var(--vuno-border)] hover:shadow-sm'
          : 'border-[var(--vuno-border-light)] opacity-60',
      )}
    >
      {/* الرأس */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <TagIcon size={16} className="text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-[13px] font-bold text-[var(--vuno-text)]">{bundle.name}</h4>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-600">-{discount}%</span>
            </div>
            <p className="text-[10px] text-[var(--vuno-text-muted)]">{bundle.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onToggle && (
            <button
              onClick={() => onToggle(bundle.id)}
              className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold',
                bundle.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400',
              )}
              title={bundle.active ? 'إلغاء التفعيل' : 'تفعيل'}
            >
              {bundle.active ? <CheckIcon size={14} /> : <CloseIcon size={14} />}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(bundle.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50"
            >
              <TrashIcon size={14} />
            </button>
          )}
        </div>
      </div>

      {/* المنتجات */}
      <div className="flex flex-wrap gap-1 mb-3">
        {bundle.items.map((item) => (
          <span key={item.productId} className="px-2 py-0.5 rounded-md bg-[var(--vuno-surface-pearl)] text-[10px] text-[var(--vuno-text-secondary)]">
            {item.name} ×{item.quantity}
          </span>
        ))}
      </div>

      {/* السعر */}
      <div className="flex items-end justify-between pt-2 border-t border-[var(--vuno-border-light)]">
        <div>
          <span className="text-[11px] text-[var(--vuno-text-muted)] line-through tabular-nums">{fmtEGP(bundle.originalPrice)}</span>
          <p className="text-lg font-bold text-[var(--vuno-primary)] tabular-nums">{fmtEGP(bundle.discountedPrice)}</p>
        </div>
        <div className="flex items-center gap-1 text-emerald-600">
          <TrendingDownIcon size={14} />
          <span className="text-[11px] font-bold">وفّر {fmtEGP(savings)}</span>
        </div>
      </div>
    </motion.div>
  );
}
