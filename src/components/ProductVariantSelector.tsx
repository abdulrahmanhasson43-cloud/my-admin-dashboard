import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, CheckIcon, PlusIcon, MinusIcon } from '@/components/icons';
import type { Product, ProductVariant, VariantValue } from '@/types';

interface ProductVariantSelectorProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: (selectedVariants: Record<string, string>, quantity: number) => void;
}

/**
 * الفكرة #30 — نافذة اختيار متغيرات المنتج (اللون / المقاس).
 * تعرض دوائر ألوان لمتغير 'color' وأزرار pills لمتغير 'size'،
 * مع اختيار الكمية والسعر، ثم تأكيد الإضافة للسلة.
 */
export default function ProductVariantSelector({
  open,
  product,
  onClose,
  onConfirm,
}: ProductVariantSelectorProps) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  // Reset selections when a new product is opened
  useEffect(() => {
    if (open && product?.variants) {
      const initial: Record<string, string> = {};
      // Pre-select the first value of each variant group
      product.variants.forEach(v => {
        if (v.values.length > 0) initial[v.id] = v.values[0].id;
      });
      setSelected(initial);
      setQuantity(1);
    }
  }, [open, product]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;
  if (!product || !product.variants || product.variants.length === 0) return null;

  const handleConfirm = () => {
    onConfirm(selected, quantity);
    onClose();
  };

  const getSelectedValueLabel = (variant: ProductVariant): string => {
    const valueId = selected[variant.id];
    const value = variant.values.find(v => v.id === valueId);
    return value?.label || '';
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50"
          dir="rtl"
        >
          <motion.div
            initial={{ y: 40, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-[var(--vuno-border)] rounded-t-3xl">
              <div className="w-10 h-1 rounded-full bg-[var(--vuno-border)] mx-auto mb-3 sm:hidden" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[15px] text-[var(--vuno-text)]">{product.name}</h3>
                  <p className="text-[11px] text-[var(--vuno-text-muted)]">اختر المتغيرات المطلوبة</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--vuno-bg)]"
                >
                  <XIcon size={16} className="text-[var(--vuno-text-secondary)]" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Variant groups */}
              {product.variants.map((variant) => (
                <div key={variant.id}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[13px] font-semibold text-[var(--vuno-text)]">
                      {variant.name}
                    </label>
                    <span className="text-[11px] text-[var(--vuno-text-muted)]">
                      {getSelectedValueLabel(variant)}
                    </span>
                  </div>

                  {variant.type === 'color' ? (
                    /* Colour circles */
                    <div className="flex flex-wrap gap-2.5">
                      {variant.values.map((value: VariantValue) => {
                        const isSelected = selected[variant.id] === value.id;
                        return (
                          <button
                            key={value.id}
                            onClick={() => setSelected(prev => ({ ...prev, [variant.id]: value.id }))}
                            className="relative w-11 h-11 rounded-full transition-transform active:scale-90"
                            style={{
                              background: value.color || '#ccc',
                              border: isSelected
                                ? '3px solid var(--vuno-primary)'
                                : '2px solid var(--vuno-border)',
                            }}
                            title={value.label}
                            aria-label={value.label}
                          >
                            {isSelected && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <CheckIcon
                                  size={16}
                                  className="text-white drop-shadow-md"
                                  style={{ filter: 'brightness(0)' }}
                                />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Size pill buttons */
                    <div className="flex flex-wrap gap-2">
                      {variant.values.map((value) => {
                        const isSelected = selected[variant.id] === value.id;
                        return (
                          <button
                            key={value.id}
                            onClick={() => setSelected(prev => ({ ...prev, [variant.id]: value.id }))}
                            className="min-w-[44px] h-10 px-4 rounded-xl text-[14px] font-semibold transition-all active:scale-95"
                            style={{
                              background: isSelected ? 'var(--vuno-primary)' : 'var(--vuno-surface)',
                              border: isSelected
                                ? '1px solid var(--vuno-primary)'
                                : '1px solid var(--vuno-border)',
                              color: isSelected ? '#fff' : 'var(--vuno-text-secondary)',
                            }}
                          >
                            {value.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Quantity + price */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--vuno-border-light)]">
                <div>
                  <label className="text-[12px] font-semibold text-[var(--vuno-text-secondary)] mb-1.5 block">
                    الكمية
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-full bg-[var(--vuno-surface)] border border-[var(--vuno-border)] flex items-center justify-center transition-transform active:scale-90"
                    >
                      <MinusIcon size={14} />
                    </button>
                    <span className="w-10 text-center text-[16px] font-bold text-[var(--vuno-text)] tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-9 h-9 rounded-full bg-[var(--vuno-surface)] border border-[var(--vuno-border)] flex items-center justify-center transition-transform active:scale-90"
                    >
                      <PlusIcon size={14} />
                    </button>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-[11px] text-[var(--vuno-text-muted)]">السعر</p>
                  <p className="text-[18px] font-bold text-[var(--vuno-primary)]">
                    {(product.price * quantity).toLocaleString()} EGP
                  </p>
                </div>
              </div>

              {/* Confirm button */}
              <button
                onClick={handleConfirm}
                className="w-full h-12 rounded-full text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-transform active:scale-95"
                style={{ background: 'var(--vuno-primary)' }}
              >
                <PlusIcon size={18} className="text-white" />
                إضافة للسلة
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
