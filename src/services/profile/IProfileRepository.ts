import type { UserProfile, StoreBranding, SubscriptionInfo } from '@/types';

/**
 * IProfileRepository — the abstraction (port) that ProfileService depends on.
 *
 * Dependency Inversion: ProfileService (high-level policy) depends on THIS
 * interface, never on a concrete storage technology. A real backend adapter
 * can replace MockProfileRepository without touching any UI code.
 */
export interface IProfileRepository {
  /** The current user's profile. */
  findProfile(): Promise<UserProfile>;

  /** Persists a replacement profile and returns the stored record. */
  saveProfile(profile: UserProfile): Promise<UserProfile>;

  /** The current store branding (name, tagline, colours). */
  findBranding(): Promise<StoreBranding>;

  /** Persists a replacement branding record and returns it. */
  saveBranding(branding: StoreBranding): Promise<StoreBranding>;

  /** The current subscription info (plan, price, usage). */
  findSubscription(): Promise<SubscriptionInfo>;
}
