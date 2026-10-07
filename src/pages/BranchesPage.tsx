import { useState } from 'react';
import { toast } from 'sonner';
import {
  BranchesIcon, PlusIcon, UsersIcon, ReceiptIcon, ShieldIcon,
} from '@/components/icons';
import StatsRow from '@/components/StatsRow';
import SearchBar from '@/components/SearchBar';
import ActiveBranchBanner from '@/components/branches/ActiveBranchBanner';
import BranchFormPanel from '@/components/branches/BranchFormPanel';
import BranchCard from '@/components/branches/BranchCard';
import RoleLegend from '@/components/branches/RoleLegend';
import StaffRow from '@/components/branches/StaffRow';
import StaffFormModal from '@/components/branches/StaffFormModal';
import { useStaff } from '@/hooks/useStaff';
import { useBranchForm } from '@/hooks/useBranchForm';
import { useStaffForm } from '@/hooks/useStaffForm';
import { countStaffByRole } from '@/lib/permissions';
import { useBranch } from '@/context/branch-context-value';
import type { Branch } from '@/types';

type Tab = 'branches' | 'staff';

export default function BranchesPage() {
  const [tab, setTab] = useState<Tab>('branches');
  const [search, setSearch] = useState('');
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null);
  const { staff, createStaff, updateStaff, deleteStaff: removeStaff } = useStaff();

  /* ---- Branch context (single source of truth for branches) ---- */
  const {
    branches, activeBranchId, setActiveBranchId, activeBranch, deleteBranch,
  } = useBranch();

  const branchForm = useBranchForm();
  const staffForm = useStaffForm({ branches, createStaff, updateStaff });

  const removeBranch = (branch: Branch) => {
    void deleteBranch(branch.id);
    toast.success(`تم حذف فرع ${branch.name}`);
  };

  const activateBranch = (branch: Branch) => {
    setActiveBranchId(branch.id);
    toast.success(`تم التبديل إلى فرع ${branch.name}`);
  };

  const deleteStaff = (id: string) => {
    void removeStaff(id);
    setExpandedStaff(null);
  };

  /* ---- Branches tab ---- */
  const filtered = branches.filter(b => b.name.includes(search));
  const totalSales = branches.reduce((s, b) => s + b.sales, 0);

  /* ---- Staff tab ---- */
  const filteredStaff = staff.filter(s =>
    s.name.includes(search) || s.branchName.includes(search)
  );
  const roleCounts = countStaffByRole(staff);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats — different per tab */}
      {tab === 'branches' ? (
        <StatsRow
          maxCols={3}
          items={[
            { label: 'إجمالي الفروع', value: branches.length.toString(), icon: BranchesIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
            { label: 'الموظفين', value: branches.reduce((s, b) => s + b.employees, 0).toString(), icon: UsersIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-success)]' },
            { label: 'إجمالي المبيعات', value: `${(totalSales / 1000).toFixed(0)}K EGP`, icon: ReceiptIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
          ]}
        />
      ) : (
        <StatsRow
          maxCols={4}
          items={[
            { label: 'إجمالي الموظفين', value: staff.length.toString(), icon: UsersIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
            { label: 'الملاك', value: roleCounts.owner.toString(), icon: ShieldIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
            { label: 'المديرين', value: roleCounts.manager.toString(), icon: UsersIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-success)]' },
            { label: 'الموظفين', value: roleCounts.employee.toString(), icon: UsersIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-text-secondary)]' },
          ]}
        />
      )}

      {/* Tab switcher — Apple segmented control */}
      <div className="flex gap-1 p-1 rounded-2xl bg-[var(--vuno-bg)] border border-[var(--vuno-border-light)] max-w-md">
        <button
          onClick={() => { setTab('branches'); setSearch(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            tab === 'branches'
              ? 'bg-white text-[var(--vuno-text)] shadow-sm'
              : 'text-[var(--vuno-text-muted)] hover:text-[var(--vuno-text)]'
          }`}
        >
          <BranchesIcon size={16} /> الفروع
        </button>
        <button
          onClick={() => { setTab('staff'); setSearch(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            tab === 'staff'
              ? 'bg-white text-[var(--vuno-text)] shadow-sm'
              : 'text-[var(--vuno-text-muted)] hover:text-[var(--vuno-text)]'
          }`}
        >
          <ShieldIcon size={16} /> الموظفين والصلاحيات
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={tab === 'branches' ? 'ابحث باسم الفرع...' : 'ابحث باسم الموظف أو الفرع...'}
        actions={
          tab === 'branches' ? (
            <button
              onClick={() => branchForm.openForm()}
              className="px-5 py-2.5 rounded-xl text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0"
              style={{ background: 'var(--vuno-primary)' }}
            >
              <PlusIcon size={16} /> فرع جديد
            </button>
          ) : (
            <button
              onClick={() => staffForm.openForm()}
              className="px-5 py-2.5 rounded-xl text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0"
              style={{ background: 'var(--vuno-primary)' }}
            >
              <PlusIcon size={16} /> موظف جديد
            </button>
          )
        }
        qrValue={tab === 'branches' ? `vuno:branches:${branches.length}` : `vuno:staff:${staff.length}`}
        qrLabel={tab === 'branches' ? 'رمز QR لصفحة الفروع' : 'رمز QR لصفحة الموظفين'}
      />

      {/* ---- Branches Tab ---- */}
      {tab === 'branches' && (
        <>
          {activeBranch && <ActiveBranchBanner branch={activeBranch} />}
          {branchForm.open && <BranchFormPanel form={branchForm} />}

          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((branch, i) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                index={i}
                isActive={activeBranchId === branch.id}
                onEdit={() => branchForm.openForm(branch)}
                onDelete={() => removeBranch(branch)}
                onActivate={() => activateBranch(branch)}
              />
            ))}
          </div>
        </>
      )}

      {/* ---- Staff & Permissions Tab ---- */}
      {tab === 'staff' && (
        <>
          <RoleLegend />
          <div className="space-y-3">
            {filteredStaff.map((member, i) => (
              <StaffRow
                key={member.id}
                member={member}
                index={i}
                expanded={expandedStaff === member.id}
                onToggle={() => setExpandedStaff(expandedStaff === member.id ? null : member.id)}
                onEdit={() => staffForm.openForm(member)}
                onDelete={() => deleteStaff(member.id)}
              />
            ))}
          </div>
        </>
      )}

      <StaffFormModal form={staffForm} branches={branches} />
    </div>
  );
}
