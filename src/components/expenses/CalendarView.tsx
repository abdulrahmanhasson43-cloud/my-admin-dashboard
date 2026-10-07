import { useState, useMemo } from 'react';
import { ChevronDownIcon } from '@/components/icons';
import { expenseCategories } from '@/types/expense';
import type { Expense } from '@/types/expense';
import { buildCalendarCells, dayDotColors, indexByDate, sumAmounts, todayIso } from '@/lib/expenses';

/** Month grid with a colour dot per category on each day; tapping a day opens its panel. */

const WEEKDAY_LABELS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export default function CalendarView({
  expenses, onSelectDay,
}: {
  expenses: Expense[];
  onSelectDay: (date: string) => void;
}) {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Map expenses by date
  const expensesByDate = useMemo(() => indexByDate(expenses), [expenses]);

  // Build calendar grid for the current view month
  const calendarDays = useMemo(
    () => buildCalendarCells(viewMonth.year, viewMonth.month, todayIso()),
    [viewMonth],
  );

  const monthLabel = new Date(viewMonth.year, viewMonth.month, 1)
    .toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });

  const goPrevMonth = () => setViewMonth(m => {
    const d = new Date(m.year, m.month - 1, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const goNextMonth = () => setViewMonth(m => {
    const d = new Date(m.year, m.month + 1, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Unique category colors for a given day (max 4 dots)
  const dotsForDay = (date: string) => dayDotColors(expensesByDate[date] ?? []);

  const dayTotal = (date: string) => sumAmounts(expensesByDate[date] ?? []);

  return (
    <div className="card-vuno p-5">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-[var(--vuno-text)]">{monthLabel}</h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={goPrevMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90"
            style={{ background: 'var(--vuno-surface-pearl)', border: '1px solid var(--vuno-border)' }}
            aria-label="الشهر السابق"
          >
            <ChevronDownIcon size={16} className="text-[var(--vuno-text)] -rotate-90" />
          </button>
          <button
            onClick={goNextMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90"
            style={{ background: 'var(--vuno-surface-pearl)', border: '1px solid var(--vuno-border)' }}
            aria-label="الشهر التالي"
          >
            <ChevronDownIcon size={16} className="text-[var(--vuno-text)] rotate-90" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map(d => (
          <div key={d} className="text-center text-[11px] font-medium text-[var(--vuno-text-muted)] py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((cell, i) => {
          if (!cell.date) return <div key={i} className="aspect-square" />;
          const dots = dotsForDay(cell.date);
          const total = dayTotal(cell.date);
          const hasExpenses = dots.length > 0;
          return (
            <button
              key={cell.date}
              onClick={() => onSelectDay(cell.date!)}
              className="aspect-square rounded-[10px] flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 relative"
              style={{
                background: cell.isToday ? 'var(--vuno-primary)' : hasExpenses ? 'var(--vuno-surface-pearl)' : 'transparent',
                border: hasExpenses && !cell.isToday ? '1px solid var(--vuno-border)' : '1px solid transparent',
              }}
            >
              <span
                className="text-[13px] font-semibold tabular-nums"
                style={{ color: cell.isToday ? 'white' : 'var(--vuno-text)' }}
              >
                {cell.day}
              </span>
              {/* Colored category dots */}
              {dots.length > 0 && (
                <div className="flex gap-0.5 flex-wrap justify-center max-w-[80%]">
                  {dots.map((color, di) => (
                    <span
                      key={di}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: cell.isToday ? 'rgba(255,255,255,0.7)' : color }}
                    />
                  ))}
                </div>
              )}
              {hasExpenses && (
                <span
                  className="text-[9px] tabular-nums leading-none"
                  style={{ color: cell.isToday ? 'rgba(255,255,255,0.8)' : 'var(--vuno-text-muted)' }}
                >
                  {total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Category legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--vuno-border-light)' }}>
        {expenseCategories.map(cat => (
          <div key={cat.id} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
            <span className="text-[11px] text-[var(--vuno-text-muted)]">{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
