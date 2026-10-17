import { CheckIcon } from '@/components/icons';
import { getReturnReasonLabel, getReturnStatusMeta, type ReturnRequest } from '@/types/return';

/** A single return request as a flat list row (mobile), no boxed card. */
export default function ReturnListRow({ ret, onAdvance }: { ret: ReturnRequest; onAdvance: (id: string) => void }) {
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
