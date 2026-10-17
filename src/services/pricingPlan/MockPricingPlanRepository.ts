import type { PricingPlan } from '@/types';
import { pricingPlans } from '@/services/mock/pricingPlans';
import type { IPricingPlanRepository } from './IPricingPlanRepository';

/**
 * MockPricingPlanRepository — an in-memory implementation of
 * IPricingPlanRepository. PricingPlanService never imports this file.
 *
 * TODO(phase-3): replace with a real adapter implementing the same
 * interface. Swap it in one place — src/context/data-services-context.tsx.
 */
export class MockPricingPlanRepository implements IPricingPlanRepository {
  private readonly plans: PricingPlan[];

  constructor(seed: PricingPlan[] = pricingPlans) {
    this.plans = seed.map(p => ({ ...p }));
  }

  async findAll(): Promise<PricingPlan[]> {
    return [...this.plans];
  }

  async findById(id: string): Promise<PricingPlan | null> {
    return this.plans.find(p => p.id === id) ?? null;
  }
}
