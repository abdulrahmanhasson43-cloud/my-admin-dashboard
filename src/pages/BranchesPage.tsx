import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BranchesIcon, PlusIcon, UsersIcon, ReceiptIcon, EditIcon, TrashIcon,
  MapPinIcon, ShieldIcon, LockIcon, PhoneIcon, CheckIcon, XIcon,
} from '@/components/icons';
import StatsRow from '@/components/StatsRow';
import SearchBar from '@/components/SearchBar';
import QRCodeButton from '@/components/QRCodeButton';
import { sampleBranches, sampleStaff } from '@/services/mock';
import {
  roleMeta, permissionModuleLabels, permissionActionLabels,
  defaultPermissions, type Role, type StaffMember, type PermissionModule, type PermissionAction,
} from '@/types';

type Tab = 'branches' | 'staff';

export default function BranchesPage() {
  const [tab, setTab] = useState<Tab>('branches');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>(sampleStaff);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null);

  /* ---- Branches tab ---- */
  const filtered = sampleBranches.filter(b => b.name.includes(search));
  const totalSales = sampleBranches.reduce((s, b) => s + b.sales, 0);

  /* ---- Staff tab ---- */
  const filteredStaff = staff.filter(s =>
    s.name.includes(search) || s.branchName.includes(search)
  );

  const roleCounts = useMemo(() => ({
    owner: staff.filter(s => s.role === 'owner').length,
    manager: staff.filter(s => s.role === 'manager').length,
    employee: staff.filter(s => s.role === 'employee').length,
  }), [staff]);

  const getRoleMeta = (role: Role) => roleMeta.find(r => r.id === role)!;

  /* ---- Staff form state ---- */
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<Role>('employee');
  const [formBranch, setFormBranch] = useState(sampleBranches[0]?.id ?? '');
  const [formPermissions, setFormPermissions] = useState<StaffMember['permissions']>(defaultPermissions.employee);

  const openStaffForm = (member?: StaffMember) => {
    if (member) {
      setEditingStaff(member);
      setFormName(member.name);
      setFormPhone(member.phone);
      setFormRole(member.role);
      setFormBranch(member.branchId);
      setFormPermissions(member.permissions);
    } else {
      setEditingStaff(null);
      setFormName('');
      setFormPhone('');
      setFormRole('employee');
      setFormBranch(sampleBranches[0]?.id ?? '');
      setFormPermissions(defaultPermissions.employee);
    }
    setShowStaffForm(true);
  };

  const handleRoleChange = (role: Role) => {
    setFormRole(role);
    setFormPermissions(defaultPermissions[role]);
  };

  const togglePermission = (module: PermissionModule, action: PermissionAction) => {
    setFormPermissions(prev => {
      const existing = prev.find(p => p.module === module);
      if (existing) {
        const hasAction = existing.actions.includes(action);
        if (hasAction) {
          const newActions = existing.actions.filter(a => a !== action);
          if (newActions.length === 0) {
            return prev.filter(p => p.module !== module);
          }
          return prev.map(p => p.module === module ? { ...p, actions: newActions } : p);
        } else {
          return prev.map(p => p.module === module ? { ...p, actions: [...p.actions, action] } : p);
        }
      } else {
        return [...prev, { module, actions: [action] }];
      }
    });
  };

  const hasPermission = (module: PermissionModule, action: PermissionAction) => {
    const p = formPermissions.find(per => per.module === module);
    return p ? p.actions.includes(action) : false;
  };

  const saveStaff = () => {
    if (!formName.trim()) return;
    const branch = sampleBranches.find(b => b.id === formBranch);
    if (editingStaff) {
      setStaff(prev => prev.map(s => s.id === editingStaff.id ? {
        ...s, name: formName, phone: formPhone, role: formRole,
        branchId: formBranch, branchName: branch?.name ?? s.branchName,
        permissions: formPermissions,
      } : s));
    } else {
      setStaff(prev => [...prev, {
        id: `s${Date.now()}`,
        name: formName,
        phone: formPhone,
        role: formRole,
        branchId: formBranch,
        branchName: branch?.name ?? '',
        status: 'active',
        lastActive: 'الآن',
        permissions: formPermissions,
      }]);
    }
    setShowStaffForm(false);
  };

  const deleteStaff = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    setExpandedStaff(null);
  };

  const allModules = Object.keys(permissionModuleLabels) as PermissionModule[];
  const allActions: PermissionAction[] = ['view', 'create', 'edit', 'delete'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats — different per tab */}
      {tab === 'branches' ? (
        <StatsRow
          maxCols={3}
          items={[
            { label: 'إجمالي الفروع', value: sampleBranches.length.toString(), icon: BranchesIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
            { label: 'الموظفين', value: sampleBranches.reduce((s, b) => s + b.employees, 0).toString(), icon: UsersIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-success)]' },
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
              onClick={() => setShowForm(!showForm)}
              className="px-5 py-2.5 rounded-xl text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0"
              style={{ background: 'var(--vuno-primary)' }}
            >
              <PlusIcon size={16} /> فرع جديد
            </button>
          ) : (
            <button
              onClick={() => openStaffForm()}
              className="px-5 py-2.5 rounded-xl text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0"
              style={{ background: 'var(--vuno-primary)' }}
            >
              <PlusIcon size={16} /> موظف جديد
            </button>
          )
        }
        qrValue={tab === 'branches' ? `vuno:branches:${sampleBranches.length}` : `vuno:staff:${staff.length}`}
        qrLabel={tab === 'branches' ? 'رمز QR لصفحة الفروع' : 'رمز QR لصفحة الموظفين'}
      />

      {/* ---- Branches Tab ---- */}
      {tab === 'branches' && (
        <>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card-vuno p-5 overflow-hidden">
              <h3 className="font-bold text-[var(--vuno-text)] mb-4">إضافة فرع جديد</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input placeholder="اسم الفرع" className="px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm" />
                <input placeholder="العنوان" className="px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm" />
              </div>
              <div className="flex gap-3 mt-4 justify-end">
                <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)] transition-colors">إلغاء</button>
                <button className="px-5 py-2.5 rounded-xl text-white font-medium hover:opacity-90 transition-opacity" style={{ background: 'var(--vuno-primary)' }}>حفظ</button>
              </div>
            </motion.div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((branch, i) => (
              <motion.div key={branch.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.1, 0.3) }} className="card-vuno p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ background: 'var(--vuno-primary)' }}>
                      <BranchesIcon size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--vuno-text)]">{branch.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-[var(--vuno-text-muted)] mt-1">
                        <MapPinIcon size={12} />
                        {branch.address}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${branch.status === 'active' ? 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-success)]' : 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-text-muted)]'}`}>
                    {branch.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--vuno-border-light)]">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[var(--vuno-text)]">{branch.employees}</p>
                    <p className="text-xs text-[var(--vuno-text-muted)]">موظف</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[var(--vuno-primary)]">{(branch.sales / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-[var(--vuno-text-muted)]">مبيعات</p>
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <QRCodeButton value={`vuno:branch:${branch.id}`} label={`رمز QR للفرع ${branch.name}`} iconSize={15} />
                    <button className="p-2 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-primary)] transition-colors"><EditIcon size={16} /></button>
                    <button className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><TrashIcon size={16} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* ---- Staff & Permissions Tab ---- */}
      {tab === 'staff' && (
        <>
          {/* Role legend */}
          <div className="card-vuno p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <LockIcon size={16} className="text-[var(--vuno-primary)]" />
              <span className="text-sm font-semibold text-[var(--vuno-text)]">الأدوار والصلاحيات</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {roleMeta.map(role => (
                <div key={role.id} className="rounded-xl p-3 border border-[var(--vuno-border-light)]" style={{ background: `color-mix(in srgb, ${role.color} 6%, transparent)` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: role.color }} />
                    <span className="text-sm font-semibold text-[var(--vuno-text)]">{role.label}</span>
                  </div>
                  <p className="text-[11px] text-[var(--vuno-text-muted)] leading-relaxed">{role.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Staff list */}
          <div className="space-y-3">
            {filteredStaff.map((member, i) => {
              const meta = getRoleMeta(member.role);
              const isExpanded = expandedStaff === member.id;
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.2) }}
                  className="card-vuno overflow-hidden"
                >
                  {/* Staff row */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                        style={{ background: `color-mix(in srgb, ${meta.color} 12%, transparent)`, color: meta.color }}
                      >
                        {member.name.charAt(0)}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-[var(--vuno-text)] truncate">{member.name}</p>
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold flex-shrink-0"
                            style={{ background: `color-mix(in srgb, ${meta.color} 12%, transparent)`, color: meta.color }}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--vuno-text-muted)]">
                          <span className="truncate">{member.branchName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <PhoneIcon size={11} /> {member.phone}
                          </span>
                        </div>
                      </div>

                      {/* Status + actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`hidden sm:inline-block w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-[var(--vuno-success)]' : 'bg-[var(--vuno-text-muted)]'}`} />
                        <span className="hidden sm:inline text-[11px] text-[var(--vuno-text-muted)]">{member.lastActive}</span>
                        <button
                          onClick={() => setExpandedStaff(isExpanded ? null : member.id)}
                          className="p-2 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-text-secondary)] transition-colors text-xs font-medium"
                        >
                          {isExpanded ? 'إخفاء' : 'الصلاحيات'}
                        </button>
                        <button onClick={() => openStaffForm(member)} className="p-2 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-primary)] transition-colors">
                          <EditIcon size={15} />
                        </button>
                        <button onClick={() => deleteStaff(member.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                          <TrashIcon size={15} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded permissions view */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-[var(--vuno-border-light)]"
                      >
                        <div className="p-4 sm:p-5 bg-[var(--vuno-bg)]">
                          <div className="text-xs font-semibold text-[var(--vuno-text-secondary)] mb-3">صلاحيات {member.name} ({meta.label})</div>
                          <div className="space-y-2">
                            {allModules.map(mod => {
                              const perm = member.permissions.find(p => p.module === mod);
                              const hasAny = perm && perm.actions.length > 0;
                              return (
                                <div key={mod} className="flex items-center justify-between gap-3 py-1.5">
                                  <span className={`text-sm ${hasAny ? 'text-[var(--vuno-text)]' : 'text-[var(--vuno-text-muted)]'}`}>
                                    {permissionModuleLabels[mod]}
                                  </span>
                                  <div className="flex gap-1.5">
                                    {allActions.map(action => {
                                      const has = perm?.actions.includes(action) ?? false;
                                      return (
                                        <span
                                          key={action}
                                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                            has
                                              ? 'text-white'
                                              : 'text-[var(--vuno-text-muted)] bg-[var(--vuno-surface-pearl)]'
                                          }`}
                                          style={has ? { background: meta.color } : {}}
                                        >
                                          {permissionActionLabels[action]}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* ---- Staff Add/Edit Modal ---- */}
      <AnimatePresence>
        {showStaffForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
            onClick={() => setShowStaffForm(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-[var(--vuno-border-light)] px-5 py-4 flex items-center justify-between">
                <h3 className="font-bold text-[var(--vuno-text)]">
                  {editingStaff ? 'تعديل موظف' : 'إضافة موظف جديد'}
                </h3>
                <button onClick={() => setShowStaffForm(false)} className="p-2 -m-2 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-text-muted)]">
                  <XIcon size={18} />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Name + Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--vuno-text-secondary)] mb-1.5">الاسم</label>
                    <input
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="اسم الموظف"
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--vuno-text-secondary)] mb-1.5">الهاتف</label>
                    <input
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm"
                    />
                  </div>
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-xs font-medium text-[var(--vuno-text-secondary)] mb-1.5">الفرع</label>
                  <select
                    value={formBranch}
                    onChange={e => setFormBranch(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm"
                  >
                    {sampleBranches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Role selector — pill buttons */}
                <div>
                  <label className="block text-xs font-medium text-[var(--vuno-text-secondary)] mb-2">الدور</label>
                  <div className="grid grid-cols-3 gap-2">
                    {roleMeta.map(role => (
                      <button
                        key={role.id}
                        onClick={() => handleRoleChange(role.id)}
                        className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${
                          formRole === role.id
                            ? 'text-white'
                            : 'border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:border-[var(--vuno-text-muted)]'
                        }`}
                        style={formRole === role.id ? { background: role.color, borderColor: role.color } : {}}
                      >
                        {role.id === 'owner' && <ShieldIcon size={18} />}
                        {role.id === 'manager' && <UsersIcon size={18} />}
                        {role.id === 'employee' && <UsersIcon size={18} />}
                        <span className="text-xs font-semibold">{role.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[var(--vuno-text-muted)] mt-2">
                    {getRoleMeta(formRole).description}
                  </p>
                </div>

                {/* Permissions grid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-[var(--vuno-text-secondary)]">الصلاحيات التفصيلية</label>
                    <span className="text-[10px] text-[var(--vuno-text-muted)]">اضغط لتخصيص</span>
                  </div>
                  <div className="rounded-xl border border-[var(--vuno-border-light)] overflow-hidden">
                    {/* Header row */}
                    <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 px-3 py-2 bg-[var(--vuno-bg)] text-[10px] font-medium text-[var(--vuno-text-muted)]">
                      <span>القسم</span>
                      {allActions.map(a => (
                        <span key={a} className="text-center w-12">{permissionActionLabels[a]}</span>
                      ))}
                    </div>
                    {/* Module rows */}
                    {allModules.map((mod, idx) => (
                      <div
                        key={mod}
                        className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 px-3 py-2.5 items-center ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-[var(--vuno-surface-pearl)]'
                        }`}
                      >
                        <span className="text-xs text-[var(--vuno-text)]">{permissionModuleLabels[mod]}</span>
                        {allActions.map(action => {
                          const has = hasPermission(mod, action);
                          return (
                            <button
                              key={action}
                              onClick={() => togglePermission(mod, action)}
                              className={`w-12 h-7 rounded-lg flex items-center justify-center transition-all ${
                                has
                                  ? 'text-white'
                                  : 'bg-[var(--vuno-bg)] text-[var(--vuno-text-muted)] hover:bg-[var(--vuno-border-light)]'
                              }`}
                              style={has ? { background: getRoleMeta(formRole).color } : {}}
                            >
                              {has && <CheckIcon size={13} />}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-[var(--vuno-border-light)] px-5 py-4 flex gap-3 justify-end">
                <button onClick={() => setShowStaffForm(false)} className="px-5 py-2.5 rounded-xl border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)] transition-colors text-sm font-medium">
                  إلغاء
                </button>
                <button
                  onClick={saveStaff}
                  className="px-5 py-2.5 rounded-xl text-white font-medium hover:opacity-90 transition-opacity text-sm"
                  style={{ background: 'var(--vuno-primary)' }}
                >
                  {editingStaff ? 'حفظ التعديلات' : 'إضافة الموظف'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
