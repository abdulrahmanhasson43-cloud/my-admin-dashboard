import { describe, expect, it } from 'vitest';
import type { Branch } from '@/types';
import { BranchService, InvalidBranchError } from './BranchService';
import { MockBranchRepository } from './MockBranchRepository';

const service = (seed: Branch[] = []) => new BranchService(new MockBranchRepository(seed));

describe('BranchService', () => {
  it('creates an active branch with zero employees and sales by default', async () => {
    const branch = await service().createBranch({ name: '  الرئيسي ', address: ' القاهرة ' });
    expect(branch).toMatchObject({ name: 'الرئيسي', address: 'القاهرة', employees: 0, sales: 0, status: 'active' });
    expect(branch.id).toMatch(/^br-/);
  });

  it('keeps the employees and sales it is given', async () => {
    expect(await service().createBranch({ name: 'ب', address: '', employees: 4, sales: 900 }))
      .toMatchObject({ employees: 4, sales: 900 });
  });

  it('rejects a blank name', async () => {
    await expect(service().createBranch({ name: ' ', address: '' })).rejects.toThrow(InvalidBranchError);
  });

  it('toggle flips active ↔ inactive; unknown ids are rejected', async () => {
    const svc = service();
    const branch = await svc.createBranch({ name: 'ب', address: '' });
    expect((await svc.toggleBranchStatus(branch.id)).status).toBe('inactive');
    expect((await svc.toggleBranchStatus(branch.id)).status).toBe('active');
    await expect(svc.toggleBranchStatus('nope')).rejects.toThrow(InvalidBranchError);
    await expect(svc.updateBranch('nope', {})).rejects.toThrow(InvalidBranchError);
  });

  it('update merges, delete removes', async () => {
    const svc = service();
    const branch = await svc.createBranch({ name: 'ب', address: 'x' });
    expect((await svc.updateBranch(branch.id, { address: 'y' })).address).toBe('y');
    await svc.deleteBranch(branch.id);
    expect(await svc.getBranchById(branch.id)).toBeNull();
  });
});
