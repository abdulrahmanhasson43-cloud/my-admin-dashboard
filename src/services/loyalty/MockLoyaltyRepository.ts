import type {
  PointsEarnTransaction,
  PointsRedeemTransaction,
} from '@/types';
import { pointsEarned, pointsRedeemed } from '@/services/mock/loyalty';
import type { ILoyaltyRepository } from './ILoyaltyRepository';

/**
 * MockLoyaltyRepository — in-memory implementation of ILoyaltyRepository.
 *
 * TODO(phase-3): replace with a real adapter (e.g. FirestoreLoyaltyRepository)
 * that implements the same interface. Swap it in one place —
 * src/context/LoyaltyServiceContext.tsx — and nothing else changes.
 */
export class MockLoyaltyRepository implements ILoyaltyRepository {
  private readonly earned: PointsEarnTransaction[];
  private readonly redeemed: PointsRedeemTransaction[];

  constructor(
    earnedSeed: PointsEarnTransaction[] = pointsEarned,
    redeemedSeed: PointsRedeemTransaction[] = pointsRedeemed,
  ) {
    this.earned = earnedSeed.map(t => ({ ...t }));
    this.redeemed = redeemedSeed.map(t => ({ ...t }));
  }

  findEarned(clientId?: string): PointsEarnTransaction[] {
    return clientId ? this.earned.filter(t => t.clientId === clientId) : [...this.earned];
  }

  findRedeemed(clientId?: string): PointsRedeemTransaction[] {
    return clientId ? this.redeemed.filter(t => t.clientId === clientId) : [...this.redeemed];
  }
}
