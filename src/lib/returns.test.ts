import { describe, expect, it } from 'vitest';
import type { InvoiceLine } from '@/types/invoice';
import {
  CATALOG_MAX_QTY,
  buildReturnItems,
  canSubmitReturn,
  clampQuantity,
  quantityOf,
  returnableItems,
  type ReturnableItem,
} from './returns';

const catalog = [
  { id: '1', name: 'سماعة', price: 250, cost: 150 },
  { id: '2', name: 'شاحن', price: 180, cost: 100 },
];
const line = (productId: string, quantity: number, price = 10, name = `p${productId}`): InvoiceLine =>
  ({ productId, name, quantity, price });

describe('returnableItems', () => {
  it('lists the products that are on the invoice, with how many were bought as the most that can come back', () => {
    const items = returnableItems('customer', { lines: [line('1', 2, 250, 'سماعة'), line('3', 5, 45, 'كيبل')] }, catalog);
    expect(items).toEqual([
      { productId: '1', name: 'سماعة', price: 250, maxQty: 2 },
      { productId: '3', name: 'كيبل', price: 45, maxQty: 5 },
    ]);
  });

  it('lines for the same product add up to one entry', () => {
    const items = returnableItems('customer', { lines: [line('1', 2, 250, 'سماعة'), line('1', 3, 250, 'سماعة')] }, catalog);
    expect(items).toEqual([{ productId: '1', name: 'سماعة', price: 250, maxQty: 5 }]);
  });

  it('an invoice without lines offers the real products of the shop instead (never made-up ones)', () => {
    const expected: ReturnableItem[] = [
      { productId: '1', name: 'سماعة', price: 250, maxQty: CATALOG_MAX_QTY },
      { productId: '2', name: 'شاحن', price: 180, maxQty: CATALOG_MAX_QTY },
    ];
    expect(returnableItems('customer', {}, catalog)).toEqual(expected);
    expect(returnableItems('customer', { lines: [] }, catalog)).toEqual(expected);
    expect(returnableItems('customer', undefined, catalog)).toEqual(expected);
  });

  it('a return to a supplier ignores the customer invoice: any real product, priced at what the shop paid for it', () => {
    const items = returnableItems('supplier', { lines: [line('1', 2, 250, 'سماعة')] }, catalog);
    expect(items).toEqual([
      { productId: '1', name: 'سماعة', price: 150, maxQty: CATALOG_MAX_QTY },
      { productId: '2', name: 'شاحن', price: 100, maxQty: CATALOG_MAX_QTY },
    ]);
  });

  it('a customer return from the shop list is priced at the selling price', () => {
    expect(returnableItems('customer', undefined, catalog).map(i => i.price)).toEqual([250, 180]);
  });

  it('is empty when there are no lines and no products', () => {
    expect(returnableItems('customer', undefined, [])).toEqual([]);
  });
});

describe('quantityOf', () => {
  it('is 1 until the user types something (the box shows 1)', () => {
    expect(quantityOf({}, '1')).toBe(1);
  });
  it('is what was typed once there is something', () => {
    expect(quantityOf({ '1': 4 }, '1')).toBe(4);
    expect(quantityOf({ '1': 4 }, '2')).toBe(1);
  });
});

describe('clampQuantity', () => {
  it('keeps a quantity that is allowed', () => {
    expect(clampQuantity(3, 5)).toBe(3);
  });
  it('never goes above the most that can come back', () => {
    expect(clampQuantity(9, 5)).toBe(5);
    expect(clampQuantity(Infinity, 5)).toBe(5);
  });
  it('never goes below 1', () => {
    expect(clampQuantity(0, 5)).toBe(1);
    expect(clampQuantity(-4, 5)).toBe(1);
  });
  it('text that is not a number becomes 1', () => {
    expect(clampQuantity(NaN, 5)).toBe(1);
  });
});

describe('buildReturnItems', () => {
  const items: ReturnableItem[] = [
    { productId: '1', name: 'سماعة', price: 250, maxQty: 2 },
    { productId: '2', name: 'شاحن', price: 180, maxQty: 5 },
    { productId: '3', name: 'كيبل', price: 45, maxQty: 10 },
  ];

  it('takes only the ticked products, in list order, as return lines', () => {
    expect(buildReturnItems(items, { '3': true, '1': true }, { '1': 2, '3': 4 })).toEqual([
      { productId: '1', name: 'سماعة', price: 250, quantity: 2 },
      { productId: '3', name: 'كيبل', price: 45, quantity: 4 },
    ]);
  });

  it('a ticked product whose quantity was never touched counts as 1 (the box shows 1)', () => {
    expect(buildReturnItems(items, { '2': true }, {})).toEqual([
      { productId: '2', name: 'شاحن', price: 180, quantity: 1 },
    ]);
  });

  it('a quantity above what can come back is cut down to it', () => {
    expect(buildReturnItems(items, { '1': true }, { '1': 7 })[0].quantity).toBe(2);
  });

  it('a quantity left over for a product that is not ticked is ignored', () => {
    expect(buildReturnItems(items, { '1': false }, { '1': 2 })).toEqual([]);
  });

  it('nothing ticked means no lines', () => {
    expect(buildReturnItems(items, {}, {})).toEqual([]);
  });
});

describe('canSubmitReturn', () => {
  it('needs a name and at least one product', () => {
    expect(canSubmitReturn('أحمد', 1)).toBe(true);
  });
  it('a missing or blank name is not enough', () => {
    expect(canSubmitReturn('', 2)).toBe(false);
    expect(canSubmitReturn('   ', 2)).toBe(false);
  });
  it('no product ticked is not enough', () => {
    expect(canSubmitReturn('أحمد', 0)).toBe(false);
  });
});
