import type { Invoice } from '@/types/invoice';
import type { ReturnItem, ReturnType } from '@/types/return';

/**
 * New-return form rules — plain functions with no React, so they can be tested
 * on their own. The form only wires them to the screen.
 */

/** A product that can be put on a return, and the most of it that can come back. */
export interface ReturnableItem {
  productId: string;
  name: string;
  price: number;
  maxQty: number;
}

/** The product fields the form needs from the shop's list. */
export interface CatalogProduct {
  id: string;
  name: string;
  /** What the shop sells it for. */
  price: number;
  /** What the shop paid for it. */
  cost: number;
}

/** When the invoice doesn't say what was on it, any real product may come back, up to this many. */
export const CATALOG_MAX_QTY = 999;

/**
 * What the form offers.
 * - A customer return of an invoice that kept its lines: the products on it, at the price the
 *   customer paid, and at most as many as were bought.
 * - Otherwise (an old invoice without lines, or a return to a supplier — a customer's invoice has
 *   nothing to do with what the shop bought): the shop's real products. A return must only name
 *   products that exist, because stock is changed by product id. A supplier takes goods back at
 *   what the shop paid for them, not at the selling price.
 */
export function returnableItems(
  type: ReturnType,
  invoice: Pick<Invoice, 'lines'> | undefined,
  catalog: ReadonlyArray<CatalogProduct>,
): ReturnableItem[] {
  const lines = invoice?.lines;
  if (type === 'customer' && lines && lines.length > 0) {
    const byProduct = new Map<string, ReturnableItem>();
    for (const line of lines) {
      const existing = byProduct.get(line.productId);
      if (existing) existing.maxQty += line.quantity;
      else byProduct.set(line.productId, { productId: line.productId, name: line.name, price: line.price, maxQty: line.quantity });
    }
    return [...byProduct.values()];
  }
  return catalog.map(p => ({
    productId: p.id,
    name: p.name,
    price: type === 'supplier' ? p.cost : p.price,
    maxQty: CATALOG_MAX_QTY,
  }));
}

/** The quantity the box shows: what was typed, or 1 until the user types something. */
export function quantityOf(quantities: Record<string, number>, productId: string): number {
  return quantities[productId] ?? 1;
}

/** Keeps a typed quantity between 1 and the most that can come back; text that isn't a number becomes 1. */
export function clampQuantity(raw: number, maxQty: number): number {
  if (Number.isNaN(raw)) return 1;
  return Math.min(maxQty, Math.max(1, raw));
}

/** The return lines for the ticked products, in list order. */
export function buildReturnItems(
  items: ReadonlyArray<ReturnableItem>,
  selected: Record<string, boolean>,
  quantities: Record<string, number>,
): ReturnItem[] {
  return items
    .filter(item => selected[item.productId])
    .map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: clampQuantity(quantityOf(quantities, item.productId), item.maxQty),
    }));
}

/** The form can be sent once it names who is returning and at least one product is ticked. */
export function canSubmitReturn(partyName: string, itemCount: number): boolean {
  return partyName.trim() !== '' && itemCount > 0;
}
