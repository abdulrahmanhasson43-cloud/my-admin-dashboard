import type { HeldOrder } from '@/types';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { readJson, writeJson } from '@/lib/storage';
import type { IHeldOrderRepository } from './IHeldOrderRepository';

/**
 * LocalStorageHeldOrderRepository — keeps parked carts in the browser so they
 * survive a refresh. TODO(phase-3): swap in data-services-context.tsx.
 */
export class LocalStorageHeldOrderRepository implements IHeldOrderRepository {
  load(): HeldOrder[] {
    return readJson<HeldOrder[]>(STORAGE_KEYS.heldOrders, []);
  }

  save(orders: HeldOrder[]): void {
    writeJson(STORAGE_KEYS.heldOrders, orders);
  }
}
