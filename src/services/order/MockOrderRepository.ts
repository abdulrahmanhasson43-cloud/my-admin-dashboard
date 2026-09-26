import type { Order } from '@/types/order';
import { sampleKanbanOrders } from '@/services/mock/orders';
import { OrderNotFoundError } from './IOrderRepository';
import type { IOrderRepository } from './IOrderRepository';

/**
 * MockOrderRepository — an in-memory implementation of IOrderRepository.
 *
 * This is a low-level module in Dependency Inversion terms: it implements
 * the IOrderRepository abstraction rather than OrderService depending on
 * it directly. OrderService never imports this file.
 *
 * TODO(phase-3): replace with a real adapter (e.g. FirestoreOrderRepository
 * or RestApiOrderRepository) that implements the same IOrderRepository
 * interface and talks to the actual backend. Swap it in one place —
 * src/context/order-service-context.tsx — and nothing else in the app
 * needs to change.
 */
export class MockOrderRepository implements IOrderRepository {
  private orders: Order[];

  constructor(seed: Order[] = sampleKanbanOrders) {
    // Copy so mutations here never reach back into the shared mock fixture.
    this.orders = seed.map(o => ({ ...o, items: [...o.items], timeline: [...o.timeline] }));
  }

  async findAll(): Promise<Order[]> {
    return [...this.orders];
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.find(o => o.id === id) ?? null;
  }

  async insert(order: Order): Promise<Order> {
    this.orders = [order, ...this.orders];
    return order;
  }

  async update(order: Order): Promise<Order> {
    const index = this.orders.findIndex(o => o.id === order.id);
    if (index === -1) {
      throw new OrderNotFoundError(order.id);
    }
    this.orders = [
      ...this.orders.slice(0, index),
      order,
      ...this.orders.slice(index + 1),
    ];
    return order;
  }

  async remove(id: string): Promise<void> {
    this.orders = this.orders.filter(o => o.id !== id);
  }
}
