import { motion } from 'framer-motion';
import { expenseCategories } from '@/types/expense';
import type { ExpenseFormValues } from '@/lib/expenses';

interface ExpenseFormPanelProps {
  form: ExpenseFormValues;
  onChange: (patch: Partial<ExpenseFormValues>) => void;
  onCancel: () => void;
  onSave: () => void;
}

/** The "add expense" form that slides open above the list. */
export default function ExpenseFormPanel({ form, onChange, onCancel, onSave }: ExpenseFormPanelProps) {
  return (
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
            onChange={e => onChange({ description: e.target.value })}
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
            onChange={e => onChange({ amount: e.target.value })}
            placeholder="0"
            className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:outline-none focus:border-[var(--vuno-primary)] focus:bg-white transition-colors"
          />
        </div>
        <div>
          <label className="text-[12px] text-[var(--vuno-text-secondary)] mb-1.5 block">طريقة الدفع</label>
          <select
            value={form.paymentMethod}
            onChange={e => onChange({ paymentMethod: e.target.value as ExpenseFormValues['paymentMethod'] })}
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
                onClick={() => onChange({ category: cat.id })}
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
            onChange={e => onChange({ notes: e.target.value })}
            placeholder="أي ملاحظات إضافية..."
            className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:outline-none focus:border-[var(--vuno-primary)] focus:bg-white transition-colors"
          />
        </div>
      </div>
      <div className="flex gap-3 mt-4 justify-end">
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)] transition-colors">إلغاء</button>
        <button onClick={onSave} className="px-5 py-2.5 rounded-full text-white font-medium hover:opacity-90 transition-opacity" style={{ background: 'var(--vuno-primary)' }}>حفظ المصروف</button>
      </div>
    </motion.div>
  );
}
