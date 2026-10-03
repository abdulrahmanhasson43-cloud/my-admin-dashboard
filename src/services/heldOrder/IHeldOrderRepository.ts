import type { HeldOrder } from '@/types';

/** IHeldOrderRepository — the port HeldOrderService depends on (synchronous, per-device). */
export interface IHeldOrderRepository {
  load(): HeldOrder[];
  save(orders: HeldOrder[]): void;
}
