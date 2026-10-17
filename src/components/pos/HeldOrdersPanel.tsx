import { ArchiveIcon, XIcon } from '@/components/icons';
import type { HeldOrder } from '@/types';

interface HeldOrdersPanelProps {
  orders: HeldOrder[];
  onClose: () => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
}

/** Bottom sheet listing parked POS orders (idea #8): resume or delete each one. */
export default function HeldOrdersPanel({ orders, onClose, onResume, onDelete }: HeldOrdersPanelProps) {
  return (
    <>
      <div
        onClick={() => onClose()}
        className="fixed inset-0 bg-black/40 z-[70] animate-in fade-in duration-200"
      />
      <div className="fixed bottom-0 inset-x-0 z-[75] bg-white rounded-t-[24px] max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
        <div className="w-10 h-1 rounded-full bg-[var(--vuno-border)] mx-auto mt-3 mb-1" />
        <div className="flex items-center justify-between px-5 pt-2 pb-3 sticky top-0 bg-white">
          <h3 className="font-semibold text-[16px] text-[var(--vuno-text)] flex items-center gap-2">
            <ArchiveIcon size={17} />
            الطلبات المعلقة
          </h3>
          <button onClick={() => onClose()} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--vuno-bg)]">
            <XIcon size={16} className="text-[var(--vuno-text-secondary)]" />
          </button>
        </div>
        <div className="px-5 pb-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-[var(--vuno-bg)] flex items-center justify-center mx-auto mb-3">
                <ArchiveIcon size={22} className="text-[var(--vuno-text-muted)]" />
              </div>
              <p className="text-[var(--vuno-text-muted)] text-[14px]">لا توجد طلبات معلقة</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map(order => (
                <div key={order.id} className="card-vuno p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[var(--vuno-text)] truncate">{order.label}</p>
                      <p className="text-[12px] text-[var(--vuno-text-muted)] mt-0.5">{order.createdAt}</p>
                      {order.reason && (
                        <span
                          className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ background: 'color-mix(in srgb, var(--vuno-warning) 12%, transparent)', color: 'var(--vuno-warning)' }}
                        >
                          {order.reason}
                        </span>
                      )}
                    </div>
                    <span className="text-[15px] font-bold text-[var(--vuno-primary)] flex-shrink-0">{order.total.toLocaleString()} EGP</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onResume(order.id)}
                      className="flex-1 h-9 rounded-full text-white font-semibold text-[13px] transition-transform active:scale-95"
                      style={{ background: 'var(--vuno-primary)' }}
                    >
                      استرداد
                    </button>
                    <button
                      onClick={() => onDelete(order.id)}
                      className="px-4 h-9 rounded-full font-semibold text-[13px] transition-transform active:scale-95"
                      style={{
                        background: 'color-mix(in srgb, var(--vuno-danger) 10%, transparent)',
                        color: 'var(--vuno-danger)',
                      }}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
