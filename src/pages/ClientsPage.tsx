import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon, UsersIcon, PhoneIcon, ReceiptIcon, EditIcon, TrashIcon,
  EyeIcon, XIcon, WhatsAppIcon, StarIcon, TagIcon, ShoppingCartIcon,
  CalendarIcon, MapPinIcon, ClockIcon,
} from '@/components/icons';
import { sampleClients, clientActivities, type ClientActivity } from '@/services/mock/clients';
import type { Client } from '@/types';
import StatsRow from '@/components/StatsRow';
import SearchBar from '@/components/SearchBar';
import QRCodeButton from '@/components/QRCodeButton';
import { useDeviceType } from '@/hooks/useDeviceType';
import { formatEnglishDate } from '@/lib/utils';
// الأفكار #35 + #36 — Customer CLV + Loyalty System
import CustomerCLV from '@/components/customers/CustomerCLV';
import LoyaltySystem from '@/components/loyalty/LoyaltySystem';
import { getLoyaltySummary, pointsEarned, pointsRedeemed } from '@/services/mock';

interface ClientForm {
  name: string;
  phone: string;
  email: string;
}

const emptyForm: ClientForm = { name: '', phone: '', email: '' };

/* ─────────────────────────────────────────────────────────────────────────────
   Activity icon + color by type — used in the timeline
   ───────────────────────────────────────────────────────────────────────────── */
const ACTIVITY_META: Record<ClientActivity['type'], { color: string; label: string }> = {
  purchase: { color: 'var(--vuno-success)', label: 'شراء' },
  visit: { color: 'var(--vuno-primary)', label: 'زيارة' },
  call: { color: '#007AFF', label: 'مكالمة' },
  return: { color: 'var(--vuno-danger)', label: 'مرتجع' },
  note: { color: 'var(--vuno-warning)', label: 'ملاحظة' },
};

function ActivityDot({ type }: { type: ClientActivity['type'] }) {
  const meta = ACTIVITY_META[type];
  const Icon = type === 'purchase' || type === 'return' ? ReceiptIcon
    : type === 'visit' ? MapPinIcon
    : type === 'call' ? PhoneIcon
    : TagIcon; // note
  return (
    <span
      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: `${meta.color}1A` }}
    >
      <Icon size={15} style={{ color: meta.color } as never} />
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Side Panel — opens when a client card is clicked.
   Tabs: الملف (Profile) | المشتريات (Purchases) | التواصل (Communication)
   ───────────────────────────────────────────────────────────────────────────── */
type SidePanelTab = 'profile' | 'purchases' | 'communication' | 'loyalty';

const PANEL_TABS: { id: SidePanelTab; label: string }[] = [
  { id: 'profile', label: 'الملف' },
  { id: 'purchases', label: 'المشتريات' },
  { id: 'communication', label: 'التواصل' },
  { id: 'loyalty', label: 'الولاء' },
];

