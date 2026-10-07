import { useState } from 'react';
import { toast } from 'sonner';
import { useBranch } from '@/context/branch-context-value';
import type { Branch } from '@/types';

/**
 * useBranchForm — the add/edit branch form: whether it is open, which branch is
 * being edited, the two fields, and saving. A blank name is ignored.
 */
export function useBranchForm() {
  const { addBranch, updateBranch } = useBranch();
  const [open, setOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');

  const openForm = (branch?: Branch) => {
    setEditingBranch(branch ?? null);
    setBranchName(branch?.name ?? '');
    setBranchAddress(branch?.address ?? '');
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditingBranch(null);
  };

  const save = () => {
    const name = branchName.trim();
    if (!name) return;
    const address = branchAddress.trim();
    if (editingBranch) {
      void updateBranch(editingBranch.id, { name, address });
      toast.success(`تم تحديث فرع ${name}`);
    } else {
      void addBranch({ name, address, employees: 0, sales: 0, status: 'active' });
      toast.success(`تمت إضافة فرع ${name}`);
    }
    close();
  };

  return { open, editingBranch, branchName, setBranchName, branchAddress, setBranchAddress, openForm, close, save };
}

export type BranchFormState = ReturnType<typeof useBranchForm>;
