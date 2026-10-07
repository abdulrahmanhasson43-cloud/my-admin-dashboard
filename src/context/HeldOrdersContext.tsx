import { useCallback, useMemo, type ReactNode } from 'react';
import { HeldOrdersContext } from '@/context/held-orders-context-value';
import { useDataServices } from './data-services-context-value';
import { useServiceState } from '@/hooks/useServiceState';
import type { CartItem, HeldOrder } from '@/types';

/**
 * HeldOrdersProvider — holds the parked POS carts in React state. Parking,
 * resuming and deleting are rules of HeldOrderService.
 */
export function HeldOrdersProvider({ children }: { children: ReactNode }) {
  const { heldOrder: service } = useDataServices();
  const [heldOrders, update] = useServiceState<HeldOrder[]>(() => service.getAll());

  const holdOrder = useCallback(
    (label: string, items: CartItem[], subtotal: number, tax: number, total: number, reason?: string) => {
      update(current => service.hold(current, { label, items, subtotal, tax, total, reason }));
    },
    [service, update],
  );

  /**
   * Takes an order out of the held list and returns it. `update` runs the
   * computation immediately (it is not a React updater), so the resumed order
   * is known by the time it returns.
   */
  const resumeOrder = useCallback(
    (id: string): HeldOrder | null => {
      const result: { order: HeldOrder | null } = { order: null };
      update(current => {
        const resumed = service.resume(current, id);
        result.order = resumed.order;
        return resumed.remaining;
      });
      return result.order;
    },
    [service, update],
  );

  const deleteHeldOrder = useCallback(
    (id: string) => {
      update(current => service.remove(current, id));
    },
    [service, update],
  );

  const heldCount = heldOrders.length;

  const value = useMemo(
    () => ({ heldOrders, holdOrder, resumeOrder, deleteHeldOrder, heldCount }),
    [heldOrders, holdOrder, resumeOrder, deleteHeldOrder, heldCount],
  );

  return <HeldOrdersContext.Provider value={value}>{children}</HeldOrdersContext.Provider>;
}
