/**
 * components/flash/FlashSales.tsx
 * ============================================================
 *  الفكرة #38 — Flash Sales (عروض الفلاش المحدودة)
 *  عرض العروض النشطة مع عدّاد تنازلي حي وشريط تقدم الكمية.
 *  يمكن عرضها كـ banner (في POS) أو كقائمة كاملة (في صفحة مستقلة).
 * ============================================================
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { FlashSale } from '@/types';
import { isFlashSaleActive, remainingQty, saleProgress, getRemaining, type Countdown } from '@/types';
import {
  ZapIcon,
  ClockIcon,
  FlameIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';

interface FlashSalesProps {
  /** قائمة عروض الفلاش */
  sales: FlashSale[];
  /** وضع العرض: 'full' قائمة كاملة، 'banner' شريط علوي واحد */
  variant?: 'full' | 'banner';
  /** عند النقر على عرض */
  onSelect?: (sale: FlashSale) => void;
  title?: string;
}

function fmtEGP(n: number): string {
  return n.toLocaleString('en-US') + ' ج.م';
}

/** نسبة الخصم */
function discountPercent(sale: FlashSale): number {
  if (sale.originalPrice === 0) return 0;
  return Math.round(((sale.originalPrice - sale.salePrice) / sale.originalPrice) * 100);
}

export default function FlashSales({
  sales,
  variant = 'full',
  onSelect,
  title = 'عروض الفلاش',
}: FlashSalesProps) {
  // العروض النشطة فقط
  const activeSales = sales.filter(isFlashSaleActive);
  // العروض المنتهية
  const endedSales = sales.filter((s) => !isFlashSaleActive(s));

  // وضع البانر: عرض أول عرض نشط كشريط
  if (variant === 'banner') {
    if (activeSales.length === 0) return null;
    return <FlashBanner sale={activeSales[0]} onSelect={onSelect} />;
  }

  // الوضع الكامل
  return (
    <div className="p-1">
      {/* العنوان */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--vuno-danger) 10%, transparent)' }}>
          <FlameIcon size={16} className="text-[var(--vuno-danger)]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--vuno-text)]">{title}</h3>
          <p className="text-[11px] text-[var(--vuno-text-muted)]">
            {activeSales.length} عرض نشط الآن
          </p>
        </div>
      </div>

      {/* العروض النشطة — صفوف مسطحة تتبع نفس أسلوب باقي قوائم الصفحة، لا صناديق منفصلة */}
      <div className="mb-2">
        {activeSales.length === 0 ? (
          <div className="text-center py-8 text-[var(--vuno-text-muted)]">
            <ZapIcon size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs">لا توجد عروض فلاش نشطة حالياً</p>
          </div>
        ) : (
          activeSales.map((sale, idx) => (
            <FlashSaleCard key={sale.id} sale={sale} index={idx} onSelect={onSelect} />
          ))
        )}
      </div>

      {/* العروض المنتهية */}
      {endedSales.length > 0 && (
        <div className="pt-3 border-t border-[var(--vuno-border-light)]">
          <p className="text-[10px] text-[var(--vuno-text-muted)] mb-2">عروض منتهية</p>
          <div className="space-y-1.5">
            {endedSales.map((sale) => (
              <div key={sale.id} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--vuno-surface-pearl)] opacity-60">
                <span className="text-[12px] text-[var(--vuno-text-secondary)] flex-1 truncate">{sale.productName}</span>
                <span className="text-[10px] text-[var(--vuno-text-muted)]">انتهى العرض</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** صف عرض فلاش — تصميم قائمة مسطحة (مش صندوق منفصل)، بشريط تقدم رفيع
    تحت الصف كله بدل شكل "البطاقة" القديم. */
function FlashSaleCard({
  sale,
  index,
  onSelect,
}: {
  sale: FlashSale;
  index: number;
  onSelect?: (sale: FlashSale) => void;
}) {
  const [countdown, setCountdown] = useState<Countdown>(() => getRemaining(sale.endAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getRemaining(sale.endAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [sale.endAt]);

  const progress = saleProgress(sale);
  const remaining = remainingQty(sale);
  const discount = discountPercent(sale);

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.25) }}
      onClick={() => onSelect?.(sale)}
      className={cn(
        'flex items-center gap-3 py-3 border-b border-[var(--vuno-border-light)] last:border-0',
        onSelect && 'cursor-pointer hover:bg-[var(--vuno-surface-pearl)] -mx-2 px-2 rounded-lg transition-colors',
      )}
    >
      {/* رقم/أيقونة صغيرة بدل الصندوق الملوّن */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--vuno-danger) 8%, transparent)' }}>
        <FlameIcon size={13} className="text-[var(--vuno-danger)]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[13px] font-semibold text-[var(--vuno-text)] truncate">{sale.productName}</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ color: 'var(--vuno-danger)', background: 'color-mix(in srgb, var(--vuno-danger) 10%, transparent)' }}>
            -{discount}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--vuno-text-muted)] line-through tabular-nums">{fmtEGP(sale.originalPrice)}</span>
          <span className="text-[13px] font-bold text-[var(--vuno-text)] tabular-nums">{fmtEGP(sale.salePrice)}</span>
          <span className="text-[10px] text-[var(--vuno-text-muted)]">تبقى {remaining}</span>
        </div>
        {/* شريط تقدم رفيع جدًا تحت النص */}
        <div className="h-1 rounded-full overflow-hidden mt-1.5" style={{ background: 'color-mix(in srgb, var(--vuno-danger) 10%, transparent)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6 }}
            className="h-full rounded-full"
            style={{ background: 'var(--vuno-danger)' }}
          />
        </div>
      </div>

      {/* العدّاد */}
      <CountdownDisplay countdown={countdown} />
    </motion.div>
  );
}

