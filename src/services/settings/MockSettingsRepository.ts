import type { PaymentMethodConfig, StaffMember } from '@/types';
import { paymentMethodsList, staffMembers } from '@/services/mock/settings';
import { PaymentMethodNotFoundError } from './ISettingsRepository';
import type { ISettingsRepository } from './ISettingsRepository';

/**
 * MockSettingsRepository — an in-memory implementation of ISettingsRepository.
 *
 * TODO(phase-3): replace with a real adapter (e.g. FirestoreSettingsRepository)
 * that implements the same interface. Swap it in one place —
 * src/context/SettingsServiceContext.tsx — and nothing else changes.
 */
export class MockSettingsRepository implements ISettingsRepository {
  private paymentMethods: PaymentMethodConfig[];
  private readonly staff: StaffMember[];

  constructor(
    paymentSeed: PaymentMethodConfig[] = paymentMethodsList,
    staffSeed: StaffMember[] = staffMembers,
  ) {
    // Copy so mutations here never reach back into the shared mock fixtures.
    this.paymentMethods = paymentSeed.map(p => ({ ...p }));
    this.staff = staffSeed.map(s => ({ ...s }));
  }

  async findPaymentMethods(): Promise<PaymentMethodConfig[]> {
    return this.paymentMethods.map(p => ({ ...p }));
  }

  async savePaymentMethod(config: PaymentMethodConfig): Promise<PaymentMethodConfig> {
    const index = this.paymentMethods.findIndex(p => p.id === config.id);
    if (index === -1) {
      throw new PaymentMethodNotFoundError(config.id);
    }
    this.paymentMethods = [
      ...this.paymentMethods.slice(0, index),
      config,
      ...this.paymentMethods.slice(index + 1),
    ];
    return config;
  }

  async findStaffMembers(): Promise<StaffMember[]> {
    return this.staff.map(s => ({ ...s }));
  }
}
