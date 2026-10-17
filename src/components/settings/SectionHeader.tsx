import { ChevronDownIcon } from '@/components/icons';
import type { SettingsSection } from '@/types';

/** The top of an open section: a back button, the section's icon and its heading. */
export default function SectionHeader({ section, onBack }: { section: SettingsSection; onBack: () => void }) {
  const Icon = section.icon;
  return (
    <div className="flex items-center gap-3 mb-5">
      <button
        onClick={onBack}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
        style={{ background: 'var(--vuno-surface-pearl)', border: '1px solid var(--vuno-border)' }}
        aria-label="رجوع"
      >
        <ChevronDownIcon size={18} className="text-[var(--vuno-text)] -rotate-90" />
      </button>
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: 'var(--vuno-surface-pearl)' }}>
        <Icon size={18} className="text-[var(--vuno-primary)]" />
      </div>
      <h2 className="text-[20px] font-semibold text-[var(--vuno-text)] tracking-tight">{section.heading}</h2>
    </div>
  );
}
