import { describe, expect, it } from 'vitest';
import type { Expense } from '@/types/expense';
import {
  EMPTY_EXPENSE_FORM, buildCalendarCells, categoryBreakdown, dateLabel, dayDotColors, expenseExportRows,
  filterExpenses, groupByDate, indexByDate, parseExpenseForm, summarizeExpenses, sumAmounts, todayIso,
} from './expenses';

const expense = (id: string, date: string, amount: number, category: Expense['category'] = 'other', description = id): Expense =>
  ({ id, date, amount, category, description, paymentMethod: 'cash', createdBy: 'M' } as Expense);

const NOW = new Date('2026-10-15T10:00:00Z');

describe('parseExpenseForm', () => {
  const filled = { ...EMPTY_EXPENSE_FORM, description: '  كهرباء ', amount: '350', notes: ' ' };

  it('accepts a filled form, trimming text and dropping blank notes', () => {
    const parsed = parseExpenseForm(filled, '2026-10-15');
    expect(parsed).toEqual({
      ok: true,
      input: { description: 'كهرباء', amount: 350, category: 'other', date: '2026-10-15', paymentMethod: 'cash', notes: undefined },
    });
  });

  it('a blank description or blank amount is "blank" (ignored quietly)', () => {
    expect(parseExpenseForm({ ...filled, description: '   ' }, 'd')).toEqual({ ok: false, reason: 'blank' });
    expect(parseExpenseForm({ ...filled, amount: '' }, 'd')).toEqual({ ok: false, reason: 'blank' });
  });

  it('zero, negative and non-numeric amounts are "amount" — they used to be sent to the service and lost', () => {
    for (const amount of ['0', '-5', 'abc', 'Infinity']) {
      expect(parseExpenseForm({ ...filled, amount }, 'd')).toEqual({ ok: false, reason: 'amount' });
    }
  });

  it('keeps decimals', () => {
    const parsed = parseExpenseForm({ ...filled, amount: '12.5' }, 'd');
    expect(parsed.ok && parsed.input.amount).toBe(12.5);
  });
});

describe('filtering, grouping, summary', () => {
  const list = [
    expense('a', '2026-10-14', 100, 'rent', 'إيجار'),
    expense('b', '2026-10-15', 50, 'other', 'شاي'),
    expense('c', '2026-10-15', 30, 'rent', 'إيجار مخزن'),
  ];

  it('filterExpenses: by category, by text, newest first, without touching the input', () => {
    const before = [...list];
    expect(filterExpenses(list, 'all', '').map(e => e.id)).toEqual(['b', 'c', 'a']);
    expect(filterExpenses(list, 'rent', '').map(e => e.id)).toEqual(['c', 'a']);
    expect(filterExpenses(list, 'rent', 'مخزن').map(e => e.id)).toEqual(['c']);
    expect(list).toEqual(before);
  });

  it('groupByDate: newest date first, with its expenses', () => {
    const groups = groupByDate(list);
    expect(groups.map(([date]) => date)).toEqual(['2026-10-15', '2026-10-14']);
    expect(groups[0][1].map(e => e.id)).toEqual(['b', 'c']);
    expect(Object.keys(indexByDate(list))).toHaveLength(2);
  });

  it('summarizeExpenses: today, all-time total, and total/4 rounded', () => {
    expect(summarizeExpenses(list, '2026-10-15')).toEqual({ todayTotal: 80, todayCount: 2, total: 180, avgDaily: 45 });
    expect(summarizeExpenses([], '2026-10-15')).toEqual({ todayTotal: 0, todayCount: 0, total: 0, avgDaily: 0 });
    expect(sumAmounts(list)).toBe(180);
  });

  it('categoryBreakdown adds up per category with its label and colour', () => {
    const slices = categoryBreakdown(list);
    expect(slices.map(s => s.value).sort((x, y) => x - y)).toEqual([50, 130]);
    for (const slice of slices) {
      expect(slice.label).toBeTruthy();
      expect(slice.color).toBeTruthy();
    }
  });

  it('dayDotColors: one dot per category, at most four', () => {
    expect(dayDotColors(list)).toHaveLength(2);
    const many = (['rent', 'other', 'salaries', 'utilities', 'supplies', 'maintenance'] as Expense['category'][])
      .map((c, i) => expense(`x${i}`, '2026-10-15', 1, c));
    expect(dayDotColors(many).length).toBeLessThanOrEqual(4);
  });

  it('expenseExportRows numbers the rows from 1 and fills missing notes', () => {
    const rows = expenseExportRows(list);
    expect(rows[0]['#']).toBe(1);
    expect(rows[2]['#']).toBe(3);
    expect(rows[0]['ملاحظات']).toBe('');
    expect(rows[0]['المبلغ']).toBe(100);
  });
});

describe('dates', () => {
  it('todayIso is YYYY-MM-DD', () => {
    expect(todayIso(NOW)).toBe('2026-10-15');
  });

  it('dateLabel: today, yesterday, otherwise a long Arabic date', () => {
    expect(dateLabel('2026-10-15', NOW)).toBe('اليوم');
    expect(dateLabel('2026-10-14', NOW)).toBe('أمس');
    expect(dateLabel('2026-09-01', NOW)).not.toMatch(/اليوم|أمس/);
  });

  it('buildCalendarCells: leading blanks, one cell per day, today flagged', () => {
    // October 2026 starts on a Thursday (getDay() === 4) and has 31 days.
    const cells = buildCalendarCells(2026, 9, '2026-10-15');
    expect(cells.filter(c => c.date === null)).toHaveLength(4);
    expect(cells.filter(c => c.date !== null)).toHaveLength(31);
    expect(cells[4]).toEqual({ date: '2026-10-01', day: 1, isToday: false });
    expect(cells.filter(c => c.isToday).map(c => c.date)).toEqual(['2026-10-15']);
  });

  it('buildCalendarCells handles a leap February and a month starting on Sunday', () => {
    expect(buildCalendarCells(2028, 1, 'x').filter(c => c.date).length).toBe(29);
    // March 2026 starts on a Sunday: no leading blanks.
    expect(buildCalendarCells(2026, 2, 'x')[0].date).toBe('2026-03-01');
  });
});
