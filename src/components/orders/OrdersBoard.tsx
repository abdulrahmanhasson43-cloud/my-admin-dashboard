import KanbanColumn from '@/components/orders/KanbanColumn';
import { orderStatuses } from '@/constants/orderStatusMeta';
import type { Order, OrderStatus } from '@/types/order';

/**
 * Kanban board — desktop only; on a phone a tall stack of 4 full columns doesn't fit the screen
 * well, so a phone gets a flat filterable list instead (MobileOrdersList).
 */
export default function OrdersBoard({
  columns,
  onDrop,
  onDragStart,
  onAddOrder,
}: {
  columns: Record<OrderStatus, ReadonlyArray<Order>>;
  onDrop: (status: OrderStatus) => void;
  onDragStart: (id: string) => void;
  onAddOrder: () => void;
}) {
  return (
    <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {orderStatuses.map((statusMeta, idx) => (
        <KanbanColumn
          key={statusMeta.id}
          statusMeta={statusMeta}
          orders={columns[statusMeta.id]}
          onDrop={onDrop}
          onDragStart={onDragStart}
          onAddOrder={onAddOrder}
          canAdd={idx === 0}
        />
      ))}
    </div>
  );
}
