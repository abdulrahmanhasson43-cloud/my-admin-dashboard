import { beforeEach, describe, expect, it } from 'vitest';
import type { CartItem, Product } from '@/types';
import { InvalidProductError, ProductService } from './ProductService';
import { MockProductRepository } from './MockProductRepository';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '1',
    name: 'سماعة بلوتوث',
    category: 'إلكترونيات',
    price: 100,
    cost: 60,
    wholesalePrice: 80,
    stock: 15,
    storeStock: 10,
    warehouseStock: 5,
    barcode: '1000000000001',
    status: 'active',
    ...overrides,
  };
}

/** A product as the form submits it: everything except the id. */
function makeDraft(): Omit<Product, 'id'> {
  const product: Partial<Product> = makeProduct();
  delete product.id;
  return product as Omit<Product, 'id'>;
}

function toCartItem(product: Product, quantity: number): CartItem {
  return { ...product, quantity };
}

let service: ProductService;

beforeEach(() => {
  // A fresh in-memory repository per test — no shared state between tests.
  service = new ProductService(new MockProductRepository([makeProduct()]));
});

describe('ProductService.sellProducts', () => {
  it('takes the sold quantity off the store shelf only', async () => {
    const [sold] = await service.sellProducts([toCartItem(makeProduct(), 3)]);

    expect(sold.storeStock).toBe(7);
    expect(sold.warehouseStock).toBe(5);
    expect(sold.stock).toBe(12); // total stays = store + warehouse
  });

  it('never lets store stock go below zero', async () => {
    const [sold] = await service.sellProducts([toCartItem(makeProduct(), 999)]);

    expect(sold.storeStock).toBe(0);
    expect(sold.stock).toBe(5);
  });

  it('ignores cart items that are not in the catalogue', async () => {
    const updated = await service.sellProducts([toCartItem(makeProduct({ id: 'nope' }), 1)]);
    expect(updated).toEqual([]);
  });
});

describe('ProductService.addProduct', () => {
  const draft = makeDraft();

  it('assigns the next numeric id', async () => {
    const created = await service.addProduct(draft);
    expect(created.id).toBe('2');
  });

  it.each([
    ['blank name', { name: '   ' }, 'name'],
    ['negative price', { price: -1 }, 'price'],
    ['negative cost', { cost: -5 }, 'cost'],
  ])('rejects %s and reports the offending field', async (_label, patch, field) => {
    const attempt = service.addProduct({ ...draft, ...patch });

    await expect(attempt).rejects.toBeInstanceOf(InvalidProductError);
    await expect(attempt).rejects.toMatchObject({ field });
  });
});

describe('ProductService transfers', () => {
  it('moves stock from warehouse to store and keeps the total', async () => {
    await service.transferToStore('1', 3);

    const product = await service.getProductById('1');
    expect(product?.storeStock).toBe(13);
    expect(product?.warehouseStock).toBe(2);
  });

  it('clamps the move to what the warehouse actually holds', async () => {
    await service.transferToStore('1', 500);

    const product = await service.getProductById('1');
    expect(product?.warehouseStock).toBe(0);
    expect(product?.storeStock).toBe(15);
  });

  it('writes to the audit trail only when something actually moved', async () => {
    await service.transferToStore('1', 0);
    expect(await service.getTransferHistory()).toHaveLength(0);

    await service.transferToStore('1', 2);
    expect(await service.getTransferHistory()).toHaveLength(1);
  });

  it('rejects a transfer for an unknown product', async () => {
    await expect(service.transferToStore('missing', 1)).rejects.toBeInstanceOf(InvalidProductError);
  });

  it('executes a queued transfer on confirm and removes it from the queue', async () => {
    const pending = await service.requestTransfer('1', 4);
    expect(await service.getPendingTransfers()).toHaveLength(1);

    await service.confirmTransfer(pending.id);

    expect(await service.getPendingTransfers()).toHaveLength(0);
    expect((await service.getProductById('1'))?.storeStock).toBe(14);
  });

  it('drops a queued transfer on cancel without touching stock', async () => {
    const pending = await service.requestTransfer('1', 4);
    await service.cancelTransfer(pending.id);

    expect(await service.getPendingTransfers()).toHaveLength(0);
    expect((await service.getProductById('1'))?.storeStock).toBe(10);
  });
});
