import { useState } from 'react';
import { motion } from 'framer-motion';
import { BranchesIcon, PlusIcon, SearchIcon, UsersIcon, ReceiptIcon, EditIcon, TrashIcon, MapPinIcon } from '@/components/icons';
import { sampleBranches } from '@/services/mock';

export default function BranchesPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = sampleBranches.filter(b => b.name.includes(search));
  const totalSales = sampleBranches.reduce((s, b) => s + b.sales, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: 'إجمالي الفروع', value: sampleBranches.length.toString(), icon: BranchesIcon, color: 'bg-blue-50 text-blue-500' },
          { label: 'الموظفين', value: sampleBranches.reduce((s, b) => s + b.employees, 0).toString(), icon: UsersIcon, color: 'bg-emerald-50 text-emerald-500' },
          { label: 'إجمالي المبيعات', value: `${(totalSales / 1000).toFixed(0)}K EGP`, icon: ReceiptIcon, color: 'bg-orange-50 text-[var(--vuno-primary)]' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.1, 0.3) }} className="card-vuno p-4">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}><Icon size={18} /></div>
              <p className="text-xs text-[var(--vuno-text-muted)] mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-[var(--vuno-text)]">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--vuno-text-muted)]" />
          <input type="text" placeholder="ابحث باسم الفرع..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pr-10 pl-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-white text-sm focus:border-[var(--vuno-primary)] transition-colors" />
        </div>
        <button onClick={() => setShowForm(!showForm)} className="self-start px-5 py-2.5 rounded-xl gradient-btn text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"><PlusIcon size={16} /> فرع جديد</button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card-vuno p-5">
          <h3 className="font-bold text-[var(--vuno-text)] mb-4">إضافة فرع جديد</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input placeholder="اسم الفرع" className="px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-gray-50 text-sm" />
            <input placeholder="العنوان" className="px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-gray-50 text-sm" />
          </div>
          <div className="flex gap-3 mt-4 justify-end">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-gray-50 transition-colors">إلغاء</button>
            <button className="px-5 py-2.5 rounded-xl gradient-btn text-white font-medium hover:opacity-90 transition-opacity">حفظ</button>
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((branch, i) => (
          <motion.div key={branch.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.1, 0.3) }} className="card-vuno p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl gradient-header flex items-center justify-center text-white">
                  <BranchesIcon size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--vuno-text)]">{branch.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-[var(--vuno-text-muted)] mt-1">
                    <MapPinIcon size={12} />
                    {branch.address}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${branch.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>{branch.status === 'active' ? 'نشط' : 'غير نشط'}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--vuno-border-light)]">
              <div className="text-center">
                <p className="text-lg font-bold text-[var(--vuno-text)]">{branch.employees}</p>
                <p className="text-xs text-[var(--vuno-text-muted)]">موظف</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[var(--vuno-primary)]">{(branch.sales / 1000).toFixed(0)}K</p>
                <p className="text-xs text-[var(--vuno-text-muted)]">مبيعات</p>
              </div>
              <div className="flex items-center justify-center gap-1">
                <button className="p-2 rounded-lg hover:bg-orange-50 text-[var(--vuno-primary)] transition-colors"><EditIcon size={16} /></button>
                <button className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><TrashIcon size={16} /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


