import type { Bundle } from '@/types';

/**
 * IBundleRepository — the abstraction (port) that BundleService depends on.
 *
 * Dependency Inversion: BundleService (high-level policy) depends on THIS
 * interface, never on a concrete storage technology. A real backend adapter
 * can replace MockBundleRepository without touching any UI code.
 */
export interface IBundleRepository {
  /** Returns every bundle. */
  findAll(): Promise<Bundle[]>;

  /** Returns a single bundle by id, or null if it doesn't exist. */
  findById(id: string): Promise<Bundle | null>;

  /** Persists a brand-new bundle and returns the stored record. */
  insert(bundle: Bundle): Promise<Bundle>;

  /** Persists a full replacement of an existing bundle. */
  update(bundle: Bundle): Promise<Bundle>;

  /** Removes a bundle by id. No-ops if it doesn't exist. */
  remove(id: string): Promise<void>;
}

/** Thrown by repository implementations when a bundle id can't be found. */
export class BundleNotFoundError extends Error {
  constructor(id: string) {
    super(`Bundle not found: ${id}`);
    this.name = 'BundleNotFoundError';
  }
}
