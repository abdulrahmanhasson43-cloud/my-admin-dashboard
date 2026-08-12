import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  PlusIcon, RefundIcon, DollarSignIcon, PackageIcon,
  XIcon, CheckIcon,
} from '@/components/icons';
import StatsRow from '@/components/StatsRow';
import { sampleInvoices } from '@/services/mock/invoices';
import { sampleReturns } from '@/services/mock/returns';
import { generateNumericId } from '@/lib/utils';
import {
  returnReasons, getReturnReasonLabel, getReturnStatusMeta,
  type ReturnRequest, type ReturnType, type ReturnStatus, type ReturnReason,
} from '@/types/return';

type Tab = 'customer' | 'supplier';

const TABS: { id: Tab; label: string }[] = [
  { id: 'customer', label: 'مرتجعات العملاء' },
  { id: 'supplier', label: 'مرتجعات الموردين' },
];

/* ─────────────────────────────────────────────────────────────────────
   ReturnCard — a single return request card
   ───────────────────────────────────────────────────────────────────── */
function ReturnCard({
  ret,
  onAdvance,
}: {
  ret: ReturnRequest;
  onAdvance: (id: string) => void;
}) {
  const statusMeta = getReturnStatusMeta(ret.status);
  const totalQty = ret.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl border border-[var(--vuno-border)] p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="font-bold text-[15px] text-[var(--vuno-text)]">{ret.id}</span>
          <p className="text-[13px] text-[var(--vuno-text-secondary)] mt-0.5">{ret.partyName}</p>
          {ret.partyPhone && (
            <p className="text-[12px] text-[var(--vuno-text-muted)]" dir="ltr">{ret.partyPhone}</p>
          )}
        </div>
        <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${statusMeta.badgeBg} ${statusMeta.badgeText}`}>
          {statusMeta.label}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1.5 mb-3">
        {ret.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between bg-[var(--vuno-surface)] rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <PackageIcon size={16} className="text-[var(--vuno-text-muted)]" />
              <span className="text-[13px] text-[var(--vuno-text)]">{item.name}</span>
            </div>
            <span className="text-[12px] text-[var(--vuno-text-secondary)]">×{item.quantity}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-3 pt-1">
          <span className="text-[11px] text-[var(--vuno-text-muted)]">إجمالي القطع</span>
          <span className="text-[12px] font-semibold text-[var(--vuno-text-secondary)]">{totalQty} قطعة</span>
        </div>
      </div>

      {/* Reason */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[12px] text-[var(--vuno-text-muted)]">السبب:</span>
        <span className="text-[12px] font-medium text-[var(--vuno-text-secondary)]">{getReturnReasonLabel(ret.reason)}</span>
      </div>
      {ret.reasonNote && (
        <p className="text-[12px] text-[var(--vuno-text-muted)] mb-3 bg-[var(--vuno-surface)] rounded-xl px-3 py-2">{ret.reasonNote}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--vuno-border)]">
        <div>
          <span className="text-[11px] text-[var(--vuno-text-muted)] block">{ret.date}</span>
          <span className="font-bold text-[15px] text-[var(--vuno-danger)]">{ret.refundAmount.toLocaleString()} ج.م</span>
        </div>
        {ret.status !== 'refunded' && (
          <button
            onClick={() => onAdvance(ret.id)}
            className="h-9 px-3 rounded-xl text-white text-[13px] font-medium flex items-center gap-1.5 hover:opacity-90"
            style={{ background: 'var(--vuno-primary)' }}
          >
            <CheckIcon size={14} />
            {ret.status === 'pending' ? 'قبول' : 'استرداد'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   ReturnListRow — flat list row (mobile), no boxed card
   ───────────────────────────────────────────────────────────────────── */
function ReturnListRow({ ret, onAdvance }: { ret: ReturnRequest; onAdvance: (id: string) => void }) {
  const statusMeta = getReturnStatusMeta(ret.status);
  const totalQty = ret.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="py-3.5 border-b border-[var(--vuno-border-light)] last:border-0">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[14px] text-[var(--vuno-text)]">{ret.id}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusMeta.badgeBg} ${statusMeta.badgeText}`}>
              {statusMeta.label}
            </span>
          </div>
          <p className="text-[13px] text-[var(--vuno-text-secondary)] truncate">{ret.partyName}</p>
        </div>
        <span className="font-bold text-[14px] tabular-nums text-[var(--vuno-danger)] flex-shrink-0">
          {ret.refundAmount.toLocaleString()} ج.م
        </span>
      </div>
      <p className="text-[12px] text-[var(--vuno-text-muted)] truncate">
        {ret.items.map(i => i.name).join('، ')} ({totalQty} قطعة) — {getReturnReasonLabel(ret.reason)}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-[var(--vuno-text-muted)]">{ret.date}</span>
        {ret.status !== 'refunded' && (
          <button
            onClick={() => onAdvance(ret.id)}
            className="h-8 px-3 rounded-lg text-white text-[12px] font-medium flex items-center gap-1 hover:opacity-90"
            style={{ background: 'var(--vuno-primary)' }}
          >
            <CheckIcon size={12} />
            {ret.status === 'pending' ? 'قبول' : 'استرداد'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   CreateReturnModal — create a new return request
   ───────────────────────────────────────────────────────────────────── */
function CreateReturnModal({
  type,
  onClose,
  onCreate,
}: {
  type: ReturnType;
  onClose: () => void;
  onCreate: (ret: ReturnRequest) => void;
}) {
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [originalInvoiceId, setOriginalInvoiceId] = useState(sampleInvoices[0]?.id ?? '');
  const [reason, setReason] = useState<ReturnReason>('defective');
  const [reasonNote, setReasonNote] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Build a fake product list from the selected invoice (mock)
  const invoiceProducts = useMemo(() => {
    const inv = sampleInvoices.find(i => i.id === originalInvoiceId);
    if (!inv) return [];
    // Mock: create 2-3 items based on the invoice
    return [
      { productId: '1', name: 'سماعة بلوتوث لاسلكية', price: 250, maxQty: 5 },
      { productId: '3', name: 'كابل USB-C 2م', price: 45, maxQty: 10 },
      { productId: '5', name: 'ماوس لاسلكي', price: 120, maxQty: 3 },
    ].slice(0, Math.max(1, inv.items));
  }, [originalInvoiceId]);

  const items = invoiceProducts
    .filter(p => selectedProducts[p.productId] && quantities[p.productId] > 0)
    .map(p => ({ productId: p.productId, name: p.name, quantity: quantities[p.productId], price: p.price }));

  const refundAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleCreate = () => {
    if (!partyName.trim() || items.length === 0) {
      toast.error('أدخل اسم العميل/المورد واختر منتج واحد على الأقل');
      return;
    }
    const ret: ReturnRequest = {
      id: generateNumericId('RET', 100, 999),
      type,
      partyName: partyName.trim(),
      partyPhone: partyPhone.trim() || undefined,
      originalInvoiceId,
      items,
      reason,
      reasonNote: reasonNote.trim() || undefined,
      status: 'pending',
      refundAmount,
      date: new Date().toISOString().slice(0, 10),
    };
    onCreate(ret);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--vuno-border)]">
          <h3 className="font-bold text-lg text-[var(--vuno-text)]">
            {type === 'customer' ? 'مرتجع عميل' : 'مرتجع مورد'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100">
            <XIcon size={20} className="text-[var(--vuno-text-muted)]" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">
              {type === 'customer' ? 'اسم العميل' : 'اسم المورد'}
            </label>
            <input
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder={type === 'customer' ? 'مثال: أحمد محمد' : 'مثال: شركة التقنية'}
              className="w-full h-11 px-4 rounded-xl border border-[var(--vuno-border)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--vuno-primary)]/30"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">رقم الهاتف</label>
            <input
              value={partyPhone}
              onChange={(e) => setPartyPhone(e.target.value)}
              placeholder="01000000000"
              dir="ltr"
              className="w-full h-11 px-4 rounded-xl border border-[var(--vuno-border)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--vuno-primary)]/30"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">الفاتورة الأصلية</label>
            <select
              value={originalInvoiceId}
              onChange={(e) => setOriginalInvoiceId(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[var(--vuno-border)] text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--vuno-primary)]/30"
            >
              {sampleInvoices.map(inv => (
                <option key={inv.id} value={inv.id}>{inv.id} — {inv.customer}</option>
              ))}
            </select>
          </div>

          {/* Product selection */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">المنتجات المرتجعة</label>
            <div className="space-y-2">
              {invoiceProducts.map(p => (
                <div key={p.productId} className="flex items-center gap-2 bg-[var(--vuno-surface)] rounded-xl px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={!!selectedProducts[p.productId]}
                    onChange={(e) => setSelectedProducts(prev => ({ ...prev, [p.productId]: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[var(--vuno-primary)]"
                  />
                  <span className="flex-1 text-[13px] text-[var(--vuno-text)]">{p.name}</span>
                  <input
                    type="number"
                    min={1}
                    max={p.maxQty}
                    value={quantities[p.productId] ?? 1}
                    onChange={(e) => setQuantities(prev => ({ ...prev, [p.productId]: Math.min(p.maxQty, Math.max(1, Number(e.target.value))) }))}
                    disabled={!selectedProducts[p.productId]}
                    className="w-16 h-8 px-2 rounded-lg border border-[var(--vuno-border)] text-[13px] disabled:opacity-40 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">السبب</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReturnReason)}
              className="w-full h-11 px-4 rounded-xl border border-[var(--vuno-border)] text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--vuno-primary)]/30"
            >
              {returnReasons.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">ملاحظات (اختياري)</label>
            <textarea
              value={reasonNote}
              onChange={(e) => setReasonNote(e.target.value)}
              rows={2}
              placeholder="تفاصيل إضافية..."
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--vuno-border)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--vuno-primary)]/30 resize-none"
            />
          </div>

          {refundAmount > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-[var(--vuno-border)]">
              <span className="font-bold text-[var(--vuno-text)]">مبلغ الاسترداد</span>
              <span className="font-bold text-[var(--vuno-danger)]">{refundAmount.toLocaleString()} ج.م</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-5 border-t border-[var(--vuno-border)]">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-[var(--vuno-border)] font-medium text-[var(--vuno-text-secondary)] hover:bg-gray-50">
            إلغاء
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 h-11 rounded-xl text-white font-medium hover:opacity-90"
            style={{ background: 'var(--vuno-primary)' }}
          >
            إرسال للمراجعة
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ReturnsPage() {
  const [tab, setTab] = useState<Tab>('customer');
  const [returns, setReturns] = useState<ReturnRequest[]>(sampleReturns);
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() =>
    returns.filter(r => r.type === tab).sort((a, b) => b.date.localeCompare(a.date)),
  [returns, tab]);

  const advanceStatus = (id: string) => {
    setReturns(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const next: ReturnStatus = r.status === 'pending' ? 'approved' : 'refunded';
        toast.success(`تم تحديث حالة المرتجع إلى ${getReturnStatusMeta(next).label}`);
        return { ...r, status: next };
      }),
    );
  };

  const handleCreate = (ret: ReturnRequest) => {
    setReturns(prev => [ret, ...prev]);
    setShowModal(false);
    toast.success(`تم إنشاء المرتجع ${ret.id}`);
  };

  const pendingCount = returns.filter(r => r.status === 'pending').length;
  const refundedCount = returns.filter(r => r.status === 'refunded').length;
  const totalRefund = returns.filter(r => r.status === 'refunded').reduce((s, r) => s + r.refundAmount, 0);

  const stats = [
    { label: 'إجمالي المرتجعات', value: returns.length.toString(), icon: RefundIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
    { label: 'قيد المراجعة', value: pendingCount.toString(), icon: PackageIcon, color: 'bg-orange-50 text-orange-600' },
    { label: 'تم الاسترداد', value: refundedCount.toString(), icon: CheckIcon, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'إجمالي المسترد', value: `${(totalRefund / 1000).toFixed(1)}K ج.م`, icon: DollarSignIcon, color: 'bg-red-50 text-[var(--vuno-danger)]' },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto">
      <StatsRow items={stats} />

      {/* Tabs + Add button */}
      <div className="flex items-center justify-between gap-3 mt-5 mb-4">
        <div className="flex gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.id
                  ? 'gradient-btn text-white'
                  : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="h-11 px-4 rounded-full text-white font-medium flex items-center gap-2 hover:opacity-90 flex-shrink-0 whitespace-nowrap"
          style={{ background: 'var(--vuno-primary)' }}
        >
          <PlusIcon size={18} />
          <span className="hidden sm:inline">مرتجع جديد</span>
        </button>
      </div>

      {/* Returns list — flat rows on mobile, boxed-card grid on desktop
          where the extra width makes cards feel natural again */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <RefundIcon size={48} className="text-[var(--vuno-text-muted)] mb-3" />
          <p className="text-[var(--vuno-text-secondary)] font-medium">لا توجد مرتجعات {tab === 'customer' ? 'للعملاء' : 'للموردين'} حالياً</p>
          <p className="text-[var(--vuno-text-muted)] text-sm mt-1">اضغط "مرتجع جديد" لإنشاء واحد</p>
        </div>
      ) : (
        <>
          <div className="lg:hidden">
            {filtered.map(ret => (
              <ReturnListRow key={ret.id} ret={ret} onAdvance={advanceStatus} />
            ))}
          </div>
          <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(ret => (
              <ReturnCard key={ret.id} ret={ret} onAdvance={advanceStatus} />
            ))}
          </div>
        </>
      )}

      {showModal && (
        <CreateReturnModal type={tab} onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
