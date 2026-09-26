/**
 * pages/BundlesPage.tsx
 * ============================================================
 *  صفحة الباقات — الفكرة #37 (Bundle Builder)
 *  تستضيف مكوّن BundleBuilder مع إدارة حالة الباقات محليًا.
 * ============================================================
 */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { PackageIcon } from '@/components/icons';
import BundleBuilder from '@/components/bundles/BundleBuilder';
import StatsRow from '@/components/StatsRow';
import { useBundles } from '@/hooks/useBundles';
import { useProducts } from '@/context/products-context-value';
import { calcSavings, calcDiscountPercent } from '@/types/bundle';
import type { Bundle } from '@/types';

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
  // Products come from the ProductsContext (clean ProductService underneath);
  // bundles come from the clean BundleService via useBundles().
  const { products } = useProducts();
  const { bundles, createBundle, toggleBundleActive, deleteBundle } = useBundles();

  const handleCreate = useCallback((bundle: Bundle) => {
    void createBundle({
      name: bundle.name,
      description: bundle.description,
      items: bundle.items,
      discountedPrice: bundle.discountedPrice,
      active: bundle.active,
    });
  }, [createBundle]);

  const handleDelete = useCallback((id: string) => {
    void deleteBundle(id);
  }, [deleteBundle]);

  const handleToggle = useCallback((id: string) => {
    void toggleBundleActive(id);
  }, [toggleBundleActive]);

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
