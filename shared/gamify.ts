// ─────────────────────────────────────────────────────────────────────────────
// مدار motivation & engagement engine — التفاعل والتحفيز (features 30–37,
// except 36 certificates which v7 already shipped).
//
// Pure deterministic logic, shared verbatim between the demo store and the
// real server:
//
//   30 نقاط وشارات وسلاسل أيام   POINT_VALUES / evaluateBadges() / streaks()
//   31 لوحة شرف أسبوعية          pointsInWeek() / rankLeaderboard()
//   32 تحديات بين الأصدقاء       challengeStanding() / challengeWinner()
//   33 نقاش تحت كل درس           (data only — sorting helpers)
//   34 حصص لايف مع شات           liveStatus()
//   35 تقييم الزمالاء للواجبات   PEER_RUBRIC / aggregatePeerReviews()
//   37 أهداف يومية وتذكيرات      goalProgress()
// ─────────────────────────────────────────────────────────────────────────────

export interface PointEvent {
  kind: PointKind;
  points: number;
  /** ISO timestamp. */
  at: string;
  /** Optional reference (lesson id, challenge id, …) for idempotent awarding. */
  ref?: string;
}

export type PointKind =
  | "lesson_watched"
  | "quiz_passed"
  | "quiz_perfect"
  | "discussion_post"
  | "discussion_reply"
  | "daily_goal_met"
  | "weekly_goal_met"
  | "challenge_won"
  | "peer_review_given"
  | "live_attended";

/** Fixed point table — shown to the student so the rules are never a secret. */
export const POINT_VALUES: Record<PointKind, number> = {
  lesson_watched: 10,
  quiz_passed: 20,
  quiz_perfect: 30,
  discussion_post: 5,
  discussion_reply: 3,
  daily_goal_met: 15,
  weekly_goal_met: 25,
  challenge_won: 25,
  peer_review_given: 10,
  live_attended: 10,
};

export function pointsOf(events: PointEvent[]): number {
  return events.reduce((sum, e) => sum + e.points, 0);
}

// ─── 30: badges ──────────────────────────────────────────────────────────────

export interface BadgeDef {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
}

export const BADGES: BadgeDef[] = [
  { id: "first-lesson", titleAr: "أول خطوة", titleEn: "First step", descAr: "خلّصت أول درس", descEn: "Finished your first lesson" },
  { id: "first-quiz", titleAr: "أول كويز", titleEn: "First quiz", descAr: "عدّيت أول كويز", descEn: "Passed your first quiz" },
  { id: "perfect-quiz", titleAr: "علامة كاملة", titleEn: "Full marks", descAr: "جبت ١٠٠٪ في كويز", descEn: "Scored 100% on a quiz" },
  { id: "streak-3", titleAr: "٣ أيام ورا بعض", titleEn: "3-day streak", descAr: "ذاكرت ٣ أيام متتالية", descEn: "Studied 3 days in a row" },
  { id: "streak-7", titleAr: "أسبوع كامل", titleEn: "Full week", descAr: "ذاكرت ٧ أيام متتالية", descEn: "Studied 7 days in a row" },
  { id: "streak-30", titleAr: "شهر من الالتزام", titleEn: "A month committed", descAr: "ذاكرت ٣٠ يوم متتالي", descEn: "Studied 30 days in a row" },
  { id: "points-100", titleAr: "أول ١٠٠ نقطة", titleEn: "First 100 points", descAr: "جمعت ١٠٠ نقطة", descEn: "Earned 100 points" },
  { id: "points-500", titleAr: "٥٠٠ نقطة", titleEn: "500 points", descAr: "جمعت ٥٠٠ نقطة", descEn: "Earned 500 points" },
  { id: "social-5", titleAr: "مشارك وفيّ", titleEn: "Faithful contributor", descAr: "كتبت ٥ مشاركات في النقاش", descEn: "Wrote 5 discussion posts" },
  { id: "challenger", titleAr: "متحدّي", titleEn: "Challenger", descAr: "كسبت أول تحدّي", descEn: "Won your first challenge" },
  { id: "reviewer", titleAr: "عين خبيرة", titleEn: "Expert eye", descAr: "قيّمت واجب زميل", descEn: "Reviewed a peer's assignment" },
  { id: "live", titleAr: "حاضر لايف", titleEn: "Live attendee", descAr: "حضرت حصة لايف", descEn: "Attended a live session" },
];

