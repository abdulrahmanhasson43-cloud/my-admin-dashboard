import { beforeEach, describe, expect, it } from 'vitest';
import type { Order, OrderItem } from '@/types/order';
import { InvalidOrderError, OrderService } from './OrderService';
import type { CreateOrderInput } from './OrderService';
import { MockOrderRepository } from './MockOrderRepository';

const items: OrderItem[] = [
  { productId: 'p1', name: 'سماعة', price: 100, quantity: 2 },
  { productId: 'p2', name: 'شاحن', price: 50, quantity: 1 },
];

function validInput(overrides: Partial<CreateOrderInput> = {}): CreateOrderInput {
  return {
    customerName: '  أحمد محمد  ',
    customerPhone: ' 01001234567 ',
    items,
    paymentMethod: 'cash',
    ...overrides,
  };
}

function makeOrder(id: string, createdAt: string, status: Order['status'] = 'new'): Order {
  return {
    id,
    customerName: 'عميل',
    customerPhone: '010',
    items,
    total: 250,
    paymentMethod: 'cash',
    status,
    createdAt,
    timeline: [],
  };
}

let service: OrderService;

beforeEach(() => {
  service = new OrderService(new MockOrderRepository([]));
});

describe('OrderService.createOrder', () => {
  it('computes the total, starts as "new" and trims customer details', async () => {
    const order = await service.createOrder(validInput());

    expect(order.total).toBe(250);
    expect(order.status).toBe('new');
    expect(order.customerName).toBe('أحمد محمد');
    expect(order.customerPhone).toBe('01001234567');
    expect(order.timeline).toHaveLength(1);
    expect(order.timeline[0].status).toBe('new');
  });

  it.each([
    ['blank customer name', { customerName: '  ' }],
    ['blank phone', { customerPhone: '' }],
    ['no items', { items: [] }],
  ])('rejects an order with %s', async (_label, patch) => {
    await expect(service.createOrder(validInput(patch))).rejects.toBeInstanceOf(InvalidOrderError);
  });
});

describe('OrderService.moveOrderToStatus', () => {
  it('changes the status and appends an Arabic timeline note', async () => {
    const created = await service.createOrder(validInput());
    const moved = await service.moveOrderToStatus(created.id, 'preparing');

    expect(moved.status).toBe('preparing');
    expect(moved.timeline).toHaveLength(2);
    expect(moved.timeline[1].note).toBe('تم نقل إلى قيد التجهيز');
  });

  it('does nothing when the order is already in that status', async () => {
    const created = await service.createOrder(validInput());
    const same = await service.moveOrderToStatus(created.id, 'new');

    expect(same.timeline).toHaveLength(1);
  });

  it('rejects an unknown order id', async () => {
    await expect(service.moveOrderToStatus('missing', 'shipped')).rejects.toBeInstanceOf(InvalidOrderError);
  });
});

describe('OrderService queries', () => {
  beforeEach(() => {
    service = new OrderService(
      new MockOrderRepository([
        makeOrder('old', '2025-01-01T10:00:00.000Z', 'delivered'),
        makeOrder('newest', '2025-03-01T10:00:00.000Z', 'new'),
        makeOrder('middle', '2025-02-01T10:00:00.000Z', 'new'),
      ]),
    );
  });

  it('lists orders newest first', async () => {
    const ids = (await service.getAllOrders()).map(o => o.id);
    expect(ids).toEqual(['newest', 'middle', 'old']);
  });

  it('groups orders by status for the kanban board', async () => {
    const grouped = await service.getOrdersGroupedByStatus();

    expect(grouped.new.map(o => o.id)).toEqual(['newest', 'middle']);
    expect(grouped.delivered.map(o => o.id)).toEqual(['old']);
    expect(grouped.preparing).toEqual([]);
    expect(grouped.shipped).toEqual([]);
  });
});
