import { describe, expect, it } from 'vitest';
import { defaultPermissions } from '@/types';
import {
  ALL_PERMISSION_ACTIONS, ALL_PERMISSION_MODULES, countStaffByRole, getRoleMeta, hasPermission, togglePermission,
  type PermissionList,
} from './permissions';

describe('togglePermission', () => {
  it('adds a module entry when the module had none', () => {
    expect(togglePermission([], 'pos', 'view')).toEqual([{ module: 'pos', actions: ['view'] }]);
  });

  it('adds an action to an existing module', () => {
    const next = togglePermission([{ module: 'pos', actions: ['view'] }], 'pos', 'create');
    expect(next).toEqual([{ module: 'pos', actions: ['view', 'create'] }]);
  });

  it('removes just that action when others remain', () => {
    const next = togglePermission([{ module: 'pos', actions: ['view', 'create'] }], 'pos', 'view');
    expect(next).toEqual([{ module: 'pos', actions: ['create'] }]);
  });

  it('removes the whole module entry when its last action is switched off', () => {
    const next = togglePermission([{ module: 'pos', actions: ['view'] }, { module: 'reports', actions: ['view'] }], 'pos', 'view');
    expect(next).toEqual([{ module: 'reports', actions: ['view'] }]);
  });

  it('only touches the requested module', () => {
    const start: PermissionList = [{ module: 'pos', actions: ['view'] }, { module: 'reports', actions: ['view'] }];
    const next = togglePermission(start, 'reports', 'edit');
    expect(next[0]).toEqual({ module: 'pos', actions: ['view'] });
    expect(next[1]).toEqual({ module: 'reports', actions: ['view', 'edit'] });
  });

  it('never mutates the list it was given', () => {
    const start: PermissionList = [{ module: 'pos', actions: ['view'] }];
    const snapshot = JSON.stringify(start);
    togglePermission(start, 'pos', 'create');
    togglePermission(start, 'pos', 'view');
    togglePermission(start, 'reports', 'view');
    expect(JSON.stringify(start)).toBe(snapshot);
  });

  it('toggling twice returns to the starting permissions', () => {
    const start = defaultPermissions.employee;
    const twice = togglePermission(togglePermission(start, 'settings', 'delete'), 'settings', 'delete');
    expect([...twice].sort((a, b) => a.module.localeCompare(b.module)))
      .toEqual([...start].sort((a, b) => a.module.localeCompare(b.module)));
  });
});

describe('hasPermission', () => {
  const list: PermissionList = [{ module: 'pos', actions: ['view', 'create'] }];

  it('is true only for an action the module grants', () => {
    expect(hasPermission(list, 'pos', 'view')).toBe(true);
    expect(hasPermission(list, 'pos', 'delete')).toBe(false);
    expect(hasPermission(list, 'reports', 'view')).toBe(false);
  });
});

describe('roles and counts', () => {
  it('getRoleMeta finds every role, and throws for an unknown one', () => {
    for (const role of ['owner', 'manager', 'employee'] as const) expect(getRoleMeta(role).id).toBe(role);
    expect(() => getRoleMeta('ghost' as never)).toThrow(/Unknown role/);
  });

  it('countStaffByRole counts each role', () => {
    expect(countStaffByRole([{ role: 'owner' }, { role: 'employee' }, { role: 'employee' }])).toEqual({ owner: 1, manager: 0, employee: 2 });
    expect(countStaffByRole([])).toEqual({ owner: 0, manager: 0, employee: 0 });
  });

  it('lists every module and the four actions', () => {
    expect(ALL_PERMISSION_MODULES.length).toBeGreaterThan(5);
    expect(ALL_PERMISSION_ACTIONS).toEqual(['view', 'create', 'edit', 'delete']);
  });
});
