import {
  roleMeta, permissionModuleLabels,
  type Role, type RoleMeta, type StaffMember, type PermissionModule, type PermissionAction,
} from '@/types';

/**
 * Permission rules — pure functions over a staff member's permission list.
 * BranchesPage used to hold these inline; every function returns a NEW list
 * and never mutates its input.
 */

export type PermissionList = StaffMember['permissions'];

export const ALL_PERMISSION_MODULES = Object.keys(permissionModuleLabels) as PermissionModule[];
export const ALL_PERMISSION_ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete'];

export function getRoleMeta(role: Role): RoleMeta {
  const meta = roleMeta.find(r => r.id === role);
  if (!meta) throw new Error(`Unknown role: ${role}`);
  return meta;
}

/**
 * Switches one action on or off for one module.
 * - turning an action on adds it (creating the module entry if needed);
 * - turning the LAST action off removes the module entry altogether.
 */
export function togglePermission(
  permissions: PermissionList,
  module: PermissionModule,
  action: PermissionAction,
): PermissionList {
  const existing = permissions.find(p => p.module === module);
  if (!existing) return [...permissions, { module, actions: [action] }];

  if (!existing.actions.includes(action)) {
    return permissions.map(p => (p.module === module ? { ...p, actions: [...p.actions, action] } : p));
  }

  const remaining = existing.actions.filter(a => a !== action);
  if (remaining.length === 0) return permissions.filter(p => p.module !== module);
  return permissions.map(p => (p.module === module ? { ...p, actions: remaining } : p));
}

export function hasPermission(
  permissions: PermissionList,
  module: PermissionModule,
  action: PermissionAction,
): boolean {
  return permissions.find(p => p.module === module)?.actions.includes(action) ?? false;
}

/** How many staff members hold each role. */
export function countStaffByRole(staff: ReadonlyArray<Pick<StaffMember, 'role'>>): Record<Role, number> {
  return {
    owner: staff.filter(s => s.role === 'owner').length,
    manager: staff.filter(s => s.role === 'manager').length,
    employee: staff.filter(s => s.role === 'employee').length,
  };
}
