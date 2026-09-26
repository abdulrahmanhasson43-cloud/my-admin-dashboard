import type { Supplier } from '@/types';
import { generateId } from '@/lib/utils';
import type { ISupplierRepository } from './ISupplierRepository';

/** Input accepted when creating a supplier from the UI. */
export interface CreateSupplierInput {
  name: string;
  phone: string;
  email: string;
}

/** Thrown when a caller tries to create/update a supplier with invalid data. */
export class InvalidSupplierError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSupplierError';
  }
}

/**
 * SupplierService — all supplier business logic lives here, and ONLY here.
 * Depends solely on the ISupplierRepository abstraction injected through the
 * constructor. The UI reaches it through useSuppliers().
 */
export class SupplierService {
  private readonly repository: ISupplierRepository;

  constructor(repository: ISupplierRepository) {
    this.repository = repository;
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return this.repository.findAll();
  }

  async getSupplierById(id: string): Promise<Supplier | null> {
    return this.repository.findById(id);
  }

  async createSupplier(input: CreateSupplierInput): Promise<Supplier> {
    this.assertValid(input);

    const supplier: Supplier = {
      id: generateId('SUP'),
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      products: 0,
      totalOrders: 0,
      status: 'active',
    };

    return this.repository.insert(supplier);
  }

  async updateSupplier(id: string, updates: Partial<Omit<Supplier, 'id'>>): Promise<Supplier> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new InvalidSupplierError(`Cannot update unknown supplier: ${id}`);
    }
    const next: Supplier = { ...existing, ...updates };
    this.assertValid(next);
    return this.repository.update(next);
  }

  async deleteSupplier(id: string): Promise<void> {
    return this.repository.remove(id);
  }

  private assertValid(input: CreateSupplierInput): void {
    if (!input.name.trim()) {
      throw new InvalidSupplierError('Supplier name is required');
    }
  }
}
