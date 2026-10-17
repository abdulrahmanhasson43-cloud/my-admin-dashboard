import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { readJson, readString, writeJson, writeString } from './storage';

/** Minimal in-memory stand-in for window.localStorage. */
function createFakeStorage(overrides: Partial<Storage> = {}): Storage {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
    clear: () => data.clear(),
    key: () => null,
    get length() {
      return data.size;
    },
    ...overrides,
  } as Storage;
}

function stubBrowser(storage: Storage) {
  vi.stubGlobal('window', { localStorage: storage });
}

beforeEach(() => stubBrowser(createFakeStorage()));
afterEach(() => vi.unstubAllGlobals());

describe('storage helpers', () => {
  it('round-trips JSON values', () => {
    expect(writeJson(STORAGE_KEYS.shifts, [{ id: 's1' }])).toBe(true);
    expect(readJson(STORAGE_KEYS.shifts, [])).toEqual([{ id: 's1' }]);
  });

  it('returns the fallback when nothing is stored', () => {
    expect(readJson(STORAGE_KEYS.heldOrders, ['fallback'])).toEqual(['fallback']);
    expect(readString(STORAGE_KEYS.theme)).toBeNull();
  });

  it('returns the fallback instead of throwing on corrupted JSON', () => {
    writeString(STORAGE_KEYS.salesGoal, '{not valid json');
    expect(readJson(STORAGE_KEYS.salesGoal, null)).toBeNull();
  });

  it('reports failure (false) when the browser refuses the write', () => {
    stubBrowser(
      createFakeStorage({
        setItem: () => {
          throw new Error('QuotaExceededError');
        },
      }),
    );
    expect(writeString(STORAGE_KEYS.theme, 'dark')).toBe(false);
  });

  it('is safe when there is no window (SSR / tests)', () => {
    vi.stubGlobal('window', undefined);
    expect(readString(STORAGE_KEYS.theme)).toBeNull();
    expect(writeString(STORAGE_KEYS.theme, 'dark')).toBe(false);
  });
});

describe('STORAGE_KEYS', () => {
  it('has no duplicate values (two features must never share a key)', () => {
    const values = Object.values(STORAGE_KEYS);
    expect(new Set(values).size).toBe(values.length);
  });
});