export interface GamifyStats {
  lessonsWatched: number;
  quizzesPassed: number;
  perfectQuizzes: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  discussionPosts: number;
  challengesWon: number;
  reviewsGiven: number;
  liveAttended: number;
}

/** Which badges these stats unlock, in catalog order. */
export function evaluateBadges(s: GamifyStats): string[] {
  const out: string[] = [];
  if (s.lessonsWatched >= 1) out.push("first-lesson");
  if (s.quizzesPassed >= 1) out.push("first-quiz");
  if (s.perfectQuizzes >= 1) out.push("perfect-quiz");
  if (s.longestStreak >= 3 || s.currentStreak >= 3) out.push("streak-3");
  if (s.longestStreak >= 7 || s.currentStreak >= 7) out.push("streak-7");
  if (s.longestStreak >= 30 || s.currentStreak >= 30) out.push("streak-30");
  if (s.totalPoints >= 100) out.push("points-100");
  if (s.totalPoints >= 500) out.push("points-500");
  if (s.discussionPosts >= 5) out.push("social-5");
  if (s.challengesWon >= 1) out.push("challenger");
  if (s.reviewsGiven >= 1) out.push("reviewer");
  if (s.liveAttended >= 1) out.push("live");
  return out;
}

// ─── 30: day streaks ─────────────────────────────────────────────────────────

/** Local calendar day "YYYY-MM-DD" of an ISO timestamp. */
export function dayKey(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shiftDay(key: string, delta: number): string {
  const d = new Date(`${key}T12:00:00`);
  d.setDate(d.getDate() + delta);
  return dayKey(d);
}

export interface StreakInfo {
  current: number;
  longest: number;
  /** True when the student already studied today. */
  activeToday: boolean;
}

/**
 * Current + longest streak from a set of active days (YYYY-MM-DD).
 * A streak is still alive when the latest active day is today or yesterday.
 */
export function streaks(days: string[], today: string): StreakInfo {
  const set = new Set(days);
  const activeToday = set.has(today);
  let current = 0;
  let cursor = activeToday ? today : shiftDay(today, -1);
  while (set.has(cursor)) {
    current += 1;
    cursor = shiftDay(cursor, -1);
  }
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of [...set].sort()) {
    run = prev !== null && shiftDay(prev, 1) === d ? run + 1 : 1;
    if (run > longest) longest = run;
    prev = d;
  }
  return { current, longest, activeToday };
}

// ─── 31: weekly leaderboard ──────────────────────────────────────────────────

/** Monday 00:00 local of the week containing `d`. */
export function weekStart(d: string | Date): Date {
  const date = typeof d === "string" ? new Date(d) : new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  const dow = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - dow);
  return date;
}

export function pointsInWeek(events: PointEvent[], ref: string | Date): number {
  const start = weekStart(ref);
  const end = new Date(start.getTime());
  end.setDate(end.getDate() + 7);
  return events
    .filter((e) => {
      const t = new Date(e.at).getTime();
      return t >= start.getTime() && t < end.getTime();
    })
    .reduce((s, e) => s + e.points, 0);
}

export interface LeaderRow {
  userId: string;
  name: string;
  points: number;
  isMe?: boolean;
}

/** Ranked leaderboard, ties share a rank. Opted-out students are excluded upstream. */
export function rankLeaderboard(rows: LeaderRow[]): (LeaderRow & { rank: number })[] {
  const sorted = [...rows].sort((a, b) => b.points - a.points || a.name.localeCompare(b.name, "ar"));
  let rank = 0;
  let prevPoints: number | null = null;
  return sorted.map((r, i) => {
    if (prevPoints === null || r.points < prevPoints) rank = i + 1;
    prevPoints = r.points;
    return { ...r, rank };
  });
}

