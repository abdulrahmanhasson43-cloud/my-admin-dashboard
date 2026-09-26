import type { ReturnRequest } from '@/types/return';
import { sampleReturns } from '@/services/mock/returns';
import { ReturnNotFoundError } from './IReturnRepository';
import type { IReturnRepository } from './IReturnRepository';

/**
 * MockReturnRepository — an in-memory implementation of IReturnRepository.
 *
 * Low-level module: implements the abstraction rather than ReturnService
 * depending on it directly. ReturnService never imports this file.
 *
 * TODO(phase-3): replace with a real adapter (FirestoreReturnRepository /
 * RestApiReturnRepository) that implements the same interface. Swap it in
 * one place — ReturnServiceContext.tsx — and nothing else changes.
 */
export class MockReturnRepository implements IReturnRepository {
  private returns: ReturnRequest[];

  constructor(seed: ReturnRequest[] = sampleReturns) {
    this.returns = seed.map(r => ({ ...r, items: [...r.items] }));
  }

  async findAll(): Promise<ReturnRequest[]> {
    return [...this.returns];
  }

  async findById(id: string): Promise<ReturnRequest | null> {
    return this.returns.find(r => r.id === id) ?? null;
  }

  async insert(ret: ReturnRequest): Promise<ReturnRequest> {
    this.returns = [ret, ...this.returns];
    return ret;
  }

  async update(ret: ReturnRequest): Promise<ReturnRequest> {
    const index = this.returns.findIndex(r => r.id === ret.id);
    if (index === -1) {
      throw new ReturnNotFoundError(ret.id);
    }
    this.returns = [
      ...this.returns.slice(0, index),
      ret,
      ...this.returns.slice(index + 1),
    ];
    return ret;
  }

  async remove(id: string): Promise<void> {
    this.returns = this.returns.filter(r => r.id !== id);
  }
}
