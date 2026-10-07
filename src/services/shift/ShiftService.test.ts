import { describe, expect, it } from 'vitest';
import type { Shift } from '@/types';
import type { IShiftRepository } from './IShiftRepository';
import { NoOpenShiftError, ShiftService } from './ShiftService';

/** In-memory repository, so these tests never depend on browser storage. */
class FakeShiftRepository implements IShiftRepository {
  shifts: Shift[] = [];
  async findAll() { return this.shifts.map(s => ({ ...s })); }
  async insert(shift: Shift) { this.shifts.push({ ...shift }); return shift; }
  async update(shift: Shift) {
    this.shifts = this.shifts.map(s => (s.id === shift.id ? { ...shift } : s));
    return shift;
  }
}

const fresh = () => new ShiftService(new FakeShiftRepository());

describe('ShiftService', () => {
  it('opens a shift with the opening cash and nothing sold yet', async () => {
    const shift = await fresh().openShift('منى', 500);
    expect(shift).toMatchObject({ cashierName: 'منى', openingAmount: 500, status: 'open', totalSales: 0, invoiceCount: 0, closingAmount: null });
  });

  it('opening twice returns the already-open shift instead of a second one', async () => {
    const svc = fresh();
    const first = await svc.openShift('منى', 500);
    const second = await svc.openShift('أحمد', 999);
    expect(second.id).toBe(first.id);
    expect(await svc.getAllShifts()).toHaveLength(1);
  });

  it('recordSale adds to the total and counts the invoice', async () => {
    const svc = fresh();
    await svc.openShift('منى', 500);
    await svc.recordSale(100);
    const shift = await svc.recordSale(50);
    expect(shift).toMatchObject({ totalSales: 150, invoiceCount: 2 });
  });

  it('recordSale with no open shift does nothing and returns null', async () => {
    expect(await fresh().recordSale(100)).toBeNull();
  });

  it('closing computes the expected cash (opening + sales) and the variance', async () => {
    const svc = fresh();
    await svc.openShift('منى', 500);
    await svc.recordSale(300);
    const closed = await svc.closeShift(790);
    expect(closed).toMatchObject({ status: 'closed', expectedAmount: 800, closingAmount: 790, variance: -10 });
    expect(await svc.getCurrentShift()).toBeNull();
  });

  it('closing with no open shift is an error', async () => {
    await expect(fresh().closeShift(100)).rejects.toThrow(NoOpenShiftError);
  });

  it('a new shift can be opened after closing the previous one', async () => {
    const svc = fresh();
    await svc.openShift('منى', 100);
    await svc.closeShift(100);
    const second = await svc.openShift('أحمد', 200);
    expect(second).toMatchObject({ cashierName: 'أحمد', openingAmount: 200, status: 'open' });
    expect((await svc.getCurrentShift())?.cashierName).toBe('أحمد');
    expect(await svc.getAllShifts()).toHaveLength(2);
  });
});
