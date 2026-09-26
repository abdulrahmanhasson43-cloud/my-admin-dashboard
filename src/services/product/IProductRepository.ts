import type { Product } from '@/types';

/**
 * PendingTransfer — a warehouse→store move that is waiting for confirmation.
 *
 * This is a domain concept, so it lives in the service layer (not in the
 * React context). The context layer imports it from here — never the other
 * way around — so the Dependency Rule (Clean Architecture, ch. 22) holds:
 * source-code dependencies point inward, toward higher-level policy.
 */
export interface PendingTransfer {
  id: string;
  productId: string;
  quantity: number;
  createdAt: string;
}

/** A completed warehouse→store move, kept for the audit trail. */
export interface TransferHistoryEntry {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  direction: 'warehouse-to-store';
  timestamp: string;
}

/**
 * IProductRepository — the abstraction (port) that ProductService depends on.
 *
 * This is the seam that makes Dependency Inversion real for the product
 * module. ProductService (the high-level policy: pricing, stock rules,
 * transfer rules) depends on THIS interface, never on a concrete storage
 * technology. Concrete adapters (MockProductRepository today; a
 * FirestoreProductRepository or RestApiProductRepository tomorrow) depend on
 * this interface too — both high-level and low-level modules depend on the
 * same abstraction, and the abstraction depends on neither.
 *
 * Swapping storage later means writing ONE new class that implements this
 * interface and pointing the composition root (product-service-context.tsx)
 * at it — ProductService and every page that calls useProducts() stays
 * completely untouched.
 */
export interface IProductRepository {
  /** Returns every product. Ordering is NOT guaranteed — callers sort as needed. */
  findAll(): Promise<Product[]>;

  /** Returns a single product by id, or null if it doesn't exist. */
  findById(id: string): Promise<Product | null>;

  /** Persists a brand-new product and returns the stored record. */
  insert(product: Product): Promise<Product>;

  /**
   * Persists a full replacement of an existing product (used after the
   * service has recomputed stock levels). Returns the updated record, or
   * throws ProductNotFoundError if the id doesn't exist.
   */
  update(product: Product): Promise<Product>;

  /** Removes a product by id. No-ops if it doesn't exist. */
  remove(id: string): Promise<void>;

  // --- Transfer queue + audit trail (kept alongside products so a real
  // backend can persist them in the same transaction as the stock change) ---

  /** Returns every transfer still waiting for confirmation. */
  findPendingTransfers(): Promise<PendingTransfer[]>;

  /** Queues a new pending transfer. */
  insertPendingTransfer(transfer: PendingTransfer): Promise<PendingTransfer>;

  /** Removes a pending transfer by id. No-ops if it doesn't exist. */
  removePendingTransfer(id: string): Promise<void>;

  /** Returns the most recent transfer history entries, newest first. */
  findTransferHistory(): Promise<TransferHistoryEntry[]>;

  /** Appends a completed transfer to the audit trail. */
  insertTransferHistory(entry: TransferHistoryEntry): Promise<TransferHistoryEntry>;
}

/** Thrown by repository implementations when a product id can't be found. */
export class ProductNotFoundError extends Error {
  constructor(id: string) {
    super(`Product not found: ${id}`);
    this.name = 'ProductNotFoundError';
  }
}
