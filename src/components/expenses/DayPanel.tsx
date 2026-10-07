import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';
import { CalendarIcon, ExpenseIcon, XIcon } from '@/components/icons';
import { formatEnglishDate } from '@/lib/utils';
import { getCategoryMeta } from '@/types/expense';
import type { Expense } from '@/types/expense';
import { categoryBreakdown, sumAmounts } from '@/lib/expenses';

/** Side panel for one calendar day: the day's expenses, total and a category pie. */

export default function DayPanel({
  date, expenses, onClose,
}: {
  date: string;
  expenses: Expense[];
  onClose: () => void;
}) {
  const dayTotal = sumAmounts(expenses);

  // Pie chart data — category breakdown
  const pieData = useMemo(
    () => categoryBreakdown(expenses).map(c => ({ name: c.label, value: c.value, color: c.color })),
    [expenses],
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 bottom-0 right-0 z-50 w-full max-w-[400px] bg-[var(--vuno-bg)] overflow-y-auto"
        style={{ boxShadow: '-4px 0 24px rgba(0,0,0,0.12)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[var(--vuno-bg)] px-5 pt-5 pb-3" style={{ borderBottom: '1px solid var(--vuno-border-light)' }}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: 'var(--vuno-surface-pearl)' }}>
                <CalendarIcon size={20} className="text-[var(--vuno-primary)]" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-[var(--vuno-text)]">{formatEnglishDate(date, false)}</h2>
                <p className="text-[12px] text-[var(--vuno-text-muted)] mt-0.5">{expenses.length} مصروف</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
              style={{ background: 'var(--vuno-surface)', border: '1px solid var(--vuno-border)' }}
              aria-label="إغلاق"
            >
              <XIcon size={18} className="text-[var(--vuno-text)]" />
            </button>
          </div>
          <div className="rounded-[12px] p-3" style={{ background: 'var(--vuno-surface)', border: '1px solid var(--vuno-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[var(--vuno-text-muted)]">إجمالي مصروفات اليوم</span>
              <span className="text-[18px] font-bold text-[var(--vuno-danger)] tabular-nums">{dayTotal.toLocaleString()} EGP</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Pie chart */}
          {pieData.length > 0 && (
            <div className="rounded-[14px] p-4" style={{ background: 'var(--vuno-surface)', border: '1px solid var(--vuno-border)' }}>
              <h3 className="text-[14px] font-semibold text-[var(--vuno-text)] mb-3">توزيع الفئات</h3>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <RTooltip
                      formatter={(v: number) => `${v.toLocaleString()} EGP`}
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid var(--vuno-border)',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-[11px] text-[var(--vuno-text-muted)] truncate">{d.name}</span>
                    <span className="text-[11px] font-semibold text-[var(--vuno-text)] tabular-nums mr-auto">{d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expense list */}
          <div>
            <h3 className="text-[14px] font-semibold text-[var(--vuno-text)] mb-3">المصروفات</h3>
            <div className="space-y-2.5">
              {expenses.map(expense => {
                const catMeta = getCategoryMeta(expense.category);
                return (
                  <div key={expense.id} className="rounded-[12px] p-3 flex items-center gap-3" style={{ background: 'var(--vuno-surface)', border: '1px solid var(--vuno-border)' }}>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${catMeta.color}1A` }}
                    >
                      <ExpenseIcon size={16} style={{ color: catMeta.color } as never} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-[var(--vuno-text)] truncate">{expense.description}</p>
                      <span
                        className="inline-block mt-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ background: `${catMeta.color}1A`, color: catMeta.color }}
                      >
                        {catMeta.label}
                      </span>
                    </div>
                    <span className="text-[14px] font-bold text-[var(--vuno-danger)] tabular-nums flex-shrink-0">
                      {expense.amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
              {expenses.length === 0 && (
                <div className="rounded-[12px] p-8 text-center" style={{ background: 'var(--vuno-surface)', border: '1px solid var(--vuno-border)' }}>
                  <ExpenseIcon size={32} className="mx-auto mb-2 text-[var(--vuno-text-muted)] opacity-40" />
                  <p className="text-[13px] text-[var(--vuno-text-muted)]">لا توجد مصروفات في هذا اليوم</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════
   Main Expenses Page — enhanced with Calendar View (#5)
   ═════════════════════════════════════════════════════════════════════════════ */
