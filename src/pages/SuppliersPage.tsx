import { useState } from 'react';
import { motion } from 'framer-motion';
import { SuppliersIcon, PlusIcon, PackageIcon, EditIcon, TrashIcon, PhoneIcon, WhatsAppIcon } from '@/components/icons';
import { sampleSuppliers } from '@/services/mock';
import StatsRow from '@/components/StatsRow';
import SearchBar from '@/components/SearchBar';
import QRCodeButton from '@/components/QRCodeButton';

interface SupplierForm {
  name: string;
  phone: string;
  email: string;
}

const emptyForm: SupplierForm = { name: '', phone: '', email: '' };

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SupplierForm>(emptyForm);
  const [suppliers, setSuppliers] = useState(sampleSuppliers);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filtered = suppliers.filter(s =>
    s.name.includes(search) && (statusFilter === 'all' || s.status === statusFilter)
  );

  /** تنسيق رقم الهاتف لـ WhatsApp (إزالة المسافات والشرطات وإضافة كود مصر) — الفكرة #16 */
  const formatWhatsAppNumber = (phone: string): string => {
    let cleaned = phone.replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('0')) cleaned = '20' + cleaned.slice(1);
    if (!cleaned.startsWith('20') && !cleaned.startsWith('+')) cleaned = '20' + cleaned;
    return cleaned.replace(/^\+/, '');
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    setSuppliers(prev => [...prev, {
      id: Date.now().toString(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      products: 0,
      totalOrders: 0,
      status: 'active',
    }]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const stats = [
    { label: 'إجمالي الموردين', value: suppliers.length.toString(), icon: SuppliersIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
    { label: 'نشطين', value: suppliers.filter(s => s.status === 'active').length.toString(), icon: SuppliersIcon, color: 'bg-emerald-50 text-emerald-500' },
    { label: 'إجمالي الطلبات', value: suppliers.reduce((s, x) => s + x.totalOrders, 0).toString(), icon: PackageIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
  ];

  const addButton = (
    <button
      onClick={() => { setShowForm(!showForm); setForm(emptyForm); }}
      className="h-11 px-4 sm:px-5 rounded-full text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0"
      style={{ background: 'var(--vuno-primary)' }}
    >
      <PlusIcon size={16} />
      مورد جديد
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <StatsRow items={stats} maxCols={3} />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="ابحث باسم المورد..."
        qrValue={`VUNO:SUPPLIERS:${suppliers.length}`}
        qrLabel="QR Code — الموردين"
        actions={addButton}
      />

      {/* Status Filter Pills — الفكرة #16 */}
      <div className="flex items-center gap-2">
        {([
          { key: 'all', label: 'الكل', count: suppliers.length },
          { key: 'active', label: 'نشط', count: suppliers.filter(s => s.status === 'active').length },
          { key: 'inactive', label: 'غير نشط', count: suppliers.filter(s => s.status === 'inactive').length },
        ] as const).map(pill => {
          const selected = statusFilter === pill.key;
          return (
            <button
              key={pill.key}
              onClick={() => setStatusFilter(pill.key)}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12px] font-medium transition-all active:scale-95"
              style={{
                background: selected ? 'var(--vuno-primary)' : 'var(--vuno-surface)',
                border: selected ? '1px solid var(--vuno-primary)' : '1px solid var(--vuno-border)',
                color: selected ? '#fff' : 'var(--vuno-text-secondary)',
              }}
            >
              {pill.label}
              <span
                className="text-[10px] px-1.5 rounded-full"
                style={{
                  background: selected ? 'rgba(255,255,255,0.25)' : 'var(--vuno-border-light)',
                  color: selected ? '#fff' : 'var(--vuno-text-muted)',
                }}
              >
                {pill.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add Form — حقول controlled تقبل الكتابة */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card-vuno p-5">
          <h3 className="font-bold text-[var(--vuno-text)] mb-4">إضافة مورد جديد</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[12px] text-[var(--vuno-text-secondary)] mb-1.5 block">اسم المورد</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="اسم المورد"
                className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:outline-none focus:border-[var(--vuno-primary)] focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="text-[12px] text-[var(--vuno-text-secondary)] mb-1.5 block">رقم الهاتف</label>
              <input
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="رقم الهاتف"
                className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:outline-none focus:border-[var(--vuno-primary)] focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="text-[12px] text-[var(--vuno-text-secondary)] mb-1.5 block">البريد الإلكتروني</label>
              <input
                type="email"
                inputMode="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="example@supplier.com"
                className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:outline-none focus:border-[var(--vuno-primary)] focus:bg-white transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4 justify-end">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)] transition-colors">إلغاء</button>
            <button onClick={handleSave} className="px-5 py-2.5 rounded-full text-white font-medium hover:opacity-90 transition-opacity" style={{ background: 'var(--vuno-primary)' }}>حفظ</button>
          </div>
        </motion.div>
      )}

      {/* Suppliers Cards Grid — بطاقات على جميع أحجام الشاشات (الفكرة #6)
          تم تحويل جدول الديسكتوب إلى شبكة بطاقات موحدة على كل الأحجام. */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.3) }}
            className="card-vuno p-4 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-[var(--vuno-surface-pearl)] flex items-center justify-center flex-shrink-0">
                  <SuppliersIcon size={20} className="text-[var(--vuno-primary)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-[var(--vuno-text)] truncate">{s.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <PhoneIcon size={12} className="text-[var(--vuno-text-muted)]" />
                    <p className="text-xs text-[var(--vuno-text-muted)]">{s.phone}</p>
                  </div>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${s.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                {s.status === 'active' ? 'نشط' : 'غير نشط'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="rounded-xl bg-[var(--vuno-bg)] p-3 text-center">
                <p className="text-[10px] text-[var(--vuno-text-muted)] mb-0.5">المنتجات</p>
                <p className="text-base font-bold text-[var(--vuno-text)]">{s.products}</p>
              </div>
              <div className="rounded-xl bg-[var(--vuno-bg)] p-3 text-center">
                <p className="text-[10px] text-[var(--vuno-text-muted)] mb-0.5">الطلبات</p>
                <p className="text-base font-bold text-[var(--vuno-text)]">{s.totalOrders}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[var(--vuno-border-light)]">
              <QRCodeButton
                value={`VUNO:SUPPLIER:${s.id}:${s.name}:${s.phone}:${s.email}`}
                label={`QR Code — ${s.name}`}
                iconSize={16}
                title="عرض QR Code"
              />
              {s.phone && (
                <a
                  href={`https://wa.me/${formatWhatsAppNumber(s.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors hover:opacity-90 flex-shrink-0"
                  style={{ background: '#25D366' }}
                  aria-label={`مراسلة ${s.name} على واتساب`}
                  title={`مراسلة ${s.name} على واتساب`}
                >
                  <WhatsAppIcon size={16} />
                </a>
              )}
              <button className="flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-[var(--vuno-primary)] border border-[var(--vuno-border)] hover:bg-[var(--vuno-bg)] transition-colors text-sm font-medium" aria-label="تعديل">
                <EditIcon size={14} />
                تعديل
              </button>
              <button className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500 border border-red-200 hover:bg-red-50 transition-colors" aria-label="حذف">
                <TrashIcon size={14} />
              </button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full card-vuno p-8 text-center text-[var(--vuno-text-muted)]">
            لا توجد موردين مطابقين للبحث
          </div>
        )}
      </div>
    </div>
  );
}
