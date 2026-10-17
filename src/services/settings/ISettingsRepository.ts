import type { PaymentMethodConfig, StaffMember } from '@/types';

/**
 * ISettingsRepository — the abstraction (port) that SettingsService depends on.
 *
 * Dependency Inversion: SettingsService (high-level policy) depends on THIS
 * interface, never on a concrete storage technology. A real backend adapter
 * can replace MockSettingsRepository without touching any UI code.
 */
export interface ISettingsRepository {
  /** Every configurable payment method (toggle flags only — no secrets). */
  findPaymentMethods(): Promise<PaymentMethodConfig[]>;

  /** Persists a replacement payment-method config and returns it. */
  savePaymentMethod(config: PaymentMethodConfig): Promise<PaymentMethodConfig>;

  /** The staff members shown in the settings screen (subset view). */
  findStaffMembers(): Promise<StaffMember[]>;
}

/** Thrown by repository implementations when a payment method id can't be found. */
export class PaymentMethodNotFoundError extends Error {
  constructor(id: string) {
    super(`Payment method not found: ${id}`);
    this.name = 'PaymentMethodNotFoundError';
  }
}
