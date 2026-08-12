/**
 * pages/BundlesPage.tsx
 * ============================================================
 *  صفحة الباقات — الفكرة #37 (Bundle Builder)
 *  تستضيف مكوّن BundleBuilder مع إدارة حالة الباقات محليًا.
 * ============================================================
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PackageIcon } from '@/components/icons';
import BundleBuilder from '@/components/bundles/BundleBuilder';
import StatsRow from '@/components/StatsRow';
import { sampleBundles } from '@/services/mock';
import { sampleProducts } from '@/services/mock/products';
import { useProducts } from '@/context/products-context-value';
import { calcSavings, calcDiscountPercent } from '@/types/bundle';
import type { Bundle } from '@/types';
import { generateId } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────
   Page header
   ───────────────────────────────────────────────────────────── */
function PageHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3"
    >
      <div
        className="w-11 h-11 rounded-[14px] flex items-center justify-center"
        style={{ background: 'var(--vuno-surface-pearl)' }}
      >
        <PackageIcon size={22} className="text-[var(--vuno-primary)]" />
      </div>
      <div>
        <h1 className="text-[22px] font-bold text-[var(--vuno-text)] tracking-tight leading-tight">
          الباقات والعروض المجمّعة
        </h1>
        <p className="text-[13px] text-[var(--vuno-text-muted)] mt-0.5">
          أنشئ باقات من منتجاتك مع خصم جذّاب لزيادة متوسط قيمة الطلب
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main page
   ───────────────────────────────────────────────────────────── */
export default function BundlesPage() {
  // Use products from context if available, otherwise fall back to mock sample
  const ctx = useProducts();
  const products = ctx?.products?.length ? ctx.products : sampleProducts;

  const [bundles, setBundles] = useState<Bundle[]>(sampleBundles);

  const handleCreate = useCallback((bundle: Bundle) => {
    setBundles((prev) => [bundle, ...prev]);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setBundles((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleToggle = useCallback((id: string) => {
    setBundles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)),
    );
  }, []);

  // Summary stats
  const activeBundles = bundles.filter((b) => b.active);
  const totalSavings = bundles.reduce((sum, b) => sum + calcSavings(b), 0);
  const avgDiscount = bundles.length
    ? Math.round(
        bundles.reduce((s, b) => s + calcDiscountPercent(b), 0) / bundles.length,
      )
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader />

      <StatsRow
        maxCols={4}
        items={[
          {
            label: 'إجمالي الباقات',
            value: bundles.length.toString(),
            icon: PackageIcon,
            color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]',
          },
          {
            label: 'الباقات النشطة',
            value: activeBundles.length.toString(),
            icon: PackageIcon,
            color: 'bg-emerald-50 text-emerald-600',
          },
          {
            label: 'متوسط الخصم',
            value: `${avgDiscount}%`,
            icon: PackageIcon,
            color: 'bg-amber-50 text-amber-600',
          },
          {
            label: 'إجمالي التوفير',
            value: `${totalSavings.toLocaleString('en-US')} ج.م`,
            icon: PackageIcon,
            color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]',
          },
        ]}
      />

      <BundleBuilder
        bundles={bundles}
        products={products}
        onCreate={handleCreate}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />
    </div>
  );
}

// Re-export for type-safe usage elsewhere if needed
export { generateId };
