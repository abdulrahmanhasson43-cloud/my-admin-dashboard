import OrderListRow from '@/components/orders/OrderListRow';
import { orderStatuses } from '@/constants/orderStatusMeta';
import type { OrderStatusFilter } from '@/lib/orders';
import type { Order, OrderStatus } from '@/types/order';

/** Phone-size screens — status chips (with how many orders each holds) + a flat full-width list, no boxed cards. */
export default function MobileOrdersList({
  columns,
  orders,
  statusFilter,
  onStatusFilterChange,
}: {
  /** The orders of each status — only their number is shown, on the chips. */
  columns: Record<OrderStatus, ReadonlyArray<Order>>;
  /** What the list shows: the chosen status, or every order. */
  orders: ReadonlyArray<Order>;
  statusFilter: OrderStatusFilter;
  onStatusFilterChange: (filter: OrderStatusFilter) => void;
}) {
  return (
    <div className="lg:hidden">
      <div className="flex gap-2 overflow-x-auto scrollbar-hidden mb-3">
        <button
          onClick={() => onStatusFilterChange('all')}
          className={`px-3.5 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all ${
            statusFilter === 'all' ? 'bg-[var(--vuno-text)] text-white' : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)]'
          }`}
        >
          الكل
        </button>
        {orderStatuses.map(s => (
          <button
            key={s.id}
            onClick={() => onStatusFilterChange(s.id)}
            className={`px-3.5 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
              statusFilter === s.id ? 'bg-[var(--vuno-text)] text-white' : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)]'
            }`}
          >
            <s.icon size={13} />
            {s.label}
            <span className="opacity-70">({columns[s.id].length})</span>
          </button>
        ))}
      </div>

      <div>
        {orders.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-[13px] text-[var(--vuno-text-muted)]">
            لا توجد طلبات
          </div>
        ) : (
          orders.map(order => <OrderListRow key={order.id} order={order} />)
        )}
      </div>
    </div>
  );
}