/** شريط العرض العلوي (banner) — للاستخدام في POS */
function FlashBanner({ sale, onSelect }: { sale: FlashSale; onSelect?: (sale: FlashSale) => void }) {
  const [countdown, setCountdown] = useState<Countdown>(() => getRemaining(sale.endAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getRemaining(sale.endAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [sale.endAt]);

  const discount = discountPercent(sale);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect?.(sale)}
      className="rounded-2xl p-3 cursor-pointer transition-all flex items-center gap-3"
      style={{ background: 'var(--vuno-text)' }}
    >
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-white/15">
        <FlameIcon size={16} className="text-white" />
      </div>
      <div className="flex-1 min-w-0 text-white">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold truncate">{sale.productName}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold flex-shrink-0">-{discount}%</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] opacity-80">
          <span className="line-through tabular-nums">{fmtEGP(sale.originalPrice)}</span>
          <span className="font-bold tabular-nums">{fmtEGP(sale.salePrice)}</span>
        </div>
      </div>
      {/* العدّاد */}
      <div className="flex items-center gap-1 flex-shrink-0 text-white">
        <ClockIcon size={14} />
        <div className="flex gap-0.5 tabular-nums font-bold">
          <span className="bg-white/15 rounded px-1 py-0.5 text-[10px]">{String(countdown.hours).padStart(2, '0')}</span>
          <span className="text-[10px]">:</span>
          <span className="bg-white/15 rounded px-1 py-0.5 text-[10px]">{String(countdown.minutes).padStart(2, '0')}</span>
          <span className="text-[10px]">:</span>
          <span className="bg-white/15 rounded px-1 py-0.5 text-[10px]">{String(countdown.seconds).padStart(2, '0')}</span>
        </div>
      </div>
    </motion.div>
  );
}

/** عرض العدّاد التنازلي */
function CountdownDisplay({ countdown }: { countdown: Countdown }) {
  if (countdown.done) {
    return <span className="text-[10px] text-[var(--vuno-text-muted)] font-medium">انتهى</span>;
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="flex items-center gap-0.5 flex-shrink-0">
      <ClockIcon size={12} className="text-[var(--vuno-danger)]" />
      <div className="flex gap-0.5 tabular-nums font-bold text-[var(--vuno-danger)]">
        <span className="rounded px-1 py-0.5 text-[10px]" style={{ background: 'color-mix(in srgb, var(--vuno-danger) 10%, transparent)' }}>{pad(countdown.hours)}</span>
        <span className="text-[10px]">:</span>
        <span className="rounded px-1 py-0.5 text-[10px]" style={{ background: 'color-mix(in srgb, var(--vuno-danger) 10%, transparent)' }}>{pad(countdown.minutes)}</span>
        <span className="text-[10px]">:</span>
        <span className="rounded px-1 py-0.5 text-[10px]" style={{ background: 'color-mix(in srgb, var(--vuno-danger) 10%, transparent)' }}>{pad(countdown.seconds)}</span>
      </div>
    </div>
  );
}

export { isFlashSaleActive, remainingQty, saleProgress };
