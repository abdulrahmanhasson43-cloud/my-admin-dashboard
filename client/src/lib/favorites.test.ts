import { beforeEach, describe, expect, it } from "vitest";
import {
  FAV_GUEST_SCOPE,
  favoriteCount,
  favoriteIds,
  isFavorite,
  resetFavoritesCacheForTest,
  toggleFavorite,
} from "./favorites";

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

describe("favorites", () => {
  beforeEach(() => {
    resetFavoritesCacheForTest();
    (globalThis as Record<string, unknown>).localStorage = fakeStorage();
  });

  it("marks and unmarks a course", () => {
    expect(isFavorite("u1", "c1")).toBe(false);
    expect(toggleFavorite("u1", "c1")).toBe(true);
    expect(isFavorite("u1", "c1")).toBe(true);
    expect(toggleFavorite("u1", "c1")).toBe(false);
    expect(isFavorite("u1", "c1")).toBe(false);
  });

  it("persists across cache resets", () => {
    toggleFavorite("u1", "c1");
    resetFavoritesCacheForTest();
    expect(isFavorite("u1", "c1")).toBe(true);
  });

  it("keeps each user's favorites separate on the same browser", () => {
    toggleFavorite("u1", "c1");
    toggleFavorite("u2", "c2");
    expect(isFavorite("u1", "c1")).toBe(true);
    expect(isFavorite("u1", "c2")).toBe(false);
    expect(isFavorite("u2", "c2")).toBe(true);
    expect(isFavorite(FAV_GUEST_SCOPE, "c1")).toBe(false);
  });

  it("lists ids and counts them", () => {
    toggleFavorite("u1", "c1");
    toggleFavorite("u1", "c2");
    expect(favoriteIds("u1").sort()).toEqual(["c1", "c2"]);
    expect(favoriteCount("u1")).toBe(2);
    expect(favoriteCount("u2")).toBe(0);
  });

  it("survives a corrupt stored payload", () => {
    localStorage.setItem("madar-favs-v1:u1", "{not json");
    expect(isFavorite("u1", "c1")).toBe(false);
    expect(favoriteCount("u1")).toBe(0);
  });

  it("works with storage completely unavailable", () => {
    delete (globalThis as Record<string, unknown>).localStorage;
    resetFavoritesCacheForTest();
    expect(toggleFavorite("u1", "c1")).toBe(true);
    expect(isFavorite("u1", "c1")).toBe(true);
  });
});
