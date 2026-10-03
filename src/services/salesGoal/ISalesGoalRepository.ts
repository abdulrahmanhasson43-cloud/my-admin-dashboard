import type { SalesGoal } from '@/types';

/** ISalesGoalRepository — the port SalesGoalService depends on (synchronous, per-device). */
export interface ISalesGoalRepository {
  /** The saved goal, or null when nothing has been saved yet. */
  load(): SalesGoal | null;
  save(goal: SalesGoal): void;
}
