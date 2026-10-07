import { describe, expect, it } from 'vitest';
import { generateId, generateNumericId, pickUniqueId } from './utils';

describe('pickUniqueId', () => {
  it('returns the first generated id when it is free', async () => {
    const id = await pickUniqueId(() => 'X-1', async () => false, 'X');
    expect(id).toBe('X-1');
  });

  it('skips taken ids and returns the first free one', async () => {
    const queue = ['X-1', 'X-2', 'X-3'];
    const taken = new Set(['X-1', 'X-2']);
    const id = await pickUniqueId(() => queue.shift() as string, async candidate => taken.has(candidate), 'X');
    expect(id).toBe('X-3');
  });

  it('falls back to a time-based id (never colliding) when every attempt is taken', async () => {
    let calls = 0;
    const id = await pickUniqueId(() => { calls++; return 'X-1'; }, async () => true, 'X', 5);
    expect(calls).toBe(5);
    expect(id).toMatch(/^X-\d+-/);
  });
});

describe('id generators', () => {
  it('generateId carries the prefix and differs between calls', () => {
    const a = generateId('P');
    expect(a.startsWith('P-')).toBe(true);
    expect(new Set(Array.from({ length: 200 }, () => generateId('P'))).size).toBeGreaterThan(190);
  });

  it('generateNumericId stays inside the range', () => {
    for (let i = 0; i < 200; i++) {
      const n = Number(generateNumericId('N', 100, 999).split('-')[1]);
      expect(n).toBeGreaterThanOrEqual(100);
      expect(n).toBeLessThan(999);
    }
  });
});
