import type { StaffMember } from '@/types';

/**
 * IStaffRepository — the abstraction (port) that StaffService depends on.
 *
 * Dependency Inversion: StaffService (high-level policy) depends on THIS
 * interface, never on a concrete storage technology. A real backend adapter
 * can replace MockStaffRepository without touching any UI code.
 */
export interface IStaffRepository {
  /** Returns every staff member. */
  findAll(): Promise<StaffMember[]>;

  /** Returns a single staff member by id, or null if they don't exist. */
  findById(id: string): Promise<StaffMember | null>;

  /** Persists a brand-new staff member and returns the stored record. */
  insert(member: StaffMember): Promise<StaffMember>;

  /** Persists a full replacement of an existing staff member. */
  update(member: StaffMember): Promise<StaffMember>;

  /** Removes a staff member by id. No-ops if they don't exist. */
  remove(id: string): Promise<void>;
}

/** Thrown by repository implementations when a staff id can't be found. */
export class StaffNotFoundError extends Error {
  constructor(id: string) {
    super(`Staff member not found: ${id}`);
    this.name = 'StaffNotFoundError';
  }
}
