/**
 * components/analytics/TopPerformers.tsx
 * ============================================================
 *  الفكرة #32 — Top & Bottom Performers (أفضل وأسوأ المنتجات)
 *  قائمتان جنباً إلى جنب: أفضل المنتجات مبيعاً وأضعفها.
 *  كل منتج يعرض: الاسم، الفئة، الكمية المباعة، الإيرادات، نسبة التغيير.
 * ============================================================
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PerformerProduct, PerformersData } from '@/types';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  PackageIcon,
  DollarSignIcon,
  TagIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';

interface TopPerformersProps {
  data: PerformersData;
  title?: string;
}

function fmtEGP(n: number): string {
  return n.toLocaleString('en-US') + ' ج.م';
}

export default function TopPerformers({ data, title = 'أداء المنتجات' }: TopPerformersProps) {
  const [tab, setTab] = useState<'top' | 'bottom'>('top');
  const list = tab === 'top' ? data.top : data.bottom;

  return (
    <div className="p-1">
      {/* العنوان */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[var(--vuno-surface-pearl)] flex items-center justify-center">
          <PackageIcon size={18} className="text-[var(--vuno-primary)]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--vuno-text)]">{title}</h3>
          <p className="text-[11px] text-[var(--vuno-text-muted)]">الأكثر والأقل مبيعاً</p>
        </div>
      </div>

      {/* التبويبات */}
      <div className="flex gap-1 p-1 bg-[var(--vuno-surface-pearl)] rounded-xl mb-4">
        <button
          onClick={() => setTab('top')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors',
            tab === 'top'
              ? 'bg-[var(--vuno-text)] text-white'
              : 'text-[var(--vuno-text-muted)]',
          )}
        >
          <TrendingUpIcon size={14} />
          الأفضل
        </button>
        <button
          onClick={() => setTab('bottom')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors',
            tab === 'bottom'
              ? 'bg-[var(--vuno-text)] text-white'
              : 'text-[var(--vuno-text-muted)]',
          )}
        >
          <TrendingDownIcon size={14} />
          الأضعف
        </button>
      </div>

      {/* القائمة */}
      <div className="space-y-2">
        {list.map((product, idx) => (
          <ProductRow key={`${product.id}-${idx}`} product={product} rank={idx + 1} isTop={tab === 'top'} />
        ))}
      </div>
    </div>
  );
}

/** صف منتج واحد */
function ProductRow({ product, rank, isTop }: { product: PerformerProduct; rank: number; isTop: boolean }) {
  const changePositive = product.change >= 0;
  const rankColor = isTop
    ? rank === 1
      ? 'bg-amber-100 text-amber-700'
      : rank === 2
        ? 'bg-gray-200 text-gray-700'
        : rank === 3
          ? 'bg-orange-100 text-orange-700'
          : 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-text-muted)]'
    : 'bg-red-50 text-red-600';

  return (
    <motion.div
      initial={{ opacity: 0, x: isTop ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(rank * 0.05, 0.25) }}
      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--vuno-surface-pearl)] transition-colors"
    >
      {/* الرقم */}
      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0', rankColor)}>
        {rank}
      </div>

      {/* الاسم + الفئة */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--vuno-text)] truncate">{product.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <TagIcon size={11} className="text-[var(--vuno-text-muted)]" />
          <span className="text-[10px] text-[var(--vuno-text-muted)] truncate">{product.category}</span>
        </div>
      </div>

      {/* الكمية المباعة */}
      <div className="text-center flex-shrink-0">
        <p className="text-[11px] text-[var(--vuno-text-muted)]">مبيع</p>
        <p className="text-[13px] font-bold text-[var(--vuno-text)] tabular-nums">{product.sold}</p>
      </div>

      {/* الإيرادات */}
      <div className="text-left flex-shrink-0 min-w-[80px]">
        <div className="flex items-center gap-0.5 justify-end">
          <DollarSignIcon size={11} className="text-[var(--vuno-text-muted)]" />
          <p className="text-[13px] font-bold text-[var(--vuno-text)] tabular-nums">{fmtEGP(product.revenue)}</p>
        </div>
        {/* نسبة التغيير */}
        <div className={cn(
          'flex items-center gap-0.5 justify-end mt-0.5',
          changePositive ? 'text-emerald-600' : 'text-red-500',
        )}>
          {changePositive ? <TrendingUpIcon size={10} /> : <TrendingDownIcon size={10} />}
          <span className="text-[10px] font-semibold tabular-nums">
            {changePositive ? '+' : ''}{product.change}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
