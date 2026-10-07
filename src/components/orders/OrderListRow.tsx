import { PackageIcon } from '@/components/icons';
import { getOrderStatusMeta } from '@/constants/orderStatusMeta';
import { ORDER_PAYMENT_ICONS } from '@/constants/orderPaymentIcons';
import { countItems, relativeTime } from '@/lib/orders';
import { paymentMethodLabels, type Order } from '@/types/order';

/** OrderListRow — flat list row (mobile), no boxed card. */
export default function OrderListRow({ order }: { order: Order }) {
  const PayIcon = ORDER_PAYMENT_ICONS[order.paymentMethod];
  const itemCount = countItems(order.items);
  const statusMeta = getOrderStatusMeta(order.status);

  return (
    <div className="flex items-center justify-between gap-3 py-3.5 border-b border-[var(--vuno-border-light)] last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-[14px] text-[var(--vuno-text)]">{order.id}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1" style={{ background: `${statusMeta.color}1A`, color: statusMeta.color }}>
            <statusMeta.icon size={11} /> {statusMeta.label}
          </span>
        </div>
        <p className="text-[13px] text-[var(--vuno-text-secondary)] truncate">{order.customerName}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[11px] text-[var(--vuno-text-muted)] flex items-center gap-1">
            <PackageIcon size={12} /> {itemCount} قطعة
          </span>
          <span className="text-[11px] text-[var(--vuno-text-muted)] flex items-center gap-1">
            <PayIcon size={12} /> {paymentMethodLabels[order.paymentMethod]}
          </span>
          <span className="text-[11px] text-[var(--vuno-text-muted)]">{relativeTime(order.createdAt)}</span>
        </div>
      </div>
      <span className="font-bold text-[15px] tabular-nums text-[var(--vuno-text)] flex-shrink-0">
        {order.total.toLocaleString()} ج.م
      </span>
    </div>
  );
}
