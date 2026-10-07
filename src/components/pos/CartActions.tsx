import { PauseIcon } from '@/components/icons';

interface CartActionsProps {
  amountPaid: string;
  paidNumber: number;
  total: number;
  onHold: () => void;
  onPayWithAmount: () => void;
  onCheckout: () => void;
}

/** الفكرة #13 — CartActions: Hold Order + the green Pay button (pays the typed amount when there is one). */
export default function CartActions({
  amountPaid, paidNumber, total, onHold, onPayWithAmount, onCheckout,
}: CartActionsProps) {
  return (
    <div className="flex gap-2 mb-2">
      <button
        onClick={onHold}
        className="flex items-center justify-center gap-1.5 h-12 px-5 rounded-full font-semibold text-[14px] transition-transform active:scale-95 flex-shrink-0"
        style={{
          background: 'var(--vuno-surface)',
          border: '1px solid var(--vuno-border)',
          color: 'var(--vuno-text-secondary)',
        }}
      >
        <PauseIcon size={16} />
        تعليق
      </button>
      {amountPaid ? (
        <button
          onClick={onPayWithAmount}
          disabled={paidNumber < total}
          className="flex-1 h-12 rounded-full text-white font-semibold text-[17px] transition-transform active:scale-95 disabled:opacity-50"
          style={{ background: '#16a34a' }}
        >
          دفع {paidNumber.toLocaleString()} EGP
        </button>
      ) : (
        <button
          onClick={onCheckout}
          className="flex-1 h-12 rounded-full text-white font-semibold text-[17px] transition-transform active:scale-95"
          style={{ background: '#16a34a' }}
        >
          دفع {total.toLocaleString()} EGP
        </button>
      )}
    </div>
  );
}
