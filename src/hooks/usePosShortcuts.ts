import { useEffect, type RefObject } from 'react';
import type { CartItem } from '@/types';

interface PosShortcutActions {
  cart: CartItem[];
  amountPaid: string;
  paidNumber: number;
  total: number;
  selectedCartItemId: string | null;
  receiptRef: RefObject<HTMLDivElement | null>;
  /** Pays the typed amount (it covers the total). */
  payWithAmount: () => void;
  /** Checks out with the selected payment method. */
  checkout: () => void;
  /** Empties the cart and forgets the customer and the typed amount. */
  clearCart: () => void;
  changeQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearSelectedItem: () => void;
}

/**
 * usePosShortcuts — the cashier's keyboard shortcuts (Idea #24).
 * `useKeyboardShortcuts` dispatches `vuno:pos-shortcut` window events; this hook
 * turns each one into a POS action.
 *
 * The listener is re-attached on EVERY render on purpose (no dependency list),
 * so it always sees the current cart and amounts.
 */
export function usePosShortcuts({
  cart, amountPaid, paidNumber, total, selectedCartItemId, receiptRef,
  payWithAmount, checkout, clearCart, changeQuantity, removeFromCart, clearSelectedItem,
}: PosShortcutActions) {
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      switch (detail.type) {
        case 'quick-pay':
          if (cart.length > 0) {
            if (amountPaid && paidNumber >= total) {
              payWithAmount();
            } else {
              checkout();
            }
          }
          break;
        case 'clear-cart':
          clearCart();
          break;
        case 'quantity-increment':
          if (selectedCartItemId) {
            changeQuantity(selectedCartItemId, 1);
          } else if (cart.length > 0) {
            // Increment last added item
            changeQuantity(cart[cart.length - 1].id, 1);
          }
          break;
        case 'quantity-decrement':
          if (selectedCartItemId) {
            changeQuantity(selectedCartItemId, -1);
          } else if (cart.length > 0) {
            changeQuantity(cart[cart.length - 1].id, -1);
          }
          break;
        case 'remove-selected':
          if (selectedCartItemId) {
            removeFromCart(selectedCartItemId);
            clearSelectedItem();
          } else if (cart.length > 0) {
            removeFromCart(cart[cart.length - 1].id);
          }
          break;
        case 'print':
          // Trigger print if receipt is visible
          if (receiptRef.current) {
            window.print();
          }
          break;
      }
    };
    window.addEventListener('vuno:pos-shortcut', handler);
    return () => window.removeEventListener('vuno:pos-shortcut', handler);
  });
}
