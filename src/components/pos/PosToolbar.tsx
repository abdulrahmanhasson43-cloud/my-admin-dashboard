import { SearchIcon, BarcodeIcon, ShoppingCartIcon, ArchiveIcon } from '@/components/icons';

interface PosToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onOpenScanner: () => void;
  onOpenCart: () => void;
  /** Units in the cart; the badge shows only above zero. */
  cartItemCount: number;
  /** Held orders; the archive button shows only above zero. */
  heldCount: number;
  onOpenHeldOrders: () => void;
}

/** PosToolbar — search + barcode scan + cart (+ held orders), compact and side by side. */
export default function PosToolbar({
  search, onSearchChange, onOpenScanner, onOpenCart, cartItemCount, heldCount, onOpenHeldOrders,
}: PosToolbarProps) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1 min-w-0">
        <SearchIcon size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--vuno-text-muted)]" />
        <input
          type="text"
          data-pos-search="true"
          placeholder="ابحث بالاسم أو الباركود..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full h-10 sm:h-11 pr-10 pl-4 rounded-full bg-white text-[13px] sm:text-[14px] text-[var(--vuno-text)] placeholder:text-[var(--vuno-text-muted)] focus:outline-none focus:border-[var(--vuno-primary)] transition-colors"
          style={{ border: '1px solid rgba(0,0,0,0.08)' }}
        />
      </div>
      <button
        onClick={onOpenScanner}
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90"
        style={{ background: 'var(--vuno-primary)' }}
        aria-label="مسح باركود"
      >
        <BarcodeIcon size={17} className="text-white" />
      </button>
      <button
        onClick={onOpenCart}
        className="relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-white"
        style={{ border: '1px solid rgba(0,0,0,0.08)' }}
        aria-label="سلة المشتريات"
      >
        <ShoppingCartIcon size={17} className="text-[var(--vuno-text)]" />
        {cartItemCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
            style={{ background: 'var(--vuno-primary)' }}
          >
            {cartItemCount}
          </span>
        )}
      </button>
      {heldCount > 0 && (
        <button
          onClick={onOpenHeldOrders}
          className="relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-white"
          style={{ border: '1px solid rgba(0,0,0,0.08)' }}
          aria-label="الطلبات المعلقة"
        >
          <ArchiveIcon size={17} className="text-[var(--vuno-text)]" />
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
            style={{ background: 'var(--vuno-warning)' }}
          >
            {heldCount}
          </span>
        </button>
      )}
    </div>
  );
}
