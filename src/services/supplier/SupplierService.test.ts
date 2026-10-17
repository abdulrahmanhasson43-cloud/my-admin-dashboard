import { describe, expect, it } from 'vitest';
import { InvalidSupplierError, SupplierService } from './SupplierService';
import { MockSupplierRepository } from './MockSupplierRepository';

const service = () => new SupplierService(new MockSupplierRepository([]));
const draft = { name: 'مورد', phone: '0100', email: 'm@x.com' };

describe('SupplierService', () => {
  it('creates an active supplier with no products or orders and trimmed fields', async () => {
    const supplier = await service().createSupplier({ name: '  مورد ', phone: ' 0100 ', email: ' m@x.com ' });
    expect(supplier).toMatchObject({ name: 'مورد', phone: '0100', email: 'm@x.com', products: 0, totalOrders: 0, status: 'active' });
    expect(supplier.id).toMatch(/^SUP-/);
  });

  it('rejects a blank name on create', async () => {
    await expect(service().createSupplier({ ...draft, name: ' ' })).rejects.toThrow(InvalidSupplierError);
  });

  it('also rejects blanking the name on update (the rule applies to the merged result)', async () => {
    const svc = service();
    const supplier = await svc.createSupplier(draft);
    await expect(svc.updateSupplier(supplier.id, { name: '  ' })).rejects.toThrow(InvalidSupplierError);
    expect((await svc.getSupplierById(supplier.id))?.name).toBe('مورد');
  });

  it('update merges, delete removes, unknown ids are rejected', async () => {
    const svc = service();
    const supplier = await svc.createSupplier(draft);
    expect((await svc.updateSupplier(supplier.id, { phone: '0111' })).phone).toBe('0111');
    await svc.deleteSupplier(supplier.id);
    expect(await svc.getSupplierById(supplier.id)).toBeNull();
    await expect(svc.updateSupplier('nope', {})).rejects.toThrow(InvalidSupplierError);
  });
});
