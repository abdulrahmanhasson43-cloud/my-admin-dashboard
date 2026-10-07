import { motion } from 'framer-motion';
import { PackageIcon } from '@/components/icons';
import { ORDER_PAYMENT_ICONS } from '@/constants/orderPaymentIcons';
import { countItems, relativeTime } from '@/lib/orders';
import { paymentMethodLabels, type Order } from '@/types/order';

interface OrderCardProps {
  order: Order;
  onDragStart: (id: string) => void;
}

/** OrderCard — a single draggable order in a Kanban column. */
export default function OrderCard({ order, onDragStart }: OrderCardProps) {
  const PayIcon = ORDER_PAYMENT_ICONS[order.paymentMethod];
  const itemCount = countItems(order.items);

  return (
    <motion.div
      layout
      draggable
      onDragStart={() => onDragStart(order.id)}
      className="bg-white rounded-2xl border border-[var(--vuno-border)] p-3.5 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow select-none"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-bold text-[15px] text-[var(--vuno-text)]">{order.id}</span>
        <span
          className="text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
          style={{ background: 'color-mix(in srgb, var(--vuno-primary) 10%, transparent)', color: 'var(--vuno-primary)' }}
        >
          <PayIcon size={12} />
          {paymentMethodLabels[order.paymentMethod]}
        </span>
      </div>

      <div className="space-y-0.5 mb-2.5">
        <p className="text-[13px] font-medium text-[var(--vuno-text)] truncate">{order.customerName}</p>
        <p className="text-[12px] text-[var(--vuno-text-muted)]" dir="ltr">{order.customerPhone}</p>
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-[var(--vuno-border)]">
        <div className="flex items-center gap-1.5 text-[12px] text-[var(--vuno-text-secondary)]">
          <PackageIcon size={14} />
          <span>{itemCount} قطعة</span>
        </div>
        <span className="font-bold text-[15px] text-[var(--vuno-primary)]">
          {order.total.toLocaleString()} ج.م
        </span>
      </div>

      <p className="text-[11px] text-[var(--vuno-text-muted)] mt-2">{relativeTime(order.createdAt)}</p>
    </motion.div>
  );
}
