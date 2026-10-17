import { describe, expect, it } from 'vitest';
import type { FlashSale } from '@/types';
import { FlashSaleService } from './FlashSaleService';
import { MockFlashSaleRepository } from './MockFlashSaleRepository';

const HOUR = 3_600_000;
const sale = (id: string, overrides: Partial<FlashSale> = {}): FlashSale => ({
  id, productId: 'p', productName: 'سماعة', originalPrice: 100, salePrice: 70,
  totalQty: 10, soldQty: 0,
  startAt: new Date(Date.now() - HOUR).toISOString(),
  endAt: new Date(Date.now() + HOUR).toISOString(),
  active: true,
  ...overrides,
});

const service = (seed: FlashSale[]) => new FlashSaleService(new MockFlashSaleRepository(seed));

describe('FlashSaleService', () => {
  it('returns the sale that is running right now', () => {
    expect(service([sale('now')]).getActiveFlashSale()?.id).toBe('now');
  });

  it('ignores sales that are switched off, not started, ended or sold out', () => {
    const svc = service([
      sale('off', { active: false }),
      sale('future', { startAt: new Date(Date.now() + HOUR).toISOString(), endAt: new Date(Date.now() + 2 * HOUR).toISOString() }),
      sale('past', { startAt: new Date(Date.now() - 2 * HOUR).toISOString(), endAt: new Date(Date.now() - HOUR).toISOString() }),
      sale('soldout', { soldQty: 10 }),
    ]);
    expect(svc.getActiveFlashSale()).toBeNull();
    expect(svc.getAllFlashSales()).toHaveLength(4);
  });

  it('with several running, the first one wins', () => {
    expect(service([sale('a'), sale('b')]).getActiveFlashSale()?.id).toBe('a');
  });
});
