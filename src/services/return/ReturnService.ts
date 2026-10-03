import type { ReturnRequest, ReturnItem, ReturnType, ReturnReason, ReturnStatus } from '@/types/return';
import { generateNumericId } from '@/lib/utils';
import type { IReturnRepository } from './IReturnRepository';

export interface CreateReturnInput {
  type: ReturnType;
  partyName: string;
  partyPhone?: string;
  originalInvoiceId: string;
  items: ReturnItem[];
  reason: ReturnReason;
  reasonNote?: string;
}

/** Thrown when a caller tries to create/advance a return with invalid data. */
export class InvalidReturnError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidReturnError';
  }
}

/**
 * ReturnService — all return business logic lives here, and ONLY here.
 *
 * Mirrors OrderService's shape exactly: depends solely on the
 * IReturnRepository abstraction (constructor-injected), has no idea
 * whether returns live in memory, Firestore, or behind a REST API.
 *
 * - Single Responsibility: return business rules (validation, refund
 *   totals, status progression) — nothing about HOW data is stored.
 * - Open/Closed: new persistence backends = a new IReturnRepository
 *   implementation; this class never changes for that.
 * - Liskov Substitution: any IReturnRepository can be substituted here.
 * - Interface Segregation: IReturnRepository exposes only what a
 *   return-storage backend needs to support.
 * - Dependency Inversion: this class and every concrete repository both
 *   depend on IReturnRepository — neither depends on the other.
 */
export class ReturnService {
  private readonly repository: IReturnRepository;

  constructor(repository: IReturnRepository) {
    this.repository = repository;
  }

  async getAllReturns(): Promise<ReturnRequest[]> {
    const returns = await this.repository.findAll();
    return [...returns].sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  async getReturnsByType(type: ReturnType): Promise<ReturnRequest[]> {
    const returns = await this.getAllReturns();
    return returns.filter(r => r.type === type);
  }

  async createReturn(input: CreateReturnInput): Promise<ReturnRequest> {
    this.assertValidCreateInput(input);

    const refundAmount = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const ret: ReturnRequest = {
      id: generateNumericId('RET', 100, 999),
      type: input.type,
      partyName: input.partyName.trim(),
      partyPhone: input.partyPhone?.trim() || undefined,
      originalInvoiceId: input.originalInvoiceId,
      items: input.items,
      reason: input.reason,
      reasonNote: input.reasonNote?.trim() || undefined,
      status: 'pending',
      refundAmount,
      date: new Date().toISOString().slice(0, 10),
    };

    return this.repository.insert(ret);
  }

  /**
   * Advances a return one step through its lifecycle: pending → approved →
   * refunded. This is the single source of truth for that business rule —
   * previously duplicated inline inside ReturnsPage's UI code.
   */
  async advanceReturnStatus(id: string): Promise<ReturnRequest> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new InvalidReturnError(`Cannot advance unknown return: ${id}`);
    }
    if (existing.status === 'refunded') {
      return existing; // already at the end of the lifecycle
    }

    const next: ReturnStatus = existing.status === 'pending' ? 'approved' : 'refunded';
    const updated: ReturnRequest = { ...existing, status: next };

    return this.repository.update(updated);
  }

  private assertValidCreateInput(input: CreateReturnInput): void {
    if (!input.partyName.trim()) {
      throw new InvalidReturnError('partyName is required');
    }
    if (input.items.length === 0) {
      throw new InvalidReturnError('A return must contain at least one item');
    }
  }
}
