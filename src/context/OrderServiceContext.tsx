import { useMemo, type ReactNode } from 'react';
import { OrderService } from '@/services/order';
import { MockOrderRepository } from '@/services/order/MockOrderRepository';
import { OrderServiceContext } from './order-service-context';

/**
 * OrderServiceProvider — the composition root for the order module.
 *
 * This is the ONLY file in the entire app that is allowed to import
 * MockOrderRepository. Every other component reaches OrderService through
 * useOrderService() / useOrders() and has zero knowledge of what's behind
 * the IOrderRepository interface.
 *
 * TODO(phase-3): once a real backend exists, this becomes:
 *   new OrderService(new FirestoreOrderRepository(db))
 * — one line, here, and nowhere else in the app changes.
 */
export function OrderServiceProvider({ children }: { children: ReactNode }) {
  const service = useMemo(() => new OrderService(new MockOrderRepository()), []);

  return (
    <OrderServiceContext.Provider value={service}>
      {children}
    </OrderServiceContext.Provider>
  );
}
