import type { Order, OrderStatus, OrderItem, OrderPaymentMethod } from '@/types/order';
import { getOrderStatusMeta } from '@/types/order';
import { generateId } from '@/lib/utils';
import type { IOrderRepository } from './IOrderRepository';

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  paymentMethod: OrderPaymentMethod;
  branchId?: string;
}

/** Thrown when a caller tries to create/move an order with invalid data. */
export class InvalidOrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidOrderError';
  }
}

/**
 * OrderService — all order business logic lives here, and ONLY here.
 *
 * This class is the "high-level module" in Dependency Inversion terms: it
 * depends solely on the IOrderRepository abstraction (injected through the
 * constructor), never on a concrete storage technology. It has no idea
 * whether orders are actually sitting in memory, in Firestore, or behind a
 * REST API — and it doesn't need to. That knowledge is fully owned by
 * whichever IOrderRepository implementation gets injected at the
 * composition root (see order-service-context.tsx).
 *
 * SOLID recap for this class specifically:
 * - Single Responsibility: order business rules (validation, status
 *   transitions, totals) — nothing about HOW data is persisted.
 * - Open/Closed: new persistence backends extend the app by adding a new
 *   IOrderRepository implementation; this class never changes for that.
 * - Liskov Substitution: any IOrderRepository implementation can be
 *   substituted here without breaking a single method below.
 * - Interface Segregation: IOrderRepository only exposes the handful of
 *   methods an order-storage backend actually needs to support — no
 *   generic "god" repository interface.
 * - Dependency Inversion: this class (high-level policy) and every
 *   concrete repository (low-level detail) both depend on IOrderRepository
 *   (the abstraction) — neither depends on the other directly.
 */
export class OrderService {
  private readonly repository: IOrderRepository;

  constructor(repository: IOrderRepository) {
    this.repository = repository;
  }

  async getAllOrders(): Promise<Order[]> {
    const orders = await this.repository.findAll();
    return [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.repository.findById(id);
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    const orders = await this.getAllOrders();
    return orders.filter(o => o.status === status);
  }

  /** Groups every order by status in one pass — what the Kanban board needs. */
  async getOrdersGroupedByStatus(): Promise<Record<OrderStatus, Order[]>> {
    const orders = await this.getAllOrders();
    const grouped: Record<OrderStatus, Order[]> = {
      new: [], preparing: [], shipped: [], delivered: [],
    };
    for (const order of orders) {
      grouped[order.status].push(order);
    }
    return grouped;
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    this.assertValidCreateInput(input);

    const total = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const now = new Date().toISOString();

    const order: Order = {
      id: generateId('ORD'),
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      items: input.items,
      total,
      paymentMethod: input.paymentMethod,
      status: 'new',
      createdAt: now,
      branchId: input.branchId,
      timeline: [
        { id: generateId('t'), status: 'new', timestamp: now, note: 'تم إنشاء الطلب' },
      ],
    };

    return this.repository.insert(order);
  }

  /**
   * Moves an order to a new status, appending a timeline entry — this is
   * the business rule the Kanban drag-and-drop calls into. Throws
   * InvalidOrderError if the order doesn't exist.
   */
  async moveOrderToStatus(id: string, status: OrderStatus): Promise<Order> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new InvalidOrderError(`Cannot move unknown order: ${id}`);
    }
    if (existing.status === status) {
      return existing; // no-op, nothing changed
    }

    const timelineEntry = {
      id: generateId('t'),
      status,
      timestamp: new Date().toISOString(),
      note: `تم نقل إلى ${getOrderStatusMeta(status).label}`,
    };

    const updated: Order = {
      ...existing,
      status,
      timeline: [...existing.timeline, timelineEntry],
    };

    return this.repository.update(updated);
  }

  async deleteOrder(id: string): Promise<void> {
    return this.repository.remove(id);
  }

  private assertValidCreateInput(input: CreateOrderInput): void {
    if (!input.customerName.trim()) {
      throw new InvalidOrderError('customerName is required');
    }
    if (!input.customerPhone.trim()) {
      throw new InvalidOrderError('customerPhone is required');
    }
    if (input.items.length === 0) {
      throw new InvalidOrderError('An order must contain at least one item');
    }
  }
}
