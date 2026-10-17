import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { CartItem, CompletedSale } from '@/types';
import { useCompleteSale } from '@/hooks/useCompleteSale';
import { evaluateTender } from '@/services/sale';

/** How long the "payment done" tick stays up before the receipt replaces it. */
const SUCCESS_ANIMATION_MS = 1200;

/** Plays the "payment done" sound; a blocked or missing sound never stops a sale. */
function playSuccessSound(): void {
  try {
    void new Audio('/sounds/payment-success.mp3').play().catch(() => undefined);
  } catch {
    // Audio is optional feedback — ignore failures.
  }
}

interface UsePosCheckoutParams {
  cart: CartItem[];
  total: number;
  /** The payment method the cashier has effectively selected. */
  effectivePayment: string;
  /** The "amount paid" box as typed (empty when nothing was typed). */
  amountPaid: string;
  /** The same box as a number. */
  paidNumber: number;
  setSelectedPayment: (id: string) => void;
  setAmountPaid: (value: string) => void;
  /** Called once a sale is saved and the success tick is done — the page clears the cart and closes the sheet. */
  onSaleSettled: () => void;
}

/**
 * usePosCheckout — ringing up the cart: the guarded checkout, quick pay, and
 * pay-with-typed-amount, plus the success tick and the finished receipt.
 */
export function usePosCheckout({
  cart, total, effectivePayment, amountPaid, paidNumber, setSelectedPayment, setAmountPaid, onSaleSettled,
}: UsePosCheckoutParams) {
  const completeSale = useCompleteSale();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);
  const settleTimer = useRef<number | undefined>(undefined);

  // Leaving the screen during the success tick must not fire the timer into a screen that is gone.
  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  /**
   * Rings up the cart in `paymentMethod`. The method is a parameter (not read
   * from state) because Quick Pay switches to cash and checks out in the SAME
   * click — state set a line earlier is not visible yet, so reading it would
   * charge the previously selected method.
   */
  const checkout = async (paymentMethod: string) => {
    if (cart.length === 0) return;
    // Re-entrancy guard: never let two checkouts race on the same cart.
    if (isCheckingOut) return;

    // The sale is persisted FIRST; the cart is only cleared once the use case
    // confirms it. If it fails the products context has already surfaced the
    // error (banner + toast) and the cart stays intact so the cashier can
    // retry — this is what prevents the "double sale" scenario.
    setIsCheckingOut(true);
    const sale = await completeSale({ cart, paymentMethod });
    if (!sale) {
      setIsCheckingOut(false);
      return;
    }

    // The sale is safely persisted — now the success feedback and the reset.
    playSuccessSound();
    setShowSuccess(true);
    settleTimer.current = window.setTimeout(() => {
      setCompletedSale(sale);
      setShowSuccess(false);
      onSaleSettled();
      setIsCheckingOut(false);
    }, SUCCESS_ANIMATION_MS);
  };

  /** Pays with the method the cashier selected. */
  const checkoutWithSelected = () => checkout(effectivePayment);

  /** A quick-pay button: the amount is handed over in cash, so the sale is rung up in cash. */
  const quickPay = (amount: number) => {
    if (cart.length === 0) return;
    setAmountPaid(String(amount));
    setSelectedPayment('cash');
    const tender = evaluateTender(total, amount);
    if (tender.kind === 'change') {
      toast.success(`الباقي: ${tender.change.toLocaleString()} جنيه`, {
        description: `المبلغ المدفوع: ${amount.toLocaleString()} | الإجمالي: ${total.toLocaleString()}`,
      });
    } else if (tender.kind === 'exact') {
      toast.success('تم الدفع بالظبط');
    }
    if (tender.kind !== 'short') {
      void checkout('cash');
      setAmountPaid('');
    }
  };

  /** Pays with the amount the cashier typed, refusing when it does not cover the total. */
  const payWithAmount = () => {
    if (cart.length === 0) return;
    const tender = evaluateTender(total, paidNumber);
    if (tender.kind === 'short') {
      toast.error('المبلغ أقل من الإجمالي', {
        description: `منفضل تدفع ${total.toLocaleString()} أو أكتر`,
      });
      return;
    }
    if (tender.kind === 'change') {
      toast.success(`الباقي: ${tender.change.toLocaleString()} جنيه`);
    } else {
      toast.success('تم الدفع بالظبط');
    }
    void checkoutWithSelected();
    setAmountPaid('');
  };

  /** Ctrl+Enter: use the typed amount when it covers the total, otherwise just pay. */
  const payNow = () => {
    if (cart.length === 0) return;
    if (amountPaid && paidNumber >= total) payWithAmount();
    else void checkoutWithSelected();
  };

  /** Leaves the receipt screen for a fresh sale. */
  const startNewSale = () => setCompletedSale(null);

  return {
    showSuccess, completedSale, startNewSale,
    checkoutWithSelected, quickPay, payWithAmount, payNow,
  };
}
