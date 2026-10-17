import { XIcon } from '@/components/icons';
import { canSubmitTransfer } from '@/lib/inventory';
import type { Product } from '@/types';

interface TransferStockModalProps {
  /** The product being moved from the warehouse to the shop. */
  transferProduct: Product;
  /** The typed quantity, as text (it comes straight from the input box). */
  quantity: string;
  onQuantityChange: (value: string) => void;
  /** True when the move is only queued until a manager confirms it. */
  needsConfirmation: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

/** Bottom sheet on phones, centred dialog on larger screens: how many pieces to move to the shop. */
export default function TransferStockModal({
  transferProduct, quantity, onQuantityChange, needsConfirmation, onClose, onSubmit,
}: TransferStockModalProps) {
  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-[70] animate-in fade-in duration-200"
      />
      <div className="fixed bottom-0 inset-x-0 sm:inset-x-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:bottom-auto sm:w-full sm:max-w-md z-[75] bg-white rounded-t-[24px] sm:rounded-[20px] p-6 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[var(--vuno-text)]">نقل مخزون — {transferProduct.name}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--vuno-bg)]">
            <XIcon size={16} className="text-[var(--vuno-text-secondary)]" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-[var(--vuno-bg)] p-3 text-center">
            <p className="text-[11px] text-[var(--vuno-text-muted)] mb-1">بالمتجر الآن</p>
            <p className="text-lg font-bold text-[var(--vuno-text)]">{transferProduct.storeStock}</p>
          </div>
          <div className="rounded-xl bg-[var(--vuno-bg)] p-3 text-center">
            <p className="text-[11px] text-[var(--vuno-text-muted)] mb-1">بالمخزن الآن</p>
            <p className="text-lg font-bold text-[var(--vuno-text)]">{transferProduct.warehouseStock}</p>
          </div>
        </div>

        <label className="block text-xs text-[var(--vuno-text-secondary)] mb-1.5">الكمية المطلوب نقلها للمتجر</label>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={transferProduct.warehouseStock}
          autoFocus
          value={quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
          placeholder="0"
          className="w-full h-11 px-4 rounded-xl border border-[var(--vuno-border)] bg-white text-sm mb-2 focus:outline-none focus:border-[var(--vuno-primary)]"
        />

        {needsConfirmation && (
          <p className="text-[11px] text-[var(--vuno-text-muted)] mb-4">
            هيتحط "معلّق" لحد ما تأكد من صفحة المخزون.
          </p>
        )}

        <button
          onClick={onSubmit}
          disabled={!canSubmitTransfer(quantity, transferProduct)}
          className="w-full h-12 rounded-full text-white font-semibold text-[15px] transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          style={{ background: 'var(--vuno-primary)' }}
        >
          {needsConfirmation ? 'إرسال للتأكيد' : 'نقل الآن'}
        </button>
      </div>
    </>
  );
}
