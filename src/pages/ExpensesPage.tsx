import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon, ExpenseIcon, TrendingDownIcon, TrashIcon, EditIcon,
  DownloadIcon, CalendarIcon,
} from '@/components/icons';
import {
  sampleExpenses, expenseCategories, getCategoryMeta,
} from '@/services/mock/expenses';
import StatsRow from '@/components/StatsRow';
import SearchBar from '@/components/SearchBar';
import { exportToExcel } from '@/lib/export-utils';
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

export default function ExpensesPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ExpenseForm>(emptyForm);
  const [expenses, setExpenses] = useState<Expense[]>(sampleExpenses);
  const [filterCat, setFilterCat] = useState<'all' | ExpenseCategory>('all');

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
  const avgDaily = Math.round(monthTotal / 4); // rough weekly average

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

  // Group expenses by date
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

      {/* Expenses grouped by date */}
      {grouped.length === 0 ? (
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
                {/* Date header */}
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <h3 className="text-[14px] font-semibold text-[var(--vuno-text)]">{formatDateLabel(dateStr)}</h3>
                  <span className="text-[13px] font-bold text-[var(--vuno-danger)] tabular-nums">
                    {dayTotal.toLocaleString()} EGP
                  </span>
                </div>

                {/* Expense items */}
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
                              <ExpenseIcon size={18} style={{ color: catMeta.color }} />
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
      )}
    </div>
  );
}
