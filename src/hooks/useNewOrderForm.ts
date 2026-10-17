import { useState } from 'react';
import { generateId } from '@/lib/utils';
import { canSubmitOrder, parseOrderItem, previewTotal } from '@/lib/orders';
import type { CreateOrderInput } from '@/services/order';
import type { OrderItem, OrderPaymentMethod } from '@/types/order';

/**
 * State of the new-order form: who the customer is, how they pay, and the product lines added so far.
 * What counts as a valid line, and the total shown, are decided in lib/orders.ts.
 */
export function useNewOrderForm() {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>('cash');
  // The three boxes of the line being typed (they hold text until the line is added).
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productQty, setProductQty] = useState('1');
  const [items, setItems] = useState<OrderItem[]>([]);

  /** Adds the typed line to the order and clears the three boxes; does nothing while the line is incomplete. */
  const addItem = () => {
    const parsed = parseOrderItem({ name: productName, price: productPrice, quantity: productQty });
    if (!parsed) return;
    const item: OrderItem = { productId: generateId('p'), ...parsed };
    setItems(prev => [...prev, item]);
    setProductName('');
    setProductPrice('');
    setProductQty('1');
  };

  /**
   * What to hand to OrderService, or null while the form is not ready to send. Just the raw input —
   * the service owns ids, timestamps and the first timeline entry.
   */
  const buildInput = (): CreateOrderInput | null => {
    if (!canSubmitOrder(customerName, customerPhone, items.length)) return null;
    return { customerName: customerName.trim(), customerPhone: customerPhone.trim(), items, paymentMethod };
  };

  return {
    customerName, setCustomerName,
    customerPhone, setCustomerPhone,
    paymentMethod, setPaymentMethod,
    productName, setProductName,
    productPrice, setProductPrice,
    productQty, setProductQty,
    items,
    total: previewTotal(items),
    addItem,
    buildInput,
  };
}
