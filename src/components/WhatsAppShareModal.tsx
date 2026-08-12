import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  WhatsAppIcon, XIcon, SendIcon, ReceiptIcon, ClockIcon,
  TagIcon, CheckCircleIcon, StarIcon, PhoneIcon,
} from '@/components/icons';
import type { Invoice, CompletedSale } from '@/types';

/** The five WhatsApp message types the merchant can choose from.
    Each generates a different message template with placeholders
    filled from the invoice/sale data. */
export type WhatsAppMessageType =
  | 'invoice'
  | 'payment-reminder'
  | 'special-offer'
  | 'order-status'
  | 'review-request';

interface MessageTypeMeta {
  id: WhatsAppMessageType;
  label: string;
  icon: React.FC<{ className?: string; size?: number }>;
  color: string;
}

const messageTypes: MessageTypeMeta[] = [
  { id: 'invoice', label: 'فاتورة', icon: ReceiptIcon, color: 'var(--vuno-primary)' },
  { id: 'payment-reminder', label: 'تذكير دفع', icon: ClockIcon, color: 'var(--vuno-warning)' },
  { id: 'special-offer', label: 'عرض خاص', icon: TagIcon, color: 'var(--vuno-success)' },
  { id: 'order-status', label: 'حالة الطلب', icon: CheckCircleIcon, color: 'var(--vuno-primary)' },
  { id: 'review-request', label: 'طلب تقييم', icon: StarIcon, color: 'var(--vuno-warning)' },
];

/** Build the WhatsApp message text for a given type, using data from
    either a mock Invoice (invoices page) or a CompletedSale (POS). */
function buildMessage(
  type: WhatsAppMessageType,
  data: { id: string; customer?: string; total?: number; amount?: number; date?: string },
): string {
  const name = data.customer || 'العميل العزيز';
  const total = (data.total ?? data.amount ?? 0).toLocaleString();

  switch (type) {
    case 'invoice':
      return (
        `🧾 *فاتورة من Vuno*\n\n` +
        `مرحباً ${name}،\n` +
        `إليك فاتورتك رقم *${data.id}*\n` +
        `الإجمالي: *${total} EGP*\n` +
        `التاريخ: ${data.date || new Date().toLocaleDateString('ar-EG')}\n\n` +
        `شكراً لتعاملكم معنا 🙏`
      );
    case 'payment-reminder':
      return (
        `⏰ *تذكير بالدفع*\n\n` +
        `مرحباً ${name}،\n` +
        `نذكركم بوجود فاتورة مستحقة رقم *${data.id}*\n` +
        `المبلغ المطلوب: *${total} EGP*\n\n` +
        `يرجى السداد في أقرب وقت.\n` +
        `شكراً لتفهمكم 🙏`
      );
    case 'special-offer':
      return (
        `🎉 *عرض خاص لك*\n\n` +
        `مرحباً ${name}،\n` +
        `بمناسبة تعاملكم معنا، نقدم لكم عرضاً خاصاً!\n` +
        `استمتع بخصم حصري على منتجاتنا المختارة.\n\n` +
        `العروض لفترة محدودة — لا تفوت الفرصة! 🛍️`
      );
    case 'order-status':
      return (
        `📦 *تحديث حالة الطلب*\n\n` +
        `مرحباً ${name}،\n` +
        `طلبكم رقم *${data.id}* قيد التجهيز.\n` +
        `سنبقيكم على اطلاع بكل تحديث.\n\n` +
        `شكراً لصبركم 🙏`
      );
    case 'review-request':
      return (
        `⭐ *رأيك يهمنا*\n\n` +
        `مرحباً ${name}،\n` +
        `نتمنى أن تكون تجربتك مع Vuno ممتازة!\n` +
        `شاركنا تقييمك — رأيك يساعدنا على التحسّن.\n\n` +
        `اضغط على النجوم لتقييم خدمتنا ⭐⭐⭐⭐⭐`
      );
  }
}

interface WhatsAppShareModalProps {
  open: boolean;
  onClose: () => void;
  /** Either a mock Invoice (invoices page) or a CompletedSale (POS).
      At least one must be provided. */
  invoice?: Invoice;
  sale?: CompletedSale;
}

/**
 * الفكرة #21 — نافذة مشاركة عبر واتساب.
 * تتيح اختيار نوع الرسالة (فاتورة، تذكير دفع، عرض خاص، حالة طلب، طلب تقييم)،
 * ومعاينة الرسالة قبل الإرسال، ثم الفتح عبر رابط wa.me.
 */
