import type { PurchaseOrder, PurchaseOrderKanban } from '@/types';

/**
 * IPurchaseOrderRepository — the abstraction (port) that PurchaseOrderService
 * depends on.
 *
 * Dependency Inversion: PurchaseOrderService (high-level policy) depends on
 * THIS interface, never on a concrete storage technology. A real backend
 * adapter can replace MockPurchaseOrderRepository without touching any UI code.
 */
export interface IPurchaseOrderRepository {
  /** Returns every legacy purchase order row. */
  findAll(): Promise<PurchaseOrder[]>;

  /** Returns every Kanban purchase order (5-stage pipeline). */
  findKanbanOrders(): Promise<PurchaseOrderKanban[]>;

  /** Persists a full replacement of an existing Kanban order, or throws if unknown. */
  updateKanbanOrder(order: PurchaseOrderKanban): Promise<PurchaseOrderKanban>;

  /** Persists a brand-new Kanban order and returns the stored record. */
  insertKanbanOrder(order: PurchaseOrderKanban): Promise<PurchaseOrderKanban>;
}

/** Thrown by repository implementations when a purchase order id can't be found. */
export class PurchaseOrderNotFoundError extends Error {
  constructor(id: string) {
    super(`Purchase order not found: ${id}`);
    this.name = 'PurchaseOrderNotFoundError';
  }
}
