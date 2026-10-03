import type { CartItem, Product } from '@/types';

/**
 * Cart rules — pure functions over a `CartItem[]`, no React, no storage.
 *
 * POSPage used to carry these as inline `setCart(prev => …)` bodies. Every
 * function here returns a NEW array and never mutates its input, so React
 * state stays valid and the rules can be unit-tested in plain Node.
 */

/** Id of a cart line for a product with chosen variants (e.g. `p1-red-XL`). */
export function variantLineId(productId: string, selectedVariants: Record<string, string>): string {
  return `${productId}-${Object.values(selectedVariants).join('-')}`;
}

/** Adds one unit of a product; merges into the existing line when present. */
export function addProduct(cart: CartItem[], product: Product): CartItem[] {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    return cart.map(item => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
  }
  return [...cart, { ...product, quantity: 1 }];
}

/** Adds `quantity` units of a variant combination as its own cart line. */
export function addProductVariant(
  cart: CartItem[],
  product: Product,
  selectedVariants: Record<string, string>,
  quantity: number,
): CartItem[] {
  const lineId = variantLineId(product.id, selectedVariants);
  const existing = cart.find(item => item.id === lineId);
  if (existing) {
    return cart.map(item => (item.id === lineId ? { ...item, quantity: item.quantity + quantity } : item));
  }
  return [...cart, { ...product, id: lineId, quantity, selectedVariants }];
}

/**
 * Moves a line's quantity up or down. A line never drops below 1 this way —
 * removing a line is an explicit action (`removeItem`).
 */
export function changeQuantity(cart: CartItem[], id: string, delta: number): CartItem[] {
  return cart
    .map(item => {
      if (item.id !== id) return item;
      const next = item.quantity + delta;
      return next > 0 ? { ...item, quantity: next } : item;
    })
    .filter(item => item.quantity > 0);
}

/** Sets an exact quantity; ignores non-finite values and anything below 1. */
export function setQuantity(cart: CartItem[], id: string, value: number): CartItem[] {
  if (!Number.isFinite(value) || value < 1) return cart;
  return cart.map(item => (item.id === id ? { ...item, quantity: Math.floor(value) } : item));
}

export function removeItem(cart: CartItem[], id: string): CartItem[] {
  return cart.filter(item => item.id !== id);
}

/** Total number of units across all lines. */
export function countUnits(cart: ReadonlyArray<CartItem>): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/** Units of one line (0 when it is not in the cart). */
export function quantityOf(cart: ReadonlyArray<CartItem>, id: string): number {
  return cart.find(item => item.id === id)?.quantity ?? 0;
}
