import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangleIcon, ArrowLeftIcon, PackageIcon,
  TrendingDownIcon, ShoppingCartIcon,
} from '@/components/icons';
import { useProducts } from '@/context/products-context-value';
import { useAppSettings } from '@/context/app-settings-context-value';
import { useActivityLog } from '@/context/activity-log-context-value';
import type { Product } from '@/types';

/**
 * LowStockAlertsWidget — ودجت تنبيهات المخزون الذكي.
 *
 * يعرض المنتجات منخفضة المخزون مع توقع عدد الأيام قبل النفاد وزر مباشر
 * لإنشاء أمر شراء. يستخدم بيانات المبيعات من سجل النشاطات لحساب متوسط
 * الاستهلاك اليومي، ثم يتنبأ بتاريخ النفاد.
 *
 * @example
 * <LowStockAlertsWidget maxItems={5} />
 */
export default function LowStockAlertsWidget({ maxItems = 5 }: { maxItems?: number }) {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { lowStockThreshold = 10 } = useAppSettings();
  const { activities } = useActivityLog();

  // حساب متوسط الاستهلاك اليومي من سجل النشاطات (أنشطة المبيعات)
  // عدد أيام المبيعات المسجلة × متوسط المبيعات اليومية
  const avgDailySales = useMemo(() => {
    const saleActivities = activities.filter(a => a.type === 'sale');
    if (saleActivities.length === 0) return 0;
    // تقدير تقريبي: عدد أنشطة المبيعات / عدد الأيام الفريدة
    const uniqueDays = new Set(saleActivities.map(a => a.timestamp?.split(' ')[0])).size;
    return uniqueDays > 0 ? saleActivities.length / uniqueDays : 0;
  }, [activities]);

  // تصفية المنتجات منخفضة المخزون مع حساب الأيام المتوقعة قبل النفاد
  const lowStockItems = useMemo(() => {
    return products
      .filter((p: Product) => p.storeStock < lowStockThreshold)
      .sort((a: Product, b: Product) => a.storeStock - b.storeStock)
      .slice(0, maxItems)
      .map((p: Product) => ({
        ...p,
        daysToStockout: avgDailySales > 0
          ? Math.ceil(p.storeStock / avgDailySales)
          : null,
        severity: p.storeStock === 0
          ? 'critical' as const
          : p.storeStock <= lowStockThreshold / 2
            ? 'urgent' as const
            : 'warning' as const,
      }));
  }, [products, lowStockThreshold, avgDailySales, maxItems]);

  const severityConfig = {
    critical: {
      color: 'var(--vuno-danger)',
      label: 'نفد المخزون',
      bg: 'color-mix(in srgb, var(--vuno-danger) 14%, transparent)',
    },
    urgent: {
      color: 'var(--vuno-warning)',
      label: 'حرج',
      bg: 'color-mix(in srgb, var(--vuno-warning) 14%, transparent)',
    },
    warning: {
      color: 'var(--vuno-primary)',
      label: 'منخفض',
      bg: 'color-mix(in srgb, var(--vuno-primary) 12%, transparent)',
    },
  };

  const handleCreatePurchaseOrder = () => {
    navigate('/purchase-orders');
  };

  if (lowStockItems.length === 0) {
    return (
      <div className="p-2 text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: 'color-mix(in srgb, var(--vuno-success) 12%, transparent)' }}
        >
          <PackageIcon size={24} className="text-[var(--vuno-success)]" />
        </div>
        <p className="text-[14px] font-medium text-[var(--vuno-text-secondary)] mb-1">
          المخزون بحالة جيدة
        </p>
        <p className="text-[12px] text-[var(--vuno-text-muted)]">
          لا توجد منتجات منخفضة المخزون حالياً
        </p>
      </div>
    );
  }

  return (
    <div className="">
      {/* رأس الودجت */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b border-[var(--vuno-border-light)]"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--vuno-danger) 12%, transparent)' }}
          >
            <AlertTriangleIcon size={18} className="text-[var(--vuno-danger)]" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[var(--vuno-text)]">
              تنبيهات المخزون
            </h3>
            <p className="text-[11px] text-[var(--vuno-text-muted)]">
              {lowStockItems.length} منتج يحتاج إعادة طلب
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/inventory')}
          className="text-[11px] flex items-center gap-1 text-[var(--vuno-text-muted)] hover:text-[var(--vuno-text)] transition-colors"
        >
          عرض الكل
          <ArrowLeftIcon size={12} />
        </button>
      </div>

      {/* قائمة المنتجات */}
      <div className="divide-y divide-[var(--vuno-border-light)]">
        {lowStockItems.map((item, i) => {
          const config = severityConfig[item.severity];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.25) }}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--vuno-surface-pearl)] transition-colors border-r-2"
              style={{ borderColor: config.color }}
            >
              <div className="min-w-0 flex-1 ml-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-medium text-[var(--vuno-text)] truncate">
                    {item.name}
                  </span>
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ color: config.color, background: config.bg }}
                  >
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[var(--vuno-text-muted)]">
                  <span className="flex items-center gap-1">
                    <PackageIcon size={10} />
                    <span dir="ltr" className="tabular-nums">{item.storeStock}</span>
                    {' '}في المتجر
                  </span>
                  {item.warehouseStock > 0 && (
                    <span dir="ltr" className="tabular-nums">
                      {item.warehouseStock} في المخزن
                    </span>
                  )}
                  {item.daysToStockout !== null && item.daysToStockout > 0 && (
                    <span className="flex items-center gap-1" style={{ color: 'var(--vuno-danger)' }}>
                      <TrendingDownIcon size={10} />
                      ~{item.daysToStockout} يوم للنفاد
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleCreatePurchaseOrder}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all active:scale-95 flex-shrink-0"
                style={{
                  color: 'var(--vuno-primary)',
                  background: 'color-mix(in srgb, var(--vuno-primary) 10%, transparent)',
                }}
                aria-label={`إنشاء أمر شراء لـ ${item.name}`}
              >
                <ShoppingCartIcon size={12} />
                أمر شراء
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* تذييل: زر إنشاء أمر شراء شامل */}
      <div className="px-5 py-3 border-t border-[var(--vuno-border-light)]">
        <button
          onClick={handleCreatePurchaseOrder}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-medium text-white transition-all active:scale-[0.98]"
          style={{ background: 'var(--vuno-primary)' }}
        >
          <ShoppingCartIcon size={14} />
          إنشاء أمر شراء للمنتجات المنخفضة
        </button>
      </div>
    </div>
  );
}
