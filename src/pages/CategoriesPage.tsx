import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, CategoriesIcon, EditIcon, TrashIcon, PackageIcon } from '@/components/icons';
import { sampleCategories, categoryColorPalette } from '@/services/mock';

export default function CategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [categories, setCategories] = useState(sampleCategories);

  const addCategory = () => {
    if (!newName.trim()) return;
    const colors = categoryColorPalette;
    setCategories(prev => [...prev, {
      id: Date.now().toString(),
      name: newName,
      productCount: 0,
      color: colors[prev.length % colors.length]
    }]);
    setNewName('');
    setShowForm(false);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div />
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-xl gradient-btn text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <PlusIcon size={16} />
          فئة جديدة
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="card-vuno p-5"
        >
          <h3 className="font-bold text-[var(--vuno-text)] mb-4">إضافة فئة جديدة</h3>
          <div className="flex gap-3">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="اسم الفئة"
              className="flex-1 px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-gray-50 text-sm"
              onKeyDown={e => e.key === 'Enter' && addCategory()}
            />
            <button onClick={addCategory} className="px-6 py-3 rounded-xl gradient-btn text-white font-medium hover:opacity-90 transition-opacity">
              إضافة
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-3 rounded-xl border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-gray-50 transition-colors">
              إلغاء
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.1, 0.3) }}
            className="card-vuno p-6 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                style={{ backgroundColor: cat.color }}
              >
                <CategoriesIcon size={24} />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-lg hover:bg-orange-50 text-[var(--vuno-primary)] transition-colors">
                  <EditIcon size={14} />
                </button>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-[var(--vuno-text)] mb-1">{cat.name}</h3>
            <div className="flex items-center gap-2 text-sm text-[var(--vuno-text-muted)]">
              <PackageIcon size={14} />
              {cat.productCount} منتج
            </div>
            <div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((cat.productCount / 100) * 100, 100)}%` }}
                transition={{ delay: Math.min(i * 0.1, 0.3) + 0.3, duration: 0.5 }}
                className="h-full rounded-full"
                style={{ backgroundColor: cat.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
