import { useMemo } from 'react';
import { useDataServices } from '@/context/data-services-context-value';

/**
 * useLoyalty — exposes loyalty-points computations through LoyaltyService.
 * Components never touch services/mock directly.
 */
export function useLoyalty() {
  const { loyalty: loyaltyService } = useDataServices();

  return useMemo(
    () => ({
      getLoyaltySummary: (clientId: string) => loyaltyService.getLoyaltySummary(clientId),
      getClientPoints: (clientId: string) => loyaltyService.getClientPoints(clientId),
      calcInvoicePoints: (amount: number) => loyaltyService.calcInvoicePoints(amount),
      getPointsEarned: (clientId: string) => loyaltyService.getPointsEarned(clientId),
      getPointsRedeemed: (clientId: string) => loyaltyService.getPointsRedeemed(clientId),
    }),
    [loyaltyService],
  );
}
