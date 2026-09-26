import type { Shift } from '@/types';
import { ShiftNotFoundError } from './IShiftRepository';
import type { IShiftRepository } from './IShiftRepository';

const STORAGE_KEY = 'vuno_shifts';

function loadShifts(): Shift[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Shift[];
  } catch {
    // ignore
  }
  return [];
}

function persistShifts(shifts: Shift[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
  } catch {
    // ignore
  }
}

/**
 * MockShiftRepository — persists shifts to localStorage, exactly like the
 * previous ShiftContext implementation did before this fix. ShiftService
 * never imports this file, and never touches localStorage directly — only
 * this adapter does.
 *
 * TODO(phase-3): replace with a real adapter implementing the same
 * interface. Swap it in one place — src/context/data-services-context.tsx.
 */
export class MockShiftRepository implements IShiftRepository {
  private shifts: Shift[];

  constructor() {
    this.shifts = loadShifts();
  }

  async findAll(): Promise<Shift[]> {
    return [...this.shifts];
  }

  async insert(shift: Shift): Promise<Shift> {
    this.shifts = [shift, ...this.shifts];
    persistShifts(this.shifts);
    return shift;
  }

  async update(shift: Shift): Promise<Shift> {
    const index = this.shifts.findIndex(s => s.id === shift.id);
    if (index === -1) {
      throw new ShiftNotFoundError(shift.id);
    }
    this.shifts = [
      ...this.shifts.slice(0, index),
      shift,
      ...this.shifts.slice(index + 1),
    ];
    persistShifts(this.shifts);
    return shift;
  }
}
