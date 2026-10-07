import { useState } from 'react';
import { toast } from 'sonner';
import { generateId } from '@/lib/utils';
import { itemsTotal, parseItemInput } from '@/lib/orders';
import type { Order, OrderPaymentMethod } from '@/types/order';
import type { CreateOrderInput } from '@/services/order';

/**
 * useNewOrderForm — the new-order modal's fields, its list of lines and the
 * create action. The input rules (what counts as a valid line) are in `lib/orders.ts`.
 */
export function useNewOrderForm(onCreate: (input: CreateOrderInput) => void) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>('cash');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productQty, setProductQty] = useState('1');
  const [items, setItems] = useState<Order['items']>([]);

  const addItem = () => {
    const item = parseItemInput(productName, productPrice, productQty);
    if (!item) return;
    setItems(prev => [...prev, { productId: generateId('p'), ...item }]);
    setProductName(''); setProductPrice(''); setProductQty('1');
  };

  const total = itemsTotal(items);

  const handleCreate = () => {
    if (!customerName.trim() || items.length === 0) {
      toast.error('أدخل اسم العميل ومنتج واحد على الأقل');
      return;
    }
    // Just the raw input — OrderService owns id generation, timestamps,
    // and the initial timeline entry (single source of truth for how a
    // valid Order gets constructed, instead of duplicating that logic
    // here in the modal).
    onCreate({ customerName: customerName.trim(), customerPhone: customerPhone.trim(), items, paymentMethod });
  };

  return {
    customerName, setCustomerName,
    customerPhone, setCustomerPhone,
    paymentMethod, setPaymentMethod,
    productName, setProductName,
    productPrice, setProductPrice,
    productQty, setProductQty,
    items,
    total,
    addItem,
    handleCreate,
  };
}
