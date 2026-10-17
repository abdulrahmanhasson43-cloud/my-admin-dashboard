import type { Role, StaffMember } from '@/types';
import { defaultPermissions } from '@/types';
import { generateId } from '@/lib/utils';
import type { IStaffRepository } from './IStaffRepository';

/** Input accepted when adding a staff member from the UI. */
export interface CreateStaffInput {
  name: string;
  phone: string;
  role: Role;
  branchId: string;
  branchName: string;
  /** Optional explicit permissions; falls back to the role defaults. */
  permissions?: StaffMember['permissions'];
}

/** Thrown when a caller tries to create/update a staff member with invalid data. */
export class InvalidStaffError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStaffError';
  }
}

/**
 * StaffService — all staff business logic lives here, and ONLY here.
 *
 * High-level module in Dependency Inversion terms: it depends solely on the
 * IStaffRepository abstraction injected through the constructor. The UI
 * reaches this service through useStaff() and never touches services/mock.
 */
export class StaffService {
  private readonly repository: IStaffRepository;

  constructor(repository: IStaffRepository) {
    this.repository = repository;
  }

  async getAllStaff(): Promise<StaffMember[]> {
    return this.repository.findAll();
  }

  async getStaffById(id: string): Promise<StaffMember | null> {
    return this.repository.findById(id);
  }

  async createStaff(input: CreateStaffInput): Promise<StaffMember> {
    if (!input.name.trim()) {
      throw new InvalidStaffError('Staff name is required');
    }

    const member: StaffMember = {
      id: generateId('STF'),
      name: input.name.trim(),
      phone: input.phone.trim(),
      role: input.role,
      branchId: input.branchId,
      branchName: input.branchName,
      status: 'active',
      lastActive: 'الآن',
      permissions: input.permissions ?? defaultPermissions[input.role],
    };

    return this.repository.insert(member);
  }

  async updateStaff(id: string, updates: Partial<Omit<StaffMember, 'id'>>): Promise<StaffMember> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new InvalidStaffError(`Cannot update unknown staff member: ${id}`);
    }
    return this.repository.update({ ...existing, ...updates });
  }

  async deleteStaff(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
