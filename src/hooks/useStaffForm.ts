import { useState } from 'react';
import { defaultPermissions, type Branch, type Role, type StaffMember, type PermissionAction, type PermissionModule } from '@/types';
import type { CreateStaffInput } from '@/services/staff';
import { hasPermission as hasPermissionIn, togglePermission as togglePermissionIn } from '@/lib/permissions';

interface UseStaffFormArgs {
  branches: Branch[];
  createStaff: (input: CreateStaffInput) => Promise<unknown>;
  updateStaff: (id: string, updates: Partial<Omit<StaffMember, 'id'>>) => Promise<unknown>;
}

/**
 * useStaffForm — the add/edit staff form: open/closed, who is being edited, the
 * fields, the role (changing it resets the permissions to that role's
 * defaults), the permission matrix, and saving. A blank name is ignored.
 */
export function useStaffForm({ branches, createStaff, updateStaff }: UseStaffFormArgs) {
  const [open, setOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<Role>('employee');
  const [formBranch, setFormBranch] = useState(branches[0]?.id ?? '');
  const [formPermissions, setFormPermissions] = useState<StaffMember['permissions']>(defaultPermissions.employee);

  const openForm = (member?: StaffMember) => {
    setEditingStaff(member ?? null);
    setFormName(member?.name ?? '');
    setFormPhone(member?.phone ?? '');
    setFormRole(member?.role ?? 'employee');
    setFormBranch(member?.branchId ?? branches[0]?.id ?? '');
    setFormPermissions(member?.permissions ?? defaultPermissions.employee);
    setOpen(true);
  };

  const close = () => setOpen(false);

  const handleRoleChange = (role: Role) => {
    setFormRole(role);
    setFormPermissions(defaultPermissions[role]);
  };

  const togglePermission = (module: PermissionModule, action: PermissionAction) =>
    setFormPermissions(prev => togglePermissionIn(prev, module, action));

  const hasPermission = (module: PermissionModule, action: PermissionAction) =>
    hasPermissionIn(formPermissions, module, action);

  const save = () => {
    if (!formName.trim()) return;
    const branch = branches.find(b => b.id === formBranch);
    if (editingStaff) {
      void updateStaff(editingStaff.id, {
        name: formName,
        phone: formPhone,
        role: formRole,
        branchId: formBranch,
        branchName: branch?.name ?? editingStaff.branchName,
        permissions: formPermissions,
      });
    } else {
      void createStaff({
        name: formName,
        phone: formPhone,
        role: formRole,
        branchId: formBranch,
        branchName: branch?.name ?? '',
        permissions: formPermissions,
      });
    }
    setOpen(false);
  };

  return {
    open, editingStaff,
    formName, setFormName, formPhone, setFormPhone, formRole, formBranch, setFormBranch, formPermissions,
    openForm, close, handleRoleChange, togglePermission, hasPermission, save,
  };
}

export type StaffFormState = ReturnType<typeof useStaffForm>;
