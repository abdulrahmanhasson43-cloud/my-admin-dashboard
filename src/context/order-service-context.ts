import { useDataServices } from './data-services-context-value';
import type { OrderService } from '@/services/order';

/**
 * useOrderService — gives any component the injected OrderService from the single
 * composition root (DataServicesProvider), without knowing which
 * IOrderRepository is behind it. Prefer the higher-level useOrders() hook for
 * reactive state; reach for this directly only for one-off imperative calls.
 */
export function useOrderService(): OrderService {
  return useDataServices().order;
}
