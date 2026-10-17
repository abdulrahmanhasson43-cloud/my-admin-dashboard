import { describe, expect, it } from 'vitest';
import type { Product } from '@/types';
import {
  ALL_CATEGORIES,
  buildExportRows,
  canSubmitTransfer,
  filterProducts,
  formatStockValue,
  inventoryQrValue,
  isLowStock,
  listCategories,
  needsRestock,
  needsTransferConfirmation,
  planModalTransfer,
  planQuickTransfer,
  productQrValue,
  stockLevel,
  summarizeInventory,
  NO_WAREHOUSE_STOCK_MESSAGE,
  transferRequestedMessage,
  transferredMessage,
} from './inventory';

const product = (over: Partial<Product> = {}): Product => {
  const storeStock = over.storeStock ?? 5;
  const warehouseStock = over.warehouseStock ?? 10;
  return {
    id: 'p1', name: 'قلم حبر أزرق', category: 'أدوات مكتبية', price: 5, cost: 3, wholesalePrice: 4,
    stock: storeStock + warehouseStock, storeStock, warehouseStock, barcode: '111', status: 'active',
    ...over,
  };
};

describe('listCategories', () => {
  it('puts "all" first and then each category once, in the order first seen', () => {
    const list = [product({ category: 'مشروبات' }), product({ category: 'سناكس' }), product({ category: 'مشروبات' })];
    expect(listCategories(list)).toEqual([ALL_CATEGORIES, 'مشروبات', 'سناكس']);
  });
  it('is just "all" when there are no products', () => {
    expect(listCategories([])).toEqual([ALL_CATEGORIES]);
  });
});

describe('filterProducts', () => {
  const items = [
    product({ id: 'a', name: 'قلم حبر', barcode: '111', category: 'مكتبي' }),
    product({ id: 'b', name: 'دفتر', barcode: '222', category: 'مكتبي' }),
    product({ id: 'c', name: 'عصير', barcode: '333', category: 'مشروبات' }),
  ];
  const ids = (list: Product[]) => list.map(p => p.id);

  it('keeps everything when the search is empty and the category is "all"', () => {
    expect(ids(filterProducts(items, '', ALL_CATEGORIES))).toEqual(['a', 'b', 'c']);
  });
  it('matches part of the name', () => {
    expect(ids(filterProducts(items, 'حبر', ALL_CATEGORIES))).toEqual(['a']);
  });
  it('matches part of the barcode', () => {
    expect(ids(filterProducts(items, '22', ALL_CATEGORIES))).toEqual(['b']);
  });
  it('filters by exact category', () => {
    expect(ids(filterProducts(items, '', 'مشروبات'))).toEqual(['c']);
  });
  it('needs both the search and the category to match', () => {
    expect(ids(filterProducts(items, 'دفتر', 'مشروبات'))).toEqual([]);
    expect(ids(filterProducts(items, 'دفتر', 'مكتبي'))).toEqual(['b']);
  });
  it('returns an empty list when nothing matches', () => {
    expect(filterProducts(items, 'zzz', ALL_CATEGORIES)).toEqual([]);
  });
});

describe('isLowStock', () => {
  it('is low only when the shop-floor stock is strictly below the threshold', () => {
    expect(isLowStock(product({ storeStock: 9 }), 10)).toBe(true);
    expect(isLowStock(product({ storeStock: 10 }), 10)).toBe(false);
    expect(isLowStock(product({ storeStock: 11 }), 10)).toBe(false);
  });
  it('ignores the warehouse: plenty in the back room is still low on the shop floor', () => {
    expect(isLowStock(product({ storeStock: 2, warehouseStock: 500 }), 10)).toBe(true);
  });
  it('a threshold of 0 never flags anything', () => {
    expect(isLowStock(product({ storeStock: 0 }), 0)).toBe(false);
  });
});

describe('stockLevel (how a shelf quantity is described)', () => {
  it('nothing on the shelf is "out", whatever the threshold', () => {
    expect(stockLevel(0, 10)).toBe('out');
    expect(stockLevel(0, 0)).toBe('out');
    expect(stockLevel(-1, 10)).toBe('out');
  });
  it('fewer than half the threshold is "critical" (exactly half is not)', () => {
    expect(stockLevel(1, 10)).toBe('critical');
    expect(stockLevel(4, 10)).toBe('critical');
    expect(stockLevel(5, 10)).toBe('low');
  });
  it('below the threshold is "low" (exactly the threshold is not)', () => {
    expect(stockLevel(9, 10)).toBe('low');
    expect(stockLevel(10, 10)).toBe('ok');
    expect(stockLevel(500, 10)).toBe('ok');
  });
  it('works with a threshold that does not halve evenly', () => {
    expect(stockLevel(2, 5)).toBe('critical');   // 2 < 2.5
    expect(stockLevel(3, 5)).toBe('low');
  });
  it('agrees with isLowStock: anything below the threshold is not "ok", anything else is', () => {
    for (let qty = 0; qty <= 25; qty++) {
      expect(stockLevel(qty, 10) !== 'ok').toBe(isLowStock(product({ storeStock: qty }), 10));
    }
  });
});

