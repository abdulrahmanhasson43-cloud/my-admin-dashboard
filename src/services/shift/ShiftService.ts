import type { Shift } from '@/types';
import type { IShiftRepository } from './IShiftRepository';

/** Thrown when closeShift() is called while no shift is open. */
export class NoOpenShiftError extends Error {
  constructor() {
    super('No shift is currently open');
    this.name = 'NoOpenShiftError';
  }
}

/**
 * ShiftService — all shift business logic lives here, and ONLY here
 * (opening/closing a shift, recording a sale against it). Depends solely on
 * the IShiftRepository abstraction injected through the constructor. The UI
 * reaches it through useShifts() / useShift() — never through
 * MockShiftRepository or localStorage directly.
 */
export class ShiftService {
  private readonly repository: IShiftRepository;

  constructor(repository: IShiftRepository) {
    this.repository = repository;
  }

  async getAllShifts(): Promise<Shift[]> {
    return this.repository.findAll();
  }

  /** The single currently-open shift, if any. */
  async getCurrentShift(): Promise<Shift | null> {
    const all = await this.repository.findAll();
    return all.find(s => s.status === 'open') ?? null;
  }

  /** Opens a new shift, or returns the already-open one if there is one. */
  async openShift(cashierName: string, openingAmount: number): Promise<Shift> {
    const existing = await this.getCurrentShift();
    if (existing) return existing;

    const shift: Shift = {
      id: 'SHF-' + Date.now().toString().slice(-6),
      cashierName,
      openingAmount,
      closingAmount: null,
      startedAt: new Date().toLocaleString('ar-EG'),
      closedAt: null,
      status: 'open',
      totalSales: 0,
      invoiceCount: 0,
    };
    return this.repository.insert(shift);
  }

  /** Closes the currently open shift, computing the expected amount and variance. */
  async closeShift(closingAmount: number): Promise<Shift> {
    const current = await this.getCurrentShift();
    if (!current) {
      throw new NoOpenShiftError();
    }
    const expectedAmount = current.openingAmount + current.totalSales;
    return this.repository.update({
      ...current,
      status: 'closed',
      closingAmount,
      closedAt: new Date().toLocaleString('ar-EG'),
      expectedAmount,
      variance: closingAmount - expectedAmount,
    });
  }

  /** Adds a sale to the currently open shift. No-ops (returns null) if none is open. */
  async recordSale(amount: number): Promise<Shift | null> {
    const current = await this.getCurrentShift();
    if (!current) return null;
    return this.repository.update({
      ...current,
      totalSales: current.totalSales + amount,
      invoiceCount: current.invoiceCount + 1,
    });
  }
}
