import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  PlusIcon, ExpenseIcon, TrendingDownIcon, DownloadIcon, CalendarIcon,
} from '@/components/icons';
import { useExpenses } from '@/hooks/useExpenses';
import StatsRow from '@/components/StatsRow';
import SearchBar from '@/components/SearchBar';
import CalendarView from '@/components/expenses/CalendarView';
import DayPanel from '@/components/expenses/DayPanel';
import ExpenseFormPanel from '@/components/expenses/ExpenseFormPanel';
import ExpenseViewToggle, { type ExpenseView } from '@/components/expenses/ExpenseViewToggle';
import ExpenseCategoryFilter from '@/components/expenses/ExpenseCategoryFilter';
import ExpenseList from '@/components/expenses/ExpenseList';
import { exportToExcel } from '@/lib/export-utils';
import {
  EMPTY_EXPENSE_FORM, expenseExportRows, filterExpenses, groupByDate, parseExpenseForm,
  summarizeExpenses, todayIso, type ExpenseFormValues,
} from '@/lib/expenses';
import type { ExpenseCategory } from '@/types/expense';

export default function ExpensesPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ExpenseFormValues>(EMPTY_EXPENSE_FORM);
  // Expenses come from the clean ExpenseService via useExpenses().
  const { expenses, createExpense, deleteExpense } = useExpenses();
  const [filterCat, setFilterCat] = useState<'all' | ExpenseCategory>('all');
  const [view, setView] = useState<ExpenseView>('calendar');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const todayStr = todayIso();

  // Plain derivations: the React Compiler memoizes these, so no manual useMemo.
  const filtered = filterExpenses(expenses, filterCat, search);
  const grouped = groupByDate(filtered);
  const { todayTotal, todayCount, total, avgDaily } = summarizeExpenses(expenses, todayStr);

  const stats = [
    { label: 'مصروفات اليوم', value: `${todayTotal.toLocaleString()} EGP`, icon: TrendingDownIcon, color: 'text-[var(--vuno-danger)] bg-red-50' },
    { label: 'عدد المصروفات اليوم', value: todayCount.toString(), icon: ExpenseIcon, color: 'text-[var(--vuno-primary)] bg-[var(--vuno-surface-pearl)]' },
    { label: 'إجمالي المصروفات', value: `${total.toLocaleString()} EGP`, icon: CalendarIcon, color: 'text-[var(--vuno-primary)] bg-[var(--vuno-surface-pearl)]' },
    { label: 'متوسط يومي', value: `${avgDaily.toLocaleString()} EGP`, icon: TrendingDownIcon, color: 'text-[var(--vuno-text-secondary)] bg-[var(--vuno-surface-pearl)]' },
  ];

  const updateForm = (patch: Partial<ExpenseFormValues>) => setForm(f => ({ ...f, ...patch }));

  const handleSave = async () => {
    const parsed = parseExpenseForm(form, todayStr);
    if (!parsed.ok) {
      // A blank form is simply ignored (as before); a bad amount is explained.
      if (parsed.reason === 'amount') toast.error('المبلغ لازم يكون رقم أكبر من صفر');
      return;
    }
    try {
      await createExpense({ ...parsed.input, createdBy: 'أحمد محمد' });
    } catch {
      toast.error('تعذر حفظ المصروف');
      return; // keep the form open so nothing the user typed is lost
    }
    setForm(EMPTY_EXPENSE_FORM);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('متأكد إنك عايز تحذف المصروف ده؟')) {
      void deleteExpense(id);
    }
  };

  const handleExport = () => {
    exportToExcel(expenseExportRows(filtered), 'المصروفات', 'المصروفات');
  };

  const addButton = (
    <button
      onClick={() => { setShowForm(!showForm); setForm(EMPTY_EXPENSE_FORM); }}
      className="h-11 px-4 sm:px-5 rounded-full text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0"
      style={{ background: 'var(--vuno-primary)' }}
    >
      <PlusIcon size={16} />
      مصروف جديد
    </button>
  );

  const selectedDayExpenses = selectedDay
    ? expenses.filter(e => e.date === selectedDay)
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <StatsRow items={stats} maxCols={4} />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="ابحث في المصروفات..."
        actions={
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleExport}
              className="px-4 py-2.5 rounded-full border border-[var(--vuno-border)] bg-white text-[var(--vuno-text)] font-medium flex items-center justify-center gap-2 hover:bg-[var(--vuno-bg)] transition-colors whitespace-nowrap active:scale-95 flex-shrink-0"
            >
              <DownloadIcon size={16} />
              تصدير
            </button>
            {addButton}
          </div>
        }
      />

      <ExpenseViewToggle view={view} onChange={setView} />

      {showForm && (
        <ExpenseFormPanel
          form={form}
          onChange={updateForm}
          onCancel={() => setShowForm(false)}
          onSave={() => { void handleSave(); }}
        />
      )}

      <ExpenseCategoryFilter value={filterCat} onChange={setFilterCat} />

      {view === 'calendar' && <CalendarView expenses={filtered} onSelectDay={setSelectedDay} />}
      {view === 'list' && <ExpenseList groups={grouped} onDelete={handleDelete} />}

      {/* Day Side Panel */}
      <AnimatePresence>
        {selectedDay && (
          <DayPanel
            date={selectedDay}
            expenses={selectedDayExpenses}
            onClose={() => setSelectedDay(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
