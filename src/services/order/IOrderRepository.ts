import type { Order } from '@/types/order';

/**
 * IOrderRepository — the abstraction (port) that OrderService depends on.
 *
 * This is the seam that makes Dependency Inversion actually work here:
 * OrderService (the high-level policy/business logic) depends on THIS
 * interface, never on a concrete storage technology. Concrete adapters
 * (MockOrderRepository today; a FirestoreOrderRepository or
 * RestApiOrderRepository tomorrow) depend on this interface too — both
 * the high-level and low-level modules depend on the same abstraction,
 * and the abstraction doesn't depend on either of them.
 *
 * Swapping storage later (e.g. moving off the in-memory mock and onto a
 * real backend) means writing ONE new class that implements this
 * interface and pointing the composition root (order-service-context.tsx)
 * at it — OrderService and every page that calls useOrders() stays
 * completely untouched.
 */
export interface IOrderRepository {
  /** Returns every order, newest first is NOT guaranteed — callers sort as needed. */
  findAll(): Promise<Order[]>;

  /** Returns a single order by id, or null if it doesn't exist. */
  findById(id: string): Promise<Order | null>;

  /** Persists a brand-new order and returns the stored record. */
  insert(order: Order): Promise<Order>;

  /**
   * Persists a full replacement of an existing order (used after the
   * service has computed the new state — e.g. new status + appended
   * timeline entry). Returns the updated record, or throws if the id
   * doesn't exist.
   */
  update(order: Order): Promise<Order>;

  /** Removes an order by id. No-ops if it doesn't exist. */
  remove(id: string): Promise<void>;
}

/** Thrown by repository implementations when an id can't be found. */
export class OrderNotFoundError extends Error {
  constructor(id: string) {
    super(`Order not found: ${id}`);
    this.name = 'OrderNotFoundError';
  }
}
