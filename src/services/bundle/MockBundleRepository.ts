import type { Bundle } from '@/types';
import { sampleBundles } from '@/services/mock/bundles';
import { BundleNotFoundError } from './IBundleRepository';
import type { IBundleRepository } from './IBundleRepository';

/**
 * MockBundleRepository — an in-memory implementation of IBundleRepository.
 *
 * TODO(phase-3): replace with a real adapter (e.g. FirestoreBundleRepository)
 * that implements the same interface. Swap it in one place —
 * src/context/BundleServiceContext.tsx — and nothing else changes.
 */
export class MockBundleRepository implements IBundleRepository {
  private bundles: Bundle[];

  constructor(seed: Bundle[] = sampleBundles) {
    // Deep-copy items so mutations here never reach the shared mock fixtures.
    this.bundles = seed.map(b => ({ ...b, items: b.items.map(i => ({ ...i })) }));
  }

  async findAll(): Promise<Bundle[]> {
    return this.bundles.map(b => ({ ...b, items: b.items.map(i => ({ ...i })) }));
  }

  async findById(id: string): Promise<Bundle | null> {
    const bundle = this.bundles.find(b => b.id === id);
    return bundle ? { ...bundle, items: bundle.items.map(i => ({ ...i })) } : null;
  }

  async insert(bundle: Bundle): Promise<Bundle> {
    this.bundles = [...this.bundles, bundle];
    return bundle;
  }

  async update(bundle: Bundle): Promise<Bundle> {
    const index = this.bundles.findIndex(b => b.id === bundle.id);
    if (index === -1) {
      throw new BundleNotFoundError(bundle.id);
    }
    this.bundles = [
      ...this.bundles.slice(0, index),
      bundle,
      ...this.bundles.slice(index + 1),
    ];
    return bundle;
  }

  async remove(id: string): Promise<void> {
    this.bundles = this.bundles.filter(b => b.id !== id);
  }
}
