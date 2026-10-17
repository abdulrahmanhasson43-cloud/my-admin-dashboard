import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { XIcon } from '@/components/icons';
import ReturnItemsPicker from '@/components/returns/ReturnItemsPicker';
import { useReturnForm } from '@/hooks/useReturnForm';
import type { CreateReturnInput } from '@/services/return';
import { returnReasons, type ReturnReason, type ReturnType } from '@/types/return';

/**
 * CreateReturnModal — the "new return" form. It only gathers input (the state is in useReturnForm, the rules in
 * lib/returns). Building the actual ReturnRequest (id, status, refundAmount, date) is ReturnService's job:
 * this modal just calls onCreate with the raw input.
 */
export default function CreateReturnModal({
  type,
  onClose,
  onCreate,
}: {
  type: ReturnType;
  onClose: () => void;
  onCreate: (input: CreateReturnInput) => void;
}) {
  const form = useReturnForm(type);
  const {
    invoices, originalInvoiceId, chooseInvoice,
    partyName, setPartyName, partyPhone, setPartyPhone,
    reason, setReason, reasonNote, setReasonNote,
    available, isSelected, setSelected, quantityFor, setQuantity,
    refundAmount,
  } = form;

  const handleCreate = () => {
    const input = form.buildInput();
    if (!input) {
      toast.error('أدخل اسم العميل/المورد واختر منتج واحد على الأقل');
      return;
    }
    onCreate(input);
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
              onChange={(e) => chooseInvoice(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[var(--vuno-border)] text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--vuno-primary)]/30"
            >
              {invoices.map(inv => (
                <option key={inv.id} value={inv.id}>{inv.id} — {inv.customer}</option>
              ))}
            </select>
          </div>

          <ReturnItemsPicker
            items={available}
            isSelected={isSelected}
            quantityFor={quantityFor}
            onToggle={setSelected}
            onQuantityChange={setQuantity}
          />

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
