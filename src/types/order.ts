/* ─────────────────────────────────────────────────────────────────────
   Order domain types — drives the Orders Pipeline Kanban Board (#1)
   ───────────────────────────────────────────────────────────────────── */
import type { ComponentType } from 'react';
import { PlusIcon, PackageIcon, TruckIcon, CheckCircleIcon } from '@/components/icons';

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

export interface OrderStatusMeta {
  id: OrderStatus;
  label: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  color: string;       // hex for accent
  badgeBg: string;     // tailwind bg class
  badgeText: string;   // tailwind text class
}

export const orderStatuses: OrderStatusMeta[] = [
  {
    id: 'new',
    label: 'جديد',
    icon: PlusIcon,
    color: '#007AFF',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-600',
  },
  {
    id: 'preparing',
    label: 'قيد التجهيز',
    icon: PackageIcon,
    color: '#FF9500',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-600',
  },
  {
    id: 'shipped',
    label: 'تم الشحن',
    icon: TruckIcon,
    color: '#AF52DE',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-600',
  },
  {
    id: 'delivered',
    label: 'تم التسليم',
    icon: CheckCircleIcon,
    color: '#34C759',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-600',
  },
];

export const getOrderStatusMeta = (id: OrderStatus): OrderStatusMeta =>
  orderStatuses.find(s => s.id === id) ?? orderStatuses[0];

export const paymentMethodLabels: Record<OrderPaymentMethod, string> = {
  cash: 'كاش',
  card: 'بطاقة',
  wallet: 'محفظة',
  instapay: 'إنستاباي',
};

export const paymentMethodEmojis: Record<OrderPaymentMethod, string> = {
  cash: '💵',
  card: '💳',
  wallet: '📱',
  instapay: '⚡',
};
