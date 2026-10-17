import { describe, expect, it } from 'vitest';
import type { StaffMember } from '@/types';
import { defaultPermissions } from '@/types';
import { InvalidStaffError, StaffService, type CreateStaffInput } from './StaffService';
import { MockStaffRepository } from './MockStaffRepository';

const input = (overrides: Partial<CreateStaffInput> = {}): CreateStaffInput =>
  ({ name: 'منى', phone: '0100', role: 'employee', branchId: 'b1', branchName: 'الرئيسي', ...overrides });

const service = (seed: StaffMember[] = []) => new StaffService(new MockStaffRepository(seed));

describe('StaffService', () => {
  it('creates an active member with the role default permissions', async () => {
    const created = await service().createStaff(input({ name: '  منى ' }));
    expect(created.name).toBe('منى');
    expect(created.status).toBe('active');
    expect(defaultPermissions.employee.length).toBeGreaterThan(0);
    expect(created.permissions).toEqual(defaultPermissions.employee);
    expect(created.permissions).not.toEqual(defaultPermissions.manager);
    expect(created.id).toMatch(/^STF-/);
  });

  it('explicit permissions win over the role defaults', async () => {
    const custom = [...defaultPermissions.manager];
    const created = await service().createStaff(input({ permissions: custom, role: 'employee' }));
    expect(created.permissions).toBe(custom);
  });

  it('rejects a blank name', async () => {
    await expect(service().createStaff(input({ name: ' ' }))).rejects.toThrow(InvalidStaffError);
  });

  it('update merges, delete removes, unknown ids are rejected', async () => {
    const svc = service();
    const created = await svc.createStaff(input());
    expect((await svc.updateStaff(created.id, { phone: '0111' })).phone).toBe('0111');
    await svc.deleteStaff(created.id);
    expect(await svc.getStaffById(created.id)).toBeNull();
    await expect(svc.updateStaff('nope', {})).rejects.toThrow(InvalidStaffError);
  });
});
