import { motion } from 'framer-motion';
import { PlusIcon, XIcon } from '@/components/icons';
import { ORDER_PAYMENT_ICONS } from '@/constants/orderPaymentIcons';
import { useNewOrderForm } from '@/hooks/useNewOrderForm';
import type { CreateOrderInput } from '@/services/order';
import { paymentMethodLabels, type OrderPaymentMethod } from '@/types/order';

interface NewOrderModalProps {
  onClose: () => void;
  onCreate: (input: CreateOrderInput) => void;
}

/** NewOrderModal — create a new order (placed in the "new" column). */
export default function NewOrderModal({ onClose, onCreate }: NewOrderModalProps) {
  const {
    customerName, setCustomerName,
    customerPhone, setCustomerPhone,
    paymentMethod, setPaymentMethod,
    productName, setProductName,
    productPrice, setProductPrice,
    productQty, setProductQty,
    items, total, addItem, handleCreate,
  } = useNewOrderForm(onCreate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--vuno-border)]">
          <h3 className="font-bold text-lg text-[var(--vuno-text)]">طلب جديد</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100">
            <XIcon size={20} className="text-[var(--vuno-text-muted)]" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">اسم العميل</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="مثال: أحمد محمد"
              className="w-full h-11 px-4 rounded-xl border border-[var(--vuno-border)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--vuno-primary)]/30"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">رقم الهاتف</label>
            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="01000000000"
              dir="ltr"
              className="w-full h-11 px-4 rounded-xl border border-[var(--vuno-border)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--vuno-primary)]/30"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">طريقة الدفع</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(paymentMethodLabels) as OrderPaymentMethod[]).map(m => {
                const PayIcon = ORDER_PAYMENT_ICONS[m];
                return (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all ${
                      paymentMethod === m
                        ? 'border-[var(--vuno-primary)] bg-[var(--vuno-surface-pearl)]'
                        : 'border-[var(--vuno-border)] hover:bg-gray-50'
                    }`}
                  >
                    <PayIcon size={18} className={paymentMethod === m ? 'text-[var(--vuno-primary)]' : 'text-[var(--vuno-text-muted)]'} />
                    <span className="text-[11px]">{paymentMethodLabels[m]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">المنتجات</label>
            <div className="flex gap-2 mb-2">
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="اسم المنتج"
                className="flex-1 h-10 px-3 rounded-xl border border-[var(--vuno-border)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--vuno-primary)]/30"
              />
              <input
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                type="number"
                placeholder="السعر"
                className="w-20 h-10 px-3 rounded-xl border border-[var(--vuno-border)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--vuno-primary)]/30"
              />
              <input
                value={productQty}
                onChange={(e) => setProductQty(e.target.value)}
                type="number"
                placeholder="الكمية"
                className="w-16 h-10 px-3 rounded-xl border border-[var(--vuno-border)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--vuno-primary)]/30"
              />
              <button
                onClick={addItem}
                aria-label="إضافة المنتج"
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ background: 'var(--vuno-primary)' }}
              >
                <PlusIcon size={18} />
              </button>
            </div>
            {items.length > 0 && (
              <div className="space-y-1.5">
                {items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[var(--vuno-surface)] rounded-xl px-3 py-2 text-[13px]">
                    <span className="text-[var(--vuno-text)]">{it.name} × {it.quantity}</span>
                    <span className="font-medium text-[var(--vuno-primary)]">{(it.price * it.quantity).toLocaleString()} ج.م</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--vuno-border)]">
                  <span className="font-bold text-[var(--vuno-text)]">الإجمالي</span>
                  <span className="font-bold text-[var(--vuno-primary)]">{total.toLocaleString()} ج.م</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-[var(--vuno-border)]">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-[var(--vuno-border)] font-medium text-[var(--vuno-text-secondary)] hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 h-11 rounded-xl text-white font-medium hover:opacity-90"
            style={{ background: 'var(--vuno-primary)' }}
          >
            إنشاء الطلب
          </button>
        </div>
      </motion.div>
    </div>
  );
}
