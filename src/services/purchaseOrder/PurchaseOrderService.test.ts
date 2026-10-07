import { describe, expect, it } from 'vitest';
import { InvalidPurchaseOrderError, PurchaseOrderService, type CreatePurchaseOrderInput } from './PurchaseOrderService';
import { MockPurchaseOrderRepository } from './MockPurchaseOrderRepository';

const input = (overrides: Partial<CreatePurchaseOrderInput> = {}): CreatePurchaseOrderInput =>
  ({
    supplier: 'مورد',
    items: [
      { productId: 'a', name: 'A', unitCost: 10, quantity: 3 },
      { productId: 'b', name: 'B', unitCost: 5, quantity: 2 },
    ],
    expectedDelivery: '2026-02-01',
    ...overrides,
  } as CreatePurchaseOrderInput);

const service = () => new PurchaseOrderService(new MockPurchaseOrderRepository([], []));

describe('PurchaseOrderService', () => {
  it('creates an ordered purchase order and totals unit cost × quantity', async () => {
    const order = await service().createKanbanOrder(input({ supplier: '  مورد ' }));
    expect(order.status).toBe('ordered');
    expect(order.total).toBe(40);
    expect(order.supplier).toBe('مورد');
    expect(order.id).toMatch(/^POK-/);
  });

  it('rejects a blank supplier and an empty item list', async () => {
    const svc = service();
    await expect(svc.createKanbanOrder(input({ supplier: ' ' }))).rejects.toThrow(InvalidPurchaseOrderError);
    await expect(svc.createKanbanOrder(input({ items: [] }))).rejects.toThrow(InvalidPurchaseOrderError);
  });

  it('moves an order between kanban columns; unknown ids are rejected', async () => {
    const svc = service();
    const order = await svc.createKanbanOrder(input());
    expect((await svc.updateKanbanOrderStatus(order.id, 'received')).status).toBe('received');
    expect((await svc.getKanbanOrders())[0].status).toBe('received');
    await expect(svc.updateKanbanOrderStatus('nope', 'received')).rejects.toThrow(InvalidPurchaseOrderError);
  });
});
