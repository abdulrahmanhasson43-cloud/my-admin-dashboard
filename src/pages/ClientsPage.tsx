import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, UsersIcon, PhoneIcon, ReceiptIcon, EditIcon, TrashIcon, EyeIcon } from '@/components/icons';
import { sampleClients } from '@/services/mock';
import StatsRow from '@/components/StatsRow';
import SearchBar from '@/components/SearchBar';
import QRCodeButton from '@/components/QRCodeButton';
import { useDeviceType } from '@/hooks/useDeviceType';

interface ClientForm {
  name: string;
  phone: string;
  email: string;
}

const emptyForm: ClientForm = { name: '', phone: '', email: '' };

export default function ClientsPage() {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [clients, setClients] = useState(sampleClients);

  const filtered = clients.filter(c =>
    c.name.includes(search) || c.phone.includes(search)
  );

  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalRevenue = clients.reduce((s, c) => s + c.totalPurchases, 0);

  const handleSave = () => {
    if (!form.name.trim()) return;
    setClients(prev => [...prev, {
      id: Date.now().toString(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      totalPurchases: 0,
      lastVisit: new Date().toISOString().slice(0, 10),
      status: 'active',
    }]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const stats = [
    { label: 'إجمالي العملاء', value: clients.length.toString(), icon: UsersIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
    { label: 'العملاء النشطين', value: activeClients.toString(), icon: UsersIcon, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'إجمالي المشتريات', value: `${(totalRevenue / 1000).toFixed(1)}K EGP`, icon: ReceiptIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
  ];

  const addButton = (
    <button
      onClick={() => { setShowForm(!showForm); setForm(emptyForm); }}
      className="h-11 px-4 sm:px-5 rounded-full text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0"
      style={{ background: 'var(--vuno-primary)' }}
    >
      <PlusIcon size={16} />
      عميل جديد
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <StatsRow items={stats} maxCols={3} />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="ابحث بالاسم أو رقم الهاتف..."
        qrValue={`VUNO:CLIENTS:${clients.length}:${activeClients}active`}
        qrLabel="QR Code — العملاء"
        actions={addButton}
      />

      {/* Add Form — حقول controlled تقبل الكتابة */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="card-vuno p-5"
        >
          <h3 className="font-bold text-[var(--vuno-text)] mb-4">إضافة عميل جديد</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[12px] text-[var(--vuno-text-secondary)] mb-1.5 block">الاسم</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="اسم العميل"
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
                placeholder="example@mail.com"
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

      {/* العملاء: بطاقات على الموبايل، جدول على الديسكتوب */}
      {isMobile ? (
        <div className="space-y-3">
          {filtered.map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              className="card-vuno p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-[var(--vuno-surface-pearl)] flex items-center justify-center flex-shrink-0">
                    <span className="text-[var(--vuno-primary)] font-bold text-base">{client.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-[var(--vuno-text)] truncate">{client.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <PhoneIcon size={12} className="text-[var(--vuno-text-muted)]" />
                      <p className="text-xs text-[var(--vuno-text-muted)]">{client.phone}</p>
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${client.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                  {client.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
              </div>

              <div className="rounded-xl bg-[var(--vuno-bg)] p-3 mb-3">
                <p className="text-[10px] text-[var(--vuno-text-muted)] mb-0.5">إجمالي المشتريات</p>
                <p className="text-lg font-bold text-[var(--vuno-primary)]">{client.totalPurchases.toLocaleString()} EGP</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[var(--vuno-border-light)]">
                <QRCodeButton
                  value={`VUNO:CLIENT:${client.id}:${client.name}:${client.phone}`}
                  label={`QR Code — ${client.name}`}
                  iconSize={16}
                  title="عرض QR Code"
                />
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
            <div className="card-vuno p-8 text-center text-[var(--vuno-text-muted)]">
              <UsersIcon size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">لا يوجد عملاء مطابقون للبحث</p>
            </div>
          )}
        </div>
      ) : (
        /* قايمة العملاء — ديسكتوب فقط */
        <div className="card-vuno overflow-hidden">
          <div className="list-header">
            <span className="flex-1 min-w-0">العميل</span>
            <span className="w-32 flex-shrink-0">إجمالي المشتريات</span>
            <span className="w-28 flex-shrink-0">آخر زيارة</span>
            <span className="w-24 flex-shrink-0">الحالة</span>
            <span className="w-32 flex-shrink-0">إجراءات</span>
          </div>
          {filtered.map((client, i) => (
            <motion.div key={client.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.05, 0.3) }} className="list-row">
              <span className="flex-1 min-w-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--vuno-surface-pearl)] flex items-center justify-center flex-shrink-0">
                  <span className="text-[var(--vuno-primary)] font-bold">{client.name.charAt(0)}</span>
                </div>
                <span className="min-w-0">
                  <p className="text-sm font-medium text-[var(--vuno-text)] truncate">{client.name}</p>
                  <p className="text-xs text-[var(--vuno-text-muted)]">{client.phone}</p>
                </span>
              </span>
              <span className="w-32 flex-shrink-0 text-sm font-bold text-[var(--vuno-primary)]">{client.totalPurchases.toLocaleString()} EGP</span>
              <span className="w-28 flex-shrink-0 text-sm text-[var(--vuno-text-muted)]">{client.lastVisit}</span>
              <span className="w-24 flex-shrink-0">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${client.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                  {client.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
              </span>
              <span className="w-32 flex-shrink-0 flex items-center gap-1.5">
                <QRCodeButton
                  value={`VUNO:CLIENT:${client.id}:${client.name}:${client.phone}`}
                  label={`QR Code — ${client.name}`}
                  iconSize={16}
                  title="عرض QR Code"
                />
                <button className="p-1.5 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-text-secondary)]" aria-label="عرض"><EyeIcon size={14} /></button>
                <button className="p-1.5 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-primary)]" aria-label="تعديل"><EditIcon size={14} /></button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" aria-label="حذف"><TrashIcon size={14} /></button>
              </span>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-[var(--vuno-text-muted)]">
              <UsersIcon size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">لا يوجد عملاء مطابقون للبحث</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
