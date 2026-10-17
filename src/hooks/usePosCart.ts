import { useCallback, useState } from 'react';
import type { CartItem, Product } from '@/types';
import {
  addProduct, addProductVariant, changeQuantity, countUnits, quantityOf, removeItem, setQuantity,
} from '@/lib/cart';

/**
 * usePosCart — the cashier's cart. Holds the lines and exposes one action per
 * rule in `lib/cart.ts`; the rules themselves stay pure and tested there.
 */
export function usePosCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const add = useCallback((product: Product) => setCart(prev => addProduct(prev, product)), []);
  const addVariant = useCallback(
    (product: Product, selectedVariants: Record<string, string>, quantity: number) =>
      setCart(prev => addProductVariant(prev, product, selectedVariants, quantity)),
    [],
  );
  const changeQty = useCallback((id: string, delta: number) => setCart(prev => changeQuantity(prev, id, delta)), []);
  const setQty = useCallback((id: string, value: number) => setCart(prev => setQuantity(prev, id, value)), []);
  const remove = useCallback((id: string) => setCart(prev => removeItem(prev, id)), []);
  const clear = useCallback(() => setCart([]), []);
  /** Swaps the whole cart (used when a parked order is taken back). */
  const replace = useCallback((items: CartItem[]) => setCart(items), []);

  return {
    cart,
    itemCount: countUnits(cart),
    quantityFor: (productId: string) => quantityOf(cart, productId),
    add, addVariant, changeQty, setQty, remove, clear, replace,
  };
}
