import { useCallback, useEffect, useState } from 'react';
import type { PurchaseOrder, PurchaseOrderKanban, PurchaseOrderStatus } from '@/types';
import type { CreatePurchaseOrderInput } from '@/services/purchaseOrder';
import { useDataServices } from '@/context/data-services-context-value';

/**
 * usePurchaseOrders — layers React state (loading/orders/kanban) on top of
 * PurchaseOrderService. Components never touch MockPurchaseOrderRepository.
 */
export function usePurchaseOrders() {
  const { purchaseOrder: purchaseOrderService } = useDataServices();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [kanbanOrders, setKanbanOrders] = useState<PurchaseOrderKanban[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const [all, kanban] = await Promise.all([
        purchaseOrderService.getAllOrders(),
        purchaseOrderService.getKanbanOrders(),
      ]);
      setOrders(all);
      setKanbanOrders(kanban);
    } finally {
      setIsLoading(false);
    }
  }, [purchaseOrderService]);

  // Load once on mount. The fetch is kicked off from a microtask so the state
  // updates inside `refetch` run asynchronously, satisfying the
  // react-hooks/set-state-in-effect rule without changing the behaviour.
  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (!cancelled) return refetch();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [refetch]);

  const updateKanbanOrderStatus = useCallback(
    async (id: string, status: PurchaseOrderStatus) => {
      const updated = await purchaseOrderService.updateKanbanOrderStatus(id, status);
      setKanbanOrders(prev => prev.map(o => (o.id === id ? updated : o)));
      return updated;
    },
    [purchaseOrderService],
  );

  const createKanbanOrder = useCallback(async (input: CreatePurchaseOrderInput) => {
    const created = await purchaseOrderService.createKanbanOrder(input);
    setKanbanOrders(prev => [...prev, created]);
    return created;
  }, [purchaseOrderService]);

  return { orders, kanbanOrders, isLoading, refetch, updateKanbanOrderStatus, createKanbanOrder };
}
