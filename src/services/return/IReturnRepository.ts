import type { ReturnRequest } from '@/types/return';

/**
 * IReturnRepository — the abstraction (port) that ReturnService depends on.
 *
 * Same seam as IOrderRepository: ReturnService (business logic) depends
 * only on this interface, never on a concrete storage technology. Swapping
 * storage later means writing one new class that implements this interface
 * and pointing the composition root (ReturnServiceContext.tsx) at it —
 * ReturnService and every page that calls useReturns() stays untouched.
 */
export interface IReturnRepository {
  /** Returns every return request; callers sort as needed. */
  findAll(): Promise<ReturnRequest[]>;

  /** Returns a single return by id, or null if it doesn't exist. */
  findById(id: string): Promise<ReturnRequest | null>;

  /** Persists a brand-new return and returns the stored record. */
  insert(ret: ReturnRequest): Promise<ReturnRequest>;

  /** Persists a full replacement of an existing return. Throws if the id doesn't exist. */
  update(ret: ReturnRequest): Promise<ReturnRequest>;

  /** Removes a return by id. No-ops if it doesn't exist. */
  remove(id: string): Promise<void>;
}

/** Thrown by repository implementations when an id can't be found. */
export class ReturnNotFoundError extends Error {
  constructor(id: string) {
    super(`Return not found: ${id}`);
    this.name = 'ReturnNotFoundError';
  }
}
