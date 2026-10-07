import { motion, AnimatePresence } from 'framer-motion';
import { ReceiptIcon, SearchIcon, XIcon, TrashIcon, MinusIcon, PlusIcon, PrintIcon, TagIcon } from '@/components/icons';
import { INVOICE_PAYMENT_METHODS } from '@/constants/invoice';
import { getMethodIcon } from '@/components/invoice/paymentMethodIcon';
import type { InvoiceBuilder } from '@/hooks/useInvoiceBuilder';
import type { Client } from '@/types';

interface InvoiceBuilderPanelProps {
  open: boolean;
  onClose: () => void;
  builder: InvoiceBuilder;
  clients: Client[];
}

/** Side panel for creating an invoice: pick a customer, add products, discount, payment, save. */
export default function InvoiceBuilderPanel({ open, onClose, builder, clients }: InvoiceBuilderPanelProps) {
  const {
    customerId, setCustomerId, lines, productSearch, setProductSearch, discountPct, setDiscountPct,
    paymentMethod, setPaymentMethod, subtotal, discountAmount, taxAmount, grandTotal,
    filteredProducts, selectedCustomer, addProduct, updateQty, removeLine, resetBuilder, saveInvoice,
  } = builder;

  return (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm print:hidden"
          onClick={() => onClose()}
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
              onClick={() => onClose()}
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
                {clients.map(c => (
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
                    {INVOICE_PAYMENT_METHODS.map(method => {
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
              onClick={() => { void saveInvoice(); }}
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
  );
}
