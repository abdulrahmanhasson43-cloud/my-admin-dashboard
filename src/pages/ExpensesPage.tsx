import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip,
} from 'recharts';
import {
  PlusIcon, ExpenseIcon, TrendingDownIcon, TrashIcon, EditIcon,
  DownloadIcon, CalendarIcon, XIcon, ChevronDownIcon,
} from '@/components/icons';
import {
  sampleExpenses, expenseCategories, getCategoryMeta,
} from '@/services/mock/expenses';
import StatsRow from '@/components/StatsRow';
import SearchBar from '@/components/SearchBar';
import { exportToExcel } from '@/lib/export-utils';
import { formatEnglishDate } from '@/lib/utils';
import type { Expense, ExpenseCategory } from '@/types/expense';

interface ExpenseForm {
  description: string;
  amount: string;
  category: ExpenseCategory;
  paymentMethod: 'cash' | 'card' | 'wallet' | 'instapay' | 'bimoob';
  notes: string;
}

const emptyForm: ExpenseForm = {
  description: '',
  amount: '',
  category: 'other',
  paymentMethod: 'cash',
  notes: '',
};

/* ─────────────────────────────────────────────────────────────────────────────
   Calendar View — month grid with colored category dots + day side panel (#5)
   ───────────────────────────────────────────────────────────────────────────── */

const WEEKDAY_LABELS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

function CalendarView({
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
  const expensesByDate = useMemo(() => {
    const map: Record<string, Expense[]> = {};
    expenses.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [expenses]);

  // Build calendar grid for the current view month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewMonth.year, viewMonth.month, 1);
    const startWeekday = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
    const todayStr = new Date().toISOString().slice(0, 10);

    const cells: { date: string | null; day: number | null; isToday: boolean }[] = [];
    // Leading blanks
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ date: null, day: null, isToday: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ date: dateStr, day: d, isToday: dateStr === todayStr });
    }
    return cells;
  }, [viewMonth]);

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
  const dotsForDay = (date: string) => {
    const dayExpenses = expensesByDate[date] ?? [];
    const cats = [...new Set(dayExpenses.map(e => e.category))].slice(0, 4);
    return cats.map(c => getCategoryMeta(c).color);
  };

  const dayTotal = (date: string) =>
    (expensesByDate[date] ?? []).reduce((s, e) => s + e.amount, 0);

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

/* ─────────────────────────────────────────────────────────────────────────────
   Day Side Panel — shows expenses for a selected calendar day + pie chart
   ───────────────────────────────────────────────────────────────────────────── */

