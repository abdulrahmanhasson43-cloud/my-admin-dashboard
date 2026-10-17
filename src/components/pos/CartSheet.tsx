import { ReceiptIcon, XIcon } from '@/components/icons';
import type { CartItem } from '@/types';
import type { PaymentMethodConfig } from '@/types/settings';
import type { SelectedCustomer } from '@/components/CustomerSelection';
import CartLines from './CartLines';
import CartTotals from './CartTotals';
import LoyaltyPointsNotice from './LoyaltyPointsNotice';
import CartPaymentPanel from './CartPaymentPanel';
import CustomerPickerButton from './CustomerPickerButton';
import CartActionBar from './CartActionBar';

interface CartSheetProps {
  cart: CartItem[];
  totals: { subtotal: number; tax: number; total: number };
  onClose: () => void;
  onChangeQuantity: (id: string, delta: number) => void;
  onSetQuantity: (id: string, value: number) => void;
  onRemove: (id: string) => void;
  customer: SelectedCustomer | null;
  onPickCustomer: () => void;
  /** Loyalty points this sale earns for the selected customer. */
  loyaltyPoints: number;
  paymentMethods: PaymentMethodConfig[];
  selectedMethod: string;
  onSelectMethod: (id: string) => void;
  amountPaid: string;
  onAmountPaidChange: (value: string) => void;
  paidNumber: number;
  change: number;
  onQuickPay: (amount: number) => void;
  onHold: () => void;
  onPay: () => void;
  onPayWithAmount: () => void;
}

/** The cart, opened from the cart icon as a bottom sheet: lines, totals, customer, payment and the pay button. */
export default function CartSheet({
  cart, totals, onClose, onChangeQuantity, onSetQuantity, onRemove, customer, onPickCustomer, loyaltyPoints,
  paymentMethods, selectedMethod, onSelectMethod, amountPaid, onAmountPaidChange, paidNumber, change,
  onQuickPay, onHold, onPay, onPayWithAmount,
}: CartSheetProps) {
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
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-[var(--vuno-bg)] flex items-center justify-center mx-auto mb-3">
                <ReceiptIcon size={22} className="text-[var(--vuno-text-muted)]" />
              </div>
              <p className="text-[var(--vuno-text-muted)] text-[14px]">السلة فارغة</p>
              <p className="text-[12px] text-[var(--vuno-text-muted)] mt-1">اضغط على منتج لإضافته</p>
            </div>
          ) : (
            <>
              <CartLines
                cart={cart}
                onChangeQuantity={onChangeQuantity}
                onSetQuantity={onSetQuantity}
                onRemove={onRemove}
              />
              <CartTotals subtotal={totals.subtotal} tax={totals.tax} total={totals.total} />
              {customer && (
                <LoyaltyPointsNotice customer={customer} points={loyaltyPoints} total={totals.total} />
              )}
              <CartPaymentPanel
                methods={paymentMethods}
                selectedMethod={selectedMethod}
                onSelectMethod={onSelectMethod}
                total={totals.total}
                amountPaid={amountPaid}
                onAmountPaidChange={onAmountPaidChange}
                change={change}
                onQuickPay={onQuickPay}
              />
              <CustomerPickerButton customer={customer} onClick={onPickCustomer} />
              <CartActionBar
                total={totals.total}
                amountPaid={amountPaid}
                paidNumber={paidNumber}
                onHold={onHold}
                onPay={onPay}
                onPayWithAmount={onPayWithAmount}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
