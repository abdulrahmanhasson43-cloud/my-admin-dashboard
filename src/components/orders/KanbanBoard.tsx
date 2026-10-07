import { orderStatuses } from '@/constants/orderStatusMeta';
import type { Order, OrderStatus } from '@/types/order';
import KanbanColumn from '@/components/orders/KanbanColumn';

interface KanbanBoardProps {
  ordersByStatus: Record<OrderStatus, Order[]>;
  onDrop: (status: OrderStatus) => void;
  onDragStart: (id: string) => void;
  onAddOrder: () => void;
}

/* Kanban Board — desktop only; on mobile a tall stack of 4 full
   columns doesn't fit the screen well, so mobile gets a flat
   filterable list instead (MobileOrdersList). */
export default function KanbanBoard({ ordersByStatus, onDrop, onDragStart, onAddOrder }: KanbanBoardProps) {
  return (
    <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {orderStatuses.map((statusMeta, idx) => (
        <KanbanColumn
          key={statusMeta.id}
          statusMeta={statusMeta}
          orders={ordersByStatus[statusMeta.id]}
          onDrop={onDrop}
          onDragStart={onDragStart}
          onAddOrder={onAddOrder}
          canAdd={idx === 0}
        />
      ))}
    </div>
  );
}
