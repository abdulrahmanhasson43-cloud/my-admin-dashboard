import { describe, expect, it } from "vitest";
import {
  buildExamNotices,
  buildSubscriptionNotices,
  generateCodeString,
  mergeNotifications,
  normalizeArabic,
  normalizeCode,
  ratingSummary,
  redeemTopupCode,
  searchCatalog,
  unreadCount,
  upsertReview,
  validateLessonInput,
  type AppNotification,
  type TopupCode,
} from "./platform";

const code: TopupCode = {
  id: "c1", code: "ABCDE12345", valueEgp: 100, createdBy: "owner",
  usedBy: null, usedAt: null, createdAt: "2026-11-20T00:00:00.000Z",
};

describe("topup codes (47)", () => {
  it("generates codes from a safe alphabet", () => {
    const c = generateCodeString(() => 0.5);
    expect(c).toHaveLength(10);
    expect(/^[A-HJ-NP-Z2-9]+$/.test(c)).toBe(true);
  });
  it("normalizes input (case, dashes)", () => {
    expect(normalizeCode("abcde-1234 5")).toBe("ABCDE12345");
  });
  it("redeems a valid code once and credits the right user", () => {
    const codes = [{ ...code }];
    const r = redeemTopupCode(codes, "abcde12345", "u1", "2026-11-26T10:00:00.000Z");
    expect(r.ok).toBe(true);
    expect(codes[0].usedBy).toBe("u1");
    const again = redeemTopupCode(codes, "abcde12345", "u1", "2026-11-26T10:05:00.000Z");
    expect(again.ok).toBe(false);
  });
  it("rejects unknown codes", () => {
    expect(redeemTopupCode([{ ...code }], "NOPE", "u1", "x").ok).toBe(false);
  });
});

describe("notifications (48)", () => {
  const now = new Date("2026-11-26T00:00:00.000Z").getTime();
  it("warns only inside the expiry window", () => {
    const subs = [
      { userId: "u", courseId: "c1", courseTitle: "كورس أ", expiresAt: "2026-11-28T00:00:00.000Z" },
      { userId: "u", courseId: "c2", courseTitle: "كورس ب", expiresAt: "2026-12-20T00:00:00.000Z" },
      { userId: "u", courseId: "c3", courseTitle: "كورس ج", expiresAt: "2026-11-25T00:00:00.000Z" },
    ];
    const n = buildSubscriptionNotices(subs, now, 3);
    expect(n.map((x) => x.ref)).toEqual(["c1"]);
    expect(n[0].body).toContain("كورس أ");
  });
  it("warns about near exams", () => {
    const n = buildExamNotices([{ userId: "u", examId: "e1", title: "امتحان التفاضل", startsAt: "2026-11-27T12:00:00.000Z" }], now, 2);
    expect(n).toHaveLength(1);
    expect(n[0].kind).toBe("exam_reminder");
  });
  it("merges without duplicating ids and counts unread", () => {
    const a: AppNotification = { id: "n1", userId: "u", kind: "general", title: "t", body: "b", ref: null, readAt: null, createdAt: "2026-11-26T01:00:00.000Z" };
    const merged = mergeNotifications([a], [{ ...a }, { ...a, id: "n2", createdAt: "2026-11-26T02:00:00.000Z" }]);
    expect(merged).toHaveLength(2);
    expect(merged[0].id).toBe("n2");
    expect(unreadCount(merged, "u")).toBe(2);
    merged[0].readAt = "x";
    expect(unreadCount(merged, "u")).toBe(1);
  });
});

describe("course reviews (49)", () => {
  it("upserts one review per user per course", () => {
    let list = upsertReview([], { id: "r1", courseId: "c", userId: "u", rating: 4, text: "كويس", createdAt: "t" });
    list = upsertReview(list, { id: "r2", courseId: "c", userId: "u", rating: 5, text: "ممتاز", createdAt: "t2" });
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("r1");
    expect(list[0].rating).toBe(5);
  });
  it("summarizes average and count", () => {
    const list = [
      { id: "1", courseId: "c", userId: "a", rating: 5, text: "", createdAt: "" },
      { id: "2", courseId: "c", userId: "b", rating: 3, text: "", createdAt: "" },
      { id: "3", courseId: "x", userId: "a", rating: 1, text: "", createdAt: "" },
    ];
    expect(ratingSummary(list, "c")).toEqual({ avg: 4, count: 2 });
    expect(ratingSummary(list, "none")).toEqual({ avg: 0, count: 0 });
  });
});

describe("global search (50)", () => {
  const data = {
    courses: [
      { id: "c1", slug: "s1", title: "تفاضل وتكامل", description: "شرح قواعد الاشتقاق", stage: "secondary" },
      { id: "c2", slug: "s2", title: "هندسة إعدادية", description: "زوايا وأشكال", stage: "prep" },
    ],
    lessons: [
      { id: "l1", courseId: "c1", title: "قاعدة السلسلة" },
      { id: "l2", courseId: "c2", title: "الزوايا المتقابلة" },
    ],
    teachers: [{ userId: "t1", displayName: "أستاذ أحمد" }],
  };
  it("normalizes Arabic variants", () => {
    expect(normalizeArabic("الإشتقاق")).toBe(normalizeArabic("الاشتقاق"));
    expect(normalizeArabic("هندسة")).toBe(normalizeArabic("هندسه"));
  });
  it("finds courses, lessons and teachers", () => {
    const hits = searchCatalog(data, "اشتقاق");
    expect(hits.some((h) => h.type === "course" && h.id === "c1")).toBe(true);
    expect(searchCatalog(data, "السلسلة").some((h) => h.type === "lesson")).toBe(true);
    expect(searchCatalog(data, "أحمد").some((h) => h.type === "teacher")).toBe(true);
  });
  it("filters by stage", () => {
    const hits = searchCatalog(data, "ا", "prep");
    expect(hits.every((h) => h.type === "teacher" || h.stage === "prep")).toBe(true);
  });
  it("returns nothing for empty query", () => {
    expect(searchCatalog(data, "  ")).toEqual([]);
  });
});

describe("teacher lesson validation (46)", () => {
  it("accepts a valid lesson", () => {
    expect(validateLessonInput({
      title: "درس", videoUrl: "https://x.test/v.mp4", durationSec: 300, isFree: false,
      quiz: [{ q: "سؤال", choices: ["أ", "ب"], correct: 0 }],
    })).toEqual([]);
  });
  it("flags bad url, short duration and broken quiz", () => {
    const errs = validateLessonInput({
      title: "", videoUrl: "nope", durationSec: 5, isFree: false,
      quiz: [{ q: "", choices: ["أ"], correct: 3 }],
    });
    expect(errs.length).toBeGreaterThanOrEqual(4);
  });
});
