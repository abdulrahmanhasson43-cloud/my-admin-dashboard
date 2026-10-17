import type { ReturnReason, ReturnRequest } from '@/types/return';
import { returnReasons } from '@/types/return';
import { InvalidReturnError } from './ReturnService';

/**
 * ProcessReturn — "move a return one step", the second real use case after
 * CompleteSale.
 *
 * Moving a return along used to be only a status change. The step that matters
 * to the shop is the last one, `refunded`: that is when the goods settle.
 *   - customer return  -> the goods come back to the shop floor (unless they
 *                         cannot be resold: see NON_RESELLABLE_REASONS);
 *   - supplier return  -> the goods leave stock.
 * Either way the activity log gets a line.
 *
 * Like CompleteSale it is a plain function over PORTS, so it runs and is tested
 * in plain Node with fakes. The status is saved FIRST; the stock and the log
 * follow only if that worked. The stock effect is applied ONLY on the step into
 * `refunded`, so processing a return that is already refunded changes nothing.
 */
export interface StockLine {
  productId: string;
  quantity: number;
}

export interface ProcessReturnPorts {
  /** The return as it is now, or `null` when there is none. */
  getReturn(id: string): Promise<ReturnRequest | null>;
  /** Moves the return one step (pending -> approved -> refunded). */
  advance(id: string): Promise<ReturnRequest>;
  /** Puts goods back on the shop floor. Resolves to how many products were actually found and changed. */
  restock(items: ReadonlyArray<StockLine>): Promise<number>;
  /** Takes goods out of stock. Resolves to how many products were actually found and changed. */
  withdraw(items: ReadonlyArray<StockLine>): Promise<number>;
  /** Writes the activity-log line. */
  logActivity(type: 'stock' | 'supplier', description: string): void;
}

/** What happened to the stock on this step. */
export type StockEffect =
  | 'none'            // not the step into "refunded" (or already refunded)
  | 'restocked'       // customer return, goods back on the shelf
  | 'withdrawn'       // supplier return, goods left stock
  | 'not-resellable'  // customer return of goods that cannot be resold
  | 'incomplete'      // the status moved, but some products are not in the stock list
  | 'failed';         // the status moved, but the stock could not be updated

export interface ProcessReturnResult {
  request: ReturnRequest;
  stock: StockEffect;
}

/** Customer returns for these reasons do NOT go back on the shelf. Change it here. */
export const NON_RESELLABLE_REASONS: ReadonlyArray<ReturnReason> = ['defective', 'expired'];

const reasonLabel = (reason: ReturnReason): string =>
  returnReasons.find(r => r.id === reason)?.label ?? reason;

const countPieces = (items: ReadonlyArray<StockLine>): number =>
  items.reduce((sum, item) => sum + (item.quantity > 0 ? item.quantity : 0), 0);

/** How many different products a return expects to find in the stock list (lines with no quantity don't count). */
const countProducts = (items: ReadonlyArray<StockLine>): number =>
  new Set(items.filter(item => item.quantity > 0).map(item => item.productId)).size;

interface AppliedStock {
  effect: 'restocked' | 'withdrawn' | 'not-resellable';
  /** Products found and changed, and products expected (both 0 when nothing was moved). */
  changed: number;
  expected: number;
}

/** Moves the goods for a return that has just been refunded; throws when the port does. */
async function applyStock(ports: ProcessReturnPorts, request: ReturnRequest): Promise<AppliedStock> {
  const expected = countProducts(request.items);
  if (request.type === 'supplier') {
    return { effect: 'withdrawn', changed: await ports.withdraw(request.items), expected };
  }
  if (NON_RESELLABLE_REASONS.includes(request.reason)) {
    return { effect: 'not-resellable', changed: 0, expected: 0 };
  }
  return { effect: 'restocked', changed: await ports.restock(request.items), expected };
}

export async function processReturn(
  ports: ProcessReturnPorts,
  id: string,
): Promise<ProcessReturnResult> {
  const before = await ports.getReturn(id);
  if (!before) throw new InvalidReturnError(`Cannot process unknown return: ${id}`);

  // Status first: if this fails nothing else is touched.
  const request = await ports.advance(id);

  const settledNow = before.status !== 'refunded' && request.status === 'refunded';
  if (!settledNow) return { request, stock: 'none' };

  let applied: AppliedStock;
  try {
    applied = await applyStock(ports, request);
  } catch {
    // The status already moved and cannot be taken back here; say so, don't hide it.
    ports.logActivity('stock', `تعذّر تحديث المخزون للمرتجع ${request.id}`);
    return { request, stock: 'failed' };
  }

  const pieces = countPieces(request.items);
  const logType = applied.effect === 'withdrawn' ? 'supplier' : 'stock';

  // Some products are not in the stock list (a return can name a product that was deleted
  // or never existed): say exactly that, never claim the whole return was applied.
  if (applied.changed < applied.expected) {
    ports.logActivity(
      logType,
      `تم تحديث ${applied.changed} من ${applied.expected} منتج للمرتجع ${request.id} — الباقي غير موجود في المخزون`,
    );
    return { request, stock: 'incomplete' };
  }

  if (applied.effect === 'withdrawn') {
    ports.logActivity('supplier', `تم خصم ${pieces} قطعة من المخزون — مرتجع مورد ${request.id}`);
  } else if (applied.effect === 'not-resellable') {
    ports.logActivity('stock', `مرتجع ${request.id} (${reasonLabel(request.reason)}) — لم يُعاد للمخزون`);
  } else {
    ports.logActivity('stock', `تم إرجاع ${pieces} قطعة للمخزون — مرتجع ${request.id}`);
  }
  return { request, stock: applied.effect };
}
