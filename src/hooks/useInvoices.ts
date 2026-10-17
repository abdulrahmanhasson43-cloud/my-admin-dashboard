import { useCallback, useEffect, useState } from 'react';
import type { Invoice } from '@/types/invoice';
import type { CreateInvoiceInput } from '@/services/invoice';
import { useInvoiceService } from '@/context/invoice-service-context';
import { toErrorMessage } from '@/lib/utils';

/**
 * useInvoices — layers ordinary React state (loading/error/invoices/refetch)
 * on top of InvoiceService so components get a familiar reactive API, while
 * every bit of business logic and data access stays in InvoiceService +
 * IInvoiceRepository underneath.
 *
 * A failed read is recorded in `error` instead of being swallowed, and every
 * mutation re-throws after recording the message so the page can show the
 * banner and keep its own try/catch around the action.
 */
export function useInvoices() {
  const invoiceService = useInvoiceService();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pure fetch — returns the snapshot WITHOUT touching state, so it can be
  // reused by the initial effect and by refetch, and calling it from an effect
  // doesn't trip react-hooks/set-state-in-effect.
  const load = useCallback(() => invoiceService.getAllInvoices(), [invoiceService]);

  // Initial read — state updates live inside promise callbacks, and the
  // cancelled flag guards against updating an unmounted component.
  useEffect(() => {
    let cancelled = false;
    load()
      .then((all) => {
        if (cancelled) return;
        setInvoices(all);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(toErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await load();
      setInvoices(all);
      setError(null);
    } catch (e: unknown) {
      setError(toErrorMessage(e));
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [load]);

  const createInvoice = useCallback(async (input: CreateInvoiceInput) => {
    try {
      const created = await invoiceService.createInvoice(input);
      setInvoices(prev => [created, ...prev]);
      return created;
    } catch (e: unknown) {
      setError(toErrorMessage(e));
      throw e;
    }
  }, [invoiceService]);

  const markAsPaid = useCallback(async (id: string) => {
    try {
      const updated = await invoiceService.markAsPaid(id);
      setInvoices(prev => prev.map(i => (i.id === id ? updated : i)));
      return updated;
    } catch (e: unknown) {
      setError(toErrorMessage(e));
      throw e;
    }
  }, [invoiceService]);

  const cancelInvoice = useCallback(async (id: string) => {
    try {
      const updated = await invoiceService.cancelInvoice(id);
      setInvoices(prev => prev.map(i => (i.id === id ? updated : i)));
      return updated;
    } catch (e: unknown) {
      setError(toErrorMessage(e));
      throw e;
    }
  }, [invoiceService]);

  return { invoices, isLoading, error, refetch, createInvoice, markAsPaid, cancelInvoice };
}
