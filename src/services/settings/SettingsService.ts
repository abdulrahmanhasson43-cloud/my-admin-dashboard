import type { PaymentMethodConfig, StaffMember } from '@/types';
import type { ISettingsRepository } from './ISettingsRepository';

/**
 * SettingsService — all app-settings business logic lives here, and ONLY here.
 *
 * High-level module in Dependency Inversion terms: it depends solely on the
 * ISettingsRepository abstraction injected through the constructor. The UI
 * reaches this service through useSettings() and never touches services/mock.
 */
export class SettingsService {
  private readonly repository: ISettingsRepository;

  constructor(repository: ISettingsRepository) {
    this.repository = repository;
  }

  async getPaymentMethods(): Promise<PaymentMethodConfig[]> {
    return this.repository.findPaymentMethods();
  }

  async setPaymentMethodEnabled(id: string, enabled: boolean): Promise<PaymentMethodConfig> {
    const methods = await this.repository.findPaymentMethods();
    const existing = methods.find(m => m.id === id);
    if (!existing) {
      throw new Error(`Cannot update unknown payment method: ${id}`);
    }
    return this.repository.savePaymentMethod({ ...existing, enabled });
  }

  async getStaffMembers(): Promise<StaffMember[]> {
    return this.repository.findStaffMembers();
  }
}
