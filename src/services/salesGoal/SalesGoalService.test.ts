import { describe, expect, it } from 'vitest';
import type { SalesGoal } from '@/types';
import type { ISalesGoalRepository } from './ISalesGoalRepository';
import { DEFAULT_MONTHLY_TARGET, SalesGoalService, monthKey } from './SalesGoalService';

class FakeRepository implements ISalesGoalRepository {
  saved: SalesGoal | null = null;
  private readonly stored: SalesGoal | null;
  constructor(stored: SalesGoal | null = null) { this.stored = stored; }
  load() { return this.stored; }
  save(goal: SalesGoal) { this.saved = goal; }
}

const OCTOBER = new Date('2026-10-02T10:00:00Z');
const goal = (achieved: number, target = 1000): SalesGoal => ({ month: '2026-10', target, achieved });

describe('SalesGoalService', () => {
  it('starts a fresh month at zero with the default target when nothing is saved', () => {
    expect(new SalesGoalService(new FakeRepository()).getCurrent(OCTOBER))
      .toEqual({ month: '2026-10', target: DEFAULT_MONTHLY_TARGET, achieved: 0 });
  });

  it('reuses the saved goal for the same month', () => {
    expect(new SalesGoalService(new FakeRepository(goal(400, 900))).getCurrent(OCTOBER)).toEqual(goal(400, 900));
  });

  it('a new month resets achieved to zero (target falls back to the default)', () => {
    const lastMonth = { month: '2026-09', target: 5000, achieved: 4000 };
    expect(new SalesGoalService(new FakeRepository(lastMonth)).getCurrent(OCTOBER))
      .toEqual({ month: '2026-10', target: DEFAULT_MONTHLY_TARGET, achieved: 0 });
  });

  it('setTarget saves and never goes below zero', () => {
    const repo = new FakeRepository();
    const service = new SalesGoalService(repo);
    expect(service.setTarget(goal(0), 2500).target).toBe(2500);
    expect(service.setTarget(goal(0), -10).target).toBe(0);
    expect(repo.saved?.target).toBe(0);
  });

  it('addAchieved adds the amount and saves', () => {
    const repo = new FakeRepository();
    const result = new SalesGoalService(repo).addAchieved(goal(100), 250);
    expect(result.goal.achieved).toBe(350);
    expect(result.justReached).toBe(false);
    expect(repo.saved?.achieved).toBe(350);
  });

  it('ignores zero, negative and non-finite amounts without saving', () => {
    const repo = new FakeRepository();
    const service = new SalesGoalService(repo);
    const start = goal(100);
    for (const bad of [0, -5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const result = service.addAchieved(start, bad);
      expect(result.goal).toBe(start);
      expect(result.justReached).toBe(false);
    }
    expect(repo.saved).toBeNull();
  });

  it('justReached is true only on the sale that crosses the target, not after it', () => {
    const service = new SalesGoalService(new FakeRepository());
    const crossing = service.addAchieved(goal(900), 150);
    expect(crossing.justReached).toBe(true);
    const after = service.addAchieved(crossing.goal, 50);
    expect(after.justReached).toBe(false);
  });

  it('a goal of 0 is never "reached"', () => {
    const service = new SalesGoalService(new FakeRepository());
    expect(service.isReached(goal(500, 0))).toBe(false);
    expect(service.progressPercent(goal(500, 0))).toBe(0);
  });

  it('progressPercent rounds and caps at 100', () => {
    const service = new SalesGoalService(new FakeRepository());
    expect(service.progressPercent(goal(333, 1000))).toBe(33);
    expect(service.progressPercent(goal(5000, 1000))).toBe(100);
  });

  it('reachedNotice is a goal notification pointing at the dashboard', () => {
    const notice = new SalesGoalService(new FakeRepository()).reachedNotice(goal(1200, 1000));
    expect(notice).toMatchObject({ type: 'goal', link: '/dashboard' });
  });

  it('monthKey is YYYY-MM', () => {
    expect(monthKey(OCTOBER)).toBe('2026-10');
  });
});
