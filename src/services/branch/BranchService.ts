import type { Branch } from '@/types';
import { generateId } from '@/lib/utils';
import type { IBranchRepository } from './IBranchRepository';

/** Input accepted when creating a branch from the UI. */
export interface CreateBranchInput {
  name: string;
  address: string;
  employees?: number;
  sales?: number;
}

/** Thrown when a caller tries to create/update a branch with invalid data. */
export class InvalidBranchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidBranchError';
  }
}

/**
 * BranchService — all branch business logic lives here, and ONLY here.
 * Depends solely on the IBranchRepository abstraction injected through the
 * constructor. The UI reaches it through useBranches() / BranchContext.
 */
export class BranchService {
  private readonly repository: IBranchRepository;

  constructor(repository: IBranchRepository) {
    this.repository = repository;
  }

  async getAllBranches(): Promise<Branch[]> {
    return this.repository.findAll();
  }

  async getBranchById(id: string): Promise<Branch | null> {
    return this.repository.findById(id);
  }

  async createBranch(input: CreateBranchInput): Promise<Branch> {
    if (!input.name.trim()) {
      throw new InvalidBranchError('Branch name is required');
    }

    const branch: Branch = {
      id: generateId('br'),
      name: input.name.trim(),
      address: input.address.trim(),
      employees: input.employees ?? 0,
      sales: input.sales ?? 0,
      status: 'active',
    };

    return this.repository.insert(branch);
  }

  async updateBranch(id: string, updates: Partial<Omit<Branch, 'id'>>): Promise<Branch> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new InvalidBranchError(`Cannot update unknown branch: ${id}`);
    }
    return this.repository.update({ ...existing, ...updates });
  }

  /** Flips a branch between active and inactive. */
  async toggleBranchStatus(id: string): Promise<Branch> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new InvalidBranchError(`Cannot toggle unknown branch: ${id}`);
    }
    return this.repository.update({
      ...existing,
      status: existing.status === 'active' ? 'inactive' : 'active',
    });
  }

  async deleteBranch(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
