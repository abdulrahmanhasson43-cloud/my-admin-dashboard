import { describe, expect, it } from 'vitest';
import type { PricingPlan } from '@/types';
import { PricingPlanService } from './PricingPlanService';
import { MockPricingPlanRepository } from './MockPricingPlanRepository';

const plan = (id: string, popular = false): PricingPlan => ({ id, name: id, price: 100, period: 'شهر', features: [], popular });
const service = (plans: PricingPlan[]) => new PricingPlanService(new MockPricingPlanRepository(plans));

describe('PricingPlanService', () => {
  it('lists the plans and finds one by id', async () => {
    const svc = service([plan('basic'), plan('pro', true)]);
    expect(await svc.getAllPlans()).toHaveLength(2);
    expect((await svc.getPlanById('pro'))?.id).toBe('pro');
    expect(await svc.getPlanById('nope')).toBeNull();
  });

  it('getPopularPlan returns the highlighted plan, or null when there is none', async () => {
    expect((await service([plan('basic'), plan('pro', true)]).getPopularPlan())?.id).toBe('pro');
    expect(await service([plan('basic')]).getPopularPlan()).toBeNull();
  });
});
