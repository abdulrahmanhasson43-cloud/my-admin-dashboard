import { ShieldIcon, UsersIcon } from '@/components/icons';
import type { LoginMode } from '@/hooks/useLoginForm';

interface LoginModeSwitcherProps {
  mode: LoginMode;
  onChange: (mode: LoginMode) => void;
}

const BASE = 'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all';

/** Owner / employee tab switcher shared by both login layouts. */
export default function LoginModeSwitcher({ mode, onChange }: LoginModeSwitcherProps) {
  const tab = (value: LoginMode) =>
    `${BASE} ${mode === value ? 'bg-white text-[var(--vuno-text)] shadow-sm' : 'text-[var(--vuno-text-muted)]'}`;

  return (
    <div className="flex gap-1 p-1 rounded-2xl bg-[var(--vuno-bg)] mb-6">
      <button onClick={() => onChange('owner')} className={tab('owner')}>
        <ShieldIcon size={15} /> المالك
      </button>
      <button onClick={() => onChange('employee')} className={tab('employee')}>
        <UsersIcon size={15} /> موظف
      </button>
    </div>
  );
}
