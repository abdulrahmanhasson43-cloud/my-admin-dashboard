import { motion } from 'framer-motion';
import type { BranchFormState } from '@/hooks/useBranchForm';

/** Inline add / edit form for a branch (name + address). */
export default function BranchFormPanel({ form }: { form: BranchFormState }) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card-vuno p-5 overflow-hidden">
      <h3 className="font-bold text-[var(--vuno-text)] mb-4">{form.editingBranch ? 'تعديل الفرع' : 'إضافة فرع جديد'}</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <input
          value={form.branchName}
          onChange={e => form.setBranchName(e.target.value)}
          placeholder="اسم الفرع"
          className="px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:outline-none focus:border-[var(--vuno-primary)] focus:bg-white transition-colors"
        />
        <input
          value={form.branchAddress}
          onChange={e => form.setBranchAddress(e.target.value)}
          placeholder="العنوان"
          className="px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:outline-none focus:border-[var(--vuno-primary)] focus:bg-white transition-colors"
        />
      </div>
      <div className="flex gap-3 mt-4 justify-end">
        <button onClick={form.close} className="px-5 py-2.5 rounded-xl border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)] transition-colors">إلغاء</button>
        <button onClick={form.save} className="px-5 py-2.5 rounded-xl text-white font-medium hover:opacity-90 transition-opacity" style={{ background: 'var(--vuno-primary)' }}>{form.editingBranch ? 'حفظ التعديلات' : 'حفظ'}</button>
      </div>
    </motion.div>
  );
}
