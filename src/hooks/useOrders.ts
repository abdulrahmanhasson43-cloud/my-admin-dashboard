import { useCallback, useEffect, useState } from 'react';
import type { Order, OrderStatus } from '@/types/order';
import type { CreateOrderInput } from '@/services/order';
import { useOrderService } from '@/context/order-service-context';
import { toErrorMessage } from '@/lib/utils';

/**
 * useOrders — the hook pages actually use. It layers ordinary React state
 * (loading/error/orders/refetch) on top of OrderService so components get a
 * familiar reactive API, while every bit of actual business logic and data
 * access still lives in OrderService + IOrderRepository underneath.
 *
 * A component using this hook never touches MockOrderRepository, Firestore,
 * or any other storage detail — only OrderService's public methods.
 *
 * Error handling (issue #3): a failed read is recorded in `error` instead of
 * being swallowed, and every mutation re-throws after recording the message,
 * so callers can `try { await createOrder(...) } catch { /* banner shows it *\/ }`.
 */
export function useOrders() {
  const orderService = useOrderService();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pure fetch — returns the snapshot WITHOUT touching state. Keeping it
  // state-free means it can be reused by the initial effect and by refetch,
  // and calling it from an effect doesn't trip react-hooks/set-state-in-effect.
  const load = useCallback(() => orderService.getAllOrders(), [orderService]);

  // Initial read. The state updates happen inside promise callbacks (never
  // synchronously in the effect body), and the cancelled flag stops a late
  // response from updating an unmounted component.
  useEffect(() => {
    let cancelled = false;
    load()
      .then((all) => {
        if (cancelled) return;
        setOrders(all);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(toErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  // Re-read the snapshot, tracking loading/error. Clears `error` on success so
  // a page-level retry button can dismiss the banner; re-throws on failure so
  // the caller can decide what to do.
  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await load();
      setOrders(all);
      setError(null);
    } catch (e: unknown) {
      setError(toErrorMessage(e));
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [load]);

  const createOrder = useCallback(async (input: CreateOrderInput) => {
    try {
      const created = await orderService.createOrder(input);
      setOrders(prev => [created, ...prev]);
      return created;
    } catch (e: unknown) {
      setError(toErrorMessage(e));
      throw e;
    }
  }, [orderService]);

  const moveOrderToStatus = useCallback(async (id: string, status: OrderStatus) => {
    try {
      const updated = await orderService.moveOrderToStatus(id, status);
      setOrders(prev => prev.map(o => (o.id === id ? updated : o)));
      return updated;
    } catch (e: unknown) {
      setError(toErrorMessage(e));
      throw e;
    }
  }, [orderService]);

  return { orders, isLoading, error, refetch, createOrder, moveOrderToStatus };
}
