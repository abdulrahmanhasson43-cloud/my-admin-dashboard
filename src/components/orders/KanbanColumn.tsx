import { useState } from 'react';
import { PlusIcon } from '@/components/icons';
import type { OrderStatusMeta } from '@/constants/orderStatusMeta';
import type { Order, OrderStatus } from '@/types/order';
import OrderCard from '@/components/orders/OrderCard';

interface KanbanColumnProps {
  statusMeta: OrderStatusMeta;
  orders: Order[];
  onDrop: (status: OrderStatus) => void;
  onDragStart: (id: string) => void;
  onAddOrder?: () => void;
  canAdd?: boolean;
}

/** KanbanColumn — a single status column that accepts dropped cards. */
export default function KanbanColumn({
  statusMeta,
  orders,
  onDrop,
  onDragStart,
  onAddOrder,
  canAdd,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => { e.preventDefault(); setIsOver(false); onDrop(statusMeta.id); }}
      className={`flex flex-col rounded-2xl transition-colors min-h-[200px] ${
        isOver ? 'bg-blue-50/60' : 'bg-[var(--vuno-surface)]'
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3.5 py-3 sticky top-0">
        <div className="flex items-center gap-2">
          <span style={{ color: statusMeta.color }} className="flex-shrink-0">
            <statusMeta.icon size={16} />
          </span>
          <h3 className="font-bold text-[14px] text-[var(--vuno-text)]">{statusMeta.label}</h3>
          <span
            className="text-[12px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${statusMeta.color}1A`, color: statusMeta.color }}
          >
            {orders.length}
          </span>
        </div>
        {canAdd && onAddOrder && (
          <button
            onClick={onAddOrder}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white transition-colors"
            style={{ color: statusMeta.color }}
            aria-label="إضافة طلب جديد"
          >
            <PlusIcon size={16} />
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 px-2.5 pb-3 space-y-2.5 overflow-y-auto">
        {orders.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-[13px] text-[var(--vuno-text-muted)]">
            اسحب الطلبات هنا
          </div>
        ) : (
          orders.map(order => (
            <OrderCard key={order.id} order={order} onDragStart={onDragStart} />
          ))
        )}
      </div>
    </div>
  );
}
