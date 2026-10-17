import { describe, expect, it } from 'vitest';
import type { Order, OrderStatus } from '@/types/order';
import {
  ORDER_TIME_WINDOW_MS,
  canSubmitOrder,
  groupByStatus,
  newestFirst,
  ordersForStatusFilter,
  ordersWithin,
  parseOrderItem,
  previewTotal,
  relativeTime,
  summarizeOrders,
} from './orders';

const NOW = Date.parse('2026-10-11T12:00:00Z');
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const agoIso = (ms: number) => new Date(NOW - ms).toISOString();

const order = (id: string, ageMs: number, status: OrderStatus = 'new', total = 100): Order => ({
  id,
  customerName: `عميل ${id}`,
  customerPhone: '01000000000',
  items: [],
  total,
  paymentMethod: 'cash',
  status,
  createdAt: agoIso(ageMs),
  timeline: [],
});
const ids = (orders: ReadonlyArray<Order>) => orders.map(o => o.id);

describe('relativeTime', () => {
  it('says "now" for the first minute, and for a time that has not come yet', () => {
    expect(relativeTime(agoIso(0), NOW)).toBe('الآن');
    expect(relativeTime(agoIso(59_999), NOW)).toBe('الآن');
    expect(relativeTime(agoIso(-5 * MINUTE), NOW)).toBe('الآن');
  });

  it('counts whole minutes up to the first hour', () => {
    expect(relativeTime(agoIso(MINUTE), NOW)).toBe('من 1 دقيقة');
    expect(relativeTime(agoIso(8 * MINUTE + 30_000), NOW)).toBe('من 8 دقيقة');
    expect(relativeTime(agoIso(HOUR - 1), NOW)).toBe('من 59 دقيقة');
  });

  it('counts whole hours up to the first day', () => {
    expect(relativeTime(agoIso(HOUR), NOW)).toBe('من 1 ساعة');
    expect(relativeTime(agoIso(5 * HOUR + 59 * MINUTE), NOW)).toBe('من 5 ساعة');
    expect(relativeTime(agoIso(DAY - 1), NOW)).toBe('من 23 ساعة');
  });

  it('then counts whole days', () => {
    expect(relativeTime(agoIso(DAY), NOW)).toBe('من 1 يوم');
    expect(relativeTime(agoIso(3 * DAY + 5 * HOUR), NOW)).toBe('من 3 يوم');
    expect(relativeTime(agoIso(40 * DAY), NOW)).toBe('من 40 يوم');
  });

  it('measures from the current time when no "now" is given', () => {
    expect(relativeTime(new Date().toISOString())).toBe('الآن');
  });
});

