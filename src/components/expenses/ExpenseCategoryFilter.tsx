import { expenseCategories } from '@/types/expense';
import type { ExpenseCategory } from '@/types/expense';

interface ExpenseCategoryFilterProps {
  value: 'all' | ExpenseCategory;
  onChange: (value: 'all' | ExpenseCategory) => void;
}

/** Scrollable row of category pills; "الكل" shows every expense. */
export default function ExpenseCategoryFilter({ value, onChange }: ExpenseCategoryFilterProps) {
  return (
  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
    <button
      onClick={() => onChange('all')}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
        value === 'all' ? 'text-white' : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)]'
      }`}
      style={value === 'all' ? { background: 'var(--vuno-primary)' } : undefined}
    >
      الكل
    </button>
    {expenseCategories.map(cat => (
      <button
        key={cat.id}
        onClick={() => onChange(cat.id)}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
          value === cat.id ? 'text-white' : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)]'
        }`}
        style={value === cat.id ? { background: cat.color } : undefined}
      >
        {cat.label}
      </button>
    ))}
  </div>
  );
}