export default function WhatsAppShareModal({ open, onClose, invoice, sale }: WhatsAppShareModalProps) {
  const [selectedType, setSelectedType] = useState<WhatsAppMessageType>('invoice');
  const [phone, setPhone] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset to invoice type whenever a new modal opens
  useEffect(() => {
    if (open) setSelectedType('invoice');
  }, [open]);

  // Derive display data from whichever source was passed
  const data = useMemo(() => {
    if (invoice) {
      return {
        id: invoice.id,
        customer: invoice.customer,
        total: invoice.total,
        amount: invoice.amount,
        date: invoice.date,
      };
    }
    if (sale) {
      return {
        id: sale.id,
        customer: undefined,
        total: sale.total,
        amount: sale.subtotal,
        date: sale.date,
      };
    }
    return { id: '', customer: '', total: 0, amount: 0, date: '' };
  }, [invoice, sale]);

  const message = useMemo(
    () => buildMessage(selectedType, data),
    [selectedType, data],
  );

  const handleSend = () => {
    // Build a wa.me link — strip non-digits from phone, default to no
    // country-code prefix so the merchant can add it in WhatsApp.
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;

    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success('تم فتح واتساب', { description: 'تأكد من إرسال الرسالة' });
    onClose();
  };

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          dir="rtl"
        >
          <motion.div
            ref={dialogRef}
            initial={{ y: 40, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-[var(--vuno-border)] rounded-t-3xl">
              <div className="w-10 h-1 rounded-full bg-[var(--vuno-border)] mx-auto mb-3 sm:hidden" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'color-mix(in srgb, #25D366 12%, transparent)' }}
                  >
                    <WhatsAppIcon size={18} className="text-[#25D366]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] text-[var(--vuno-text)]">مشاركة عبر واتساب</h3>
                    <p className="text-[11px] text-[var(--vuno-text-muted)]">اختر نوع الرسالة ثم أرسل</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--vuno-bg)]"
                >
                  <XIcon size={16} className="text-[var(--vuno-text-secondary)]" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Message type selection */}
              <div>
                <label className="text-[12px] font-semibold text-[var(--vuno-text-secondary)] mb-2 block">
                  نوع الرسالة
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {messageTypes.map(mt => {
                    const Icon = mt.icon;
                    const selected = selectedType === mt.id;
                    return (
                      <button
                        key={mt.id}
                        onClick={() => setSelectedType(mt.id)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all active:scale-95"
                        style={{
                          background: selected
                            ? `color-mix(in srgb, ${mt.color} 10%, transparent)`
                            : 'var(--vuno-surface-pearl)',
                          border: selected
                            ? `1.5px solid ${mt.color}`
                            : '1px solid var(--vuno-border-light)',
                        }}
                      >
                        <Icon size={18} className={selected ? '' : 'text-[var(--vuno-text-muted)]'} />
                        <span
                          className="text-[11px] font-medium text-center leading-tight"
                          style={{ color: selected ? mt.color : 'var(--vuno-text-secondary)' }}
                        >
                          {mt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Phone number input */}
              <div>
                <label className="text-[12px] font-semibold text-[var(--vuno-text-secondary)] mb-1.5 block">
                  رقم واتساب المستلِم (اختياري)
                </label>
                <div className="relative">
                  <PhoneIcon size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--vuno-text-muted)]" />
                  <input
                    type="tel"
                    dir="ltr"
                    inputMode="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full h-11 rounded-xl pr-10 pl-4 text-[14px] text-left"
                    style={{
                      background: 'var(--vuno-surface)',
                      border: '1px solid var(--vuno-border)',
                      color: 'var(--vuno-text)',
                    }}
                  />
                </div>
                <p className="text-[10px] text-[var(--vuno-text-muted)] mt-1">
                  اتركه فارغاً ليفتح واتساب لاختيار جهة الاتصال يدوياً
                </p>
              </div>

              {/* Message preview */}
              <div>
                <label className="text-[12px] font-semibold text-[var(--vuno-text-secondary)] mb-1.5 block">
                  معاينة الرسالة
                </label>
                <div
                  className="rounded-2xl p-4 max-h-[200px] overflow-y-auto"
                  style={{ background: '#dcf8c6', border: '1px solid #c5f0a8' }}
                >
                  <pre className="whitespace-pre-wrap text-[13px] text-[#075e54] font-sans leading-relaxed">
                    {message}
                  </pre>
                </div>
              </div>

              {/* Send button */}
              <button
                onClick={handleSend}
                className="w-full h-12 rounded-full text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-transform active:scale-95"
                style={{ background: '#25D366' }}
              >
                <SendIcon size={18} className="text-white" />
                إرسال عبر واتساب
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
