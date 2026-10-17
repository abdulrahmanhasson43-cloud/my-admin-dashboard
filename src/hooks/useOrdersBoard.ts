import { useMemo, useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import {
  groupByStatus, ordersForStatusFilter, ordersWithin, summarizeOrders,
  type OrderStatusFilter, type OrderTimeFilter,
} from '@/lib/orders';
import type { OrderStatus } from '@/types/order';

/**
 * State of the orders screen: the orders (through useOrders → OrderService), the two filters,
 * which card is being dragged, and everything the screen shows worked out from them.
 * What each of those means is decided in lib/orders.ts; the page only lays it out.
 */
export function useOrdersBoard() {
  const { orders, isLoading, error, refetch, moveOrderToStatus, createOrder } = useOrders();
  const [timeFilter, setTimeFilter] = useState<OrderTimeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Capture "now" once per mount and keep it stable. Computing Date.now() directly inside useMemo
  // violates React Compiler's purity rule, and recomputing the time-window filter on every
  // keystroke would be wasteful. useState with a lazy initializer runs the initializer only on
  // the first render and never again, giving a stable timestamp without an impure call during render.
  const [mountTime] = useState(() => Date.now());

  const visibleOrders = useMemo(() => ordersWithin(orders, timeFilter, mountTime), [orders, timeFilter, mountTime]);
  /** The desktop board: one column per status, inside the chosen time window. */
  const columns = useMemo(() => groupByStatus(visibleOrders), [visibleOrders]);
  /** The phone-size list: the chosen status (or all), inside the chosen time window. */
  const listOrders = useMemo(() => ordersForStatusFilter(visibleOrders, statusFilter), [visibleOrders, statusFilter]);
  /** The stats row counts every order, whatever the filters say. */
  const summary = useMemo(() => summarizeOrders(orders), [orders]);

  /**
   * Drops the card being dragged on a column. Resolves to true when the order was moved and to false
   * when nothing was being dragged; rejects when the move failed (useOrders has already recorded the error).
   */
  const dropOn = async (status: OrderStatus): Promise<boolean> => {
    if (!draggedId) return false;
    try {
      await moveOrderToStatus(draggedId, status);
      return true;
    } finally {
      setDraggedId(null);
    }
  };

  return {
    orders, isLoading, error, refetch, createOrder,
    timeFilter, setTimeFilter, statusFilter, setStatusFilter,
    columns, listOrders, summary,
    startDrag: setDraggedId,
    dropOn,
  };
}
