import type { PricingPlan } from '@/types';

/**
 * IPricingPlanRepository — the abstraction (port) that PricingPlanService
 * depends on. Pricing plans are read-only reference data (no create/update/
 * delete from the UI today), so the port only exposes read methods.
 * Concrete adapters implement this same interface, so swapping storage
 * touches exactly one file — the composition root — and nothing else.
 */
export interface IPricingPlanRepository {
  /** Returns every pricing plan. Ordering is NOT guaranteed. */
  findAll(): Promise<PricingPlan[]>;

  /** Returns a single plan by id, or null if it doesn't exist. */
  findById(id: string): Promise<PricingPlan | null>;
}