function ClientSidePanel({
  client, activities, onClose,
}: {
  client: Client;
  activities: ClientActivity[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<SidePanelTab>('profile');
  const sortedActivities = useMemo(
    () => [...activities].sort((a, b) => b.date.localeCompare(a.date)),
    [activities],
  );
  const purchaseActivities = sortedActivities.filter(a => a.type === 'purchase' || a.type === 'return');
  const totalSpent = purchaseActivities.reduce((s, a) => s + (a.amount ?? 0), 0);
  const initials = client.name.charAt(0);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />
      {/* Panel — slides from the right (RTL: appears on the right edge) */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 bottom-0 right-0 z-50 w-full max-w-[420px] bg-[var(--vuno-bg)] overflow-y-auto"
        style={{ boxShadow: '-4px 0 24px rgba(0,0,0,0.12)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[var(--vuno-bg)] px-5 pt-5 pb-3" style={{ borderBottom: '1px solid var(--vuno-border-light)' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--vuno-surface)' , border: '1px solid var(--vuno-border)' }}>
                <span className="text-[var(--vuno-primary)] font-bold text-xl">{initials}</span>
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-[var(--vuno-text)] leading-tight">{client.name}</h2>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${client.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                  {client.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
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

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-full" style={{ background: 'var(--vuno-surface-pearl)' }}>
            {PANEL_TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 h-9 rounded-full text-[13px] font-medium transition-all"
                style={{
                  background: tab === t.id ? 'var(--vuno-surface)' : 'transparent',
                  color: tab === t.id ? 'var(--vuno-text)' : 'var(--vuno-text-muted)',
                  boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-5">
          {tab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[14px] p-4" style={{ background: 'var(--vuno-surface)', border: '1px solid var(--vuno-border)' }}>
                  <p className="text-[11px] text-[var(--vuno-text-muted)] mb-1">إجمالي المشتريات</p>
                  <p className="text-[18px] font-bold text-[var(--vuno-primary)] tabular-nums">{client.totalPurchases.toLocaleString()} EGP</p>
                </div>
                <div className="rounded-[14px] p-4" style={{ background: 'var(--vuno-surface)', border: '1px solid var(--vuno-border)' }}>
                  <p className="text-[11px] text-[var(--vuno-text-muted)] mb-1">عدد العمليات</p>
                    <p className="text-[18px] font-bold text-[var(--vuno-text)] tabular-nums">{sortedActivities.length}</p>
                </div>
              </div>

              {/* Contact info */}
              <div className="rounded-[14px] p-4" style={{ background: 'var(--vuno-surface)', border: '1px solid var(--vuno-border)' }}>
                <h3 className="text-[14px] font-semibold text-[var(--vuno-text)] mb-3">معلومات التواصل</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <PhoneIcon size={18} className="text-[var(--vuno-text-muted)] flex-shrink-0" />
                    <span className="text-[14px] text-[var(--vuno-text)]" dir="ltr">{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ReceiptIcon size={18} className="text-[var(--vuno-text-muted)] flex-shrink-0" />
                    <span className="text-[14px] text-[var(--vuno-text)]" dir="ltr">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon size={18} className="text-[var(--vuno-text-muted)] flex-shrink-0" />
                    <span className="text-[14px] text-[var(--vuno-text)]">آخر زيارة: {formatEnglishDate(client.lastVisit, false)}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-[14px] p-4" style={{ background: 'var(--vuno-surface)', border: '1px solid var(--vuno-border)' }}>
                <h3 className="text-[14px] font-semibold text-[var(--vuno-text)] mb-3">النشاط الأخير</h3>
                <div className="relative">
                  {sortedActivities.slice(0, 5).map((act, i) => {
                    const meta = ACTIVITY_META[act.type];
                    return (
                      <div key={act.id} className="flex gap-3 pb-4 last:pb-0">
                        {/* Timeline line */}
                        {i < Math.min(sortedActivities.length, 5) - 1 && (
                          <div className="absolute top-8 right-4 w-px h-[calc(100%-2rem)]" style={{ background: 'var(--vuno-border-light)' }} />
                        )}
                        <ActivityDot type={act.type} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] text-[var(--vuno-text)] leading-snug">{act.description}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-[11px] text-[var(--vuno-text-muted)]">{formatEnglishDate(act.date, false)}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${meta.color}1A`, color: meta.color }}>
                              {meta.label}
                            </span>
                            {act.amount != null && (
                              <span className="text-[11px] font-semibold tabular-nums" style={{ color: act.amount < 0 ? 'var(--vuno-danger)' : 'var(--vuno-success)' }}>
                                {act.amount > 0 ? '+' : ''}{act.amount.toLocaleString()} EGP
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'purchases' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="rounded-[14px] p-4" style={{ background: 'var(--vuno-surface)', border: '1px solid var(--vuno-border)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[var(--vuno-text-muted)]">صافي الإنفاق</span>
                  <span className="text-[20px] font-bold text-[var(--vuno-primary)] tabular-nums">{totalSpent.toLocaleString()} EGP</span>
                </div>
              </div>
              {purchaseActivities.length === 0 ? (
                <div className="rounded-[14px] p-8 text-center" style={{ background: 'var(--vuno-surface)', border: '1px solid var(--vuno-border)' }}>
                  <ShoppingCartIcon size={36} className="mx-auto mb-3 text-[var(--vuno-text-muted)] opacity-40" />
                  <p className="text-[13px] text-[var(--vuno-text-muted)]">لا توجد مشتريات مسجلة</p>
                </div>
              ) : (
                purchaseActivities.map(act => (
                  <div key={act.id} className="rounded-[14px] p-4 flex items-center gap-3" style={{ background: 'var(--vuno-surface)', border: '1px solid var(--vuno-border)' }}>
                    <ActivityDot type={act.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[var(--vuno-text)] leading-snug truncate">{act.description}</p>
                      <p className="text-[11px] text-[var(--vuno-text-muted)] mt-0.5">{formatEnglishDate(act.date, false)}</p>
                    </div>
                    {act.amount != null && (
                      <span className="text-[14px] font-bold tabular-nums flex-shrink-0" style={{ color: act.amount < 0 ? 'var(--vuno-danger)' : 'var(--vuno-success)' }}>
                        {act.amount > 0 ? '+' : ''}{act.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                ))
              )}
            </motion.div>
          )}

          {tab === 'communication' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <a
                href={`https://wa.me/2${client.phone.replace(/^0/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[14px] p-4 flex items-center gap-3 transition-transform active:scale-95"
                style={{ background: '#25D366', color: 'white' }}
              >
                <WhatsAppIcon size={24} className="flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[15px] font-bold">مراسلة عبر واتساب</p>
                  <p className="text-[12px] opacity-90" dir="ltr">{client.phone}</p>
                </div>
              </a>
              <a
                href={`tel:${client.phone}`}
                className="rounded-[14px] p-4 flex items-center gap-3 transition-transform active:scale-95"
                style={{ background: 'var(--vuno-surface)', border: '1px solid var(--vuno-border)' }}
              >
                <span className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#007AFF1A' }}>
                  <PhoneIcon size={20} style={{ color: '#007AFF' } as never} />
                </span>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-[var(--vuno-text)]">اتصال هاتفي</p>
                  <p className="text-[12px] text-[var(--vuno-text-muted)]" dir="ltr">{client.phone}</p>
                </div>
              </a>
              <a
                href={`mailto:${client.email}`}
                className="rounded-[14px] p-4 flex items-center gap-3 transition-transform active:scale-95"
                style={{ background: 'var(--vuno-surface)', border: '1px solid var(--vuno-border)' }}
              >
                <span className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--vuno-surface-pearl)' }}>
                  <ReceiptIcon size={20} className="text-[var(--vuno-text-secondary)]" />
                </span>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-[var(--vuno-text)]">بريد إلكتروني</p>
                  <p className="text-[12px] text-[var(--vuno-text-muted)]" dir="ltr">{client.email}</p>
                </div>
              </a>

              {/* VIP badge for top customers */}
              {client.totalPurchases > 20000 && (
                <div className="rounded-[14px] p-4 flex items-center gap-3" style={{ background: '#FFD7001A', border: '1px solid #FFD70044' }}>
                  <StarIcon size={24} style={{ color: '#FFD700' } as never} className="flex-shrink-0" />
                  <div>
                    <p className="text-[15px] font-bold" style={{ color: '#B8860B' }}>عميل مميز (VIP)</p>
                    <p className="text-[12px] text-[var(--vuno-text-muted)]">إجمالي مشتريات يتجاوز 20,000 EGP</p>
                  </div>
                </div>
              )}

              {/* Recent calls log */}
              <div className="rounded-[14px] p-4" style={{ background: 'var(--vuno-surface)', border: '1px solid var(--vuno-border)' }}>
                <h3 className="text-[14px] font-semibold text-[var(--vuno-text)] mb-3">آخر التواصل</h3>
                {sortedActivities.filter(a => a.type === 'call' || a.type === 'note').slice(0, 3).map(act => (
                  <div key={act.id} className="flex items-center gap-3 py-2">
                    <ClockIcon size={15} className="text-[var(--vuno-text-muted)] flex-shrink-0" />
                    <p className="text-[12px] text-[var(--vuno-text)] flex-1 min-w-0">{act.description}</p>
                    <span className="text-[11px] text-[var(--vuno-text-muted)] flex-shrink-0">{formatEnglishDate(act.date, false)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* الأفكار #35 + #36 — Customer CLV + Loyalty System */}
          {tab === 'loyalty' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <CustomerCLV client={client} activities={purchaseActivities} />

              <LoyaltySystem
                summary={getLoyaltySummary(client.id)}
                clientId={client.id}
                earnedHistory={pointsEarned}
                redeemedHistory={pointsRedeemed}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════
   Main Clients Page — enhanced with Cards Grid + Side Panel (#3)
   ═════════════════════════════════════════════════════════════════════════════ */

export default function ClientsPage() {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [clients, setClients] = useState(sampleClients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filtered = clients.filter(c =>
    c.name.includes(search) || c.phone.includes(search)
  );

  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalRevenue = clients.reduce((s, c) => s + c.totalPurchases, 0);
  const vipCount = clients.filter(c => c.totalPurchases > 20000).length;

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
    { label: 'عملاء VIP', value: vipCount.toString(), icon: StarIcon, color: 'bg-amber-50 text-amber-600' },
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

  const clientActivitiesFor = (clientId: string) =>
    clientActivities.filter(a => a.clientId === clientId);

  return (
    <div className="space-y-6 animate-fade-in">
      <StatsRow items={stats} maxCols={4} />

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

      {/* العملاء: بطاقات على الموبايل والديسكتوب — مع إمكانية النقر لفتح Side Panel */}
      <div className={isMobile ? "space-y-3" : "grid sm:grid-cols-2 lg:grid-cols-3 gap-4"}>
        {filtered.map((client, i) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.3) }}
            className="card-vuno p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedClient(client)}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-[var(--vuno-surface-pearl)] flex items-center justify-center flex-shrink-0 relative">
                  <span className="text-[var(--vuno-primary)] font-bold text-base">{client.name.charAt(0)}</span>
                  {client.totalPurchases > 20000 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#FFD700' }}>
                      <StarIcon size={11} className="text-white" />
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-[var(--vuno-text)] truncate">{client.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <PhoneIcon size={12} className="text-[var(--vuno-text-muted)]" />
                    <p className="text-xs text-[var(--vuno-text-muted)]" dir="ltr">{client.phone}</p>
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

            <div className="flex items-center gap-2 pt-2 border-t border-[var(--vuno-border-light)]" onClick={e => e.stopPropagation()}>
              <QRCodeButton
                value={`VUNO:CLIENT:${client.id}:${client.name}:${client.phone}`}
                label={`QR Code — ${client.name}`}
                iconSize={16}
                title="عرض QR Code"
              />
              <button
                onClick={() => setSelectedClient(client)}
                className="flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-[var(--vuno-primary)] border border-[var(--vuno-border)] hover:bg-[var(--vuno-bg)] transition-colors text-sm font-medium"
              >
                <EyeIcon size={14} />
                التفاصيل
              </button>
              <button className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--vuno-primary)] border border-[var(--vuno-border)] hover:bg-[var(--vuno-bg)] transition-colors" aria-label="تعديل">
                <EditIcon size={14} />
              </button>
              <button className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500 border border-red-200 hover:bg-red-50 transition-colors" aria-label="حذف">
                <TrashIcon size={14} />
              </button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="card-vuno p-8 text-center text-[var(--vuno-text-muted)] col-span-full">
            <UsersIcon size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">لا يوجد عملاء مطابقون للبحث</p>
          </div>
        )}
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {selectedClient && (
          <ClientSidePanel
            client={selectedClient}
            activities={clientActivitiesFor(selectedClient.id)}
            onClose={() => setSelectedClient(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
