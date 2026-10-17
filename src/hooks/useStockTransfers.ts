import { useState } from 'react';
import { toast } from 'sonner';
import { useProducts } from '@/context/products-context-value';
import {
  NO_WAREHOUSE_STOCK_MESSAGE,
  planModalTransfer,
  planQuickTransfer,
  transferRequestedMessage,
  transferredMessage,
  type TransferPlan,
} from '@/lib/inventory';
import type { Product } from '@/types';

/**
 * useStockTransfers — moving stock from the warehouse to the shop, three ways:
 * the modal (type a quantity), the one-tap arrow, and drag-and-drop. It holds
 * what is open / being dragged and carries out whatever lib/inventory.ts decides.
 *
 * `needsConfirmation` = the move is only queued until a manager confirms it.
 */
export function useStockTransfers(needsConfirmation: boolean) {
  const { transferToStore, requestTransfer } = useProducts();
  const [transferProduct, setTransferProduct] = useState<Product | null>(null);
  const [transferQty, setTransferQty] = useState('');
  const [dragProduct, setDragProduct] = useState<Product | null>(null);

  /** Runs the plan against the store. A failure was already shown by the context (banner + toast). */
  const run = async (productId: string, plan: TransferPlan) => {
    if (plan.action === 'request') await requestTransfer(productId, plan.quantity);
    else await transferToStore(productId, plan.quantity);
  };

  const quickTransfer = async (product: Product, quantity = 1) => {
    const plan = planQuickTransfer(product, quantity, needsConfirmation);
    if (plan.action === 'reject') {
      toast.error(NO_WAREHOUSE_STOCK_MESSAGE);
      return;
    }
    try {
      await run(product.id, plan);
      toast.success(
        plan.action === 'request'
          ? transferRequestedMessage(plan.quantity)
          : transferredMessage(plan.quantity, product.name),
      );
    } catch {
      // The context has already surfaced the error (banner + toast).
    }
  };

  /** Opens the modal for a product. The quantity box always starts empty — not with a number typed for another product. */
  const openTransfer = (product: Product) => {
    setTransferProduct(product);
    setTransferQty('');
  };

  const dropToStore = () => {
    if (dragProduct) {
      void quickTransfer(dragProduct, 1);
      setDragProduct(null);
    }
  };

  const submitTransfer = async () => {
    if (!transferProduct) return;
    const plan = planModalTransfer(transferQty, transferProduct, needsConfirmation);
    if (plan.action !== 'none') {
      try {
        await run(transferProduct.id, plan);
      } catch {
        // The context has already surfaced the error (banner + toast).
      }
    }
    setTransferProduct(null);
    setTransferQty('');
  };

  return {
    transferProduct,
    transferQty,
    setTransferQty,
    openTransfer,
    closeTransfer: () => setTransferProduct(null),
    submitTransfer,
    dragProduct,
    startDrag: setDragProduct,
    endDrag: () => setDragProduct(null),
    dropToStore,
    quickTransfer,
  };
}
