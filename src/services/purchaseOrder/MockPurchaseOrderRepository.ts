import type { PurchaseOrder, PurchaseOrderKanban } from '@/types';
import { sampleOrders, samplePurchaseKanbanOrders } from '@/services/mock/purchaseOrders';
import { PurchaseOrderNotFoundError } from './IPurchaseOrderRepository';
import type { IPurchaseOrderRepository } from './IPurchaseOrderRepository';

/**
 * MockPurchaseOrderRepository — an in-memory implementation of
 * IPurchaseOrderRepository.
 *
 * TODO(phase-3): replace with a real adapter (e.g. FirestorePurchaseOrderRepository)
 * that implements the same interface. Swap it in one place —
 * src/context/PurchaseOrderServiceContext.tsx — and nothing else changes.
 */
export class MockPurchaseOrderRepository implements IPurchaseOrderRepository {
  private readonly orders: PurchaseOrder[];
  private kanbanOrders: PurchaseOrderKanban[];

  constructor(
    seed: PurchaseOrder[] = sampleOrders,
    kanbanSeed: PurchaseOrderKanban[] = samplePurchaseKanbanOrders,
  ) {
    this.orders = seed.map(o => ({ ...o }));
    // Deep-copy items so mutations here never reach the shared mock fixtures.
    this.kanbanOrders = kanbanSeed.map(o => ({ ...o, items: o.items.map(i => ({ ...i })) }));
  }

  async findAll(): Promise<PurchaseOrder[]> {
    return [...this.orders];
  }

  async findKanbanOrders(): Promise<PurchaseOrderKanban[]> {
    return this.kanbanOrders.map(o => ({ ...o, items: o.items.map(i => ({ ...i })) }));
  }

  async updateKanbanOrder(order: PurchaseOrderKanban): Promise<PurchaseOrderKanban> {
    const index = this.kanbanOrders.findIndex(o => o.id === order.id);
    if (index === -1) {
      throw new PurchaseOrderNotFoundError(order.id);
    }
    this.kanbanOrders = [
      ...this.kanbanOrders.slice(0, index),
      order,
      ...this.kanbanOrders.slice(index + 1),
    ];
    return order;
  }

  async insertKanbanOrder(order: PurchaseOrderKanban): Promise<PurchaseOrderKanban> {
    this.kanbanOrders = [...this.kanbanOrders, order];
    return order;
  }
}
