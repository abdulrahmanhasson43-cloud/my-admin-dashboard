import { PaletteIcon } from '@/components/icons';
import type { ProductVariant } from '@/types';

interface VariantCardProps {
  variants: ProductVariant[];
  /** Compact mode for inline display in product cards */
  compact?: boolean;
}

/**
 * الفكرة #30 — بطاقة عرض متغيرات المنتج بصرياً.
 * تعرض دوائر الألوان وأزرار المقاسات بشكل مرئي داخل بطاقة المنتج.
 * يمكن استخدامها في صفحة المنتجات (compact) أو في تفاصيل المنتج.
 */
export default function VariantCard({ variants, compact = false }: VariantCardProps) {
  if (!variants || variants.length === 0) return null;

  return (
    <div
      className={`rounded-xl ${compact ? 'p-2.5' : 'p-3'}`}
      style={{ background: 'var(--vuno-surface-pearl)' }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <PaletteIcon size={compact ? 12 : 14} className="text-[var(--vuno-text-muted)]" />
        <span className={`font-semibold text-[var(--vuno-text-secondary)] ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
          المتغيرات
        </span>
      </div>

      <div className="space-y-2">
        {variants.map(variant => (
          <div key={variant.id} className="flex items-center gap-2 flex-wrap">
            <span className={`text-[var(--vuno-text-muted)] flex-shrink-0 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
              {variant.name}:
            </span>
            {variant.type === 'color' ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                {variant.values.map(value => (
                  <div
                    key={value.id}
                    className={`rounded-full ${compact ? 'w-4 h-4' : 'w-5 h-5'} flex-shrink-0`}
                    style={{
                      background: value.color || '#ccc',
                      border: '1px solid var(--vuno-border)',
                    }}
                    title={value.label}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1 flex-wrap">
                {variant.values.map(value => (
                  <span
                    key={value.id}
                    className={`inline-flex items-center justify-center rounded-md font-medium text-[var(--vuno-text-secondary)] ${compact ? 'h-4 px-1.5 text-[9px]' : 'h-5 px-2 text-[10px]'}`}
                    style={{
                      background: 'var(--vuno-surface)',
                      border: '1px solid var(--vuno-border)',
                    }}
                  >
                    {value.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
