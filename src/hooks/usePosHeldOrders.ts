import { toast } from 'sonner';
import type { CartItem } from '@/types';
import type { HoldReason } from '@/components/HoldOrderPopup';
import { useHeldOrders } from '@/context/held-orders-context-value';
import { useActivityLog } from '@/context/activity-log-context-value';
import { cartFromHeldItems } from '@/lib/cart';
import { heldOrderLabel } from '@/services/sale';

interface UsePosHeldOrdersParams {
  cart: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  /** Called after the cart was parked — the page clears the cart and closes the sheet. */
  onHeld: () => void;
  /** Called with the lines of an order taken back — the page loads them into the cart. */
  onResumed: (items: CartItem[]) => void;
}

/** usePosHeldOrders — parking the current cart and taking a parked order back. */
export function usePosHeldOrders({ cart, subtotal, tax, total, onHeld, onResumed }: UsePosHeldOrdersParams) {
  const { heldOrders, holdOrder, resumeOrder, deleteHeldOrder, heldCount } = useHeldOrders();
  const { logActivity } = useActivityLog();

  /** The cashier confirmed the hold popup (customer name + reason). */
  const confirmHold = (customerName: string, reason: HoldReason) => {
    const label = heldOrderLabel(customerName, cart.length, total);
    holdOrder(label, cart, subtotal, tax, total, reason);
    logActivity('sale', `تم تعليق طلب بقيمة ${total.toLocaleString()} EGP — السبب: ${reason}`);
    toast.success('تم تعليق الطلب', { description: reason });
    onHeld();
  };

  const resume = (id: string) => {
    const order = resumeOrder(id);
    if (!order) return;
    onResumed(cartFromHeldItems(order.items));
    logActivity('sale', 'تم استرداد طلب معلق');
  };

  return { heldOrders, heldCount, deleteHeldOrder, confirmHold, resume };
}
