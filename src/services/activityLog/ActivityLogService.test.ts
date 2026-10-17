import { describe, expect, it } from 'vitest';
import type { ActivityEntry } from '@/types';
import type { IActivityLogRepository } from './IActivityLogRepository';
import { ActivityLogService, MAX_ACTIVITY_ENTRIES } from './ActivityLogService';

class FakeRepository implements IActivityLogRepository {
  saved: ActivityEntry[] | null = null;
  load() { return []; }
  save(entries: ActivityEntry[]) { this.saved = entries; }
}

const entry = (id: string): ActivityEntry => ({ id, type: 'sale', description: id, timestamp: 'now' });

describe('ActivityLogService', () => {
  it('log puts the newest entry first and saves', () => {
    const repo = new FakeRepository();
    const next = new ActivityLogService(repo).log([entry('old')], 'sale', 'تم بيع', 150);
    expect(next[0]).toMatchObject({ type: 'sale', description: 'تم بيع', amount: 150 });
    expect(next[0].id).toMatch(/^ACT-/);
    expect(next[1].id).toBe('old');
    expect(repo.saved).toBe(next);
  });

  it(`keeps at most ${MAX_ACTIVITY_ENTRIES} entries`, () => {
    const full = Array.from({ length: MAX_ACTIVITY_ENTRIES }, (_, i) => entry(`e${i}`));
    const next = new ActivityLogService(new FakeRepository()).log(full, 'stock', 'x');
    expect(next).toHaveLength(MAX_ACTIVITY_ENTRIES);
    expect(next.at(-1)?.id).toBe(`e${MAX_ACTIVITY_ENTRIES - 2}`);
  });

  it('clear empties the log and saves the empty list', () => {
    const repo = new FakeRepository();
    expect(new ActivityLogService(repo).clear()).toEqual([]);
    expect(repo.saved).toEqual([]);
  });

  it('does not mutate the list it was given', () => {
    const before = [entry('a')];
    new ActivityLogService(new FakeRepository()).log(before, 'sale', 'x');
    expect(before).toHaveLength(1);
  });
});
