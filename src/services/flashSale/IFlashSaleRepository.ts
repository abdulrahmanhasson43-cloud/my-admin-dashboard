import type { FlashSale } from '@/types';

/**
 * IFlashSaleRepository — the abstraction (port) that FlashSaleService depends on.
 *
 * Flash-sale reads are pure computations over static data, so this interface
 * is synchronous. Dependency Inversion still holds: FlashSaleService depends
 * on this port, and a real backend adapter can replace MockFlashSaleRepository
 * without touching any UI code.
 */
export interface IFlashSaleRepository {
  /** Every flash sale. */
  findAll(): FlashSale[];

  /** The currently active flash sale (in window + stock remaining), or null. */
  findActive(): FlashSale | null;
}
