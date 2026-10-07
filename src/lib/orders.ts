import type { Order, OrderItem, OrderStatus } from '@/types/order';

/** Time windows the Orders screen can filter by. */
export type OrderTimeFilter = 'all' | 'today' | 'week' | 'month';

export const ORDER_TIME_FILTERS: { id: OrderTimeFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'today', label: 'اليوم' },
  { id: 'week', label: 'الأسبوع' },
  { id: 'month', label: 'الشهر' },
];

const WINDOW_MS = { today: 86400000, week: 604800000, month: 2592000000 } as const;

/** Orders created within the chosen window ending at `now` (ms). `all` keeps everything. */
export function filterOrdersByTime(orders: Order[], filter: OrderTimeFilter, now: number): Order[] {
  if (filter === 'all') return orders;
  return orders.filter(o => now - new Date(o.createdAt).getTime() <= WINDOW_MS[filter]);
}

const newestFirst = (a: Order, b: Order) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

/** A sorted copy, newest order first. */
export function sortNewestFirst(orders: Order[]): Order[] {
  return orders.slice().sort(newestFirst);
}

/** One list per status, newest first inside each. Every status is always present. */
export function groupOrdersByStatus(orders: Order[]): Record<OrderStatus, Order[]> {
  const map: Record<OrderStatus, Order[]> = { new: [], preparing: [], shipped: [], delivered: [] };
  orders.forEach(o => map[o.status].push(o));
  (Object.keys(map) as OrderStatus[]).forEach(s => map[s].sort(newestFirst));
  return map;
}

/** What the mobile list shows: everything, or one status, newest first. */
export function ordersForStatusFilter(
  filtered: Order[],
  byStatus: Record<OrderStatus, Order[]>,
  filter: OrderStatus | 'all',
): Order[] {
  return sortNewestFirst(filter === 'all' ? filtered : byStatus[filter]);
}

/** Format createdAt ISO as a relative Arabic string like "من 10 دقائق". */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `من ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `من ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `من ${days} يوم`;
}

/** Headline numbers for the stats row. */
export interface OrdersSummary {
  total: number;
  newCount: number;
  deliveredCount: number;
  revenue: number;
}

export function summarizeOrders(orders: Order[]): OrdersSummary {
  return {
    total: orders.length,
    newCount: orders.filter(o => o.status === 'new').length,
    deliveredCount: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.reduce((s, o) => s + o.total, 0),
  };
}

/** Units across all lines of an order. */
export function countItems(items: OrderItem[]): number {
  return items.reduce((s, i) => s + i.quantity, 0);
}

/** Sum of price × quantity across the lines. */
export function itemsTotal(items: OrderItem[]): number {
  return items.reduce((s, i) => s + i.price * i.quantity, 0);
}

/**
 * Reads the three "add item" fields of the new-order form. Returns null when
 * the name is blank or the price or quantity is not a non-zero number, so the
 * form ignores the click instead of adding a broken line.
 */
export function parseItemInput(
  name: string,
  price: string,
  quantity: string,
): { name: string; price: number; quantity: number } | null {
  const parsedPrice = Number(price);
  const parsedQuantity = Number(quantity);
  if (!name.trim() || !parsedPrice || !parsedQuantity) return null;
  return { name: name.trim(), price: parsedPrice, quantity: parsedQuantity };
}
