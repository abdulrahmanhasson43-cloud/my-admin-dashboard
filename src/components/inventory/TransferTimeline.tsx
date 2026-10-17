import { ClockIcon, ArrowLeftIcon } from '@/components/icons';
import type { TransferHistoryEntry } from '@/context/products-context-value';

/** "سجل عمليات النقل" — the latest warehouse → shop moves. */
export default function TransferTimeline({ transferHistory }: { transferHistory: TransferHistoryEntry[] }) {
  return (
    <div className="card-vuno p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--vuno-surface-pearl)] flex items-center justify-center">
          <ClockIcon size={18} className="text-[var(--vuno-primary)]" />
        </div>
        <div>
          <h3 className="font-bold text-[var(--vuno-text)] text-sm">سجل عمليات النقل</h3>
          <p className="text-xs text-[var(--vuno-text-muted)]">آخر {transferHistory.length} عملية</p>
        </div>
      </div>
      {transferHistory.length === 0 ? (
        <div className="py-8 text-center text-sm text-[var(--vuno-text-muted)]">
          لا توجد عمليات نقل بعد — اسحب منتجاً من المستودع إلى المتجر للبدء
        </div>
      ) : (
        <div className="space-y-0 max-h-64 overflow-y-auto">
          {transferHistory.map((entry, idx) => (
            <div key={entry.id} className="flex items-start gap-3 py-2.5 border-b border-[var(--vuno-border-light)] last:border-0">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                  <ArrowLeftIcon size={14} className="text-emerald-500" />
                </div>
                {idx < transferHistory.length - 1 && (
                  <div className="absolute top-8 right-1/2 w-px h-full bg-[var(--vuno-border)]" />
                )}
              </div>
              <div className="flex-1 min-w-0 pb-2">
                <p className="text-sm font-medium text-[var(--vuno-text)] truncate">
                  نقل {entry.quantity} قطعة — {entry.productName}
                </p>
                <p className="text-xs text-[var(--vuno-text-muted)] mt-0.5">
                  من المستودع إلى المتجر • {entry.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
