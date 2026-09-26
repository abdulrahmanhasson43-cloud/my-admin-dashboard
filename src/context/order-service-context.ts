import { createContext, useContext } from 'react';
import type { OrderService } from '@/services/order';

export const OrderServiceContext = createContext<OrderService | null>(null);

/**
 * useOrderService — gives any component access to the injected OrderService
 * instance, without that component ever knowing which IOrderRepository is
 * behind it. Components should generally prefer the higher-level
 * useOrders() hook (src/hooks/useOrders.ts) for reactive state; reach for
 * this directly only when you need one-off imperative calls.
 */
export function useOrderService(): OrderService {
  const service = useContext(OrderServiceContext);
  if (!service) {
    throw new Error('useOrderService must be used within an OrderServiceProvider');
  }
  return service;
}
