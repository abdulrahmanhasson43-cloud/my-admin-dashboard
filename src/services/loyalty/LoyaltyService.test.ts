import { describe, expect, it } from 'vitest';
import type { PointsEarnTransaction, PointsRedeemTransaction } from '@/types';
import { LoyaltyService } from './LoyaltyService';
import { MockLoyaltyRepository } from './MockLoyaltyRepository';

const earn = (clientId: string, points: number): PointsEarnTransaction =>
  ({ id: `e-${clientId}-${points}`, clientId, invoiceId: 'INV', points, date: '2026-01-01' });
const redeem = (clientId: string, pointsSpent: number): PointsRedeemTransaction =>
  ({ id: `r-${clientId}-${pointsSpent}`, clientId, reward: 'خصم', pointsSpent, date: '2026-01-02' });

const service = (earned: PointsEarnTransaction[], redeemed: PointsRedeemTransaction[] = []) =>
  new LoyaltyService(new MockLoyaltyRepository(earned, redeemed));

describe('LoyaltyService', () => {
  it('current points = earned − redeemed, for that client only', () => {
    const svc = service([earn('c1', 400), earn('c1', 200), earn('c2', 999)], [redeem('c1', 100), redeem('c2', 5)]);
    expect(svc.getClientPoints('c1')).toBe(500);
    expect(svc.getClientPoints('nobody')).toBe(0);
  });

  it('summary: level and the distance to the next level', () => {
    const summary = service([earn('c1', 600)], [redeem('c1', 100)]).getLoyaltySummary('c1');
    expect(summary.currentPoints).toBe(500);
    expect(summary.redeemedPoints).toBe(100);
    expect(summary.totalEarned).toBe(600);
    expect(summary.level.label).toBe('فضي');
    expect(summary.nextLevel?.label).toBe('ذهبي');
    expect(summary.pointsToNext).toBe(1000);
  });

  it('a client with no history is at the lowest level', () => {
    const summary = service([]).getLoyaltySummary('c1');
    expect(summary.level.label).toBe('برونزي');
    expect(summary.pointsToNext).toBe(500);
  });

  it('the top level has no next level and nothing left to reach', () => {
    const summary = service([earn('c1', 5000)]).getLoyaltySummary('c1');
    expect(summary.level.label).toBe('بلاتيني');
    expect(summary.nextLevel).toBeNull();
    expect(summary.pointsToNext).toBe(0);
  });

  it('an invoice earns one point per 10 EGP, rounded down', () => {
    const svc = service([]);
    expect(svc.calcInvoicePoints(1000)).toBe(100);
    expect(svc.calcInvoicePoints(99)).toBe(9);
    expect(svc.calcInvoicePoints(9)).toBe(0);
  });

  it('exposes the earn and redeem history per client', () => {
    const svc = service([earn('c1', 10), earn('c2', 20)], [redeem('c1', 5)]);
    expect(svc.getPointsEarned('c1')).toHaveLength(1);
    expect(svc.getPointsRedeemed('c1')).toHaveLength(1);
    expect(svc.getPointsRedeemed('c2')).toHaveLength(0);
  });
});
