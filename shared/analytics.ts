// Analytics engine (PDF features 13–20): student progress dashboard, weak-topic
// mapping, video drop-off + rewatch heatmap, parent weekly report, anonymous
// cohort comparison, export rows, revenue report. Pure functions only.

export type LessonFact = {
  lessonId: string;
  title: string;
  unitTitle: string;
  state: "locked" | "available" | "completed";
  watchPct: number; // 0..100
  quizBestPct: number | null; // 0..100
  topics: string[]; // topic tags for the lesson
};

export type WatchEvent = { lessonId: string; second: number; kind: "watched" | "left" | "rewatched" };

// ── 13 · per-student progress dashboard ───────────────────────────────────────

export type UnitProgress = { unitTitle: string; done: number; total: number; pct: number };

export function unitProgress(facts: LessonFact[]): UnitProgress[] {
  const byUnit = new Map<string, { done: number; total: number }>();
  for (const f of facts) {
    const u = byUnit.get(f.unitTitle) ?? { done: 0, total: 0 };
    u.total += 1;
    if (f.state === "completed") u.done += 1;
    byUnit.set(f.unitTitle, u);
  }
  return [...byUnit.entries()].map(([unitTitle, u]) => ({
    unitTitle,
    done: u.done,
    total: u.total,
    pct: u.total ? Math.round((u.done / u.total) * 100) : 0,
  }));
}

export function studyMinutesByDay(events: { at: string; gainedSec: number }[], days: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const d of days) out[d] = 0;
  for (const e of events) {
    const d = e.at.slice(0, 10);
    if (d in out) out[d] += Math.round(e.gainedSec / 60);
  }
  return out;
}

// ── 14 · weak-topic map ───────────────────────────────────────────────────────

export type TopicScore = { topic: string; attempts: number; avgPct: number };

export function weakTopics(facts: LessonFact[], threshold = 60): TopicScore[] {
  const acc = new Map<string, { sum: number; n: number }>();
  for (const f of facts) {
    if (f.quizBestPct == null) continue;
    for (const topic of f.topics) {
      const a = acc.get(topic) ?? { sum: 0, n: 0 };
      a.sum += f.quizBestPct;
      a.n += 1;
      acc.set(topic, a);
    }
  }
  return [...acc.entries()]
    .map(([topic, a]) => ({ topic, attempts: a.n, avgPct: Math.round(a.sum / a.n) }))
    .filter((t) => t.avgPct < threshold)
    .sort((a, b) => a.avgPct - b.avgPct);
}

// ── 15/16 · drop-off point + rewatch heatmap ──────────────────────────────────

export function dropOffPoint(events: WatchEvent[]): { second: number; count: number } | null {
  const lefts = new Map<number, number>();
  for (const e of events) {
    if (e.kind !== "left") continue;
    lefts.set(e.second, (lefts.get(e.second) ?? 0) + 1);
  }
  let best: { second: number; count: number } | null = null;
  for (const [second, count] of lefts) if (!best || count > best.count) best = { second, count };
  return best;
}

export function rewatchHeatmap(events: WatchEvent[], bucketSec = 30): { bucket: number; starts: number }[] {
  const buckets = new Map<number, number>();
  for (const e of events) {
    if (e.kind !== "rewatched") continue;
    const b = Math.floor(e.second / bucketSec);
    buckets.set(b, (buckets.get(b) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([bucket, starts]) => ({ bucket, starts })).sort((a, b) => a.bucket - b.bucket);
}

// ── 17 · parent weekly report ─────────────────────────────────────────────────

export function parentWeeklyReport(input: {
  studentName: string;
  minutesThisWeek: number;
  minutesLastWeek: number;
  lessonsDone: number;
  quizzesPassed: number;
  currentStreak: number;
}): string {
  const delta = input.minutesThisWeek - input.minutesLastWeek;
  const trend = delta > 0 ? `أكتر من الأسبوع اللي فات بـ ${delta} دقيقة` : delta < 0 ? `أقل من الأسبوع اللي فات بـ ${-delta} دقيقة` : "زي الأسبوع اللي فات بالظبط";
  return [
    `تقرير الأسبوع — ${input.studentName}:`,
    `ذاكر ${input.minutesThisWeek} دقيقة (${trend}).`,
    `كمّل ${input.lessonsDone} درس ونجح في ${input.quizzesPassed} كويز.`,
    input.currentStreak >= 3 ? `سلسلة مذاكرة ${input.currentStreak} أيام ورا بعض — استمرارية حلوة.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

// ── 18 · anonymous cohort comparison ──────────────────────────────────────────

export function cohortComparison(myPoints: number, cohortPoints: number[]): { percentile: number; avg: number; cohortSize: number } {
  const all = cohortPoints.filter((p) => Number.isFinite(p));
  if (!all.length) return { percentile: 0, avg: 0, cohortSize: 0 };
  const below = all.filter((p) => p < myPoints).length;
  const avg = Math.round(all.reduce((a, b) => a + b, 0) / all.length);
  return { percentile: Math.round((below / all.length) * 100), avg, cohortSize: all.length };
}

// ── 19 · export rows (CSV; PDF rendering happens in the UI layer) ─────────────

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
}

// ── 20 · revenue report ───────────────────────────────────────────────────────

export type RevenueReport = {
  topupsEgp: number;
  purchasesEgp: number;
  activeSubscriptions: number;
  renewals: number;
};

export function revenueReport(
  wallet: { type: string; amountEgp: number }[],
  enrollments: { status: string; renewedAt: string | null }[]
): RevenueReport {
  return {
    topupsEgp: wallet.filter((w) => w.type === "topup").reduce((a, w) => a + w.amountEgp, 0),
    purchasesEgp: wallet.filter((w) => w.type === "purchase").reduce((a, w) => a - w.amountEgp, 0),
    activeSubscriptions: enrollments.filter((e) => e.status === "active").length,
    renewals: enrollments.filter((e) => e.renewedAt).length,
  };
}
