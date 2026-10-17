import type {
  PointsEarnTransaction,
  PointsRedeemTransaction,
} from '@/types';

/**
 * ILoyaltyRepository — the abstraction (port) that LoyaltyService depends on.
 *
 * Loyalty reads are pure computations over transaction history, so this
 * interface is intentionally synchronous. Dependency Inversion still holds:
 * LoyaltyService depends on this port, and a real backend adapter can replace
 * MockLoyaltyRepository without touching any UI code.
 */
export interface ILoyaltyRepository {
  /** Every "points earned" transaction, optionally filtered by client. */
  findEarned(clientId?: string): PointsEarnTransaction[];

  /** Every "points redeemed" transaction, optionally filtered by client. */
  findRedeemed(clientId?: string): PointsRedeemTransaction[];
}
