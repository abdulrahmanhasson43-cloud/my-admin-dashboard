import type { Supplier } from '@/types';

/**
 * ISupplierRepository — the abstraction (port) that SupplierService depends on.
 * Concrete adapters (MockSupplierRepository today; a Firestore/REST adapter
 * tomorrow) implement this same interface, so swapping storage touches exactly
 * one file — the composition root — and nothing else in the app.
 */
export interface ISupplierRepository {
  /** Returns every supplier. Ordering is NOT guaranteed — callers sort as needed. */
  findAll(): Promise<Supplier[]>;

  /** Returns a single supplier by id, or null if it doesn't exist. */
  findById(id: string): Promise<Supplier | null>;

  /** Persists a brand-new supplier and returns the stored record. */
  insert(supplier: Supplier): Promise<Supplier>;

  /** Persists a full replacement of an existing supplier, or throws if the id is unknown. */
  update(supplier: Supplier): Promise<Supplier>;

  /** Removes a supplier by id. No-ops if it doesn't exist. */
  remove(id: string): Promise<void>;
}

/** Thrown by repository implementations when a supplier id can't be found. */
export class SupplierNotFoundError extends Error {
  constructor(id: string) {
    super(`Supplier not found: ${id}`);
    this.name = 'SupplierNotFoundError';
  }
}
