import type { StaffMember } from '@/types';
import { sampleStaff } from '@/services/mock/staff';
import { StaffNotFoundError } from './IStaffRepository';
import type { IStaffRepository } from './IStaffRepository';

/**
 * MockStaffRepository — an in-memory implementation of IStaffRepository.
 *
 * TODO(phase-3): replace with a real adapter (e.g. FirestoreStaffRepository)
 * that implements the same interface. Swap it in one place —
 * src/context/StaffServiceContext.tsx — and nothing else changes.
 */
export class MockStaffRepository implements IStaffRepository {
  private members: StaffMember[];

  constructor(seed: StaffMember[] = sampleStaff) {
    // Copy so mutations here never reach back into the shared mock fixture.
    this.members = seed.map(m => ({ ...m }));
  }

  async findAll(): Promise<StaffMember[]> {
    return [...this.members];
  }

  async findById(id: string): Promise<StaffMember | null> {
    return this.members.find(m => m.id === id) ?? null;
  }

  async insert(member: StaffMember): Promise<StaffMember> {
    this.members = [...this.members, member];
    return member;
  }

  async update(member: StaffMember): Promise<StaffMember> {
    const index = this.members.findIndex(m => m.id === member.id);
    if (index === -1) {
      throw new StaffNotFoundError(member.id);
    }
    this.members = [
      ...this.members.slice(0, index),
      member,
      ...this.members.slice(index + 1),
    ];
    return member;
  }

  async remove(id: string): Promise<void> {
    this.members = this.members.filter(m => m.id !== id);
  }
}
