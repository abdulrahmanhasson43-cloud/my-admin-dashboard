import { LockIcon } from '@/components/icons';
import { roleMeta } from '@/types';

/** The three roles (owner / manager / employee) with their colour and description. */
export default function RoleLegend() {
  return (
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
  );
}
