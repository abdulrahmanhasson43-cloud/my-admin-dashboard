import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { Product, CartItem } from '@/types';
import { toErrorMessage } from '@/lib/utils';
import { InvalidProductError } from '@/services/product';
import { useProductService } from './product-service-context';
import {
  ProductsContext,
  type PendingTransfer,
  type TransferHistoryEntry,
} from './products-context-value';

/**
 * ProductsProvider — the reactive adapter over ProductService.
 *
 * This component used to own ALL product logic (stock math, transfers,
 * history, id generation) directly in useState reducers. It now owns NONE of
 * it: every business rule lives in ProductService, every storage detail lives
 * behind IProductRepository. This provider's only job is to hold the current
 * snapshot in React state and re-read it after each action.
 *
 * The adapter is now *honest* about two things it previously hid (issues #1
 * and #2):
 *   1. Actions are asynchronous, so every method returns a real Promise and
 *      re-throws on failure instead of swallowing it.
 *   2. Failures are surfaced — as an `error` state value and, for unexpected
 *      errors, as a toast — so the user is never told an operation succeeded
 *      when it did not.
 *
 * Round-2 fixes (gaps found while verifying the first report):
 *   - A failed snapshot re-read after a SUCCESSFUL mutation is no longer
 *     reported as a mutation failure. The old runAction treated a refresh
 *     failure like an action failure, which made POS checkout abort after
 *     the sale had already been persisted — the cashier could then retry
 *     and record the same sale twice. The two concerns are now separated.
 *   - `refresh` clears `error` on success, so the page-level retry button
 *     actually dismisses the banner once the re-read succeeds.
 */
export function ProductsProvider({ children }: { children: ReactNode }) {
  const service = useProductService();
  const [products, setProducts] = useState<Product[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransfer[]>([]);
  const [transferHistory, setTransferHistory] = useState<TransferHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pure fetch — returns the snapshot WITHOUT touching state, so it is safe to
  // call from the initial effect (react-hooks/set-state-in-effect) and reusable
  // by `refresh`.
  const fetchSnapshot = useCallback(
    () =>
      Promise.all([
        service.getAllProducts(),
        service.getPendingTransfers(),
        service.getTransferHistory(),
      ]),
    [service],
  );

  // Apply a snapshot to state and clear the error banner.
  const applySnapshot = useCallback(
    ([nextProducts, nextPending, nextHistory]: [
      Product[],
      PendingTransfer[],
      TransferHistoryEntry[],
    ]) => {
      setProducts(nextProducts);
      setPendingTransfers(nextPending);
      setTransferHistory(nextHistory);
      setError(null);
    },
    [],
  );

  // Public refresh — re-reads and applies. Clears `error` on success so retry
  // loops can dismiss the error banner.
  const refresh = useCallback(async () => {
    applySnapshot(await fetchSnapshot());
  }, [fetchSnapshot, applySnapshot]);

  // Initial read — tracks loading/error instead of failing silently (issue #3).
  // The snapshot is fetched first, then applied inside promise callbacks, so
  // nothing runs synchronously in the effect body.
  useEffect(() => {
    let cancelled = false;
    fetchSnapshot()
      .then((snapshot) => {
        if (!cancelled) applySnapshot(snapshot);
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
  }, [fetchSnapshot, applySnapshot]);

  /**
   * Runs a mutation and makes any failure observable:
   *   - records the message in `error` state,
   *   - shows a toast for unexpected (non-validation) failures,
   *   - re-throws so the caller can react (e.g. ProductFormModal binds a
   *     validation error to its field — issue #4).
   *
   * CRITICAL: only the mutation itself is allowed to fail this function.
   * The snapshot re-read after a successful mutation is a SEPARATE concern:
   * the write is already persisted, so reporting it as a failure would let
   * the caller retry an operation that already happened (double sale at the
   * POS). A failed re-read is therefore surfaced as a soft warning, and the
   * action still resolves successfully.
   *
   * Validation errors are intentionally NOT toasted and NOT pushed into the
   * page-level `error` banner: the form that owns the field renders them
   * inline, so a duplicate toast/banner would be noise.
   */
  const runAction = useCallback(
    async (action: () => Promise<unknown>): Promise<void> => {
      try {
        setError(null);
        await action();
      } catch (e: unknown) {
        const message = toErrorMessage(e);
        if (!(e instanceof InvalidProductError)) {
          setError(message);
          toast.error('تعذّر إتمام العملية', { description: message });
        }
        throw e;
      }

      // Mutation persisted — now best-effort refresh the displayed snapshot.
      try {
        await refresh();
      } catch (e: unknown) {
        setError(toErrorMessage(e));
        toast.warning('تمت العملية، لكن تعذّر تحديث البيانات المعروضة', {
          description: 'اضغط "إعادة المحاولة" لتحديث القائمة',
        });
      }
    },
    [refresh],
  );

  // Each action delegates to the service, then refreshes the snapshot. The
  // service owns the business rules; this layer only mirrors the result.
  const sellProducts = useCallback(
    (items: CartItem[]) => runAction(() => service.sellProducts(items)),
    [runAction, service],
  );

  const addProduct = useCallback(
    (product: Omit<Product, 'id'>) => runAction(() => service.addProduct(product)),
    [runAction, service],
  );

  const updateProduct = useCallback(
    (id: string, updates: Omit<Product, 'id'>) => runAction(() => service.updateProduct(id, updates)),
    [runAction, service],
  );

  const deleteProduct = useCallback(
    (id: string) => runAction(() => service.deleteProduct(id)),
    [runAction, service],
  );

  const transferToStore = useCallback(
    (productId: string, quantity: number) => runAction(() => service.transferToStore(productId, quantity)),
    [runAction, service],
  );

  const requestTransfer = useCallback(
    (productId: string, quantity: number) => runAction(() => service.requestTransfer(productId, quantity)),
    [runAction, service],
  );

  const confirmTransfer = useCallback(
    (transferId: string) => runAction(() => service.confirmTransfer(transferId)),
    [runAction, service],
  );

  const cancelTransfer = useCallback(
    (transferId: string) => runAction(() => service.cancelTransfer(transferId)),
    [runAction, service],
  );

  return (
    <ProductsContext.Provider
      value={{
        products, isLoading, error, refresh,
        sellProducts, addProduct, updateProduct, deleteProduct, transferToStore,
        pendingTransfers, requestTransfer, confirmTransfer, cancelTransfer, transferHistory,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}
