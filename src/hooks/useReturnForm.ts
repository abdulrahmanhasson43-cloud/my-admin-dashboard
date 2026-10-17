import { useMemo, useState } from 'react';
import { useProducts } from '@/context/products-context-value';
import { useInvoices } from '@/hooks/useInvoices';
import { calcSubtotal } from '@/lib/pricing';
import { buildReturnItems, canSubmitReturn, clampQuantity, quantityOf, returnableItems } from '@/lib/returns';
import type { CreateReturnInput } from '@/services/return';
import type { ReturnReason, ReturnType } from '@/types/return';

/**
 * useReturnForm — everything the "new return" form remembers and works out: who, which invoice, the reason,
 * which products are ticked and how many, and the refund preview. What can be returned, how many, and the
 * checks are in lib/returns.ts; this hook only holds the state and hands the rules what they need.
 */
export function useReturnForm(type: ReturnType) {
  const { invoices } = useInvoices();
  const { products } = useProducts();
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  // Invoices load a moment after the form opens, so "no choice yet" means the first one in the list
  // (what the dropdown shows) — never an empty id.
  const [chosenInvoiceId, setChosenInvoiceId] = useState('');
  const originalInvoiceId = chosenInvoiceId || invoices[0]?.id || '';
  const [reason, setReason] = useState<ReturnReason>('defective');
  const [reasonNote, setReasonNote] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const available = useMemo(
    () => returnableItems(type, invoices.find(i => i.id === originalInvoiceId), products),
    [type, invoices, originalInvoiceId, products],
  );

  const items = buildReturnItems(available, selectedProducts, quantities);

  // Preview only — ReturnService computes the authoritative total with the same rule.
  const refundAmount = calcSubtotal(items);

  const chooseInvoice = (id: string) => {
    setChosenInvoiceId(id);
    // The products on offer belong to the invoice, so ticks and quantities start again.
    setSelectedProducts({});
    setQuantities({});
  };

  const isSelected = (productId: string) => !!selectedProducts[productId];
  const setSelected = (productId: string, selected: boolean) =>
    setSelectedProducts(prev => ({ ...prev, [productId]: selected }));
  const quantityFor = (productId: string) => quantityOf(quantities, productId);
  const setQuantity = (productId: string, raw: number, maxQty: number) =>
    setQuantities(prev => ({ ...prev, [productId]: clampQuantity(raw, maxQty) }));

  /** What to send to the service, or null while the form is not ready (no name, or nothing ticked). */
  const buildInput = (): CreateReturnInput | null =>
    canSubmitReturn(partyName, items.length)
      ? { type, partyName, partyPhone, originalInvoiceId, items, reason, reasonNote }
      : null;

  return {
    invoices, originalInvoiceId, chooseInvoice,
    partyName, setPartyName, partyPhone, setPartyPhone,
    reason, setReason, reasonNote, setReasonNote,
    available, isSelected, setSelected, quantityFor, setQuantity,
    refundAmount, buildInput,
  };
}