// ─── 32: friend challenges ───────────────────────────────────────────────────

export interface ChallengePlayer {
  userId: string;
  name: string;
  /** Quiz percentage 0–100, null until they finish. */
  score: number | null;
  finishedAt: string | null;
}

export interface Challenge {
  id: string;
  lessonId: string;
  createdBy: string;
  createdAt: string;
  players: ChallengePlayer[];
}

export type ChallengeState = "waiting" | "running" | "done";

export function challengeState(ch: Challenge): ChallengeState {
  const finished = ch.players.filter((p) => p.score !== null).length;
  if (finished === 0) return "waiting";
  return finished === ch.players.length ? "done" : "running";
}

/** Highest score wins; ties broken by who finished first. Null while undecided. */
export function challengeWinner(ch: Challenge): string | null {
  if (challengeState(ch) !== "done") return null;
  const done = ch.players.filter((p) => p.score !== null);
  done.sort((a, b) => {
    if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
    return String(a.finishedAt).localeCompare(String(b.finishedAt));
  });
  return done[0]?.userId ?? null;
}

/** Per-player standing line: rank within the challenge. */
export function challengeStanding(ch: Challenge): (ChallengePlayer & { rank: number })[] {
  const sorted = [...ch.players].sort((a, b) => {
    if (a.score === null && b.score === null) return 0;
    if (a.score === null) return 1;
    if (b.score === null) return -1;
    if (b.score !== a.score) return b.score - a.score;
    return String(a.finishedAt).localeCompare(String(b.finishedAt));
  });
  return sorted.map((p, i) => ({ ...p, rank: i + 1 }));
}

// ─── 34: live sessions ───────────────────────────────────────────────────────

export type LiveState = "upcoming" | "live" | "ended";

export function liveStatus(startsAt: string, endsAt: string, now: string | Date): LiveState {
  const t = typeof now === "string" ? new Date(now).getTime() : now.getTime();
  if (t < new Date(startsAt).getTime()) return "upcoming";
  if (t <= new Date(endsAt).getTime()) return "live";
  return "ended";
}

// ─── 35: peer review rubric ──────────────────────────────────────────────────

export interface RubricCriterion {
  id: string;
  titleAr: string;
  titleEn: string;
}

/** Clear rubric, 1–5 each, like Coursera's peer grading. */
export const PEER_RUBRIC: RubricCriterion[] = [
  { id: "clarity", titleAr: "وضوح الشرح", titleEn: "Clarity" },
  { id: "steps", titleAr: "ترتيب الخطوات", titleEn: "Ordered steps" },
  { id: "example", titleAr: "مثال تطبيقي", titleEn: "Worked example" },
  { id: "accuracy", titleAr: "صحة المعلومة", titleEn: "Accuracy" },
];

export interface PeerReview {
  reviewerId: string;
  /** criterion id → 1..5 */
  scores: Record<string, number>;
  note?: string;
  at: string;
}

export interface PeerReviewSummary {
  count: number;
  /** criterion id → average 0..5 */
  averages: Record<string, number>;
  /** 0..100 overall. */
  pct: number;
}

export function aggregatePeerReviews(reviews: PeerReview[]): PeerReviewSummary {
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};
  for (const r of reviews) {
    for (const c of PEER_RUBRIC) {
      const v = r.scores[c.id];
      if (typeof v !== "number" || v < 1 || v > 5) continue;
      sums[c.id] = (sums[c.id] ?? 0) + v;
      counts[c.id] = (counts[c.id] ?? 0) + 1;
    }
  }
  const averages: Record<string, number> = {};
  let total = 0;
  let n = 0;
  for (const c of PEER_RUBRIC) {
    if (counts[c.id]) {
      averages[c.id] = Math.round((sums[c.id] / counts[c.id]) * 10) / 10;
      total += sums[c.id];
      n += counts[c.id];
    }
  }
  const pct = n ? Math.round((total / (n * 5)) * 100) : 0;
  return { count: reviews.length, averages, pct };
}

