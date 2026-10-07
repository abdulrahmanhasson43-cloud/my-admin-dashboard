import type { Shift } from '@/types';

/**
 * IShiftRepository — the abstraction (port) that ShiftService depends on.
 * Unlike most other repositories, shift data was never seeded from
 * services/mock (there is no sampleShifts array) — it's real,
 * user-generated state persisted from the moment the first shift opens.
 * The port still exists so a real backend can replace the storage adapter
 * in one place, exactly like every other entity.
 */
export interface IShiftRepository {
  /** Returns every shift (open and closed). Ordering is NOT guaranteed. */
  findAll(): Promise<Shift[]>;

  /** Persists a brand-new shift and returns the stored record. */
  insert(shift: Shift): Promise<Shift>;

  /** Persists a full replacement of an existing shift, or throws if the id is unknown. */
  update(shift: Shift): Promise<Shift>;
}

/** Thrown by repository implementations when a shift id can't be found. */
export class ShiftNotFoundError extends Error {
  constructor(id: string) {
    super(`Shift not found: ${id}`);
    this.name = 'ShiftNotFoundError';
  }
}
