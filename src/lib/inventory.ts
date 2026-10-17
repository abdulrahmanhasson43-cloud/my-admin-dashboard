import type { Product } from '@/types';
import { formatThousands } from '@/lib/utils';

/**
 * Inventory rules — plain functions with no React and no storage, so they can
 * be tested on their own. The inventory screen (hooks + components) only
 * wires them to the UI.
 *
 * Two kinds of stock, the same names the screen uses:
 *  - storeStock     — on the shop floor; this is what the POS sells from.
 *  - warehouseStock — in the back room (المخزن / المستودع); moved to the shop on demand.
 */

/** The "all categories" chip. */
export const ALL_CATEGORIES = 'الكل';

/** "All" first, then every category once, in the order first seen. */
export function listCategories(products: ReadonlyArray<Product>): string[] {
  return [ALL_CATEGORIES, ...Array.from(new Set(products.map(p => p.category)))];
}

/** Search matches part of the name or the barcode; the category must match exactly (unless "all"). */
export function filterProducts(products: ReadonlyArray<Product>, search: string, category: string): Product[] {
  return products.filter(item => {
    const matchSearch = item.name.includes(search) || item.barcode.includes(search);
    const matchCategory = category === ALL_CATEGORIES || item.category === category;
    return matchSearch && matchCategory;
  });
}

/**
 * Low = the shop floor holds strictly fewer than the threshold (the warehouse does not count).
 * This describes a product's stock; a threshold of 0 turns it off. For "is this worth an alert", see needsRestock.
 */
export function isLowStock(product: Product, threshold: number): boolean {
  return product.storeStock < threshold;
}

/**
 * Worth telling the user about: low on the shop floor AND still on sale. A product that is switched off
 * (inactive) is not being sold, so running out of it is not a reason to alert anyone. Use this for alerts,
 * notifications and "needs restocking" lists; use isLowStock to describe a product's own stock.
 */
export function needsRestock(product: Product, threshold: number): boolean {
  return product.status === 'active' && isLowStock(product, threshold);
}

/** How a quantity on the shop floor is described, from worst to best. */
export type StockLevel = 'out' | 'critical' | 'low' | 'ok';

/**
 * out = nothing left; critical = fewer than half the threshold; low = below the threshold; ok = enough.
 * Both boundaries are strict (exactly half, or exactly the threshold, is the better level).
 */
export function stockLevel(quantity: number, threshold: number): StockLevel {
  if (quantity <= 0) return 'out';
  if (quantity < threshold / 2) return 'critical';
  if (quantity < threshold) return 'low';
  return 'ok';
}

export interface InventorySummary {
  productCount: number;
  /** Units everywhere (shop + warehouse). */
  totalItems: number;
  /** Everything on hand valued at purchase cost. */
  totalValue: number;
  /** Products that need restocking (low on the shop floor and still on sale), in list order. */
  lowStock: Product[];
}

export function summarizeInventory(products: ReadonlyArray<Product>, threshold: number): InventorySummary {
  return {
    productCount: products.length,
    totalItems: products.reduce((sum, p) => sum + p.stock, 0),
    totalValue: products.reduce((sum, p) => sum + p.stock * p.cost, 0),
    lowStock: products.filter(p => needsRestock(p, threshold)),
  };
}

/** Stock value for the stats card: thousands with one decimal. */
export function formatStockValue(totalValue: number): string {
  return `${formatThousands(totalValue)} EGP`;
}

export function inventoryQrValue(productCount: number, totalItems: number): string {
  return `VUNO:INVENTORY:${productCount}:${totalItems}`;
}

export function productQrValue(product: Product): string {
  return `VUNO:PRODUCT:${product.id}:${product.name}:STOCK:${product.stock}:BC:${product.barcode}`;
}

/** The rows of the inventory export — Arabic column names, in this order. */
export function buildExportRows(products: ReadonlyArray<Product>, threshold: number): Record<string, string | number>[] {
  return products.map((p, i) => ({
    '#': i + 1,
    'اسم المنتج': p.name,
    'الباركود': p.barcode,
    'الفئة': p.category,
    'المخزون (متجر)': p.storeStock,
    'المخزون (مستودع)': p.warehouseStock,
    'المخزون (إجمالي)': p.stock,
    'سعر الشراء': p.cost,
    'سعر البيع': p.price,
    'قيمة المخزون': p.stock * p.cost,
    'الحالة': isLowStock(p, threshold) ? 'منخفض' : 'متوفر',
  }));
}

/** Moves between warehouse and shop wait for a manager's OK only in multi-branch shops that asked for it. */
export function needsTransferConfirmation(multiBranchEnabled: boolean, transferRequiresConfirmation: boolean): boolean {
  return multiBranchEnabled && transferRequiresConfirmation;
}

/** What to do with a transfer: do it now, queue it for confirmation, or nothing. */
export type TransferPlan =
  | { action: 'transfer'; quantity: number }
  | { action: 'request'; quantity: number };

export type QuickTransferPlan = TransferPlan | { action: 'reject' };
export type ModalTransferPlan = TransferPlan | { action: 'none' };

/**
 * The one-tap and drag-and-drop move. An empty warehouse is refused; otherwise
 * at most what the warehouse holds is moved.
 */
export function planQuickTransfer(product: Product, quantity: number, needsConfirmation: boolean): QuickTransferPlan {
  if (product.warehouseStock <= 0) return { action: 'reject' };
  const moved = Math.min(quantity, product.warehouseStock);
  return { action: needsConfirmation ? 'request' : 'transfer', quantity: moved };
}

/** A typed quantity is acceptable from just above 0 up to exactly what the warehouse holds. */
function isAllowedQuantity(quantity: number, product: Product): boolean {
  return quantity > 0 && quantity <= product.warehouseStock;
}

/** Whether the modal's confirm button is enabled for what is typed in the box. */
export function canSubmitTransfer(rawQuantity: string, product: Product): boolean {
  return rawQuantity !== '' && isAllowedQuantity(Number(rawQuantity), product);
}

/** What the modal's confirm button does with what is typed in the box. */
export function planModalTransfer(rawQuantity: string, product: Product, needsConfirmation: boolean): ModalTransferPlan {
  const quantity = Number(rawQuantity);
  if (!isAllowedQuantity(quantity, product)) return { action: 'none' };
  return { action: needsConfirmation ? 'request' : 'transfer', quantity };
}

export const NO_WAREHOUSE_STOCK_MESSAGE = 'لا يوجد مخزون في المستودع';

export function transferRequestedMessage(quantity: number): string {
  return `تم إرسال طلب نقل ${quantity} قطعة — بانتظار التأكيد`;
}

export function transferredMessage(quantity: number, productName: string): string {
  return `تم نقل ${quantity} قطعة من ${productName} إلى المتجر`;
}

/** The two ways the inventory screen can show products. */
export type InventoryViewMode = 'list' | 'visual';
