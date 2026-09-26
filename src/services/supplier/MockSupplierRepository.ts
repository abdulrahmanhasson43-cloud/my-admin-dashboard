import type { Supplier } from '@/types';
import { sampleSuppliers } from '@/services/mock/suppliers';
import { SupplierNotFoundError } from './ISupplierRepository';
import type { ISupplierRepository } from './ISupplierRepository';

/**
 * MockSupplierRepository — an in-memory implementation of ISupplierRepository.
 * SupplierService never imports this file.
 *
 * TODO(phase-3): replace with a real adapter implementing the same interface.
 * Swap it in one place — src/context/SupplierServiceContext.tsx.
 */
export class MockSupplierRepository implements ISupplierRepository {
  private suppliers: Supplier[];

  constructor(seed: Supplier[] = sampleSuppliers) {
    this.suppliers = seed.map(s => ({ ...s }));
  }

  async findAll(): Promise<Supplier[]> {
    return [...this.suppliers];
  }

  async findById(id: string): Promise<Supplier | null> {
    return this.suppliers.find(s => s.id === id) ?? null;
  }

  async insert(supplier: Supplier): Promise<Supplier> {
    this.suppliers = [...this.suppliers, supplier];
    return supplier;
  }

  async update(supplier: Supplier): Promise<Supplier> {
    const index = this.suppliers.findIndex(s => s.id === supplier.id);
    if (index === -1) {
      throw new SupplierNotFoundError(supplier.id);
    }
    this.suppliers = [
      ...this.suppliers.slice(0, index),
      supplier,
      ...this.suppliers.slice(index + 1),
    ];
    return supplier;
  }

  async remove(id: string): Promise<void> {
    this.suppliers = this.suppliers.filter(s => s.id !== id);
  }
}
