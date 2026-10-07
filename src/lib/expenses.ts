import { getCategoryMeta, type Expense, type ExpenseCategory } from '@/types/expense';

/**
 * Expense rules — pure functions, no React, no storage. ExpensesPage used to
 * compute all of this inline; here it can be tested in plain Node.
 */

/** Today as `YYYY-MM-DD` (UTC, as the rest of the expenses code has always done). */
export function todayIso(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export type ExpensePaymentMethod = 'cash' | 'card' | 'wallet' | 'instapay' | 'bimoob';

/** The add-expense form as the cashier fills it (everything is still text). */
export interface ExpenseFormValues {
  description: string;
  amount: string;
  category: ExpenseCategory;
  paymentMethod: ExpensePaymentMethod;
  notes: string;
}

export const EMPTY_EXPENSE_FORM: ExpenseFormValues = {
  description: '',
  amount: '',
  category: 'other',
  paymentMethod: 'cash',
  notes: '',
};

export type ParsedExpenseForm =
  | {
      ok: true;
      input: {
        description: string;
        amount: number;
        category: ExpenseCategory;
        date: string;
        paymentMethod: ExpensePaymentMethod;
        notes: string | undefined;
      };
    }
  /** `blank`: description or amount not filled in. `amount`: filled in, but not a number above zero. */
  | { ok: false; reason: 'blank' | 'amount' };

/**
 * Turns the form into something the service accepts, or says why not.
 * A zero, negative or non-numeric amount used to slip through to the service,
 * which rejected it AFTER the form had already closed — so nothing was saved
 * and nobody was told.
 */
export function parseExpenseForm(form: ExpenseFormValues, date: string): ParsedExpenseForm {
  const description = form.description.trim();
  if (!description || !form.amount.trim()) return { ok: false, reason: 'blank' };

  const amount = Number(form.amount);
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, reason: 'amount' };

  return {
    ok: true,
    input: {
      description,
      amount,
      category: form.category,
      date,
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim() || undefined,
    },
  };
}

/** Expenses in a category (or all) whose description contains `search`, newest first. */
export function filterExpenses(
  expenses: Expense[],
  category: 'all' | ExpenseCategory,
  search: string,
): Expense[] {
  return expenses
    .filter(e => category === 'all' || e.category === category)
    .filter(e => e.description.includes(search))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function sumAmounts(expenses: ReadonlyArray<Expense>): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export interface ExpenseSummary {
  todayTotal: number;
  todayCount: number;
  /** Everything in the list — not only the current month, despite how the page words it. */
  total: number;
  /** `total / 4`, rounded. See the note in the project context about this formula. */
  avgDaily: number;
}

export function summarizeExpenses(expenses: Expense[], today: string): ExpenseSummary {
  const todays = expenses.filter(e => e.date === today);
  const total = sumAmounts(expenses);
  return {
    todayTotal: sumAmounts(todays),
    todayCount: todays.length,
    total,
    avgDaily: Math.round(total / 4),
  };
}

/** Expenses keyed by their date. */
export function indexByDate(expenses: Expense[]): Record<string, Expense[]> {
  const map: Record<string, Expense[]> = {};
  for (const e of expenses) {
    if (!map[e.date]) map[e.date] = [];
    map[e.date].push(e);
  }
  return map;
}

/** `[date, expenses]` pairs, newest date first. */
export function groupByDate(expenses: Expense[]): [string, Expense[]][] {
  return Object.entries(indexByDate(expenses)).sort((a, b) => b[0].localeCompare(a[0]));
}

/** "اليوم" / "أمس" / a long Arabic date. */
export function dateLabel(dateStr: string, now: Date = new Date()): string {
  if (dateStr === todayIso(now)) return 'اليوم';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === todayIso(yesterday)) return 'أمس';
  return new Date(dateStr).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });
}

export interface CalendarCell {
  /** `YYYY-MM-DD`, or null for a leading blank. */
  date: string | null;
  day: number | null;
  isToday: boolean;
}

/**
 * The cells of a month grid, Sunday first: blanks up to the first weekday,
 * then one cell per day. `month` is 0-based, like `Date`.
 */
export function buildCalendarCells(year: number, month: number, today: string): CalendarCell[] {
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: CalendarCell[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ date: null, day: null, isToday: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ date, day: d, isToday: date === today });
  }
  return cells;
}

/** Colour dots for a day: one per category, at most four. */
export function dayDotColors(dayExpenses: Expense[], max = 4): string[] {
  const categories = [...new Set(dayExpenses.map(e => e.category))].slice(0, max);
  return categories.map(c => getCategoryMeta(c).color);
}

export interface CategoryAmount {
  label: string;
  value: number;
  color: string;
}

/** Total per category (label and colour included), in the order categories first appear. */
export function categoryBreakdown(expenses: Expense[]): CategoryAmount[] {
  const byCategory: Record<string, number> = {};
  for (const e of expenses) byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
  return Object.entries(byCategory).map(([category, value]) => {
    const meta = getCategoryMeta(category as ExpenseCategory);
    return { label: meta.label, value, color: meta.color };
  });
}

/** The rows of the Excel export. */
export function expenseExportRows(expenses: Expense[]) {
  return expenses.map((e, i) => ({
    '#': i + 1,
    'الوصف': e.description,
    'المبلغ': e.amount,
    'الفئة': getCategoryMeta(e.category).label,
    'التاريخ': e.date,
    'طريقة الدفع': e.paymentMethod,
    'ملاحظات': e.notes || '',
  }));
}
