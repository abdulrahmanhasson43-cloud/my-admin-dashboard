import { motion, AnimatePresence } from 'framer-motion';
import { EditIcon, TrashIcon, PhoneIcon } from '@/components/icons';
import { permissionModuleLabels, permissionActionLabels, type StaffMember } from '@/types';
import { ALL_PERMISSION_ACTIONS, ALL_PERMISSION_MODULES, getRoleMeta } from '@/lib/permissions';

interface StaffRowProps {
  member: StaffMember;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** One staff member: avatar, role badge, branch, phone, and an expandable permission matrix. */
export default function StaffRow({ member, index: i, expanded: isExpanded, onToggle, onEdit, onDelete }: StaffRowProps) {
  const meta = getRoleMeta(member.role);
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
              onClick={() => onToggle()}
              className="p-2 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-text-secondary)] transition-colors text-xs font-medium"
            >
              {isExpanded ? 'إخفاء' : 'الصلاحيات'}
            </button>
            <button onClick={() => onEdit()} className="p-2 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-primary)] transition-colors">
              <EditIcon size={15} />
            </button>
            <button onClick={() => onDelete()} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
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
                {ALL_PERMISSION_MODULES.map(mod => {
                  const perm = member.permissions.find(p => p.module === mod);
                  const hasAny = perm && perm.actions.length > 0;
                  return (
                    <div key={mod} className="flex items-center justify-between gap-3 py-1.5">
                      <span className={`text-sm ${hasAny ? 'text-[var(--vuno-text)]' : 'text-[var(--vuno-text-muted)]'}`}>
                        {permissionModuleLabels[mod]}
                      </span>
                      <div className="flex gap-1.5">
                        {ALL_PERMISSION_ACTIONS.map(action => {
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
}
