// Story tests for the analytics group (features 13–20) against the demo store.
import { beforeEach, describe, expect, it } from "vitest";
import { demoCall, resetDemo } from "./demo-api";

const call = (path: string, input?: unknown) => demoCall(path, input ?? {});

describe("analytics demo stories (13–20)", () => {
  beforeEach(() => resetDemo());

  it("student dashboard: unit progress, week minutes, cohort comparison", async () => {
    await call("auth.login", { email: "student@madar.test", password: "Student2026!" });
    const course: any = await call("catalog.course", { slug: "sec-3-term-1" });
    await call("learning.purchase", { courseId: course.course.id });
    const r: any = await call("analytics.dashboard");
    expect(r.units.length).toBeGreaterThan(0);
    expect(r.units[0]).toHaveProperty("pct");
    expect(r.weekMinutes).toHaveLength(7);
    expect(r.weekMinutes.every((d: any) => d.minutes >= 0)).toBe(true);
    // cohort: classmates have seeded weekly points, so a size and avg exist
    expect(r.cohort.cohortSize).toBeGreaterThanOrEqual(5);
    expect(r.cohort.avg).toBeGreaterThan(0);
    expect(r.cohort.percentile).toBeGreaterThanOrEqual(0);
  });

  it("heartbeat feeds the study-minutes chart (13)", async () => {
    await call("auth.login", { email: "student@madar.test", password: "Student2026!" });
    const detail: any = await call("catalog.course", { slug: "sec-3-term-1" });
    const lesson = detail.lessons[0];
    const before: any = await call("analytics.dashboard");
    const beforeToday = before.weekMinutes[6].minutes;
    await call("progress.heartbeat", { lessonId: lesson.id, positionSec: 300, deltaSec: 300 });
    const after: any = await call("analytics.dashboard");
    expect(after.weekMinutes[6].minutes).toBeGreaterThan(beforeToday);
  });

  it("weak topics show after a low quiz score (14)", async () => {
    await call("auth.login", { email: "student@madar.test", password: "Student2026!" });
    const course: any = await call("catalog.course", { slug: "sec-3-term-1" });
    await call("learning.purchase", { courseId: course.course.id });
    const lesson = course.lessons[0];
    const full: any = await call("learning.lesson", { lessonId: lesson.id });
    const dur = full.lesson.durationSec;
    // bank full watch coverage in 30-second beats (the server cap per beat)
    for (let pos = 30; pos <= dur + 30; pos += 30) {
      await call("progress.heartbeat", { lessonId: lesson.id, positionSec: pos, deltaSec: 30 });
    }
    // fail the quiz on purpose (all answers wrong)
    await call("quiz.submit", { lessonId: lesson.id, answers: [1, 1, 1, 1, 1, 1, 1, 1] });
    const r: any = await call("analytics.dashboard");
    expect(Array.isArray(r.weak)).toBe(true);
    expect(r.weak.length).toBeGreaterThan(0);
    expect(r.weak[0].avgPct).toBeLessThan(60);
  });

  it("parent weekly report reads naturally (17)", async () => {
    await call("auth.login", { email: "student@madar.test", password: "Student2026!" });
    const r: any = await call("parent.report");
    expect(r.text).toContain("تقرير الأسبوع");
    expect(r.text).toContain("طالب تجريبي");
    expect(r.text).toMatch(/دقيقة/);
  });

  it("teacher video stats: drop-off point and rewatch heatmap (15/16)", async () => {
    await call("auth.login", { email: "owner@madar.test", password: "MadarOwner2026!" });
    const detail: any = await call("catalog.course", { slug: "sec-3-term-1" });
    const r: any = await call("videoStats.stats", { lessonId: detail.lessons[0].id });
    expect(r.dropOff).not.toBeNull();
    expect(r.dropOff.second).toBeGreaterThanOrEqual(780);
    expect(r.dropOff.count).toBeGreaterThanOrEqual(2);
    expect(r.heatmap.length).toBeGreaterThan(0);
    expect(r.viewers).toBeGreaterThanOrEqual(6);
  });

  it("video stats are staff-only", async () => {
    await call("auth.login", { email: "student@madar.test", password: "Student2026!" });
    const detail: any = await call("catalog.course", { slug: "sec-3-term-1" });
    await expect(call("videoStats.stats", { lessonId: detail.lessons[0].id })).rejects.toThrow();
  });

  it("revenue report + CSV export (19/20)", async () => {
    await call("auth.login", { email: "owner@madar.test", password: "MadarOwner2026!" });
    const rep: any = await call("revenue.report");
    expect(rep.topupsEgp).toBeGreaterThanOrEqual(2000);
    expect(rep.purchasesEgp).toBeGreaterThanOrEqual(0);
    const csv: any = await call("analytics.exportCsv", { what: "revenue" });
    expect(csv.filename).toBe("madar-revenue.csv");
    expect(csv.csv.split("\n")[0]).toContain("الكورس");
  });

  it("student exports their own progress CSV but not revenue (19)", async () => {
    await call("auth.login", { email: "student@madar.test", password: "Student2026!" });
    const csv: any = await call("analytics.exportCsv", { what: "progress" });
    expect(csv.filename).toBe("madar-progress.csv");
    expect(csv.csv).toContain("الدرس");
    await expect(call("analytics.exportCsv", { what: "revenue" })).rejects.toThrow();
    await expect(call("revenue.report")).rejects.toThrow();
  });
});
