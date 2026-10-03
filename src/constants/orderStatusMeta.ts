import type { ComponentType } from 'react';
import { PlusIcon, PackageIcon, TruckIcon, CheckCircleIcon } from '@/components/icons';
import { orderStatusLabels } from '@/types/order';
import type { OrderStatus } from '@/types/order';

/**
 * Presentation metadata for order statuses (icon + colours).
 * Split out of `types/order.ts` so the domain layer no longer imports UI code.
 */
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
    label: orderStatusLabels.new,
    icon: PlusIcon,
    color: '#007AFF',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-600',
  },
  {
    id: 'preparing',
    label: orderStatusLabels.preparing,
    icon: PackageIcon,
    color: '#FF9500',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-600',
  },
  {
    id: 'shipped',
    label: orderStatusLabels.shipped,
    icon: TruckIcon,
    color: '#AF52DE',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-600',
  },
  {
    id: 'delivered',
    label: orderStatusLabels.delivered,
    icon: CheckCircleIcon,
    color: '#34C759',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-600',
  },
];

export const getOrderStatusMeta = (id: OrderStatus): OrderStatusMeta =>
  orderStatuses.find(s => s.id === id) ?? orderStatuses[0];
