import { motion } from 'framer-motion';
import { PackageIcon, CheckIcon } from '@/components/icons';
import { getReturnReasonLabel, getReturnStatusMeta, type ReturnRequest } from '@/types/return';

/** A single return request as a card (desktop). */
export default function ReturnCard({
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
