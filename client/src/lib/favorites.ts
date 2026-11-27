import { useSyncExternalStore } from "react";

/**
 * Favorite courses, kept on the device (localStorage) — same rules as
 * lib/progress.ts: convenience data, scoped per signed-in user (or "guest"),
 * guarded against corrupt JSON, blocked storage and the non-DOM test
 * environment. Swap this single module for a server table if favorites ever
 * need to sync across devices.
 */

const STORAGE_PREFIX = "madar-favs-v1";
export const FAV_GUEST_SCOPE = "guest";

const listeners = new Set<() => void>();
const cache = new Map<string, Set<string>>();
let version = 0;

function storage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function load(scope: string): Set<string> {
  const hit = cache.get(scope);
  if (hit) return hit;
  const set = new Set<string>();
  cache.set(scope, set);
  const s = storage();
  if (!s) return set;
  try {
    const raw = s.getItem(`${STORAGE_PREFIX}:${scope}`);
    if (!raw) return set;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      for (const id of parsed) if (typeof id === "string") set.add(id);
    }
  } catch {
    /* corrupt payload — start empty rather than crash the page */
  }
  return set;
}

function persist(scope: string) {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(`${STORAGE_PREFIX}:${scope}`, JSON.stringify([...load(scope)]));
  } catch {
    /* quota or blocked storage — favorites just won't survive a reload */
  }
}

export function isFavorite(scope: string, courseId: string): boolean {
  return load(scope).has(courseId);
}

/** Flip one course; returns the new state (true = now a favorite). */
export function toggleFavorite(scope: string, courseId: string): boolean {
  const set = load(scope);
  const next = !set.has(courseId);
  if (next) set.add(courseId);
  else set.delete(courseId);
  persist(scope);
  version += 1;
  listeners.forEach((fn) => fn());
  return next;
}

/** All favorite course ids for the scope. */
export function favoriteIds(scope: string): string[] {
  return [...load(scope)];
}

export function favoriteCount(scope: string): number {
  return load(scope).size;
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Re-render trigger — same contract as useWatchedVersion() in lib/progress. */
export function useFavoritesVersion(): number {
  return useSyncExternalStore(subscribe, () => version);
}

/** Test hook: forget the in-memory copy so the next read re-hits storage. */
export function resetFavoritesCacheForTest(): void {
  cache.clear();
  version = 0;
  listeners.clear();
}
