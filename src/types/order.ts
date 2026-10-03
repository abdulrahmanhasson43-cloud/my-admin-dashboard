/* ─────────────────────────────────────────────────────────────────────
   Order domain types — drives the Orders Pipeline Kanban Board (#1)
   ───────────────────────────────────────────────────────────────────── */

export type OrderStatus =
  | 'new'        // جديد
  | 'preparing'  // قيد التجهيز
  | 'shipped'    // تم الشحن
  | 'delivered'; // تم التسليم

export type OrderPaymentMethod = 'cash' | 'card' | 'wallet' | 'instapay';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderTimelineEntry {
  id: string;
  status: OrderStatus;
  timestamp: string; // ISO string
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  paymentMethod: OrderPaymentMethod;
  status: OrderStatus;
  createdAt: string; // ISO string
  branchId?: string;
  timeline: OrderTimelineEntry[];
}

/**
 * Arabic label for each order status. This is domain data (services write it
 * into the order timeline), so it lives here. Icons and colours are UI
 * concerns and live in `constants/orderStatusMeta.ts`.
 */
export const orderStatusLabels: Record<OrderStatus, string> = {
  new: 'جديد',
  preparing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
};

export const getOrderStatusLabel = (id: OrderStatus): string => orderStatusLabels[id];

export const paymentMethodLabels: Record<OrderPaymentMethod, string> = {
  cash: 'كاش',
  card: 'بطاقة',
  wallet: 'محفظة',
  instapay: 'إنستاباي',
};

