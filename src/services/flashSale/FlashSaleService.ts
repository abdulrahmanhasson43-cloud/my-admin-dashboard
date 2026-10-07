import type { FlashSale } from '@/types';
import type { IFlashSaleRepository } from './IFlashSaleRepository';

/**
 * FlashSaleService — all flash-sale logic lives here, and ONLY here.
 *
 * High-level module in Dependency Inversion terms: it depends solely on the
 * IFlashSaleRepository abstraction injected through the constructor. The UI
 * reaches this service through useFlashSales() and never touches services/mock.
 */
export class FlashSaleService {
  private readonly repository: IFlashSaleRepository;

  constructor(repository: IFlashSaleRepository) {
    this.repository = repository;
  }

  getAllFlashSales(): FlashSale[] {
    return this.repository.findAll();
  }

  getActiveFlashSale(): FlashSale | null {
    return this.repository.findActive();
  }
}