describe('needsRestock (worth telling the user about)', () => {
  it('is a low product that is still on sale', () => {
    expect(needsRestock(product({ storeStock: 3, status: 'active' }), 10)).toBe(true);
  });
  it('a low product that is switched off (inactive) is not worth an alert', () => {
    expect(needsRestock(product({ storeStock: 3, status: 'inactive' }), 10)).toBe(false);
  });
  it('an active product with enough on the shelf is not', () => {
    expect(needsRestock(product({ storeStock: 10, status: 'active' }), 10)).toBe(false);
  });
  it('follows the same strict threshold and the same "threshold 0 turns it off" as isLowStock', () => {
    expect(needsRestock(product({ storeStock: 9 }), 10)).toBe(true);
    expect(needsRestock(product({ storeStock: 0 }), 0)).toBe(false);
  });
});

describe('summarizeInventory', () => {
  it('leaves inactive products out of the low list, but still counts and values them', () => {
    const list = [
      product({ id: 'a', storeStock: 2, warehouseStock: 0, cost: 10, status: 'active' }),
      product({ id: 'b', storeStock: 2, warehouseStock: 0, cost: 10, status: 'inactive' }),
    ];
    const s = summarizeInventory(list, 10);
    expect(s.lowStock.map(p => p.id)).toEqual(['a']);
    expect(s.productCount).toBe(2);
    expect(s.totalValue).toBe(40);
  });
  it('counts products, adds up units and their cost value, and lists the low ones in order', () => {
    const list = [
      product({ id: 'a', storeStock: 4, warehouseStock: 6, cost: 2 }),   // stock 10, value 20, low
      product({ id: 'b', storeStock: 20, warehouseStock: 0, cost: 5 }),  // stock 20, value 100
      product({ id: 'c', storeStock: 1, warehouseStock: 1, cost: 10 }), // stock 2, value 20, low
    ];
    const s = summarizeInventory(list, 10);
    expect(s.productCount).toBe(3);
    expect(s.totalItems).toBe(32);
    expect(s.totalValue).toBe(140);
    expect(s.lowStock.map(p => p.id)).toEqual(['a', 'c']);
  });
  it('is all zeros for an empty store', () => {
    expect(summarizeInventory([], 10)).toEqual({ productCount: 0, totalItems: 0, totalValue: 0, lowStock: [] });
  });
});

describe('formatStockValue', () => {
  it('shows thousands with one decimal', () => {
    expect(formatStockValue(0)).toBe('0.0K EGP');
    expect(formatStockValue(1500)).toBe('1.5K EGP');
    expect(formatStockValue(123456)).toBe('123.5K EGP');
  });
});

describe('QR values', () => {
  it('inventory QR carries the product count and total units', () => {
    expect(inventoryQrValue(6, 299)).toBe('VUNO:INVENTORY:6:299');
  });
  it('product QR carries id, name, stock and barcode', () => {
    expect(productQrValue(product({ id: 'p9', name: 'مياه', stock: 15, barcode: '444' }))).toBe('VUNO:PRODUCT:p9:مياه:STOCK:15:BC:444');
  });
});

