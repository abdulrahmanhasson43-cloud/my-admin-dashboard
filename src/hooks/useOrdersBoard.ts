import { useState } from 'react';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '@/types/order';
import type { CreateOrderInput } from '@/services/order';
import { getOrderStatusMeta } from '@/constants/orderStatusMeta';
import {
  filterOrdersByTime, groupOrdersByStatus, ordersForStatusFilter, type OrderTimeFilter,
} from '@/lib/orders';

interface OrdersBoardInput {
  orders: Order[];
  /** From `useOrders()` — passed in, because each `useOrders()` call has its own state. */
  moveOrderToStatus: (id: string, status: OrderStatus) => Promise<unknown>;
  createOrder: (input: CreateOrderInput) => Promise<Order>;
}

/**
 * useOrdersBoard — everything the Orders screen remembers and does: the time
 * and status filters, the drag-and-drop between columns, and the new-order modal.
 * The filtering and grouping rules are pure functions in `lib/orders.ts`.
 */
export function useOrdersBoard({ orders, moveOrderToStatus, createOrder }: OrdersBoardInput) {
  const [timeFilter, setTimeFilter] = useState<OrderTimeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // Capture "now" once per mount and keep it stable. Computing Date.now()
  // directly during render violates React Compiler's purity rule, and
  // recomputing the time-window filter on every keystroke would be wasteful.
  // useState with a lazy initializer runs the initializer only on the first
  // render and never again, giving us a stable timestamp without an impure
  // call during render or ref access during render.
  const [mountTime] = useState(() => Date.now());

  const filteredOrders = filterOrdersByTime(orders, timeFilter, mountTime);
  const ordersByStatus = groupOrdersByStatus(filteredOrders);
  const mobileOrders = ordersForStatusFilter(filteredOrders, ordersByStatus, statusFilter);

  const handleDrop = async (status: OrderStatus) => {
    if (!draggedId) return;
    try {
      await moveOrderToStatus(draggedId, status);
      toast.success(`تم نقل الطلب إلى ${getOrderStatusMeta(status).label}`);
    } catch {
      toast.error('تعذّر نقل الطلب، حاول مرة أخرى');
    } finally {
      setDraggedId(null);
    }
  };

  const handleCreate = async (input: CreateOrderInput) => {
    try {
      const order = await createOrder(input);
      setShowNewModal(false);
      toast.success(`تم إنشاء الطلب ${order.id}`);
    } catch {
      toast.error('تعذّر إنشاء الطلب، تحقق من البيانات المدخلة');
    }
  };

  return {
    timeFilter, setTimeFilter,
    statusFilter, setStatusFilter,
    ordersByStatus,
    mobileOrders,
    setDraggedId,
    handleDrop,
    handleCreate,
    showNewModal,
    openNewModal: () => setShowNewModal(true),
    closeNewModal: () => setShowNewModal(false),
  };
}
