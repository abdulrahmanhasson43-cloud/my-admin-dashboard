// Story tests for the platform & admin group (features 46–50) against the demo store.
import { beforeEach, describe, expect, it } from "vitest";
import { demoCall, resetDemo } from "./demo-api";

async function login(email: string, password: string) {
  await demoCall("auth.login", { email, password });
}
async function call(path: string, input: unknown = {}) {
  return demoCall(path, input);
}

describe("platform & admin demo stories (46–50)", () => {
  beforeEach(() => {
    resetDemo();
  });

  it("student redeems a top-up code once; balance grows; second use rejected", async () => {
    await login("student@madar.test", "Student2026!");
    const before: any = await call("wallet.summary");
    const r: any = await call("codes.redeem", { code: "madar10001" });
    expect(r.ok).toBe(true);
    expect(r.valueEgp).toBe(100);
    expect(r.balanceEgp).toBe(before.balanceEgp + 100);
    await expect(call("codes.redeem", { code: "MADAR10001" })).rejects.toThrow();
  });

  it("rejects an unknown code", async () => {
    await login("student@madar.test", "Student2026!");
    await expect(call("codes.redeem", { code: "NOPE123" })).rejects.toThrow();
  });

  it("owner generates codes and lists them; student cannot", async () => {
    await login("owner@madar.test", "MadarOwner2026!");
    const g: any = await call("codes.generate", { count: 3, valueEgp: 75 });
    expect(g.codes).toHaveLength(3);
    expect(new Set(g.codes.map((c: any) => c.code)).size).toBe(3);
    const list: any = await call("codes.list");
    expect(list.length).toBeGreaterThanOrEqual(5); // 2 seeded + 3 new
    await demoCall("auth.logout", {});
    await login("student@madar.test", "Student2026!");
    await expect(call("codes.generate", { count: 1, valueEgp: 50 })).rejects.toThrow();
    await expect(call("codes.list")).rejects.toThrow();
  });

  it("notifications list shows seeded reminders and marks read", async () => {
    await login("student@madar.test", "Student2026!");
    const r: any = await call("notify.list");
    expect(r.items.length).toBeGreaterThanOrEqual(2);
    expect(r.unread).toBeGreaterThanOrEqual(2);
    await call("notify.read", { id: r.items[0].id });
    const r2: any = await call("notify.list");
    expect(r2.unread).toBe(r.unread - 1);
    await call("notify.readAll");
    expect((await call("notify.list") as any).unread).toBe(0);
  });

  it("course reviews: enrolled student posts one review, upsert replaces it", async () => {
    await login("student@madar.test", "Student2026!");
    const course: any = await call("catalog.course", { slug: "sec-3-term-1" });
    // enroll first (wallet has demo balance)
    await call("learning.purchase", { courseId: course.course.id }).catch(() => {});
    const up: any = await call("reviews.upsert", { courseId: course.course.id, rating: 5, text: "كورس ممتاز فعلًا" });
    expect(up.ok).toBe(true);
    await call("reviews.upsert", { courseId: course.course.id, rating: 4, text: "رأيي اتعدل" });
    const list: any = await call("reviews.list", { courseId: course.course.id });
    const mine = list.items.filter((r: any) => r.userName);
    expect(list.summary.count).toBe(4); // 3 seeded + mine (upsert, not duplicate)
    expect(list.summary.avg).toBeCloseTo((5 + 4 + 5 + 4) / 4, 1);
    expect(mine.length).toBe(4);
  });

  it("reviews require enrollment", async () => {
    await demoCall("auth.signup", { email: "fresh@madar.test", password: "Fresh2026!x", name: "جديد" });
    const course: any = await call("catalog.course", { slug: "sec-3-term-1" });
    await expect(call("reviews.upsert", { courseId: course.course.id, rating: 5, text: "مش مشترك" })).rejects.toThrow();
  });

  it("global search finds courses, lessons and teachers with stage filter", async () => {
    const hits: any = await call("search.query", { q: "تفاضل" });
    expect(hits.hits.some((h: any) => h.type === "course")).toBe(true);
    const lessons: any = await call("search.query", { q: "اشتقاق" });
    expect(lessons.hits.some((h: any) => h.type === "lesson")).toBe(true);
    const teachers: any = await call("search.query", { q: "المالك" });
    expect(teachers.hits.some((h: any) => h.type === "teacher")).toBe(true);
    const prep: any = await call("search.query", { q: "ا", stage: "prep" });
    expect(prep.hits.every((h: any) => h.type === "teacher" || h.stage === "prep")).toBe(true);
  });

  it("teacher adds a lesson with quiz; it appears in the course; validation rejects bad input", async () => {
    await login("owner@madar.test", "MadarOwner2026!");
    const course: any = await call("catalog.course", { slug: "sec-3-term-1" });
    const r: any = await call("teacher.addLesson", {
      courseId: course.course.id,
      title: "درس جديد من الاستوديو",
      videoUrl: "https://example.com/v.mp4",
      durationSec: 600,
      isFree: true,
      quiz: [{ q: "سؤال", choices: ["أ", "ب"], correct: 0 }],
    });
    expect(r.lesson.title).toContain("استوديو");
    const after: any = await call("catalog.course", { slug: "sec-3-term-1" });
    expect(after.lessons.some((l: any) => l.title === "درس جديد من الاستوديو")).toBe(true);
    await expect(call("teacher.addLesson", { courseId: course.course.id, title: "", videoUrl: "bad", durationSec: 5, isFree: false, quiz: [] })).rejects.toThrow();
  });

  it("teacher adds a course; students cannot", async () => {
    await login("owner@madar.test", "MadarOwner2026!");
    const r: any = await call("teacher.addCourse", { title: "كورس جديد", stage: "secondary", priceEgp: 300 });
    expect(r.course.title).toBe("كورس جديد");
    await demoCall("auth.logout", {});
    await login("student@madar.test", "Student2026!");
    await expect(call("teacher.addCourse", { title: "ممنوع", stage: "prep", priceEgp: 100 })).rejects.toThrow();
  });
});
