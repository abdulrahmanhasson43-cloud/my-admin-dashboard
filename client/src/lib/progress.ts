import { useSyncExternalStore } from "react";

/**
 * Watched-lesson progress, kept on the device (localStorage).
 *
 * Deliberately client-side: progress is a convenience for the student, not
 * business data, so it works for logged-out visitors on free lessons too and
 * needs no migration. If cross-device sync is ever wanted, this module is the
 * single seam to swap for a server table.
 *
 * Every read/write takes a `scope` — the signed-in user's id, or "guest" when
 * logged out — so two students sharing one browser never see each other's
 * progress. Data from before scopes existed is treated as guest progress.
 *
 * The store survives corrupt JSON, blocked storage (private mode) and the
 * non-DOM test environment — every storage touch is guarded.
 */

const STORAGE_PREFIX = "madar-watched-v1";
export const GUEST_SCOPE = "guest";

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
    // Unscoped data written by the first version of this feature counts as
    // guest progress rather than disappearing.
    const legacy = scope === GUEST_SCOPE ? s.getItem(STORAGE_PREFIX) : null;
    for (const payload of [raw, legacy]) {
      if (!payload) continue;
      const parsed: unknown = JSON.parse(payload);
      if (Array.isArray(parsed)) {
        for (const id of parsed) if (typeof id === "string") set.add(id);
      }
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
    /* quota or blocked storage — progress just won't survive a reload */
  }
}

export function isWatched(scope: string, lessonId: string): boolean {
  return load(scope).has(lessonId);
}

/** Flip one lesson; returns the new state (true = now watched). */
export function toggleWatched(scope: string, lessonId: string): boolean {
  const set = load(scope);
  const next = !set.has(lessonId);
  if (next) set.add(lessonId);
  else set.delete(lessonId);
  persist(scope);
  version += 1;
  listeners.forEach((fn) => fn());
  return next;
}

export function watchedCount(scope: string, lessonIds: string[]): number {
  const set = load(scope);
  return lessonIds.reduce((n, id) => n + (set.has(id) ? 1 : 0), 0);
}

/** Every lesson this scope ever marked watched — the profile-page stat. */
export function watchedTotal(scope: string): number {
  return load(scope).size;
}

/* ── Last lesson per course ("continue where you stopped") ─────────────────
   A second store: course slug → the lesson the student opened most recently.
   Same scope rules and failure modes as the watched set above. */

const LAST_PREFIX = "madar-last-v1";

export interface LastLesson {
  lessonId: string;
  title: string;
  at: string;
}

const lastCache = new Map<string, Map<string, LastLesson>>();

function loadLast(scope: string): Map<string, LastLesson> {
  const hit = lastCache.get(scope);
  if (hit) return hit;
  const map = new Map<string, LastLesson>();
  lastCache.set(scope, map);
  const s = storage();
  if (!s) return map;
  try {
    const raw = s.getItem(`${LAST_PREFIX}:${scope}`);
    if (!raw) return map;
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      for (const [slug, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (
          v &&
          typeof v === "object" &&
          typeof (v as LastLesson).lessonId === "string" &&
          typeof (v as LastLesson).title === "string"
        ) {
          map.set(slug, {
            lessonId: (v as LastLesson).lessonId,
            title: (v as LastLesson).title,
            at: typeof (v as LastLesson).at === "string" ? (v as LastLesson).at : "",
          });
        }
      }
    }
  } catch {
    /* corrupt payload — start empty rather than crash the page */
  }
  return map;
}

function persistLast(scope: string) {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(
      `${LAST_PREFIX}:${scope}`,
      JSON.stringify(Object.fromEntries(loadLast(scope))),
    );
  } catch {
    /* quota or blocked storage */
  }
}

/** Remember the lesson a student just opened, so Home and the profile can resume it. */
export function setLastLesson(scope: string, courseSlug: string, lesson: { id: string; title: string }): void {
  loadLast(scope).set(courseSlug, {
    lessonId: lesson.id,
    title: lesson.title,
    at: new Date().toISOString(),
  });
  persistLast(scope);
  version += 1;
  listeners.forEach((fn) => fn());
}

export function getLastLesson(scope: string, courseSlug: string): LastLesson | null {
  return loadLast(scope).get(courseSlug) ?? null;
}

/** Every course with a remembered stopping point, most recent first. */
export function lastLessons(scope: string): { slug: string; lesson: LastLesson }[] {
  return [...loadLast(scope).entries()]
    .map(([slug, lesson]) => ({ slug, lesson }))
    .sort((a, b) => (b.lesson.at > a.lesson.at ? 1 : -1));
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/**
 * Re-render trigger for progress state. Components call this once, then read
 * with isWatched()/watchedCount() — the returned number only signals change.
 */
export function useWatchedVersion(): number {
  return useSyncExternalStore(subscribe, () => version);
}

/** Test hook: forget the in-memory copy so the next read re-hits storage. */
export function resetProgressCacheForTest(): void {
  cache.clear();
  lastCache.clear();
  version = 0;
  listeners.clear();
}
