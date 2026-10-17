import type { OrderTimeFilter } from '@/lib/orders';

/** The time chips above the orders, in the order they are shown (the windows themselves are in lib/orders.ts). */
export const orderTimeFilters: { id: OrderTimeFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'today', label: 'اليوم' },
  { id: 'week', label: 'الأسبوع' },
  { id: 'month', label: 'الشهر' },
];
