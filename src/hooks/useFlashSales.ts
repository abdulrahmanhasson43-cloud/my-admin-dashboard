import { useMemo } from 'react';
import { useDataServices } from '@/context/data-services-context-value';

/**
 * useFlashSales — exposes flash-sale data through FlashSaleService.
 * Components never touch services/mock directly.
 */
export function useFlashSales() {
  const { flashSale: flashSaleService } = useDataServices();

  return useMemo(
    () => ({
      flashSales: flashSaleService.getAllFlashSales(),
      activeFlashSale: flashSaleService.getActiveFlashSale(),
    }),
    [flashSaleService],
  );
}
