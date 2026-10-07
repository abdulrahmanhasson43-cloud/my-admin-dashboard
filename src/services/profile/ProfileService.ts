import type { UserProfile, StoreBranding, SubscriptionInfo } from '@/types';
import type { IProfileRepository } from './IProfileRepository';

/**
 * ProfileService — all profile/branding business logic lives here, and ONLY here.
 *
 * High-level module in Dependency Inversion terms: it depends solely on the
 * IProfileRepository abstraction injected through the constructor. The UI
 * reaches this service through useProfile() and never touches services/mock.
 */
export class ProfileService {
  private readonly repository: IProfileRepository;

  constructor(repository: IProfileRepository) {
    this.repository = repository;
  }

  async getProfile(): Promise<UserProfile> {
    return this.repository.findProfile();
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const existing = await this.repository.findProfile();
    return this.repository.saveProfile({ ...existing, ...updates });
  }

  async getBranding(): Promise<StoreBranding> {
    return this.repository.findBranding();
  }

  async updateBranding(updates: Partial<StoreBranding>): Promise<StoreBranding> {
    const existing = await this.repository.findBranding();
    return this.repository.saveBranding({ ...existing, ...updates });
  }

  async getSubscription(): Promise<SubscriptionInfo> {
    return this.repository.findSubscription();
  }
}
