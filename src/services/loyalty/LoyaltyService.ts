import type {
  LoyaltySummary,
  PointsEarnTransaction,
  PointsRedeemTransaction,
} from '@/types';
import { getLoyaltyLevel, getNextLoyaltyLevel } from '@/types';
import type { ILoyaltyRepository } from './ILoyaltyRepository';

/** Points earned per currency unit (1 EGP = 0.1 point). */
const POINTS_PER_CURRENCY_UNIT = 0.1;

/**
 * LoyaltyService — all loyalty-points business logic lives here, and ONLY here.
 *
 * High-level module in Dependency Inversion terms: it depends solely on the
 * ILoyaltyRepository abstraction injected through the constructor. The UI
 * reaches this service through useLoyalty() and never touches services/mock.
 */
export class LoyaltyService {
  private readonly repository: ILoyaltyRepository;

  constructor(repository: ILoyaltyRepository) {
    this.repository = repository;
  }

  /** Current spendable balance = total earned − total redeemed. */
  getClientPoints(clientId: string): number {
    const earned = this.repository
      .findEarned(clientId)
      .reduce((sum, t) => sum + t.points, 0);
    const redeemed = this.repository
      .findRedeemed(clientId)
      .reduce((sum, t) => sum + t.pointsSpent, 0);
    return earned - redeemed;
  }

  /** Full loyalty snapshot for a client (balance, level, progress to next). */
  getLoyaltySummary(clientId: string): LoyaltySummary {
    const currentPoints = this.getClientPoints(clientId);
    const redeemedPoints = this.repository
      .findRedeemed(clientId)
      .reduce((sum, t) => sum + t.pointsSpent, 0);
    const totalEarned = currentPoints + redeemedPoints;
    const level = getLoyaltyLevel(currentPoints);
    const nextLevel = getNextLoyaltyLevel(currentPoints);
    const pointsToNext = nextLevel ? nextLevel.minPoints - currentPoints : 0;

    return { currentPoints, redeemedPoints, totalEarned, level, nextLevel, pointsToNext };
  }

  /** Points a given invoice amount would earn. */
  calcInvoicePoints(amount: number): number {
    return Math.floor(amount * POINTS_PER_CURRENCY_UNIT);
  }

  getPointsEarned(clientId: string): PointsEarnTransaction[] {
    return this.repository.findEarned(clientId);
  }

  getPointsRedeemed(clientId: string): PointsRedeemTransaction[] {
    return this.repository.findRedeemed(clientId);
  }
}
