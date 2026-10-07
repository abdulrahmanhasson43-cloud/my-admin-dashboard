import type { ReactNode } from 'react';
import { ReceiptIcon, XIcon } from '@/components/icons';

interface CartSheetProps {
  /** True when the cart has no lines: the sheet shows its empty state instead of `children`. */
  isEmpty: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** CartSheet — the bottom sheet that opens from the cart icon: backdrop, header and the empty state. */
export default function CartSheet({ isEmpty, onClose, children }: CartSheetProps) {
  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-[70] animate-in fade-in duration-200"
      />
      <div className="fixed bottom-0 inset-x-0 z-[75] bg-white rounded-t-[24px] max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
        <div className="w-10 h-1 rounded-full bg-[var(--vuno-border)] mx-auto mt-3 mb-1" />
        <div className="flex items-center justify-between px-5 pt-2 pb-3 sticky top-0 bg-white">
          <h3 className="font-semibold text-[16px] text-[var(--vuno-text)] flex items-center gap-2">
            <ReceiptIcon size={17} />
            سلة المشتريات
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--vuno-bg)]">
            <XIcon size={16} className="text-[var(--vuno-text-secondary)]" />
          </button>
        </div>

        <div className="px-5 pb-6">
          {isEmpty ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-[var(--vuno-bg)] flex items-center justify-center mx-auto mb-3">
                <ReceiptIcon size={22} className="text-[var(--vuno-text-muted)]" />
              </div>
              <p className="text-[var(--vuno-text-muted)] text-[14px]">السلة فارغة</p>
              <p className="text-[12px] text-[var(--vuno-text-muted)] mt-1">اضغط على منتج لإضافته</p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </>
  );
}
