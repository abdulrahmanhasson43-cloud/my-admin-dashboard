import { useMemo } from 'react';
import { useDataServices } from '@/context/data-services-context-value';

/**
 * useReporting — exposes the aggregated reporting data through ReportingService.
 * Components never touch services/mock directly.
 */
export function useReporting() {
  const { reporting: reportingService } = useDataServices();

  return useMemo(
    () => ({
      getSalesData: () => reportingService.getSalesData(),
      getTopProducts: () => reportingService.getTopProducts(),
      getHeatmapCells: () => reportingService.getHeatmapCells(),
      getTopPerformers: () => reportingService.getTopPerformers(),
      getBottomPerformers: () => reportingService.getBottomPerformers(),
      getPeriodData: () => reportingService.getPeriodData(),
      getAvailablePeriods: () => reportingService.getAvailablePeriods(),
      getPriceHistory: (productId: string) => reportingService.getPriceHistory(productId),
      getPriceHistoryProducts: () => reportingService.getPriceHistoryProducts(),
      getPriceSuppliers: () => reportingService.getPriceSuppliers(),
      getWeekSales: () => reportingService.getWeekSales(),
      getYearSales: () => reportingService.getYearSales(),
      getLastSevenDaysSales: () => reportingService.getLastSevenDaysSales(),
      getCategorySales: () => reportingService.getCategorySales(),
      getCategoryRevenue: () => reportingService.getCategoryRevenue(),
      getPaymentMethodShare: () => reportingService.getPaymentMethodShare(),
      getTotalLosses: () => reportingService.getTotalLosses(),
      getTodayRevenue: () => reportingService.getTodayRevenue(),
    }),
    [reportingService],
  );
}
