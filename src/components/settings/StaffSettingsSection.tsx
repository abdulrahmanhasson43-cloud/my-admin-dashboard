import { toast } from 'sonner';
import { PlusIcon, ShieldIcon } from '@/components/icons';
import { countStaffByRole } from '@/lib/permissions';
import { roleMeta, type SettingsSection, type StaffMember } from '@/types';
import SectionHeader from './SectionHeader';
import SectionPanel from './SectionPanel';
import StaffMemberCard from './StaffMemberCard';

/** Staff and roles: how many people hold each role, then one card per member. Adding and editing are announced as "coming soon" for now. */
export default function StaffSettingsSection({ section, members, onBack }: {
  section: SettingsSection;
  members: ReadonlyArray<StaffMember>;
  onBack: () => void;
}) {
  const countByRole = countStaffByRole(members);

  return (
    <SectionPanel variant="slide" className="space-y-4">
      <SectionHeader section={section} onBack={onBack} />

      {/* Role summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {roleMeta.map(role => (
          <div key={role.id} className="card-vuno p-3 text-center">
            <div className="w-8 h-8 rounded-full mx-auto mb-1.5 flex items-center justify-center" style={{ background: `color-mix(in srgb, ${role.color} 12%, transparent)` }}>
              <ShieldIcon size={14} style={{ color: role.color }} />
            </div>
            <p className="text-lg font-bold text-[var(--vuno-text)]">{countByRole[role.id]}</p>
            <p className="text-[11px] text-[var(--vuno-text-muted)]">{role.label}</p>
          </div>
        ))}
      </div>

      {/* Add user button */}
      <button
        onClick={() => toast.info('سيتم إضافة موظف جديد قريباً')}
        className="w-full py-3 rounded-xl border-2 border-dashed border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:border-[var(--vuno-primary)] hover:text-[var(--vuno-primary)] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
      >
        <PlusIcon size={16} />
        إضافة موظف جديد
      </button>

      {/* User cards */}
      <div className="space-y-3">
        {members.map((member, i) => (
          <StaffMemberCard
            key={member.id}
            member={member}
            index={i}
            onEdit={m => toast.info(`تعديل بيانات ${m.name}`)}
          />
        ))}
      </div>
    </SectionPanel>
  );
}
