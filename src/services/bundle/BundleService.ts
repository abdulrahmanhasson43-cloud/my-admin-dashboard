import type { Bundle, BundleItem } from '@/types';
import { calcOriginalPrice } from '@/types';
import { generateId } from '@/lib/utils';
import type { IBundleRepository } from './IBundleRepository';

/** Input accepted when creating a bundle from the UI. */
export interface CreateBundleInput {
  name: string;
  description: string;
  items: BundleItem[];
  discountedPrice: number;
  active?: boolean;
}

/** Thrown when a caller tries to create/update a bundle with invalid data. */
export class InvalidBundleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidBundleError';
  }
}

/**
 * BundleService — all bundle business logic lives here, and ONLY here.
 *
 * High-level module in Dependency Inversion terms: it depends solely on the
 * IBundleRepository abstraction injected through the constructor. The UI
 * reaches this service through useBundles() and never touches services/mock.
 */
export class BundleService {
  private readonly repository: IBundleRepository;

  constructor(repository: IBundleRepository) {
    this.repository = repository;
  }

  async getAllBundles(): Promise<Bundle[]> {
    return this.repository.findAll();
  }

  async getBundleById(id: string): Promise<Bundle | null> {
    return this.repository.findById(id);
  }

  async createBundle(input: CreateBundleInput): Promise<Bundle> {
    if (!input.name.trim()) {
      throw new InvalidBundleError('Bundle name is required');
    }
    if (input.items.length === 0) {
      throw new InvalidBundleError('A bundle needs at least one item');
    }

    const originalPrice = calcOriginalPrice(input.items);
    if (input.discountedPrice <= 0 || input.discountedPrice >= originalPrice) {
      throw new InvalidBundleError('Discounted price must be positive and below the original price');
    }

    const bundle: Bundle = {
      id: generateId('bundle'),
      name: input.name.trim(),
      description: input.description.trim(),
      items: input.items,
      originalPrice,
      discountedPrice: input.discountedPrice,
      active: input.active ?? true,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    return this.repository.insert(bundle);
  }

  async updateBundle(id: string, updates: Partial<Omit<Bundle, 'id'>>): Promise<Bundle> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new InvalidBundleError(`Cannot update unknown bundle: ${id}`);
    }
    const next: Bundle = { ...existing, ...updates };
    // Keep the original price in sync whenever items change.
    if (updates.items) {
      next.originalPrice = calcOriginalPrice(updates.items);
    }
    return this.repository.update(next);
  }

  async toggleBundleActive(id: string): Promise<Bundle> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new InvalidBundleError(`Cannot toggle unknown bundle: ${id}`);
    }
    return this.repository.update({ ...existing, active: !existing.active });
  }

  async deleteBundle(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
