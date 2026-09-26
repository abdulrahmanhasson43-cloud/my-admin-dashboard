import type {
  HeatmapCell,
  PerformerProduct,
  PeriodMetrics,
  PriceHistoryPoint,
} from '@/types';
import type { IReportingRepository, SalesPoint, TopProductRow } from './IReportingRepository';

/**
 * ReportingService — all aggregated reporting logic lives here, and ONLY here.
 *
 * High-level module in Dependency Inversion terms: it depends solely on the
 * IReportingRepository abstraction injected through the constructor. The UI
 * reaches this service through useReporting() and never touches services/mock.
 */
export class ReportingService {
  private readonly repository: IReportingRepository;

  constructor(repository: IReportingRepository) {
    this.repository = repository;
  }

  getSalesData(): SalesPoint[] {
    return this.repository.findSalesData();
  }

  getTopProducts(): TopProductRow[] {
    return this.repository.findTopProducts();
  }

  getHeatmapCells(): HeatmapCell[][] {
    return this.repository.findHeatmapCells();
  }

  getTopPerformers(): PerformerProduct[] {
    return this.repository.findTopPerformers();
  }

  getBottomPerformers(): PerformerProduct[] {
    return this.repository.findBottomPerformers();
  }

  getPeriodData(): Record<string, PeriodMetrics> {
    return this.repository.findPeriodData();
  }

  getAvailablePeriods(): string[] {
    return this.repository.findAvailablePeriods();
  }

  getPriceHistory(productId: string): PriceHistoryPoint[] {
    return this.repository.findPriceHistory(productId);
  }

  getPriceHistoryProducts(): string[] {
    return this.repository.findPriceHistoryProducts();
  }

  getPriceSuppliers(): string[] {
    return this.repository.findPriceSuppliers();
  }
}
