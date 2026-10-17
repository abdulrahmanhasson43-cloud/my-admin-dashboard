import { motion } from 'framer-motion';
import { ExpenseIcon, TrashIcon, EditIcon } from '@/components/icons';
import { getCategoryMeta } from '@/types/expense';
import type { Expense } from '@/types/expense';
import { dateLabel, sumAmounts } from '@/lib/expenses';

interface ExpenseListProps {
  /** `[date, expenses]` pairs, newest first (see `groupByDate`). */
  groups: [string, Expense[]][];
  onDelete: (id: string) => void;
}

/** Expenses grouped by day, each with the day's total. */
export default function ExpenseList({ groups, onDelete }: ExpenseListProps) {
  return (
    groups.length === 0 ? (
      <div className="card-vuno p-10 text-center text-[var(--vuno-text-muted)]">
        <ExpenseIcon size={40} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">لا توجد مصروفات مطابقة</p>
      </div>
    ) : (
      <div className="space-y-5">
        {groups.map(([dateStr, items]) => {
          const dayTotal = sumAmounts(items);
          return (
            <div key={dateStr}>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <h3 className="text-[14px] font-semibold text-[var(--vuno-text)]">{dateLabel(dateStr)}</h3>
                <span className="text-[13px] font-bold text-[var(--vuno-danger)] tabular-nums">
                  {dayTotal.toLocaleString()} EGP
                </span>
              </div>
              <div className="space-y-2.5">
                {items.map((expense, i) => {
                  const catMeta = getCategoryMeta(expense.category);
                  return (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.2) }}
                      className="card-vuno p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `color-mix(in srgb, ${catMeta.color} 12%, transparent)` }}
                          >
                            <ExpenseIcon size={18} style={{ color: catMeta.color } as never} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[var(--vuno-text)] truncate">{expense.description}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                                style={{ background: `color-mix(in srgb, ${catMeta.color} 12%, transparent)`, color: catMeta.color }}
                              >
                                {catMeta.label}
                              </span>
                              {expense.notes && (
                                <span className="text-[11px] text-[var(--vuno-text-muted)] truncate">{expense.notes}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <p className="text-base font-bold text-[var(--vuno-danger)] tabular-nums">
                            {expense.amount.toLocaleString()} EGP
                          </p>
                          <div className="flex items-center gap-1">
                            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--vuno-primary)] hover:bg-[var(--vuno-bg)] transition-colors" aria-label="تعديل">
                              <EditIcon size={13} />
                            </button>
                            <button
                              onClick={() => onDelete(expense.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                              aria-label="حذف"
                            >
                              <TrashIcon size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    )
  );
}
