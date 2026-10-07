import { KanbanIcon, PackageIcon, DollarSignIcon, TruckIcon } from '@/components/icons';
import StatsRow from '@/components/StatsRow';
import type { OrdersSummary } from '@/lib/orders';

/** OrdersStats — the four headline numbers above the board. */
export default function OrdersStats({ summary }: { summary: OrdersSummary }) {
  const stats = [
    { label: 'إجمالي الطلبات', value: summary.total.toString(), icon: KanbanIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
    { label: 'طلبات جديدة', value: summary.newCount.toString(), icon: PackageIcon, color: 'bg-blue-50 text-blue-600' },
    { label: 'تم التسليم', value: summary.deliveredCount.toString(), icon: TruckIcon, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'إجمالي القيمة', value: `${(summary.revenue / 1000).toFixed(1)}K ج.م`, icon: DollarSignIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
  ];
  return <StatsRow items={stats} />;
}