describe('ordersWithin', () => {
  const orders = [
    order('a', 5 * MINUTE), order('b', DAY), order('c', DAY + 1),
    order('d', 7 * DAY), order('e', 7 * DAY + 1), order('f', 30 * DAY), order('g', 30 * DAY + 1),
  ];

  it('"all" keeps everything', () => {
    expect(ordersWithin(orders, 'all', NOW)).toBe(orders);
  });

  it('"today" keeps orders up to exactly 24 hours old, and drops anything older', () => {
    expect(ids(ordersWithin(orders, 'today', NOW))).toEqual(['a', 'b']);
  });

  it('"week" keeps up to exactly 7 days, "month" up to exactly 30 days', () => {
    expect(ids(ordersWithin(orders, 'week', NOW))).toEqual(['a', 'b', 'c', 'd']);
    expect(ids(ordersWithin(orders, 'month', NOW))).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  it('keeps an order stamped slightly in the future (a clock that is a little ahead)', () => {
    expect(ids(ordersWithin([order('x', -2 * MINUTE)], 'today', NOW))).toEqual(['x']);
  });

  it('keeps the order of the list and leaves the original alone', () => {
    const before = [...orders];
    ordersWithin(orders, 'week', NOW);
    expect(orders).toEqual(before);
  });

  it('the windows are one day, seven days and thirty days', () => {
    expect(ORDER_TIME_WINDOW_MS).toEqual({ today: DAY, week: 7 * DAY, month: 30 * DAY });
  });
});

describe('newestFirst', () => {
  it('puts the latest order on top without touching the original list', () => {
    const list = [order('old', 3 * DAY), order('new', MINUTE), order('mid', HOUR)];
    expect(ids(newestFirst(list))).toEqual(['new', 'mid', 'old']);
    expect(ids(list)).toEqual(['old', 'new', 'mid']);
  });

  it('orders created at the same moment stay in the order they came', () => {
    const list = [order('first', HOUR), order('second', HOUR), order('third', HOUR)];
    expect(ids(newestFirst(list))).toEqual(['first', 'second', 'third']);
  });
});

describe('groupByStatus', () => {
  it('has a column for every status, even an empty one', () => {
    expect(groupByStatus([])).toEqual({ new: [], preparing: [], shipped: [], delivered: [] });
  });

  it('files each order under its status, newest first in every column', () => {
    const grouped = groupByStatus([
      order('n-old', 2 * HOUR, 'new'), order('d1', 5 * HOUR, 'delivered'), order('n-new', MINUTE, 'new'),
      order('p', HOUR, 'preparing'), order('d2', 9 * HOUR, 'delivered'),
    ]);
    expect(ids(grouped.new)).toEqual(['n-new', 'n-old']);
    expect(ids(grouped.preparing)).toEqual(['p']);
    expect(ids(grouped.shipped)).toEqual([]);
    expect(ids(grouped.delivered)).toEqual(['d1', 'd2']);
  });
});

describe('ordersForStatusFilter', () => {
  const list = [order('s-old', 5 * HOUR, 'shipped'), order('n', MINUTE, 'new'), order('s-new', HOUR, 'shipped'), order('d', 2 * HOUR, 'delivered')];

  it('"all" lists every order, newest first', () => {
    expect(ids(ordersForStatusFilter(list, 'all'))).toEqual(['n', 's-new', 'd', 's-old']);
  });

  it('a status lists only the orders in it, newest first', () => {
    expect(ids(ordersForStatusFilter(list, 'shipped'))).toEqual(['s-new', 's-old']);
    expect(ids(ordersForStatusFilter(list, 'preparing'))).toEqual([]);
  });

  it('does not reorder the list it was given', () => {
    ordersForStatusFilter(list, 'all');
    expect(ids(list)).toEqual(['s-old', 'n', 's-new', 'd']);
  });
});

describe('summarizeOrders', () => {
  it('counts the orders, the new ones and the delivered ones, and adds up their value', () => {
    const summary = summarizeOrders([
      order('1', HOUR, 'new', 250), order('2', HOUR, 'new', 100.5), order('3', HOUR, 'preparing', 40),
      order('4', HOUR, 'delivered', 1000), order('5', HOUR, 'shipped', 9.5), order('6', HOUR, 'shipped', 10),
    ]);
    expect(summary).toEqual({ count: 6, newCount: 2, deliveredCount: 1, totalValue: 1410 });
  });

  it('is all zeros for no orders', () => {
    expect(summarizeOrders([])).toEqual({ count: 0, newCount: 0, deliveredCount: 0, totalValue: 0 });
  });
});

describe('parseOrderItem', () => {
  it('builds the order line from what was typed: trimmed name, price and quantity as numbers', () => {
    expect(parseOrderItem({ name: '  قلم ', price: '1.1', quantity: '3' }))
      .toEqual({ name: 'قلم', price: 1.1, quantity: 3 });
  });

  it('refuses a line with no name, no price or no quantity', () => {
    expect(parseOrderItem({ name: '', price: '5', quantity: '1' })).toBeNull();
    expect(parseOrderItem({ name: '   ', price: '5', quantity: '1' })).toBeNull();
    expect(parseOrderItem({ name: 'قلم', price: '', quantity: '1' })).toBeNull();
    expect(parseOrderItem({ name: 'قلم', price: '5', quantity: '' })).toBeNull();
  });

  it('refuses a price or a quantity of zero, or text that is not a number', () => {
    expect(parseOrderItem({ name: 'قلم', price: '0', quantity: '1' })).toBeNull();
    expect(parseOrderItem({ name: 'قلم', price: '5', quantity: '0' })).toBeNull();
    expect(parseOrderItem({ name: 'قلم', price: 'abc', quantity: '1' })).toBeNull();
    expect(parseOrderItem({ name: 'قلم', price: '5', quantity: 'x' })).toBeNull();
  });

  it('refuses a negative price or quantity, and an endless one', () => {
    expect(parseOrderItem({ name: 'قلم', price: '-5', quantity: '2' })).toBeNull();
    expect(parseOrderItem({ name: 'قلم', price: '5', quantity: '-2' })).toBeNull();
    expect(parseOrderItem({ name: 'قلم', price: '1e999', quantity: '1' })).toBeNull();
    expect(parseOrderItem({ name: 'قلم', price: '5', quantity: '1e999' })).toBeNull();
  });

  it('still takes a fractional quantity (half a kilo) and a price with piastres', () => {
    expect(parseOrderItem({ name: 'جبنة', price: '45.5', quantity: '0.5' })).toEqual({ name: 'جبنة', price: 45.5, quantity: 0.5 });
  });
});

describe('canSubmitOrder', () => {
  it('needs a customer name, a phone number and at least one line — the same things OrderService asks for', () => {
    expect(canSubmitOrder('أحمد', '01001234567', 1)).toBe(true);
    expect(canSubmitOrder('', '01001234567', 1)).toBe(false);
    expect(canSubmitOrder('   ', '01001234567', 1)).toBe(false);
    expect(canSubmitOrder('أحمد', '', 1)).toBe(false);
    expect(canSubmitOrder('أحمد', '   ', 1)).toBe(false);
    expect(canSubmitOrder('أحمد', '01001234567', 0)).toBe(false);
  });
});

describe('previewTotal', () => {
  const line = (price: number, quantity: number) => ({ productId: 'p', name: 'x', price, quantity });

  it('adds up price × quantity', () => {
    expect(previewTotal([line(10, 2), line(5, 1)])).toBe(25);
    expect(previewTotal([])).toBe(0);
  });

  it('has no floating-point tail (1.1 × 3 is 3.3, as the service will store it)', () => {
    expect(previewTotal([line(1.1, 3)])).toBe(3.3);
    expect(previewTotal([line(1.1, 3), line(19.99, 2)])).toBe(43.28);
  });
});
