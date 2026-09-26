import type {
  HeatmapCell,
  PerformerProduct,
  PeriodMetrics,
  PriceHistoryPoint,
} from '@/types';

/** A single point on the sales-over-time chart. */
export interface SalesPoint {
  name: string;
  sales: number;
}

/** A single row on the top-products chart. */
export interface TopProductRow {
  name: string;
  sales: number;
  revenue: number;
}

/**
 * IReportingRepository — the abstraction (port) that ReportingService depends on.
 *
 * Reporting data is aggregated read-only data, so this interface is
 * synchronous. Dependency Inversion still holds: ReportingService depends on
 * this port, and a real analytics backend can replace MockReportingRepository
 * without touching any UI code.
 */
export interface IReportingRepository {
  findSalesData(): SalesPoint[];
  findTopProducts(): TopProductRow[];
  findHeatmapCells(): HeatmapCell[][];
  findTopPerformers(): PerformerProduct[];
  findBottomPerformers(): PerformerProduct[];
  findPeriodData(): Record<string, PeriodMetrics>;
  findAvailablePeriods(): string[];
  findPriceHistory(productId: string): PriceHistoryPoint[];
  findPriceHistoryProducts(): string[];
  findPriceSuppliers(): string[];
}
