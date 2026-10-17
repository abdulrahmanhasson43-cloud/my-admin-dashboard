import type { Order, OrderItem, OrderStatus } from '@/types/order';
import { calcSubtotal } from '@/lib/pricing';

/**
 * Orders-screen rules — plain functions with no React, so they can be tested on their own.
 * The hooks (useOrdersBoard, useNewOrderForm) only wire them to the screen.
 * Anything that depends on the clock takes "now" as an argument, so a test can pin the time.
 */

/** How far back the time chips look. */
export type OrderTimeFilter = 'all' | 'today' | 'week' | 'month';

/** What the phone-size status chips show: one status, or every order. */
export type OrderStatusFilter = OrderStatus | 'all';

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

/** An order is inside a window when it is at most this many milliseconds old (the limit itself counts). */
export const ORDER_TIME_WINDOW_MS: Record<Exclude<OrderTimeFilter, 'all'>, number> = {
  today: DAY_MS,
  week: 7 * DAY_MS,
  month: 30 * DAY_MS,
};

/**
 * How long ago an order was placed, in words: "الآن" for the first minute (or a time that has not
 * come yet), then whole minutes, hours and days — "من 8 دقيقة", "من 3 ساعة", "من 2 يوم".
 */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const mins = Math.floor(diff / MINUTE_MS);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `من ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `من ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `من ${days} يوم`;
}

/** The orders placed inside the chosen window; "all" gives the same list back. Order is kept. */
export function ordersWithin(orders: ReadonlyArray<Order>, filter: OrderTimeFilter, now: number): ReadonlyArray<Order> {
  if (filter === 'all') return orders;
  const limit = ORDER_TIME_WINDOW_MS[filter];
  return orders.filter(o => now - new Date(o.createdAt).getTime() <= limit);
}

/** A copy of the list with the latest order first. Orders placed at the same moment keep the order they came in. */
export function newestFirst(orders: ReadonlyArray<Order>): Order[] {
  return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** One column per status — every status is there even when empty — newest order first in each. */
export function groupByStatus(orders: ReadonlyArray<Order>): Record<OrderStatus, Order[]> {
  const columns: Record<OrderStatus, Order[]> = { new: [], preparing: [], shipped: [], delivered: [] };
  for (const order of orders) columns[order.status].push(order);
  (Object.keys(columns) as OrderStatus[]).forEach(status => { columns[status] = newestFirst(columns[status]); });
  return columns;
}

/** The phone-size list: every order, or just the chosen status, newest first. */
export function ordersForStatusFilter(orders: ReadonlyArray<Order>, filter: OrderStatusFilter): Order[] {
  return newestFirst(filter === 'all' ? orders : orders.filter(o => o.status === filter));
}

export interface OrdersSummary {
  count: number;
  newCount: number;
  deliveredCount: number;
  /** Sum of every order's total. */
  totalValue: number;
}

/** The numbers on the stats row. They look at all orders, whatever the filters say. */
export function summarizeOrders(orders: ReadonlyArray<Order>): OrdersSummary {
  return {
    count: orders.length,
    newCount: orders.filter(o => o.status === 'new').length,
    deliveredCount: orders.filter(o => o.status === 'delivered').length,
    totalValue: orders.reduce((sum, o) => sum + o.total, 0),
  };
}

/** What the new-order form has typed for one product line (the boxes hold text). */
export interface OrderItemDraft {
  name: string;
  price: string;
  quantity: string;
}

/** The order line for what was typed (the caller gives it its id), or null while a name, a price above zero or a quantity above zero is missing. */
export function parseOrderItem(draft: OrderItemDraft): Omit<OrderItem, 'productId'> | null {
  const price = Number(draft.price);
  const quantity = Number(draft.quantity);
  if (!draft.name.trim() || !isAboveZero(price) || !isAboveZero(quantity)) return null;
  return { name: draft.name.trim(), price, quantity };
}

/** A real number greater than zero: not negative, not 0, not text that is not a number, not endless. */
function isAboveZero(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

/** The form can be sent once it has what OrderService asks for: a customer name, a phone number and at least one line. */
export function canSubmitOrder(customerName: string, customerPhone: string, itemCount: number): boolean {
  return customerName.trim() !== '' && customerPhone.trim() !== '' && itemCount > 0;
}

/** The total the form shows — worked out the way OrderService will store it, to the piastre. */
export function previewTotal(items: ReadonlyArray<OrderItem>): number {
  return calcSubtotal(items);
}
