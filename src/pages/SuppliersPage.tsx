import { useState } from 'react';
import { motion } from 'framer-motion';
import { SuppliersIcon, PlusIcon, SearchIcon, PackageIcon, EditIcon, TrashIcon } from '@/components/icons';
import { sampleSuppliers } from '@/services/mock';

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = sampleSuppliers.filter(s => s.name.includes(search));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: 'إجمالي الموردين', value: sampleSuppliers.length.toString(), icon: SuppliersIcon, color: 'bg-blue-50 text-blue-500' },
          { label: 'نشطين', value: sampleSuppliers.filter(s => s.status === 'active').length.toString(), icon: SuppliersIcon, color: 'bg-emerald-50 text-emerald-500' },
          { label: 'إجمالي الطلبات', value: sampleSuppliers.reduce((s, x) => s + x.totalOrders, 0).toString(), icon: PackageIcon, color: 'bg-orange-50 text-[var(--vuno-primary)]' },
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
          <input type="text" placeholder="ابحث باسم المورد..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pr-10 pl-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-white text-sm focus:border-[var(--vuno-primary)] transition-colors" />
        </div>
        <button onClick={() => setShowForm(!showForm)} className="self-start px-5 py-2.5 rounded-xl gradient-btn text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <PlusIcon size={16} /> مورد جديد
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card-vuno p-5">
          <h3 className="font-bold text-[var(--vuno-text)] mb-4">إضافة مورد جديد</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <input placeholder="اسم المورد" className="px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-gray-50 text-sm" />
            <input placeholder="رقم الهاتف" className="px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-gray-50 text-sm" />
            <input placeholder="البريد الإلكتروني" className="px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-gray-50 text-sm" />
          </div>
          <div className="flex gap-3 mt-4 justify-end">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-gray-50 transition-colors">إلغاء</button>
            <button className="px-5 py-2.5 rounded-xl gradient-btn text-white font-medium hover:opacity-90 transition-opacity">حفظ</button>
          </div>
        </motion.div>
      )}

      <div className="card-vuno overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-[var(--vuno-border)]">
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">المورد</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">المنتجات</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">الطلبات</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">الحالة</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.05, 0.3) }} className="border-b border-[var(--vuno-border-light)] last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><SuppliersIcon size={16} className="text-blue-500" /></div>
                      <div><p className="text-sm font-medium text-[var(--vuno-text)]">{s.name}</p><p className="text-xs text-[var(--vuno-text-muted)]">{s.phone}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--vuno-text)]">{s.products}</td>
                  <td className="px-4 py-3 text-sm text-[var(--vuno-text)]">{s.totalOrders}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${s.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>{s.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1"><button className="p-1.5 rounded-lg hover:bg-orange-50 text-[var(--vuno-primary)]"><EditIcon size={14} /></button><button className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><TrashIcon size={14} /></button></div></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