describe('buildExportRows', () => {
  it('numbers rows from 1 and uses the Arabic column names, in this order', () => {
    const rows = buildExportRows([product({ storeStock: 4, warehouseStock: 6, cost: 2, price: 5 })], 10);
    expect(Object.keys(rows[0])).toEqual([
      '#', 'اسم المنتج', 'الباركود', 'الفئة', 'المخزون (متجر)', 'المخزون (مستودع)',
      'المخزون (إجمالي)', 'سعر الشراء', 'سعر البيع', 'قيمة المخزون', 'الحالة',
    ]);
    expect(rows[0]).toEqual({
      '#': 1, 'اسم المنتج': 'قلم حبر أزرق', 'الباركود': '111', 'الفئة': 'أدوات مكتبية',
      'المخزون (متجر)': 4, 'المخزون (مستودع)': 6, 'المخزون (إجمالي)': 10,
      'سعر الشراء': 2, 'سعر البيع': 5, 'قيمة المخزون': 20, 'الحالة': 'منخفض',
    });
  });
  it('marks a product that is not low as available, and keeps the order of the list', () => {
    const rows = buildExportRows([product({ id: 'a', storeStock: 50 }), product({ id: 'b', storeStock: 1 })], 10);
    expect(rows.map(r => r['#'])).toEqual([1, 2]);
    expect(rows.map(r => r['الحالة'])).toEqual(['متوفر', 'منخفض']);
  });
  it('is empty for no products', () => {
    expect(buildExportRows([], 10)).toEqual([]);
  });
});

describe('needsTransferConfirmation', () => {
  it('only when multi-branch is on AND confirmation is required', () => {
    expect(needsTransferConfirmation(true, true)).toBe(true);
    expect(needsTransferConfirmation(true, false)).toBe(false);
    expect(needsTransferConfirmation(false, true)).toBe(false);
    expect(needsTransferConfirmation(false, false)).toBe(false);
  });
});

describe('planQuickTransfer (one-tap / drag-and-drop move)', () => {
  it('refuses when the warehouse is empty', () => {
    expect(planQuickTransfer(product({ warehouseStock: 0 }), 1, false)).toEqual({ action: 'reject' });
  });
  it('moves what was asked for', () => {
    expect(planQuickTransfer(product({ warehouseStock: 10 }), 1, false)).toEqual({ action: 'transfer', quantity: 1 });
  });
  it('never moves more than the warehouse holds', () => {
    expect(planQuickTransfer(product({ warehouseStock: 3 }), 5, false)).toEqual({ action: 'transfer', quantity: 3 });
  });
  it('asks for confirmation instead of moving when the shop requires it', () => {
    expect(planQuickTransfer(product({ warehouseStock: 10 }), 2, true)).toEqual({ action: 'request', quantity: 2 });
  });
  it('an empty warehouse is refused even when confirmation is required', () => {
    expect(planQuickTransfer(product({ warehouseStock: 0 }), 1, true)).toEqual({ action: 'reject' });
  });
});

describe('transfer messages', () => {
  it('say what happened, in Arabic', () => {
    expect(NO_WAREHOUSE_STOCK_MESSAGE).toBe('لا يوجد مخزون في المستودع');
    expect(transferRequestedMessage(3)).toBe('تم إرسال طلب نقل 3 قطعة — بانتظار التأكيد');
    expect(transferredMessage(3, 'مياه')).toBe('تم نقل 3 قطعة من مياه إلى المتجر');
  });
});

describe('canSubmitTransfer (the modal button)', () => {
  const p = product({ warehouseStock: 5 });
  it('is off while the box is empty, zero or negative', () => {
    expect(canSubmitTransfer('', p)).toBe(false);
    expect(canSubmitTransfer('0', p)).toBe(false);
    expect(canSubmitTransfer('-2', p)).toBe(false);
  });
  it('is on from 1 up to exactly what the warehouse holds', () => {
    expect(canSubmitTransfer('1', p)).toBe(true);
    expect(canSubmitTransfer('5', p)).toBe(true);
  });
  it('is off above what the warehouse holds', () => {
    expect(canSubmitTransfer('6', p)).toBe(false);
  });
  it('accepts a decimal quantity (unchanged behaviour of the screen)', () => {
    expect(canSubmitTransfer('2.5', p)).toBe(true);
  });
  it('is off for text that is not a number', () => {
    expect(canSubmitTransfer('abc', p)).toBe(false);
  });
});

describe('planModalTransfer (the submit button)', () => {
  const p = product({ warehouseStock: 5 });
  it('moves the typed quantity', () => {
    expect(planModalTransfer('4', p, false)).toEqual({ action: 'transfer', quantity: 4 });
  });
  it('requests instead when confirmation is required', () => {
    expect(planModalTransfer('4', p, true)).toEqual({ action: 'request', quantity: 4 });
  });
  it('allows exactly the warehouse amount', () => {
    expect(planModalTransfer('5', p, false)).toEqual({ action: 'transfer', quantity: 5 });
  });
  it('does nothing for zero, negative, too many, empty or non-numeric input', () => {
    for (const raw of ['0', '-1', '6', '', 'abc']) {
      expect(planModalTransfer(raw, p, false)).toEqual({ action: 'none' });
    }
  });
});
