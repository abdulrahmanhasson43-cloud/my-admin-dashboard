import { describe, expect, it } from 'vitest';
import type { Bundle, BundleItem } from '@/types';
import { BundleService, InvalidBundleError, type CreateBundleInput } from './BundleService';
import { MockBundleRepository } from './MockBundleRepository';

const items: BundleItem[] = [
  { productId: 'a', name: 'A', price: 100, quantity: 2 },
  { productId: 'b', name: 'B', price: 50, quantity: 1 },
]; // original price = 250

const input = (overrides: Partial<CreateBundleInput> = {}): CreateBundleInput =>
  ({ name: 'باقة', description: 'وصف', items, discountedPrice: 200, ...overrides });

const stored = (overrides: Partial<Bundle> = {}): Bundle =>
  ({ id: 'b1', name: 'x', description: '', items, originalPrice: 250, discountedPrice: 200, active: true, createdAt: '2026-01-01', ...overrides } as Bundle);

const service = (seed: Bundle[] = []) => new BundleService(new MockBundleRepository(seed));

describe('BundleService', () => {
  it('creates an active bundle and computes the original price from the items', async () => {
    const bundle = await service().createBundle(input({ name: '  باقة  ' }));
    expect(bundle.originalPrice).toBe(250);
    expect(bundle.name).toBe('باقة');
    expect(bundle.active).toBe(true);
  });

  it('rejects a blank name and a bundle with no items', async () => {
    await expect(service().createBundle(input({ name: ' ' }))).rejects.toThrow(InvalidBundleError);
    await expect(service().createBundle(input({ items: [] }))).rejects.toThrow(InvalidBundleError);
  });

  it('the discounted price must be positive and below the original price', async () => {
    const svc = service();
    await expect(svc.createBundle(input({ discountedPrice: 0 }))).rejects.toThrow(InvalidBundleError);
    await expect(svc.createBundle(input({ discountedPrice: 250 }))).rejects.toThrow(InvalidBundleError);
    await expect(svc.createBundle(input({ discountedPrice: 300 }))).rejects.toThrow(InvalidBundleError);
    await expect(svc.createBundle(input({ discountedPrice: 249 }))).resolves.toBeTruthy();
  });

  it('updating the items recomputes the original price; other updates leave it alone', async () => {
    const svc = service([stored()]);
    const renamed = await svc.updateBundle('b1', { name: 'جديد' });
    expect(renamed.originalPrice).toBe(250);
    const cheaper = await svc.updateBundle('b1', { items: [{ productId: 'a', name: 'A', price: 10, quantity: 1 }] });
    expect(cheaper.originalPrice).toBe(10);
  });

  it('toggle flips active; unknown ids are rejected', async () => {
    const svc = service([stored({ active: true })]);
    expect((await svc.toggleBundleActive('b1')).active).toBe(false);
    expect((await svc.toggleBundleActive('b1')).active).toBe(true);
    await expect(svc.toggleBundleActive('nope')).rejects.toThrow(InvalidBundleError);
    await expect(svc.updateBundle('nope', {})).rejects.toThrow(InvalidBundleError);
  });

  it('delete removes the bundle', async () => {
    const svc = service([stored()]);
    await svc.deleteBundle('b1');
    expect(await svc.getAllBundles()).toEqual([]);
  });
});
