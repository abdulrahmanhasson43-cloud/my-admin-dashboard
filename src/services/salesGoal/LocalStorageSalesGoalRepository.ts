import type { SalesGoal } from '@/types';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { readJson, writeJson } from '@/lib/storage';
import type { ISalesGoalRepository } from './ISalesGoalRepository';

/**
 * LocalStorageSalesGoalRepository — keeps the goal in the browser.
 * TODO(phase-3): swap in data-services-context.tsx.
 */
export class LocalStorageSalesGoalRepository implements ISalesGoalRepository {
  load(): SalesGoal | null {
    return readJson<SalesGoal | null>(STORAGE_KEYS.salesGoal, null);
  }

  save(goal: SalesGoal): void {
    writeJson(STORAGE_KEYS.salesGoal, goal);
  }
}
