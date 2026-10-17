import { motion } from 'framer-motion';
import { BranchesIcon, CheckIcon, ClockIcon, PhoneIcon } from '@/components/icons';
import { roleMeta, type StaffMember } from '@/types';

/** One staff member: avatar letter, role badge, phone, branch, status, last activity and an edit button. */
export default function StaffMemberCard({ member, index, onEdit }: {
  member: StaffMember;
  index: number;
  onEdit: (member: StaffMember) => void;
}) {
  const role = roleMeta.find(r => r.id === member.role);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.08, 0.3) }}
      className="card-vuno p-4"
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-base"
          style={{ background: role?.color ?? 'var(--vuno-primary)' }}
        >
          {member.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[15px] font-bold text-[var(--vuno-text)] leading-snug">{member.name}</p>
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-bold"
              style={{
                background: `color-mix(in srgb, ${role?.color ?? 'var(--vuno-primary)'} 12%, transparent)`,
                color: role?.color ?? 'var(--vuno-primary)',
              }}
            >
              {role?.label ?? member.role}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--vuno-text-muted)] mt-1">
            <PhoneIcon size={11} />
            {member.phone}
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--vuno-text-muted)] mt-0.5">
            <BranchesIcon size={11} />
            {member.branchName}
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 flex-shrink-0 ${
            member.status === 'active'
              ? ''
              : 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-text-muted)]'
          }`}
          style={member.status === 'active' ? { background: 'color-mix(in srgb, var(--vuno-success) 12%, transparent)', color: 'var(--vuno-success)' } : undefined}
        >
          <CheckIcon size={10} />
          {member.status === 'active' ? 'نشط' : 'غير نشط'}
        </span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-[var(--vuno-border-light)]">
        <div className="flex items-center gap-1.5 text-xs text-[var(--vuno-text-muted)]">
          <ClockIcon size={12} />
          {member.lastActive}
        </div>
        <button
          onClick={() => onEdit(member)}
          className="px-4 h-8 rounded-full text-[12px] font-medium transition-transform active:scale-95"
          style={{ border: '1px solid var(--vuno-border)', color: 'var(--vuno-primary)' }}
        >
          تعديل
        </button>
      </div>
    </motion.div>
  );
}
