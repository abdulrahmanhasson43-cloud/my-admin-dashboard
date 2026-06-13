import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { merchants as initialMerchants } from '../data';
import type { Merchant, MerchantStatus } from '../types';

const statusConfig: Record<MerchantStatus, { bg: string; text: string; label: string }> = {
  active:    { bg: 'bg-[#34C759]/20', text: 'text-[#34C759]', label: 'نشط' },
  pending:   { bg: 'bg-[#F5C443]/20', text: 'text-[#F5C443]', label: 'معلق' },
  suspended: { bg: 'bg-[#FF5757]/20', text: 'text-[#FF5757]', label: 'موقوف' },
};

export default function Merchants() {
  const [list, setList] = useState<Merchant[]>(initialMerchants);
  const [filter, setFilter] = useState<MerchantStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStore, setNewStore] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const filtered = list.filter((m) => {
    const matchFilter = filter === 'all' || m.status === filter;
    const matchSearch = m.name.includes(search) || m.store.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const toggleStatus = (id: string) => {
    setList((prev) => prev.map((m) => {
      if (m.id !== id) return m;
      const next: MerchantStatus = m.status === 'active' ? 'suspended' : 'active';
      return { ...m, status: next };
    }));
  };

  const addMerchant = () => {
    if (!newName || !newStore || !newEmail) return;
    const merchant: Merchant = {
      id: `M00${list.length + 1}`,
      name: newName,
      store: newStore,
      email: newEmail,
      phone: newPhone,
      shipmentsCount: 0,
      totalRevenue: 0,
      commission: 0,
      status: 'pending',
      joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };
    setList((prev) => [merchant, ...prev]);
    setNewName(''); setNewStore(''); setNewEmail(''); setNewPhone('');
    setShowAdd(false);
  };

  const filterTabs: { id: MerchantStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'الكل' },
    { id: 'active', label: 'نشط' },
    { id: 'pending', label: 'معلق' },
    { id: 'suspended', label: 'موقوف' },
  ];

  const counts = {
    all: list.length,
    active: list.filter(m => m.status === 'active').length,
    pending: list.filter(m => m.status === 'pending').length,
    suspended: list.filter(m => m.status === 'suspended').length,
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">التجار</h1>
          <p className="text-[#8E8E93] text-sm mt-1">{list.length} تاجر مسجل</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowAdd(true)}
          className="bg-[#F5C443] text-[#1C1C1E] font-bold text-sm px-4 py-2.5 rounded-xl flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
          إضافة تاجر
        </motion.button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-[#636366]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو المتجر..."
            className="w-full bg-[#2C2C2E] text-white text-sm rounded-xl pr-9 pl-4 py-2.5 outline-none border border-transparent focus:border-[#F5C443] transition-colors placeholder:text-[#636366]"
          />
        </div>
        <div className="flex gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-[#F5C443] text-[#1C1C1E]'
                  : 'bg-[#2C2C2E] text-[#8E8E93] hover:text-white'
              }`}
            >
              {tab.label} ({counts[tab.id]})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#2C2C2E] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#3A3A3C]">
                {['التاجر', 'المتجر', 'البريد الإلكتروني', 'الهاتف', 'الشحنات', 'الإيرادات', 'العمولة', 'الحالة', 'إجراء'].map((h) => (
                  <th key={h} className="text-[#8E8E93] text-xs font-medium text-right px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A3A3C]">
              {filtered.map((m, i) => {
                const sc = statusConfig[m.status];
                return (
                  <motion.tr
                    key={m.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-[#3A3A3C] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#F5C443]/20 flex items-center justify-center text-[#F5C443] text-xs font-bold flex-shrink-0">
                          {m.name.charAt(0)}
                        </div>
                        <p className="text-white text-xs font-medium">{m.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#8E8E93] text-xs">{m.store}</td>
                    <td className="px-4 py-3 text-[#8E8E93] text-xs">{m.email}</td>
                    <td className="px-4 py-3 text-[#8E8E93] text-xs whitespace-nowrap">{m.phone}</td>
                    <td className="px-4 py-3 text-white text-xs font-semibold">{m.shipmentsCount}</td>
                    <td className="px-4 py-3 text-white text-xs font-semibold">{m.totalRevenue.toLocaleString()} EGP</td>
                    <td className="px-4 py-3 text-[#F5C443] text-xs font-bold">{m.commission.toLocaleString()} EGP</td>
                    <td className="px-4 py-3">
                      <span className={`${sc.bg} ${sc.text} text-[10px] font-medium px-2.5 py-1 rounded-full`}>{sc.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(m.id)}
                        className={`text-[10px] font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          m.status === 'active'
                            ? 'bg-[#FF5757]/10 text-[#FF5757] hover:bg-[#FF5757]/20'
                            : 'bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759]/20'
                        }`}
                      >
                        {m.status === 'active' ? 'إيقاف' : 'تفعيل'}
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-[#8E8E93] text-sm">لا توجد نتائج</div>
          )}
        </div>
      </div>

      {/* Add Merchant Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#2C2C2E] rounded-2xl p-6 w-full max-w-md space-y-4"
            >
              <h2 className="text-white font-bold text-lg">إضافة تاجر جديد</h2>
              {[
                { label: 'الاسم *', val: newName, set: setNewName, ph: 'اسم التاجر' },
                { label: 'اسم المتجر *', val: newStore, set: setNewStore, ph: 'اسم المتجر' },
                { label: 'البريد الإلكتروني *', val: newEmail, set: setNewEmail, ph: 'email@example.com' },
                { label: 'الهاتف', val: newPhone, set: setNewPhone, ph: '+20 100 000 0000' },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-[#8E8E93] text-xs mb-1.5">{f.label}</label>
                  <input
                    type="text"
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.ph}
                    className="w-full bg-[#3A3A3C] text-white text-sm rounded-xl px-4 py-2.5 outline-none border border-transparent focus:border-[#F5C443] transition-colors placeholder:text-[#636366]"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 bg-[#3A3A3C] text-[#8E8E93] text-sm font-medium py-2.5 rounded-xl">
                  إلغاء
                </button>
                <button onClick={addMerchant} className="flex-1 bg-[#F5C443] text-[#1C1C1E] text-sm font-bold py-2.5 rounded-xl">
                  إضافة
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
