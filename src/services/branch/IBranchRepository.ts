import type { Branch } from '@/types';

/**
 * IBranchRepository — the abstraction (port) that BranchService depends on.
 * Concrete adapters implement this same interface, so swapping storage touches
 * exactly one file — the composition root — and nothing else in the app.
 */
export interface IBranchRepository {
  /** Returns every branch. Ordering is NOT guaranteed — callers sort as needed. */
  findAll(): Promise<Branch[]>;

  /** Returns a single branch by id, or null if it doesn't exist. */
  findById(id: string): Promise<Branch | null>;

  /** Persists a brand-new branch and returns the stored record. */
  insert(branch: Branch): Promise<Branch>;

  /** Persists a full replacement of an existing branch, or throws if the id is unknown. */
  update(branch: Branch): Promise<Branch>;

  /** Removes a branch by id. No-ops if it doesn't exist. */
  remove(id: string): Promise<void>;
}

/** Thrown by repository implementations when a branch id can't be found. */
export class BranchNotFoundError extends Error {
  constructor(id: string) {
    super(`Branch not found: ${id}`);
    this.name = 'BranchNotFoundError';
  }
}
