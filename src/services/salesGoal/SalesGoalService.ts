import type { SalesGoal } from '@/types';
import type { NewNotification } from '@/services/notification';
import type { ISalesGoalRepository } from './ISalesGoalRepository';

/** Monthly sales target used until the merchant sets their own (EGP). */
export const DEFAULT_MONTHLY_TARGET = 100000;

export interface AchievedResult {
  goal: SalesGoal;
  /** True only on the sale that carries the month from "not reached" to "reached". */
  justReached: boolean;
}

/** Month key in `YYYY-MM`. */
export function monthKey(date: Date): string {
  return date.toISOString().slice(0, 7);
}

/**
 * SalesGoalService — the rules of the monthly sales goal. A new month starts
 * from zero achieved; the "goal reached" moment is detected here, not in the UI.
 */
export class SalesGoalService {
  private readonly repository: ISalesGoalRepository;

  constructor(repository: ISalesGoalRepository) {
    this.repository = repository;
  }

  /** The goal for the month of `now` (a new month, or nothing saved, starts at zero). */
  getCurrent(now: Date = new Date()): SalesGoal {
    const month = monthKey(now);
    const stored = this.repository.load();
    if (stored && stored.month === month) return stored;
    return { month, target: DEFAULT_MONTHLY_TARGET, achieved: 0 };
  }

  setTarget(current: SalesGoal, target: number): SalesGoal {
    return this.commit({ ...current, target: Math.max(0, target) });
  }

  /** Adds a sale to the month. Non-positive or non-finite amounts change nothing. */
  addAchieved(current: SalesGoal, amount: number): AchievedResult {
    if (!Number.isFinite(amount) || amount <= 0) return { goal: current, justReached: false };
    const next = this.commit({ ...current, achieved: current.achieved + amount });
    return { goal: next, justReached: !this.isReached(current) && this.isReached(next) };
  }

  isReached(goal: SalesGoal): boolean {
    return goal.target > 0 && goal.achieved >= goal.target;
  }

  /** Progress as a whole percent, capped at 100. */
  progressPercent(goal: SalesGoal): number {
    if (goal.target <= 0) return 0;
    return Math.min(100, Math.round((goal.achieved / goal.target) * 100));
  }

  /** The congratulation notification raised when the goal is reached. */
  reachedNotice(goal: SalesGoal): NewNotification {
    return {
      type: 'goal',
      title: 'تم تحقيق هدف الشهر!',
      message: `مبروك! تجاوزت هدف المبيعات الشهري (${goal.target.toLocaleString()} EGP). حققت ${goal.achieved.toLocaleString()} EGP حتى الآن.`,
      link: '/dashboard',
    };
  }

  private commit(next: SalesGoal): SalesGoal {
    this.repository.save(next);
    return next;
  }
}
