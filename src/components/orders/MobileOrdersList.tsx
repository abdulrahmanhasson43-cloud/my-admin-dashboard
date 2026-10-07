import { orderStatuses } from '@/constants/orderStatusMeta';
import type { Order, OrderStatus } from '@/types/order';
import OrderListRow from '@/components/orders/OrderListRow';

interface MobileOrdersListProps {
  statusFilter: OrderStatus | 'all';
  onStatusFilterChange: (filter: OrderStatus | 'all') => void;
  ordersByStatus: Record<OrderStatus, Order[]>;
  /** The orders to list, already filtered and sorted. */
  orders: Order[];
}

/** Mobile — status chips + flat full-width list, no boxed cards. */
export default function MobileOrdersList({
  statusFilter, onStatusFilterChange, ordersByStatus, orders,
}: MobileOrdersListProps) {
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
            <span className="opacity-70">({ordersByStatus[s.id].length})</span>
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
