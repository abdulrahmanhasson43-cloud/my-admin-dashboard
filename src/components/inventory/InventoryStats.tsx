import { PackageIcon, TrendingUpIcon, AlertTriangleIcon } from '@/components/icons';
import StatsRow from '@/components/StatsRow';
import { formatStockValue, type InventorySummary } from '@/lib/inventory';

/** The four numbers at the top: products, units, stock value at cost, and how many are low. */
export default function InventoryStats({ summary }: { summary: InventorySummary }) {
  const stats = [
    { label: 'إجمالي المنتجات', value: summary.productCount.toString(), icon: PackageIcon, color: 'text-[var(--vuno-primary)] bg-[var(--vuno-surface-pearl)]' },
    { label: 'إجمالي الكمية', value: summary.totalItems.toLocaleString(), icon: TrendingUpIcon, color: 'text-emerald-500 bg-emerald-50' },
    { label: 'قيمة المخزون (بسعر الشراء)', value: formatStockValue(summary.totalValue), icon: TrendingUpIcon, color: 'text-[var(--vuno-primary)] bg-[var(--vuno-surface-pearl)]' },
    { label: 'منخفض المخزون بالمتجر', value: summary.lowStock.length.toString(), icon: AlertTriangleIcon, color: 'text-red-500 bg-red-50' },
  ];

  return <StatsRow items={stats} maxCols={4} />;
}
