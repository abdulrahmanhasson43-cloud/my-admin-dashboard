import type { FlashSale } from '@/types';
import { isFlashSaleActive } from '@/types';
import { sampleFlashSales } from '@/services/mock/flashSales';
import type { IFlashSaleRepository } from './IFlashSaleRepository';

/**
 * MockFlashSaleRepository — in-memory implementation of IFlashSaleRepository.
 *
 * TODO(phase-3): replace with a real adapter (e.g. FirestoreFlashSaleRepository)
 * that implements the same interface. Swap it in one place —
 * src/context/FlashSaleServiceContext.tsx — and nothing else changes.
 */
export class MockFlashSaleRepository implements IFlashSaleRepository {
  private readonly sales: FlashSale[];

  constructor(seed: FlashSale[] = sampleFlashSales) {
    this.sales = seed.map(s => ({ ...s }));
  }

  findAll(): FlashSale[] {
    return this.sales.map(s => ({ ...s }));
  }

  findActive(): FlashSale | null {
    const active = this.sales.find(isFlashSaleActive);
    return active ? { ...active } : null;
  }
}
