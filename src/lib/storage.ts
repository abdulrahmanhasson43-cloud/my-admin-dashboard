import type { StorageKey } from '@/constants/storageKeys';

/**
 * Thin, failure-safe wrapper over `localStorage`.
 *
 * Contexts and repositories go through these helpers instead of touching
 * `localStorage` themselves, so (1) the try/catch for quota / private-mode /
 * corrupted-JSON cases lives in ONE place, and (2) swapping the storage
 * technology later (IndexedDB, Firestore, …) means changing this file only.
 *
 * Every function is safe to call during SSR or when storage is blocked: reads
 * return the fallback, writes return `false`.
 */

function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Reads and parses JSON. Returns `fallback` when missing, blocked, or corrupted. */
export function readJson<T>(key: StorageKey, fallback: T): T {
  const storage = getStorage();
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/** Serialises and stores a value. Returns whether the write succeeded. */
export function writeJson(key: StorageKey, value: unknown): boolean {
  return writeString(key, JSON.stringify(value));
}

export function readString(key: StorageKey): string | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: StorageKey, value: string): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
