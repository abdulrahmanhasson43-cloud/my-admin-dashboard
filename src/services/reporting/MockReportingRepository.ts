import type {
  HeatmapCell,
  PerformerProduct,
  PeriodMetrics,
  PriceHistoryPoint,
} from '@/types';
import { salesData, topProducts } from '@/services/mock/dashboard';
import {
  heatmapCells,
  topPerformers,
  bottomPerformers,
  periodData,
  availablePeriods,
  mockPriceHistory,
  priceSuppliers,
} from '@/services/mock/analytics';
import type { IReportingRepository, SalesPoint, TopProductRow } from './IReportingRepository';

/**
 * MockReportingRepository — in-memory implementation of IReportingRepository.
 *
 * TODO(phase-3): replace with a real adapter (e.g. AnalyticsReportingRepository)
 * that implements the same interface. Swap it in one place —
 * src/context/ReportingServiceContext.tsx — and nothing else changes.
 */
export class MockReportingRepository implements IReportingRepository {
  findSalesData(): SalesPoint[] {
    return salesData.map(p => ({ ...p }));
  }

  findTopProducts(): TopProductRow[] {
    return topProducts.map(p => ({ ...p }));
  }

  findHeatmapCells(): HeatmapCell[][] {
    return heatmapCells.map(row => row.map(cell => ({ ...cell })));
  }

  findTopPerformers(): PerformerProduct[] {
    return topPerformers.map(p => ({ ...p }));
  }

  findBottomPerformers(): PerformerProduct[] {
    return bottomPerformers.map(p => ({ ...p }));
  }

  findPeriodData(): Record<string, PeriodMetrics> {
    return Object.fromEntries(
      Object.entries(periodData).map(([key, value]) => [key, { ...value }]),
    );
  }

  findAvailablePeriods(): string[] {
    return [...availablePeriods];
  }

  findPriceHistory(productId: string): PriceHistoryPoint[] {
    return (mockPriceHistory[productId] ?? []).map(p => ({ ...p }));
  }

  findPriceHistoryProducts(): string[] {
    return Object.keys(mockPriceHistory);
  }

  findPriceSuppliers(): string[] {
    return [...priceSuppliers];
  }
}
