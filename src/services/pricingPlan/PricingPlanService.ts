import type { PricingPlan } from '@/types';
import type { IPricingPlanRepository } from './IPricingPlanRepository';

/**
 * PricingPlanService — the UI reaches pricing-plan data solely through this
 * service (via usePricingPlans()), and never touches services/mock directly.
 * High-level module: depends only on the IPricingPlanRepository abstraction
 * injected through the constructor, never on a concrete storage technology.
 */
export class PricingPlanService {
  private readonly repository: IPricingPlanRepository;

  constructor(repository: IPricingPlanRepository) {
    this.repository = repository;
  }

  async getAllPlans(): Promise<PricingPlan[]> {
    return this.repository.findAll();
  }

  async getPlanById(id: string): Promise<PricingPlan | null> {
    return this.repository.findById(id);
  }

  /** The plan flagged as most popular, if any. */
  async getPopularPlan(): Promise<PricingPlan | null> {
    const all = await this.repository.findAll();
    return all.find(p => p.popular) ?? null;
  }
}
