import { CalendarIcon } from '@/components/icons';

export type ExpenseView = 'list' | 'calendar';

interface ExpenseViewToggleProps {
  view: ExpenseView;
  onChange: (view: ExpenseView) => void;
}

/** Calendar / list switch. */
export default function ExpenseViewToggle({ view, onChange }: ExpenseViewToggleProps) {
  return (
  <div className="flex gap-1 p-1 rounded-full w-fit" style={{ background: 'var(--vuno-surface-pearl)' }}>
    <button
      onClick={() => onChange('calendar')}
      className="h-9 px-5 rounded-full text-[13px] font-medium transition-all flex items-center gap-2"
      style={{
        background: view === 'calendar' ? 'var(--vuno-surface)' : 'transparent',
        color: view === 'calendar' ? 'var(--vuno-text)' : 'var(--vuno-text-muted)',
        boxShadow: view === 'calendar' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      <CalendarIcon size={16} />
      التقويم
    </button>
    <button
      onClick={() => onChange('list')}
      className="h-9 px-5 rounded-full text-[13px] font-medium transition-all"
      style={{
        background: view === 'list' ? 'var(--vuno-surface)' : 'transparent',
        color: view === 'list' ? 'var(--vuno-text)' : 'var(--vuno-text-muted)',
        boxShadow: view === 'list' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      القائمة
    </button>
  </div>
  );
}