function DayPanel({
  date, expenses, onClose,
}: {
  date: string;
  expenses: Expense[];
  onClose: () => void;
}) {
  const dayTotal = expenses.reduce((s, e) => s + e.amount, 0);

  // Pie chart data — category breakdown
  const pieData = useMemo(() => {
    const byCat: Record<string, number> = {};
    expenses.forEach(e => {
      byCat[e.category] = (byCat[e.category] ?? 0) + e.amount;
    });
    return Object.entries(byCat).map(([cat, amount]) => ({
      name: getCategoryMeta(cat as ExpenseCategory).label,
      value: amount,
      color: getCategoryMeta(cat as ExpenseCategory).color,
    }));
  }, [expenses]);

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

export default function ExpensesPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ExpenseForm>(emptyForm);
  const [expenses, setExpenses] = useState<Expense[]>(sampleExpenses);
  const [filterCat, setFilterCat] = useState<'all' | ExpenseCategory>('all');
  const [view, setView] = useState<'list' | 'calendar'>('calendar');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    return expenses
      .filter(e => filterCat === 'all' || e.category === filterCat)
      .filter(e => e.description.includes(search))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, filterCat, search]);

  const todayExpenses = expenses.filter(e => e.date === todayStr);
  const todayTotal = todayExpenses.reduce((s, e) => s + e.amount, 0);
  const monthTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const avgDaily = Math.round(monthTotal / 4);

  const stats = [
    { label: 'مصروفات اليوم', value: `${todayTotal.toLocaleString()} EGP`, icon: TrendingDownIcon, color: 'text-[var(--vuno-danger)] bg-red-50' },
    { label: 'عدد المصروفات اليوم', value: todayExpenses.length.toString(), icon: ExpenseIcon, color: 'text-[var(--vuno-primary)] bg-[var(--vuno-surface-pearl)]' },
    { label: 'إجمالي المصروفات', value: `${monthTotal.toLocaleString()} EGP`, icon: CalendarIcon, color: 'text-[var(--vuno-primary)] bg-[var(--vuno-surface-pearl)]' },
    { label: 'متوسط يومي', value: `${avgDaily.toLocaleString()} EGP`, icon: TrendingDownIcon, color: 'text-[var(--vuno-text-secondary)] bg-[var(--vuno-surface-pearl)]' },
  ];

  const handleSave = () => {
    if (!form.description.trim() || !form.amount) return;
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      description: form.description.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: todayStr,
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim() || undefined,
      createdBy: 'أحمد محمد',
    };
    setExpenses(prev => [newExpense, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('متأكد إنك عايز تحذف المصروف ده؟')) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleExport = () => {
    const rows = filtered.map((e, i) => ({
      '#': i + 1,
      'الوصف': e.description,
      'المبلغ': e.amount,
      'الفئة': getCategoryMeta(e.category).label,
      'التاريخ': e.date,
      'طريقة الدفع': e.paymentMethod,
      'ملاحظات': e.notes || '',
    }));
    exportToExcel(rows, 'المصروفات', 'المصروفات');
  };

  // Group expenses by date (for list view)
  const grouped = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    filtered.forEach(e => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const formatDateLabel = (dateStr: string) => {
    if (dateStr === todayStr) return 'اليوم';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === yesterday.toISOString().slice(0, 10)) return 'أمس';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });
  };

  const addButton = (
    <button
      onClick={() => { setShowForm(!showForm); setForm(emptyForm); }}
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

      {/* View toggle: List / Calendar */}
      <div className="flex gap-1 p-1 rounded-full w-fit" style={{ background: 'var(--vuno-surface-pearl)' }}>
        <button
          onClick={() => setView('calendar')}
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
          onClick={() => setView('list')}
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

      {/* Add Expense Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="card-vuno p-5"
        >
          <h3 className="font-bold text-[var(--vuno-text)] mb-4">إضافة مصروف جديد</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[12px] text-[var(--vuno-text-secondary)] mb-1.5 block">الوصف</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="مثال: فاتورة الكهرباء"
                className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:outline-none focus:border-[var(--vuno-primary)] focus:bg-white transition-colors"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[12px] text-[var(--vuno-text-secondary)] mb-1.5 block">المبلغ (EGP)</label>
              <input
                type="number"
                inputMode="decimal"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:outline-none focus:border-[var(--vuno-primary)] focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="text-[12px] text-[var(--vuno-text-secondary)] mb-1.5 block">طريقة الدفع</label>
              <select
                value={form.paymentMethod}
                onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value as ExpenseForm['paymentMethod'] }))}
                className="w-full h-[46px] px-4 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:outline-none focus:border-[var(--vuno-primary)]"
              >
                <option value="cash">كاش</option>
                <option value="card">بطاقة ائتمان</option>
                <option value="wallet">محفظة إلكترونية</option>
                <option value="instapay">إنستاباي</option>
                <option value="bimoob">بيموب</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-[12px] text-[var(--vuno-text-secondary)] mb-2 block">الفئة</label>
              <div className="flex flex-wrap gap-2">
                {expenseCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                    className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
                      form.category === cat.id ? 'text-white' : 'border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)]'
                    }`}
                    style={form.category === cat.id ? { background: cat.color } : undefined}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-[12px] text-[var(--vuno-text-secondary)] mb-1.5 block">ملاحظات (اختياري)</label>
              <input
                type="text"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="أي ملاحظات إضافية..."
                className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:outline-none focus:border-[var(--vuno-primary)] focus:bg-white transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4 justify-end">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)] transition-colors">إلغاء</button>
            <button onClick={handleSave} className="px-5 py-2.5 rounded-full text-white font-medium hover:opacity-90 transition-opacity" style={{ background: 'var(--vuno-primary)' }}>حفظ المصروف</button>
          </div>
        </motion.div>
      )}

      {/* Category filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => setFilterCat('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
            filterCat === 'all' ? 'text-white' : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)]'
          }`}
          style={filterCat === 'all' ? { background: 'var(--vuno-primary)' } : undefined}
        >
          الكل
        </button>
        {expenseCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCat(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              filterCat === cat.id ? 'text-white' : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)]'
            }`}
            style={filterCat === cat.id ? { background: cat.color } : undefined}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <CalendarView expenses={filtered} onSelectDay={setSelectedDay} />
      )}

      {/* List View (original grouped list) */}
      {view === 'list' && (
        grouped.length === 0 ? (
          <div className="card-vuno p-10 text-center text-[var(--vuno-text-muted)]">
            <ExpenseIcon size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">لا توجد مصروفات مطابقة</p>
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map(([dateStr, items]) => {
              const dayTotal = items.reduce((s, e) => s + e.amount, 0);
              return (
                <div key={dateStr}>
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <h3 className="text-[14px] font-semibold text-[var(--vuno-text)]">{formatDateLabel(dateStr)}</h3>
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
                                  onClick={() => handleDelete(expense.id)}
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
      )}

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
