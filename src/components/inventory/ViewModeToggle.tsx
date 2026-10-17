import { TruckIcon } from '@/components/icons';
import type { InventoryViewMode } from '@/lib/inventory';

interface ViewModeToggleProps {
  mode: InventoryViewMode;
  onChange: (mode: InventoryViewMode) => void;
}

/** Product list / visual transfer. */
export default function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange('list')}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          mode === 'list' ? 'gradient-btn text-white' : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)]'
        }`}
      >
        قائمة المنتجات
      </button>
      <button
        onClick={() => onChange('visual')}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
          mode === 'visual' ? 'gradient-btn text-white' : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)]'
        }`}
      >
        <TruckIcon size={14} />
        نقل بصري
      </button>
    </div>
  );
}
