import { describe, expect, it } from 'vitest';
import type { Order, OrderStatus } from '@/types/order';
import {
  countItems, filterOrdersByTime, groupOrdersByStatus, itemsTotal, ordersForStatusFilter,
  parseItemInput, relativeTime, sortNewestFirst, summarizeOrders,
} from './orders';

const NOW = new Date('2026-10-06T12:00:00Z').getTime();
const minutesAgo = (m: number) => new Date(NOW - m * 60000).toISOString();

function order(id: string, status: OrderStatus, createdAt: string, total = 100): Order {
  return {
    id, customerName: 'عميل', customerPhone: '01000000000', items: [], total,
    paymentMethod: 'cash', status, createdAt, timeline: [],
  };
}

describe('filterOrdersByTime', () => {
  const orders = [
    order('a', 'new', minutesAgo(30)),            // 30 minutes
    order('b', 'new', minutesAgo(60 * 24 * 3)),   // 3 days
    order('c', 'new', minutesAgo(60 * 24 * 20)),  // 20 days
    order('d', 'new', minutesAgo(60 * 24 * 60)),  // 60 days
  ];
  const ids = (list: Order[]) => list.map(o => o.id);

  it('"all" keeps every order', () => {
    expect(ids(filterOrdersByTime(orders, 'all', NOW))).toEqual(['a', 'b', 'c', 'd']);
  });
  it('today / week / month keep only orders inside the window', () => {
    expect(ids(filterOrdersByTime(orders, 'today', NOW))).toEqual(['a']);
    expect(ids(filterOrdersByTime(orders, 'week', NOW))).toEqual(['a', 'b']);
    expect(ids(filterOrdersByTime(orders, 'month', NOW))).toEqual(['a', 'b', 'c']);
  });
  it('an order exactly at the window edge is still inside it', () => {
    const edge = [order('edge', 'new', new Date(NOW - 86400000).toISOString())];
    expect(filterOrdersByTime(edge, 'today', NOW)).toHaveLength(1);
  });
});

describe('sorting and grouping', () => {
  const older = order('older', 'new', minutesAgo(90));
  const newer = order('newer', 'new', minutesAgo(10));

  it('sortNewestFirst returns a sorted copy and leaves the input alone', () => {
    const input = [older, newer];
    expect(sortNewestFirst(input).map(o => o.id)).toEqual(['newer', 'older']);
    expect(input.map(o => o.id)).toEqual(['older', 'newer']);
  });

  it('groupOrdersByStatus has all four statuses and sorts each newest first', () => {
    const grouped = groupOrdersByStatus([older, newer, order('s', 'shipped', minutesAgo(5))]);
    expect(Object.keys(grouped).sort()).toEqual(['delivered', 'new', 'preparing', 'shipped']);
    expect(grouped.new.map(o => o.id)).toEqual(['newer', 'older']);
    expect(grouped.shipped.map(o => o.id)).toEqual(['s']);
    expect(grouped.preparing).toEqual([]);
  });

  it('ordersForStatusFilter picks everything or one status, newest first', () => {
    const all = [older, order('d', 'delivered', minutesAgo(1)), newer];
    const byStatus = groupOrdersByStatus(all);
    expect(ordersForStatusFilter(all, byStatus, 'all').map(o => o.id)).toEqual(['d', 'newer', 'older']);
    expect(ordersForStatusFilter(all, byStatus, 'delivered').map(o => o.id)).toEqual(['d']);
  });
});

describe('relativeTime', () => {
  it.each([
    [0, 'الآن'],
    [1, 'من 1 دقيقة'],
    [59, 'من 59 دقيقة'],
    [60, 'من 1 ساعة'],
    [60 * 23 + 59, 'من 23 ساعة'],
    [60 * 24, 'من 1 يوم'],
    [60 * 24 * 3, 'من 3 يوم'],
  ])('%i minutes ago reads "%s"', (minutes, expected) => {
    expect(relativeTime(minutesAgo(minutes), NOW)).toBe(expected);
  });
});

describe('summarizeOrders', () => {
  it('counts new and delivered orders and adds up the revenue', () => {
    const summary = summarizeOrders([
      order('1', 'new', minutesAgo(1), 100),
      order('2', 'new', minutesAgo(2), 50),
      order('3', 'delivered', minutesAgo(3), 250),
      order('4', 'preparing', minutesAgo(4), 10),
    ]);
    expect(summary).toEqual({ total: 4, newCount: 2, deliveredCount: 1, revenue: 410 });
  });
  it('an empty list is all zeros', () => {
    expect(summarizeOrders([])).toEqual({ total: 0, newCount: 0, deliveredCount: 0, revenue: 0 });
  });
});

describe('order lines', () => {
  const items = [
    { productId: 'p1', name: 'قلم', price: 10, quantity: 3 },
    { productId: 'p2', name: 'دفتر', price: 25, quantity: 2 },
  ];
  it('countItems adds the quantities', () => expect(countItems(items)).toBe(5));
  it('itemsTotal adds price × quantity', () => expect(itemsTotal(items)).toBe(80));
  it('both are zero for no lines', () => {
    expect(countItems([])).toBe(0);
    expect(itemsTotal([])).toBe(0);
  });
});

describe('parseItemInput', () => {
  it('trims the name and reads the numbers', () => {
    expect(parseItemInput('  قلم  ', '12.5', '4')).toEqual({ name: 'قلم', price: 12.5, quantity: 4 });
  });
  it.each([
    ['blank name', '   ', '10', '1'],
    ['empty price', 'قلم', '', '1'],
    ['zero price', 'قلم', '0', '1'],
    ['not a number', 'قلم', 'abc', '1'],
    ['zero quantity', 'قلم', '10', '0'],
    ['empty quantity', 'قلم', '10', ''],
  ])('is ignored for %s', (_label, name, price, quantity) => {
    expect(parseItemInput(name, price, quantity)).toBeNull();
  });
});
