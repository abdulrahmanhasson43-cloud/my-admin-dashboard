import type { CartItem, HeldOrder } from '@/types';
import type { IHeldOrderRepository } from './IHeldOrderRepository';

export interface HoldOrderInput {
  /** Empty label gets an automatic "طلب معلق #NNNN" name. */
  label: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  reason?: string;
}

export interface ResumeResult {
  /** The order that was resumed, or null when the id is unknown. */
  order: HeldOrder | null;
  /** The held orders that remain after resuming. */
  remaining: HeldOrder[];
}

/**
 * HeldOrderService — rules for parking a POS cart and bringing it back.
 * Methods take the current list and return the next one.
 */
export class HeldOrderService {
  private readonly repository: IHeldOrderRepository;

  constructor(repository: IHeldOrderRepository) {
    this.repository = repository;
  }

  getAll(): HeldOrder[] {
    return this.repository.load();
  }

  /** Parks a cart. Only id/name/price/quantity are kept per line. */
  hold(current: HeldOrder[], input: HoldOrderInput): HeldOrder[] {
    const stamp = Date.now().toString();
    const order: HeldOrder = {
      id: this.uniqueId(current),
      label: input.label || `طلب معلق #${stamp.slice(-4)}`,
      reason: input.reason,
      items: input.items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      subtotal: input.subtotal,
      tax: input.tax,
      total: input.total,
      createdAt: new Date().toLocaleString('ar-EG'),
    };
    return this.commit([order, ...current]);
  }

  /** Takes an order out of the held list and hands it back. */
  resume(current: HeldOrder[], id: string): ResumeResult {
    const order = current.find(o => o.id === id) ?? null;
    if (!order) return { order: null, remaining: current };
    return { order, remaining: this.commit(current.filter(o => o.id !== id)) };
  }

  remove(current: HeldOrder[], id: string): HeldOrder[] {
    return this.commit(current.filter(o => o.id !== id));
  }

  /**
   * `HLD-` + the last six digits of the clock. Six digits repeat every ~17
   * minutes (and two holds in the same millisecond collide), so when the id is
   * already taken a random suffix is added — ids must be unique or resuming one
   * order would resume (and remove) another.
   */
  private uniqueId(current: HeldOrder[]): string {
    const taken = new Set(current.map(o => o.id));
    let id = `HLD-${Date.now().toString().slice(-6)}`;
    while (taken.has(id)) {
      id = `HLD-${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2, 5)}`;
    }
    return id;
  }

  private commit(next: HeldOrder[]): HeldOrder[] {
    this.repository.save(next);
    return next;
  }
}
