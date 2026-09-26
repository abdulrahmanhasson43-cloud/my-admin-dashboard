import { useState } from 'react';
import { motion } from 'framer-motion';
import { PauseIcon, XIcon } from '@/components/icons';

/* أسباب تعليق الطلب — الفكرة #12 */
export const HOLD_REASONS = [
  'العميل راح يجيب فلوس',
  'انتظار تأكيد',
  'أخرى',
] as const;

export type HoldReason = (typeof HOLD_REASONS)[number];

interface HoldOrderPopupProps {
  /** إجمالي الطلب — يُعرض في النافذة للمساعدة في القرار */
  total: number;
  itemCount: number;
  onConfirm: (customerName: string, reason: HoldReason) => void;
  onCancel: () => void;
}

/**
 * نافذة تعليق الطلب — الفكرة #12
 *
 * يفتحها الكاشير عند تعليق طلب. تطلب:
 * - اسم العميل أو ملاحظة (اختياري)
 * - سبب التعليق (dropdown)
 *
 * عند التأكيد يُستدعى onConfirm بالاسم والسبب.
 */
export default function HoldOrderPopup({ total, itemCount, onConfirm, onCancel }: HoldOrderPopupProps) {
  const [customerName, setCustomerName] = useState('');
  const [reason, setReason] = useState<HoldReason>(HOLD_REASONS[0]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* رأس النافذة */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--vuno-border)]">
          <h3 className="font-bold text-[17px] text-[var(--vuno-text)] flex items-center gap-2">
            <PauseIcon size={18} className="text-[var(--vuno-text)]" />
            تعليق الطلب
          </h3>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--vuno-bg)]"
            aria-label="إغلاق"
          >
            <XIcon size={16} className="text-[var(--vuno-text-secondary)]" />
          </button>
        </div>

        {/* ملخص سريع */}
        <div className="px-5 pt-4">
          <div className="rounded-xl bg-[var(--vuno-bg)] p-3 flex items-center justify-between">
            <span className="text-[12px] text-[var(--vuno-text-muted)]">{itemCount} منتج</span>
            <span className="text-[16px] font-bold text-[var(--vuno-primary)]">{total.toLocaleString()} EGP</span>
          </div>
        </div>

        {/* الحقول */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[12px] text-[var(--vuno-text-secondary)] mb-1.5 block">
              اسم العميل أو ملاحظة (اختياري)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="مثال: أحمد — طاولة 3"
              className="w-full h-11 px-4 rounded-xl border border-[var(--vuno-border)] text-[14px] focus:outline-none focus:border-[var(--vuno-primary)] transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[12px] text-[var(--vuno-text-secondary)] mb-1.5 block">
              سبب التعليق
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as HoldReason)}
              className="w-full h-11 px-4 rounded-xl border border-[var(--vuno-border)] text-[14px] bg-white focus:outline-none focus:border-[var(--vuno-primary)] transition-colors"
            >
              {HOLD_REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* أزرار */}
        <div className="flex gap-2 p-5 pt-0">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl border border-[var(--vuno-border)] font-semibold text-[14px] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)] transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => onConfirm(customerName.trim(), reason)}
            className="flex-1 h-11 rounded-xl text-white font-semibold text-[14px] transition-transform active:scale-95"
            style={{ background: 'var(--vuno-primary)' }}
          >
            تعليق
          </button>
        </div>
      </motion.div>
    </div>
  );
}
