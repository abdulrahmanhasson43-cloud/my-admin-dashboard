import { describe, expect, it } from 'vitest';
import type { CartItem, HeldOrder } from '@/types';
import type { IHeldOrderRepository } from './IHeldOrderRepository';
import { HeldOrderService } from './HeldOrderService';

class FakeRepository implements IHeldOrderRepository {
  saved: HeldOrder[] | null = null;
  load() { return []; }
  save(orders: HeldOrder[]) { this.saved = orders; }
}

const cartItem = (id: string, quantity = 1): CartItem =>
  ({ id, name: `p-${id}`, price: 10, quantity, barcode: 'b', category: 'c', stock: 5 } as unknown as CartItem);

const input = { label: '', items: [cartItem('a', 2)], subtotal: 20, tax: 2.8, total: 22.8 };

describe('HeldOrderService', () => {
  it('hold parks the cart first in the list and saves it', () => {
    const repo = new FakeRepository();
    const next = new HeldOrderService(repo).hold([], { ...input, reason: 'العميل نسي محفظته' });
    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({ subtotal: 20, tax: 2.8, total: 22.8, reason: 'العميل نسي محفظته' });
    expect(next[0].id).toMatch(/^HLD-/);
    expect(repo.saved).toBe(next);
  });

  it('gives an unnamed order an automatic label, and keeps a given label', () => {
    const service = new HeldOrderService(new FakeRepository());
    expect(service.hold([], input)[0].label).toMatch(/^طلب معلق #/);
    expect(service.hold([], { ...input, label: 'طاولة 3' })[0].label).toBe('طاولة 3');
  });

  it('keeps only id, name, price and quantity per line', () => {
    const [order] = new HeldOrderService(new FakeRepository()).hold([], input);
    expect(Object.keys(order.items[0]).sort()).toEqual(['id', 'name', 'price', 'quantity']);
  });

  it('resume returns the order AND the remaining list, and saves the remainder', () => {
    const repo = new FakeRepository();
    const service = new HeldOrderService(repo);
    const parked = service.hold(service.hold([], { ...input, label: 'first' }), { ...input, label: 'second' });
    const target = parked[1];

    const { order, remaining } = service.resume(parked, target.id);
    expect(order?.label).toBe('first');
    expect(remaining.map(o => o.label)).toEqual(['second']);
    expect(repo.saved).toBe(remaining);
  });

  it('resume of an unknown id changes nothing and saves nothing new', () => {
    const repo = new FakeRepository();
    const service = new HeldOrderService(repo);
    const parked = service.hold([], input);
    repo.saved = null;
    const result = service.resume(parked, 'nope');
    expect(result.order).toBeNull();
    expect(result.remaining).toBe(parked);
    expect(repo.saved).toBeNull();
  });

  it('gives every held order a unique id, even when parked in the same millisecond', () => {
    const service = new HeldOrderService(new FakeRepository());
    let list: HeldOrder[] = [];
    for (let i = 0; i < 25; i++) list = service.hold(list, { ...input, label: `o${i}` });
    expect(new Set(list.map(o => o.id)).size).toBe(25);
  });

  it('remove deletes just that order', () => {
    const service = new HeldOrderService(new FakeRepository());
    const parked = service.hold(service.hold([], { ...input, label: 'a' }), { ...input, label: 'b' });
    expect(service.remove(parked, parked[0].id).map(o => o.label)).toEqual(['a']);
  });
});