// ─── 37: daily goals ─────────────────────────────────────────────────────────

export const DEFAULT_GOAL_MINUTES = 30;

export interface GoalProgress {
  goalMinutes: number;
  doneMinutes: number;
  pct: number;
  met: boolean;
}

export function goalProgress(doneMinutes: number, goalMinutes: number = DEFAULT_GOAL_MINUTES): GoalProgress {
  const goal = Math.max(5, Math.min(480, Math.round(goalMinutes)));
  const done = Math.max(0, Math.round(doneMinutes));
  return {
    goalMinutes: goal,
    doneMinutes: done,
    pct: Math.min(100, Math.round((done / goal) * 100)),
    met: done >= goal,
  };
}

/** Award the daily-goal points at most once per day. */
export function canAwardDailyGoal(events: PointEvent[], today: string): boolean {
  return !events.some((e) => e.kind === "daily_goal_met" && dayKey(e.at) === today);
}

// ─── Weekly goals (single-subject platform: students don't visit daily) ──────
//
// مدار مادة واحدة، فالطالب مش هيدخل كل يوم. الهدف الأساسي أسبوعي، والسلسلة
// بتعد الأسابيع المتتالية اللي حقق فيها هدفه — يوم فاضي في نص الأسبوع مش
// بيكسر حاجة.

export const DEFAULT_WEEKLY_GOAL_MINUTES = 150;

/** Week key "YYYY-MM-DD" of the Monday containing `d` (local). */
export function weekKey(d: string | Date): string {
  return dayKey(weekStart(d));
}

function shiftWeek(key: string, delta: number): string {
  const d = new Date(`${key}T12:00:00`);
  d.setDate(d.getDate() + delta * 7);
  return dayKey(d);
}

/** Total minutes studied in the week containing `ref`. */
export function minutesInWeek<T extends { day: string; minutes: number }>(rows: T[], ref: string | Date): number {
  const wk = weekKey(ref);
  return Math.round(rows.filter((r) => weekKey(r.day) === wk).reduce((a, r) => a + r.minutes, 0) * 10) / 10;
}

export interface WeekStreakInfo {
  current: number;
  longest: number;
  /** True when the current week's goal is already met. */
  metThisWeek: boolean;
}

/**
 * Streak of consecutive weeks whose minutes met the weekly goal.
 * Alive when last week was met (current week still in progress) or this week
 * is already met. A skipped day inside a week never breaks it.
 */
export function weekStreaks(minutesByDay: { day: string; minutes: number }[], goalMinutes: number, today: string): WeekStreakInfo {
  const goal = Math.max(5, Math.round(goalMinutes));
  const byWeek = new Map<string, number>();
  for (const r of minutesByDay) byWeek.set(weekKey(r.day), (byWeek.get(weekKey(r.day)) ?? 0) + r.minutes);
  const thisWk = weekKey(today);
  const met = (wk: string) => (byWeek.get(wk) ?? 0) >= goal;
  const metThisWeek = met(thisWk);
  let current = 0;
  let cursor = metThisWeek ? thisWk : shiftWeek(thisWk, -1);
  while (met(cursor)) {
    current += 1;
    cursor = shiftWeek(cursor, -1);
  }
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const wk of [...byWeek.keys()].sort()) {
    run = prev !== null && shiftWeek(prev, 1) === wk && met(wk) && met(prev) ? run + 1 : met(wk) ? 1 : 0;
    if (run > longest) longest = run;
    prev = wk;
  }
  return { current, longest, metThisWeek };
}

/** Award the weekly-goal points at most once per week. */
export function canAwardWeeklyGoal(events: PointEvent[], ref: string | Date): boolean {
  const wk = weekKey(ref);
  return !events.some((e) => e.kind === "weekly_goal_met" && weekKey(e.at) === wk);
}
