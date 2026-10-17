import type {
  PurchaseOrder,
  PurchaseOrderKanban,
  PurchaseOrderStatus,
} from '@/types';
import { generateId } from '@/lib/utils';
import type { IPurchaseOrderRepository } from './IPurchaseOrderRepository';

/** Input accepted when creating a Kanban purchase order from the UI. */
export interface CreatePurchaseOrderInput {
  supplier: string;
  items: PurchaseOrderKanban['items'];
  expectedDelivery: string;
  notes?: string;
}

/** Thrown when a caller tries to create/update an order with invalid data. */
export class InvalidPurchaseOrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPurchaseOrderError';
  }
}

/**
 * PurchaseOrderService — all purchase-order business logic lives here, and
 * ONLY here.
 *
 * High-level module in Dependency Inversion terms: it depends solely on the
 * IPurchaseOrderRepository abstraction injected through the constructor. The
 * UI reaches this service through usePurchaseOrders() and never touches
 * services/mock.
 */
export class PurchaseOrderService {
  private readonly repository: IPurchaseOrderRepository;

  constructor(repository: IPurchaseOrderRepository) {
    this.repository = repository;
  }

  async getAllOrders(): Promise<PurchaseOrder[]> {
    return this.repository.findAll();
  }

  async getKanbanOrders(): Promise<PurchaseOrderKanban[]> {
    return this.repository.findKanbanOrders();
  }

  async updateKanbanOrderStatus(
    id: string,
    status: PurchaseOrderStatus,
  ): Promise<PurchaseOrderKanban> {
    const orders = await this.repository.findKanbanOrders();
    const existing = orders.find(o => o.id === id);
    if (!existing) {
      throw new InvalidPurchaseOrderError(`Cannot update unknown purchase order: ${id}`);
    }
    return this.repository.updateKanbanOrder({ ...existing, status });
  }

  async createKanbanOrder(input: CreatePurchaseOrderInput): Promise<PurchaseOrderKanban> {
    if (!input.supplier.trim()) {
      throw new InvalidPurchaseOrderError('Supplier is required');
    }
    if (input.items.length === 0) {
      throw new InvalidPurchaseOrderError('A purchase order needs at least one item');
    }

    const total = input.items.reduce((sum, i) => sum + i.unitCost * i.quantity, 0);
    const order: PurchaseOrderKanban = {
      id: generateId('POK'),
      supplier: input.supplier.trim(),
      items: input.items,
      total,
      status: 'ordered',
      date: new Date().toISOString().slice(0, 10),
      expectedDelivery: input.expectedDelivery,
      notes: input.notes,
    };

    return this.repository.insertKanbanOrder(order);
  }
}
