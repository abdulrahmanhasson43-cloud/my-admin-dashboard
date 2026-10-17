import type { ActivityEntry } from '@/types';
import type { IActivityLogRepository } from './IActivityLogRepository';

/** Most entries kept (older ones are dropped). */
export const MAX_ACTIVITY_ENTRIES = 200;

/**
 * ActivityLogService — the rules of the activity log: newest first, capped at
 * MAX_ACTIVITY_ENTRIES. Methods take the current list and return the next one.
 */
export class ActivityLogService {
  private readonly repository: IActivityLogRepository;

  constructor(repository: IActivityLogRepository) {
    this.repository = repository;
  }

  getAll(): ActivityEntry[] {
    return this.repository.load();
  }

  log(
    current: ActivityEntry[],
    type: ActivityEntry['type'],
    description: string,
    amount?: number,
  ): ActivityEntry[] {
    const entry: ActivityEntry = {
      id: `ACT-${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2, 6)}`,
      type,
      description,
      amount,
      timestamp: new Date().toLocaleString('ar-EG'),
    };
    return this.commit([entry, ...current].slice(0, MAX_ACTIVITY_ENTRIES));
  }

  clear(): ActivityEntry[] {
    return this.commit([]);
  }

  private commit(next: ActivityEntry[]): ActivityEntry[] {
    this.repository.save(next);
    return next;
  }
}
