import { describe, expect, it } from 'vitest';
import type { AppNotification } from '@/types';
import type { INotificationRepository } from './INotificationRepository';
import { MAX_NOTIFICATIONS, NotificationService } from './NotificationService';

/** In-memory fake: records what was saved so tests can check persistence. */
class FakeRepository implements INotificationRepository {
  saved: AppNotification[] | null = null;
  private readonly initial: AppNotification[];
  constructor(initial: AppNotification[] = []) { this.initial = initial; }
  load() { return this.initial; }
  save(list: AppNotification[]) { this.saved = list; }
}

const note = (id: string, read = false): AppNotification => ({
  id, type: 'system', title: id, message: id, createdAt: '2026-01-01T00:00:00.000Z', read,
});

describe('NotificationService', () => {
  it('loads whatever the repository provides', () => {
    expect(new NotificationService(new FakeRepository([note('a')])).getAll()).toEqual([note('a')]);
  });

  it('add puts the new notification first, unread, with a generated id and timestamp', () => {
    const repo = new FakeRepository();
    const next = new NotificationService(repo).add([note('old')], { type: 'goal', title: 't', message: 'm' });
    expect(next).toHaveLength(2);
    expect(next[0]).toMatchObject({ type: 'goal', title: 't', read: false });
    expect(next[0].id).toMatch(/^n-\d+-/);
    expect(Number.isNaN(Date.parse(next[0].createdAt))).toBe(false);
    expect(next[1].id).toBe('old');
  });

  it(`keeps at most ${MAX_NOTIFICATIONS}, dropping the oldest`, () => {
    const full = Array.from({ length: MAX_NOTIFICATIONS }, (_, i) => note(`n${i}`));
    const next = new NotificationService(new FakeRepository()).add(full, { type: 'system', title: 'new', message: '' });
    expect(next).toHaveLength(MAX_NOTIFICATIONS);
    expect(next[0].title).toBe('new');
    expect(next.at(-1)?.id).toBe(`n${MAX_NOTIFICATIONS - 2}`);
  });

  it('every change is saved through the repository and the input is never mutated', () => {
    const repo = new FakeRepository();
    const service = new NotificationService(repo);
    const before = [note('a'), note('b')];
    const snapshot = JSON.stringify(before);

    expect(service.markAsRead(before, 'a')[0].read).toBe(true);
    expect(repo.saved?.[0].read).toBe(true);
    expect(service.markAllAsRead(before).every(n => n.read)).toBe(true);
    expect(service.remove(before, 'a').map(n => n.id)).toEqual(['b']);
    expect(JSON.stringify(before)).toBe(snapshot);
  });

  it('clearRead keeps only unread; clearAll empties and saves', () => {
    const repo = new FakeRepository();
    const service = new NotificationService(repo);
    expect(service.clearRead([note('a', true), note('b', false)]).map(n => n.id)).toEqual(['b']);
    expect(service.clearAll()).toEqual([]);
    expect(repo.saved).toEqual([]);
  });

  it('counts unread', () => {
    expect(new NotificationService(new FakeRepository()).countUnread([note('a'), note('b', true), note('c')])).toBe(2);
  });

  it('lowStockNotice: none for an empty list, named for one product, counted for many', () => {
    const service = new NotificationService(new FakeRepository());
    expect(service.lowStockNotice([])).toBeNull();
    expect(service.lowStockNotice(['سماعة'])?.message).toContain('سماعة');
    expect(service.lowStockNotice(['a', 'b', 'c'])?.message).toContain('3');
    expect(service.lowStockNotice(['a'])?.link).toBe('/inventory');
  });
});
