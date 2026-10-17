import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, ShieldIcon, UsersIcon, CheckIcon } from '@/components/icons';
import { roleMeta, permissionModuleLabels, permissionActionLabels, type Branch } from '@/types';
import { ALL_PERMISSION_ACTIONS, ALL_PERMISSION_MODULES, getRoleMeta } from '@/lib/permissions';
import type { StaffFormState } from '@/hooks/useStaffForm';

interface StaffFormModalProps {
  form: StaffFormState;
  branches: Branch[];
}

/** Bottom-sheet / dialog to add or edit a staff member, including the permission matrix. */
export default function StaffFormModal({ form, branches }: StaffFormModalProps) {
  const {
    editingStaff, formName, setFormName, formPhone, setFormPhone, formRole, formBranch, setFormBranch,
    handleRoleChange, togglePermission, hasPermission,
  } = form;

  return (
  <AnimatePresence>
    {form.open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
        onClick={() => form.close()}
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
            <button onClick={() => form.close()} className="p-2 -m-2 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-text-muted)]">
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
                {branches.map(b => (
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
                  {ALL_PERMISSION_ACTIONS.map(a => (
                    <span key={a} className="text-center w-12">{permissionActionLabels[a]}</span>
                  ))}
                </div>
                {/* Module rows */}
                {ALL_PERMISSION_MODULES.map((mod, idx) => (
                  <div
                    key={mod}
                    className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 px-3 py-2.5 items-center ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[var(--vuno-surface-pearl)]'
                    }`}
                  >
                    <span className="text-xs text-[var(--vuno-text)]">{permissionModuleLabels[mod]}</span>
                    {ALL_PERMISSION_ACTIONS.map(action => {
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
            <button onClick={() => form.close()} className="px-5 py-2.5 rounded-xl border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)] transition-colors text-sm font-medium">
              إلغاء
            </button>
            <button
              onClick={form.save}
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
  );
}
