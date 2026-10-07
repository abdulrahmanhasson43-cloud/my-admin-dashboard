import { useMemo, useState } from 'react';
import { calcChange } from '@/services/sale';

interface PaymentMethodOption {
  id: string;
}

/**
 * usePosPayment — how the customer is paying: the chosen method, the amount
 * handed over, and the change owed.
 *
 * `selectedPayment` records what the cashier tapped; `effectivePayment` is the
 * method actually used. If the merchant switches the chosen method off in
 * Settings, the effective one falls back to the first enabled method — derived
 * during render rather than fixed up in an effect.
 */
export function usePosPayment(enabledMethods: PaymentMethodOption[], total: number) {
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');

  const effectivePayment = useMemo(() => {
    const stillEnabled = enabledMethods.some(m => m.id === selectedPayment);
    if (stillEnabled || enabledMethods.length === 0) return selectedPayment;
    return enabledMethods[0].id;
  }, [enabledMethods, selectedPayment]);

  const paidNumber = parseFloat(amountPaid) || 0;
  const change = calcChange(total, paidNumber);

  return { selectedPayment, setSelectedPayment, effectivePayment, amountPaid, setAmountPaid, paidNumber, change };
}
