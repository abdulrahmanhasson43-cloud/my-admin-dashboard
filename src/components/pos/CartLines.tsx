import { MinusIcon, PlusIcon, TrashIcon } from '@/components/icons';
import type { CartItem } from '@/types';

interface CartLinesProps {
  cart: CartItem[];
  onChangeQuantity: (id: string, delta: number) => void;
  onSetQuantity: (id: string, value: number) => void;
  onRemove: (id: string) => void;
}

/** The editable list of cart lines: -/+ buttons, a typed quantity, and delete. */
export default function CartLines({ cart, onChangeQuantity, onSetQuantity, onRemove }: CartLinesProps) {
  return (
    <div className="space-y-2 mb-4">
      {cart.map(item => (
        <div
          key={item.id}
          className="flex items-center justify-between p-3 bg-[var(--vuno-bg)] rounded-[14px]"
        >
          <div className="flex-1 min-w-0 mr-2">
            <p className="text-[14px] font-semibold text-[var(--vuno-text)] truncate">{item.name}</p>
            <p className="text-[12px] text-[var(--vuno-primary)]">{item.price} EGP</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onChangeQuantity(item.id, -1)}
              className="w-8 h-8 rounded-full bg-white border border-[var(--vuno-border)] flex items-center justify-center transition-transform active:scale-90"
            >
              <MinusIcon size={13} />
            </button>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={item.quantity}
              onChange={(e) => onSetQuantity(item.id, parseInt(e.target.value, 10))}
              onFocus={(e) => e.target.select()}
              className="text-[14px] font-semibold w-11 h-8 text-center rounded-lg border border-[var(--vuno-border)] bg-white focus:outline-none focus:border-[var(--vuno-primary)]"
            />
            <button
              onClick={() => onChangeQuantity(item.id, 1)}
              className="w-8 h-8 rounded-full bg-white border border-[var(--vuno-border)] flex items-center justify-center transition-transform active:scale-90"
            >
              <PlusIcon size={13} />
            </button>
            <button
              onClick={() => onRemove(item.id)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--vuno-danger)] transition-transform active:scale-90"
              style={{ background: 'color-mix(in srgb, var(--vuno-danger) 10%, transparent)' }}
            >
              <TrashIcon size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
