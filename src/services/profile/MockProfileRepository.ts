import type { UserProfile, StoreBranding, SubscriptionInfo } from '@/types';
import {
  defaultUserProfile,
  defaultStoreBranding,
  defaultSubscription,
} from '@/services/mock/profile';
import type { IProfileRepository } from './IProfileRepository';

/**
 * MockProfileRepository — an in-memory implementation of IProfileRepository.
 *
 * TODO(phase-3): replace with a real adapter (e.g. FirestoreProfileRepository)
 * that implements the same interface. Swap it in one place —
 * src/context/ProfileServiceContext.tsx — and nothing else changes.
 */
export class MockProfileRepository implements IProfileRepository {
  private profile: UserProfile;
  private branding: StoreBranding;
  private readonly subscription: SubscriptionInfo;

  constructor(
    profileSeed: UserProfile = defaultUserProfile,
    brandingSeed: StoreBranding = defaultStoreBranding,
    subscriptionSeed: SubscriptionInfo = defaultSubscription,
  ) {
    // Copy so mutations here never reach back into the shared mock fixtures.
    this.profile = { ...profileSeed };
    this.branding = { ...brandingSeed };
    this.subscription = { ...subscriptionSeed, usage: subscriptionSeed.usage.map(u => ({ ...u })) };
  }

  async findProfile(): Promise<UserProfile> {
    return { ...this.profile };
  }

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    this.profile = { ...profile };
    return { ...this.profile };
  }

  async findBranding(): Promise<StoreBranding> {
    return { ...this.branding };
  }

  async saveBranding(branding: StoreBranding): Promise<StoreBranding> {
    this.branding = { ...branding };
    return { ...this.branding };
  }

  async findSubscription(): Promise<SubscriptionInfo> {
    return { ...this.subscription, usage: this.subscription.usage.map(u => ({ ...u })) };
  }
}
