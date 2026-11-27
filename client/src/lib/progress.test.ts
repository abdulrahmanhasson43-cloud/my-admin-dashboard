import { beforeEach, describe, expect, it } from "vitest";
import {
  GUEST_SCOPE,
  getLastLesson,
  isWatched,
  lastLessons,
  resetProgressCacheForTest,
  setLastLesson,
  toggleWatched,
  watchedCount,
  watchedTotal,
} from "./progress";

// Minimal in-memory Storage stand-in: the suite runs in the node environment,
// so localStorage does not exist unless we provide it.
function fakeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, String(v)),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    get length() {
      return map.size;
    },
  } satisfies Storage;
}

describe("progress (watched lessons)", () => {
  beforeEach(() => {
    resetProgressCacheForTest();
    (globalThis as Record<string, unknown>).localStorage = fakeStorage();
  });

  it("marks and unmarks a lesson", () => {
    expect(isWatched("u1", "l1")).toBe(false);
    expect(toggleWatched("u1", "l1")).toBe(true);
    expect(isWatched("u1", "l1")).toBe(true);
    expect(toggleWatched("u1", "l1")).toBe(false);
    expect(isWatched("u1", "l1")).toBe(false);
  });

  it("persists across cache resets", () => {
    toggleWatched("u1", "l1");
    resetProgressCacheForTest();
    expect(isWatched("u1", "l1")).toBe(true);
  });

  it("keeps each user's progress separate on the same browser", () => {
    toggleWatched("u1", "l1");
    toggleWatched("u2", "l2");
    expect(isWatched("u1", "l1")).toBe(true);
    expect(isWatched("u1", "l2")).toBe(false);
    expect(isWatched("u2", "l2")).toBe(true);
    expect(isWatched("u2", "l1")).toBe(false);
    expect(isWatched(GUEST_SCOPE, "l1")).toBe(false);
  });

  it("treats unscoped legacy data as guest progress", () => {
    localStorage.setItem("madar-watched-v1", JSON.stringify(["l1"]));
    expect(isWatched(GUEST_SCOPE, "l1")).toBe(true);
    expect(isWatched("u1", "l1")).toBe(false);
  });

  it("survives a corrupt stored payload", () => {
    localStorage.setItem("madar-watched-v1:u1", "{not json");
    expect(isWatched("u1", "l1")).toBe(false);
    expect(watchedCount("u1", ["l1", "l2"])).toBe(0);
  });

  it("ignores non-string entries in the stored array", () => {
    localStorage.setItem("madar-watched-v1:u1", JSON.stringify(["l1", 42, null]));
    expect(isWatched("u1", "l1")).toBe(true);
    expect(watchedCount("u1", ["l1", "l2"])).toBe(1);
  });

  it("counts only the asked-about lessons", () => {
    toggleWatched("u1", "l1");
    toggleWatched("u1", "other-course-lesson");
    expect(watchedCount("u1", ["l1", "l2", "l3"])).toBe(1);
  });

  it("works with storage completely unavailable", () => {
    delete (globalThis as Record<string, unknown>).localStorage;
    resetProgressCacheForTest();
    expect(toggleWatched("u1", "l1")).toBe(true);
    expect(isWatched("u1", "l1")).toBe(true);
  });

  it("counts every watched lesson for the profile stat", () => {
    toggleWatched("u1", "l1");
    toggleWatched("u1", "l2");
    toggleWatched("u2", "l3");
    expect(watchedTotal("u1")).toBe(2);
    expect(watchedTotal("u2")).toBe(1);
    expect(watchedTotal("u3")).toBe(0);
  });
});

describe("progress (last lesson per course)", () => {
  beforeEach(() => {
    resetProgressCacheForTest();
    (globalThis as Record<string, unknown>).localStorage = fakeStorage();
  });

  it("remembers and returns the last opened lesson", () => {
    expect(getLastLesson("u1", "algebra-1")).toBeNull();
    setLastLesson("u1", "algebra-1", { id: "l1", title: "المعادلات" });
    expect(getLastLesson("u1", "algebra-1")).toMatchObject({ lessonId: "l1", title: "المعادلات" });
  });

  it("overwrites with the most recent lesson", () => {
    setLastLesson("u1", "algebra-1", { id: "l1", title: "أ" });
    setLastLesson("u1", "algebra-1", { id: "l2", title: "ب" });
    expect(getLastLesson("u1", "algebra-1")?.lessonId).toBe("l2");
  });

  it("persists across cache resets and keeps scopes separate", () => {
    setLastLesson("u1", "algebra-1", { id: "l1", title: "أ" });
    resetProgressCacheForTest();
    expect(getLastLesson("u1", "algebra-1")?.lessonId).toBe("l1");
    expect(getLastLesson("u2", "algebra-1")).toBeNull();
    expect(getLastLesson("u1", "geometry-2")).toBeNull();
  });

  it("lists every course with a stopping point", () => {
    setLastLesson("u1", "algebra-1", { id: "l1", title: "أ" });
    setLastLesson("u1", "geometry-2", { id: "l9", title: "ب" });
    const all = lastLessons("u1");
    expect(all.map((r) => r.slug).sort()).toEqual(["algebra-1", "geometry-2"]);
    expect(all.find((r) => r.slug === "geometry-2")?.lesson.lessonId).toBe("l9");
  });

  it("survives a corrupt stored payload", () => {
    localStorage.setItem("madar-last-v1:u1", "{not json");
    expect(getLastLesson("u1", "algebra-1")).toBeNull();
    expect(lastLessons("u1")).toEqual([]);
  });
});
