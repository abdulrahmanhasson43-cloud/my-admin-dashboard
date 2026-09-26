import type { Branch } from '@/types';
import { sampleBranches } from '@/services/mock/branches';
import { BranchNotFoundError } from './IBranchRepository';
import type { IBranchRepository } from './IBranchRepository';

/**
 * MockBranchRepository — an in-memory implementation of IBranchRepository.
 * BranchService never imports this file.
 *
 * TODO(phase-3): replace with a real adapter implementing the same interface.
 * Swap it in one place — src/context/BranchServiceContext.tsx.
 */
export class MockBranchRepository implements IBranchRepository {
  private branches: Branch[];

  constructor(seed: Branch[] = sampleBranches) {
    this.branches = seed.map(b => ({ ...b }));
  }

  async findAll(): Promise<Branch[]> {
    return [...this.branches];
  }

  async findById(id: string): Promise<Branch | null> {
    return this.branches.find(b => b.id === id) ?? null;
  }

  async insert(branch: Branch): Promise<Branch> {
    this.branches = [...this.branches, branch];
    return branch;
  }

  async update(branch: Branch): Promise<Branch> {
    const index = this.branches.findIndex(b => b.id === branch.id);
    if (index === -1) {
      throw new BranchNotFoundError(branch.id);
    }
    this.branches = [
      ...this.branches.slice(0, index),
      branch,
      ...this.branches.slice(index + 1),
    ];
    return branch;
  }

  async remove(id: string): Promise<void> {
    this.branches = this.branches.filter(b => b.id !== id);
  }
}
