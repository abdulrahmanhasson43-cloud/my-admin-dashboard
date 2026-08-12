import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon, ReceiptIcon, EyeIcon, DownloadIcon, SearchIcon,
  XIcon, TrashIcon, MinusIcon, PrintIcon, TagIcon,
  CashIcon, CardIcon, WalletIcon, InstaPayIcon, ApplePayIcon
} from '@/components/icons';
import StatsRow from '@/components/StatsRow';
import SearchBar from '@/components/SearchBar';
import QRCodeButton, { QRCodeInline } from '@/components/QRCodeButton';
import WhatsAppShareButton from '@/components/WhatsAppShareButton';
import { exportToExcel } from '@/lib/export-utils';
import { formatEnglishDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { Invoice } from '@/types';
import { sampleInvoices, sampleProducts, sampleClients } from '@/services/mock';

const getMethodIcon = (method: string) => {
  switch (method) {
    case 'كاش': return CashIcon;
    case 'بطاقة': return CardIcon;
    case 'محفظة': return WalletIcon;
    case 'إنستاباي': return InstaPayIcon;
    case 'Apple Pay': return ApplePayIcon;
    default: return CashIcon;
  }
};

const PAYMENT_METHODS = ['كاش', 'بطاقة', 'محفظة', 'إنستاباي', 'Apple Pay'];
const TAX_RATE = 0.14;

/* ── Invoice Builder line item ── */
interface BuilderLine {
  uid: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
}

let lineCounter = 0;
const makeLine = (productId: string, name: string, price: number, qty = 1): BuilderLine => ({
  uid: `bl-${++lineCounter}`,
  productId,
  name,
  price,
  qty,
});

export default function InvoicePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);

  /* ── Invoice Builder state ── */
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState<BuilderLine[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('كاش');

  const filtered = sampleInvoices.filter(inv => {
    const matchSearch = inv.customer.includes(search) || inv.id.includes(search);
    const matchStatus = statusFilter === 'الكل' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalSales = sampleInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalInvoices = sampleInvoices.length;
  const paidCount = sampleInvoices.filter(i => i.status === 'paid').length;
  const pendingCount = sampleInvoices.filter(i => i.status === 'pending').length;

  /* ── Builder calculations ── */
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.price * l.qty, 0), [lines]);
  const discountAmount = subtotal * (discountPct / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * TAX_RATE;
  const grandTotal = afterDiscount + taxAmount;
  const totalQty = lines.reduce((s, l) => s + l.qty, 0);

  const filteredProducts = sampleProducts.filter(p =>
    p.name.includes(productSearch) || p.barcode.includes(productSearch)
  );

  const selectedCustomer = sampleClients.find(c => c.id === customerId);

  const addProduct = (productId: string) => {
    const product = sampleProducts.find(p => p.id === productId);
    if (!product) return;
    const existing = lines.find(l => l.productId === productId);
    if (existing) {
      setLines(prev => prev.map(l => l.productId === productId ? { ...l, qty: l.qty + 1 } : l));
    } else {
      setLines(prev => [...prev, makeLine(product.id, product.name, product.price)]);
    }
    toast.success(`تمت إضافة ${product.name}`);
  };

  const updateQty = (uid: string, delta: number) => {
    setLines(prev => prev.map(l =>
      l.uid === uid ? { ...l, qty: Math.max(1, l.qty + delta) } : l
    ));
  };

  const removeLine = (uid: string) => {
    setLines(prev => prev.filter(l => l.uid !== uid));
  };

  const resetBuilder = () => {
    setCustomerId('');
    setLines([]);
    setProductSearch('');
    setDiscountPct(0);
    setPaymentMethod('كاش');
  };

  const saveInvoice = () => {
    if (!customerId) {
      toast.error('يرجى اختيار العميل');
      return;
    }
    if (lines.length === 0) {
      toast.error('يرجى إضافة منتج واحد على الأقل');
      return;
    }
    const invoiceId = `INV-${Math.floor(2050 + Math.random() * 900)}`;
    toast.success(`تم إنشاء الفاتورة ${invoiceId} بنجاح`, {
      description: `الإجمالي: ${grandTotal.toLocaleString()} EGP • ${totalQty} منتج`,
    });
    resetBuilder();
    setBuilderOpen(false);
  };

  const statusButtons = (
    <div className="flex gap-2 overflow-x-auto scrollbar-hidden">
      {['الكل', 'paid', 'pending', 'cancelled'].map(status => (
        <button
          key={status}
          onClick={() => setStatusFilter(status)}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
            statusFilter === status
              ? 'gradient-btn text-white'
              : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-gray-50'
          }`}
        >
          {status === 'الكل' ? 'الكل' : status === 'paid' ? 'مدفوعة' : status === 'pending' ? 'معلقة' : 'ملغاة'}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats — horizontal cards */}
      <StatsRow
        maxCols={4}
        items={[
          { label: 'إجمالي الفواتير', value: totalInvoices.toString(), icon: ReceiptIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
          { label: 'إجمالي المبيعات', value: `${(totalSales / 1000).toFixed(1)}K EGP`, icon: CashIcon, color: 'bg-emerald-50 text-emerald-500' },
          { label: 'المدفوعة', value: paidCount.toString(), icon: ReceiptIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
          { label: 'المعلقة', value: pendingCount.toString(), icon: ReceiptIcon, color: 'bg-amber-50 text-amber-500' },
        ]}
      />

      {/* Controls — صف البحث والإجراء الأساسي أولاً، وصف تانٍ للفلاتر والتصدير
          تحته — عشان صف البحث ميتزحمش بعدد كبير من الأزرار جنبه. */}
      <div className="space-y-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="ابحث برقم الفاتورة أو العميل..."
          actions={
            <button
              onClick={() => { resetBuilder(); setBuilderOpen(true); }}
              className="self-start px-5 py-2.5 rounded-full btn-primary-pill text-white font-medium flex items-center gap-2 whitespace-nowrap flex-shrink-0"
            >
              <PlusIcon size={16} />
              فاتورة جديدة
            </button>
          }
          qrValue={`vuno:invoices:${totalInvoices}`}
          qrLabel="رمز QR لصفحة الفواتير"
        />

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hidden">
          {statusButtons}
          <button
            onClick={() => exportToExcel(
              filtered.map(inv => ({
                'رقم الفاتورة': inv.id,
                'العميل': inv.customer,
                'المبلغ': inv.amount,
                'الضريبة': inv.tax,
                'الإجمالي': inv.total,
                'طريقة الدفع': inv.method,
                'التاريخ': inv.date,
                'الحالة': inv.status === 'paid' ? 'مدفوعة' : inv.status === 'pending' ? 'معلقة' : 'ملغاة',
              })),
              'فواتير-Vuno',
              'الفواتير',
            )}
            className="px-4 py-2.5 rounded-full font-medium flex items-center gap-2 transition-transform active:scale-95 whitespace-nowrap flex-shrink-0"
            style={{ border: '1px solid var(--vuno-border)', color: 'var(--vuno-text)', background: 'var(--vuno-surface)' }}
          >
            <DownloadIcon size={16} />
            تصدير
          </button>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedInvoice(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="invoice-print-area bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[var(--vuno-surface-pearl)] flex items-center justify-center mx-auto mb-3">
                <ReceiptIcon size={28} className="text-[var(--vuno-primary)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--vuno-text)]">{selectedInvoice.id}</h3>
              <p className="text-sm text-[var(--vuno-text-muted)]">{formatEnglishDate(selectedInvoice.date)}</p>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between"><span className="text-[var(--vuno-text-muted)]">العميل</span><span className="font-medium">{selectedInvoice.customer}</span></div>
              <div className="flex justify-between"><span className="text-[var(--vuno-text-muted)]">المبلغ</span><span className="font-medium">{selectedInvoice.amount.toLocaleString()} EGP</span></div>
              <div className="flex justify-between"><span className="text-[var(--vuno-text-muted)]">الضريبة</span><span className="font-medium">{selectedInvoice.tax.toLocaleString()} EGP</span></div>
              <div className="flex justify-between border-t pt-2"><span className="font-bold">الإجمالي</span><span className="font-bold text-[var(--vuno-primary)]">{selectedInvoice.total.toLocaleString()} EGP</span></div>
            </div>

            {/* QR code for invoice — يظهر مباشرة، بدون ضغطة إضافية */}
            <div className="flex justify-center mb-6">
              <QRCodeInline value={`vuno:invoice:${selectedInvoice.id}`} />
            </div>

            <button
              onClick={() => setSelectedInvoice(null)}
              className="w-full py-3 rounded-xl gradient-btn text-white font-semibold"
            >
              إغلاق
            </button>
            <button
              onClick={() => window.print()}
              className="w-full mt-2 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 print:hidden"
              style={{ border: '1px solid var(--vuno-border)', color: 'var(--vuno-text)' }}
            >
              <PrintIcon size={16} />
              طباعة الفاتورة
            </button>
            {/* WhatsApp Share (Idea #21) */}
            <div className="w-full mt-2 print:hidden">
              <WhatsAppShareButton
                invoice={selectedInvoice}
                variant="pill"
                label="مشاركة عبر واتساب"
                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 !text-white"
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ── Invoice Builder Side Panel ── */}
      <AnimatePresence>
        {builderOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm print:hidden"
              onClick={() => setBuilderOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-full max-w-md bg-[var(--vuno-surface)] shadow-2xl overflow-y-auto flex flex-col"
            >
              {/* Panel Header */}
              <div className="sticky top-0 z-10 bg-[var(--vuno-surface)] px-5 py-4 border-b border-[var(--vuno-border)] flex items-center justify-between print:hidden">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[var(--vuno-surface-pearl)] flex items-center justify-center">
                    <ReceiptIcon size={18} className="text-[var(--vuno-primary)]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--vuno-text)]">منشئ الفواتير</h2>
                    <p className="text-xs text-[var(--vuno-text-muted)]">أنشئ فاتورة جديدة تفاعلية</p>
                  </div>
                </div>
                <button
                  onClick={() => setBuilderOpen(false)}
                  className="p-2 rounded-xl hover:bg-[var(--vuno-bg)] text-[var(--vuno-text-muted)] transition-colors"
                >
                  <XIcon size={20} />
                </button>
              </div>

              {/* Panel Body */}
              <div className="flex-1 px-5 py-4 space-y-5">
                {/* Customer Selection */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--vuno-text)] mb-2">العميل</label>
                  <select
                    value={customerId}
                    onChange={e => setCustomerId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium border border-[var(--vuno-border)] bg-white text-[var(--vuno-text)] focus:outline-none focus:ring-2 focus:ring-[var(--vuno-primary)]/30"
                  >
                    <option value="">— اختر العميل —</option>
                    {sampleClients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} • {c.phone}</option>
                    ))}
                  </select>
                  {selectedCustomer && (
                    <div className="mt-2 px-3 py-2 rounded-lg bg-[var(--vuno-surface-pearl)] text-xs text-[var(--vuno-text-secondary)] flex items-center justify-between">
                      <span>{selectedCustomer.email}</span>
                      <span className="font-medium text-[var(--vuno-primary)]">{selectedCustomer.totalPurchases.toLocaleString()} EGP</span>
                    </div>
                  )}
                </div>

                {/* Product Search & Selection */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--vuno-text)] mb-2">إضافة منتجات</label>
                  <div className="relative">
                    <SearchIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--vuno-text-muted)]" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder="ابحث بالاسم أو الباركود..."
                      className="w-full pr-10 pl-4 py-3 rounded-xl text-sm border border-[var(--vuno-border)] bg-white text-[var(--vuno-text)] focus:outline-none focus:ring-2 focus:ring-[var(--vuno-primary)]/30"
                    />
                  </div>
                  <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-[var(--vuno-border)] divide-y divide-[var(--vuno-border)]">
                    {filteredProducts.map(p => {
                      const inCart = lines.some(l => l.productId === p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => addProduct(p.id)}
                          className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-[var(--vuno-surface-pearl)] transition-colors text-right"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[var(--vuno-text)] truncate">{p.name}</p>
                            <p className="text-xs text-[var(--vuno-text-muted)]">{p.category} • متوفر {p.storeStock}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm font-bold text-[var(--vuno-primary)]">{p.price} EGP</span>
                            {inCart ? (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-600 text-[10px] font-medium">في السلة</span>
                            ) : (
                              <PlusIcon size={16} className="text-[var(--vuno-primary)]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                    {filteredProducts.length === 0 && (
                      <p className="px-3 py-4 text-center text-sm text-[var(--vuno-text-muted)]">لا توجد منتجات مطابقة</p>
                    )}
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--vuno-text)] mb-2">
                    عناصر الفاتورة ({lines.length})
                  </label>
                  {lines.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-[var(--vuno-border)] py-8 text-center">
                      <TagIcon size={28} className="mx-auto text-[var(--vuno-text-muted)] mb-2" />
                      <p className="text-sm text-[var(--vuno-text-muted)]">لم تتم إضافة منتجات بعد</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lines.map(line => (
                        <motion.div
                          key={line.uid}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          className="rounded-xl border border-[var(--vuno-border)] bg-white p-3"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-medium text-[var(--vuno-text)] flex-1">{line.name}</p>
                            <button
                              onClick={() => removeLine(line.uid)}
                              className="p-1 rounded-lg hover:bg-red-50 text-red-400 transition-colors flex-shrink-0"
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQty(line.uid, -1)}
                                className="w-7 h-7 rounded-lg border border-[var(--vuno-border)] flex items-center justify-center text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)] transition-colors"
                              >
                                <MinusIcon size={14} />
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-[var(--vuno-text)]">{line.qty}</span>
                              <button
                                onClick={() => updateQty(line.uid, 1)}
                                className="w-7 h-7 rounded-lg border border-[var(--vuno-border)] flex items-center justify-center text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)] transition-colors"
                              >
                                <PlusIcon size={14} />
                              </button>
                              <span className="text-xs text-[var(--vuno-text-muted)]">× {line.price} EGP</span>
                            </div>
                            <span className="text-sm font-bold text-[var(--vuno-primary)]">{(line.price * line.qty).toLocaleString()} EGP</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Discount & Payment Method */}
                {lines.length > 0 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--vuno-text)] mb-2">الخصم (%)</label>
                      <div className="flex items-center gap-2">
                        {[0, 5, 10, 15, 20].map(pct => (
                          <button
                            key={pct}
                            onClick={() => setDiscountPct(pct)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 ${
                              discountPct === pct
                                ? 'gradient-btn text-white'
                                : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-gray-50'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--vuno-text)] mb-2">طريقة الدفع</label>
                      <div className="grid grid-cols-3 gap-2">
                        {PAYMENT_METHODS.map(method => {
                          const Icon = getMethodIcon(method);
                          return (
                            <button
                              key={method}
                              onClick={() => setPaymentMethod(method)}
                              className={`px-2 py-2.5 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                                paymentMethod === method
                                  ? 'gradient-btn text-white'
                                  : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-gray-50'
                              }`}
                            >
                              <Icon size={16} />
                              {method}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Live Summary */}
                    <div className="rounded-2xl bg-[var(--vuno-surface-pearl)] p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--vuno-text-muted)]">المجموع الفرعي</span>
                        <span className="font-medium text-[var(--vuno-text)]">{subtotal.toLocaleString()} EGP</span>
                      </div>
                      {discountPct > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--vuno-text-muted)]">الخصم ({discountPct}%)</span>
                          <span className="font-medium text-emerald-500">−{discountAmount.toLocaleString()} EGP</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--vuno-text-muted)]">ضريبة القيمة المضافة (14%)</span>
                        <span className="font-medium text-[var(--vuno-text)]">{taxAmount.toLocaleString()} EGP</span>
                      </div>
                      <div className="flex justify-between border-t border-[var(--vuno-border)] pt-2">
                        <span className="font-bold text-[var(--vuno-text)]">الإجمالي</span>
                        <span className="font-bold text-lg text-[var(--vuno-primary)]">{grandTotal.toLocaleString()} EGP</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Panel Footer Actions */}
              <div className="sticky bottom-0 bg-[var(--vuno-surface)] px-5 py-4 border-t border-[var(--vuno-border)] space-y-2 print:hidden">
                <button
                  onClick={saveInvoice}
                  className="w-full py-3 rounded-xl gradient-btn text-white font-semibold flex items-center justify-center gap-2"
                >
                  <ReceiptIcon size={18} />
                  حفظ الفاتورة
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    disabled={lines.length === 0}
                    className="flex-1 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ border: '1px solid var(--vuno-border)', color: 'var(--vuno-text)' }}
                  >
                    <PrintIcon size={16} />
                    طباعة
                  </button>
                  <button
                    onClick={resetBuilder}
                    className="flex-1 py-2.5 rounded-xl font-medium text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)] transition-colors"
                    style={{ border: '1px solid var(--vuno-border)' }}
                  >
                    مسح
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Invoices — modern list rows on desktop, hidden on mobile (cards below) */}
      <div className="hidden md:block card-vuno overflow-hidden">
        <div className="list-header">
          <span className="w-24 flex-shrink-0">رقم الفاتورة</span>
          <span className="flex-1 min-w-0">العميل</span>
          <span className="w-20 flex-shrink-0 text-center">المنتجات</span>
          <span className="w-28 flex-shrink-0">المبلغ</span>
          <span className="w-28 flex-shrink-0">الإجمالي</span>
          <span className="w-28 flex-shrink-0">الدفع</span>
          <span className="w-36 flex-shrink-0">التاريخ</span>
          <span className="w-20 flex-shrink-0">الحالة</span>
          <span className="w-24 flex-shrink-0">إجراءات</span>
        </div>
        {filtered.map((inv, i) => {
          const MethodIcon = getMethodIcon(inv.method);
          return (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              className="list-row cursor-pointer"
              onClick={() => setSelectedInvoice(inv)}
            >
              <span className="w-24 flex-shrink-0 text-sm font-medium text-[var(--vuno-text)]">{inv.id}</span>
              <span className="flex-1 min-w-0 text-sm font-medium text-[var(--vuno-text)] truncate">{inv.customer}</span>
              <span className="w-20 flex-shrink-0 text-sm text-[var(--vuno-text-muted)] text-center">{inv.items}</span>
              <span className="w-28 flex-shrink-0 text-sm text-[var(--vuno-text)]">{inv.amount.toLocaleString()} EGP</span>
              <span className="w-28 flex-shrink-0 text-sm font-bold text-[var(--vuno-primary)]">{inv.total.toLocaleString()} EGP</span>
              <span className="w-28 flex-shrink-0 flex items-center gap-1.5">
                <MethodIcon size={14} className="text-[var(--vuno-text-muted)]" />
                <span className="text-xs text-[var(--vuno-text-secondary)]">{inv.method}</span>
              </span>
              <span className="w-36 flex-shrink-0 text-xs text-[var(--vuno-text-muted)]">{formatEnglishDate(inv.date)}</span>
              <span className="w-20 flex-shrink-0">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  inv.status === 'paid' ? 'bg-emerald-100 text-emerald-600' :
                  inv.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'pending' ? 'معلقة' : 'ملغاة'}
                </span>
              </span>
              <span className="w-24 flex-shrink-0 flex items-center gap-1">
                <div onClick={e => e.stopPropagation()}>
                  <QRCodeButton value={`vuno:invoice:${inv.id}`} label={`رمز QR للفاتورة ${inv.id}`} iconSize={14} />
                  <WhatsAppShareButton invoice={inv} variant="icon" size="sm" />
                </div>
                <button className="p-1.5 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-primary)]" onClick={e => { e.stopPropagation(); setSelectedInvoice(inv); }}>
                  <EyeIcon size={14} />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-green-50 text-green-500" onClick={e => e.stopPropagation()}>
                  <DownloadIcon size={14} />
                </button>
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile invoice cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((inv, i) => {
          const MethodIcon = getMethodIcon(inv.method);
          return (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              className="card-vuno p-4"
              onClick={() => setSelectedInvoice(inv)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-mono font-bold text-[var(--vuno-text)]">{inv.id}</p>
                  <p className="text-xs text-[var(--vuno-text-muted)] mt-0.5">{inv.customer}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  inv.status === 'paid' ? 'bg-emerald-100 text-emerald-600' :
                  inv.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'pending' ? 'معلقة' : 'ملغاة'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[var(--vuno-border-light)]">
                <div className="flex items-center gap-1.5">
                  <MethodIcon size={14} className="text-[var(--vuno-text-muted)]" />
                  <span className="text-xs text-[var(--vuno-text-secondary)]">{inv.method}</span>
                  <span className="text-xs text-[var(--vuno-text-muted)]">• {inv.items} منتج</span>
                </div>
                <p className="text-base font-bold text-[var(--vuno-primary)]">{inv.total.toLocaleString()} EGP</p>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--vuno-border-light)]">
                <span className="text-xs text-[var(--vuno-text-muted)]">{formatEnglishDate(inv.date)}</span>
                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                  <QRCodeButton value={`vuno:invoice:${inv.id}`} label={`رمز QR للفاتورة ${inv.id}`} iconSize={14} />
                  <WhatsAppShareButton invoice={inv} variant="icon" size="sm" />
                  <button className="p-1.5 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-primary)]" onClick={() => setSelectedInvoice(inv)}>
                    <EyeIcon size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card-vuno p-8 text-center text-[var(--vuno-text-muted)] text-sm">لا توجد فواتير مطابقة</div>
        )}
      </div>
    </div>
  );
}
