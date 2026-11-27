import { describe, expect, it } from "vitest";
import {
  cohortComparison,
  dropOffPoint,
  parentWeeklyReport,
  revenueReport,
  rewatchHeatmap,
  studyMinutesByDay,
  toCsv,
  unitProgress,
  weakTopics,
  type LessonFact,
} from "./analytics";

const facts: LessonFact[] = [
  { lessonId: "l1", title: "المشتقة", unitTitle: "التفاضل", state: "completed", watchPct: 100, quizBestPct: 80, topics: ["مشتقة", "نهايات"] },
  { lessonId: "l2", title: "قواعد الاشتقاق", unitTitle: "التفاضل", state: "completed", watchPct: 95, quizBestPct: 40, topics: ["مشتقة"] },
  { lessonId: "l3", title: "التكامل المحدود", unitTitle: "التكامل", state: "available", watchPct: 30, quizBestPct: 55, topics: ["تكامل"] },
  { lessonId: "l4", title: "عزم القوة", unitTitle: "الاستاتيكا", state: "locked", watchPct: 0, quizBestPct: null, topics: ["استاتيكا"] },
];

describe("student dashboard (13)", () => {
  it("computes per-unit progress bars", () => {
    const u = unitProgress(facts);
    expect(u).toEqual([
      { unitTitle: "التفاضل", done: 2, total: 2, pct: 100 },
      { unitTitle: "التكامل", done: 0, total: 1, pct: 0 },
      { unitTitle: "الاستاتيكا", done: 0, total: 1, pct: 0 },
    ]);
  });
  it("sums study minutes per day", () => {
    const m = studyMinutesByDay(
      [
        { at: "2026-11-24T10:00:00Z", gainedSec: 1800 },
        { at: "2026-11-24T11:00:00Z", gainedSec: 600 },
        { at: "2026-11-25T09:00:00Z", gainedSec: 900 },
      ],
      ["2026-11-24", "2026-11-25", "2026-11-26"]
    );
    expect(m).toEqual({ "2026-11-24": 40, "2026-11-25": 15, "2026-11-26": 0 });
  });
});

describe("weak topics (14)", () => {
  it("flags topics under the threshold, weakest first", () => {
    const w = weakTopics(facts);
    // مشتقة averages exactly 60 → at the threshold, not below it, so excluded.
    expect(w.map((x) => x.topic)).toEqual(["تكامل"]);
    expect(w[0]).toEqual({ topic: "تكامل", attempts: 1, avgPct: 55 });
    const w75 = weakTopics(facts, 75);
    expect(w75.map((x) => x.topic)).toEqual(["تكامل", "مشتقة"]);
    expect(w75.find((x) => x.topic === "مشتقة")!.avgPct).toBe(60);
  });
});

describe("video analytics (15/16)", () => {
  it("finds the most common drop-off second", () => {
    const d = dropOffPoint([
      { lessonId: "l", second: 300, kind: "left" },
      { lessonId: "l", second: 300, kind: "left" },
      { lessonId: "l", second: 120, kind: "left" },
      { lessonId: "l", second: 500, kind: "watched" },
    ]);
    expect(d).toEqual({ second: 300, count: 2 });
  });
  it("builds a rewatch heatmap by bucket", () => {
    const h = rewatchHeatmap([
      { lessonId: "l", second: 305, kind: "rewatched" },
      { lessonId: "l", second: 310, kind: "rewatched" },
      { lessonId: "l", second: 30, kind: "rewatched" },
    ], 30);
    expect(h).toEqual([{ bucket: 1, starts: 1 }, { bucket: 10, starts: 2 }]);
  });
});

describe("parent weekly report (17)", () => {
  it("writes a readable Arabic summary with trend", () => {
    const r = parentWeeklyReport({ studentName: "عبدالرحمن", minutesThisWeek: 200, minutesLastWeek: 150, lessonsDone: 4, quizzesPassed: 3, currentStreak: 5 });
    expect(r).toContain("200 دقيقة");
    expect(r).toContain("أكتر من الأسبوع اللي فات بـ 50 دقيقة");
    expect(r).toContain("سلسلة مذاكرة 5 أيام");
  });
});

describe("cohort comparison (18)", () => {
  it("computes percentile and average without names", () => {
    const c = cohortComparison(120, [40, 60, 90, 120, 180]);
    expect(c).toEqual({ percentile: 60, avg: 98, cohortSize: 5 });
  });
});

describe("export + revenue (19/20)", () => {
  it("escapes CSV values with commas and quotes", () => {
    const csv = toCsv(["الاسم", "النقاط"], [["سامي, أحمد", 10], ['قال "تم"', 20]]);
    expect(csv).toBe('الاسم,النقاط\n"سامي, أحمد",10\n"قال ""تم""",20');
  });
  it("summarizes revenue", () => {
    const r = revenueReport(
      [
        { type: "topup", amountEgp: 1000 },
        { type: "purchase", amountEgp: -600 },
        { type: "purchase", amountEgp: -600 },
      ],
      [{ status: "active", renewedAt: null }, { status: "active", renewedAt: "x" }, { status: "expired", renewedAt: null }]
    );
    expect(r).toEqual({ topupsEgp: 1000, purchasesEgp: 1200, activeSubscriptions: 2, renewals: 1 });
  });
});
