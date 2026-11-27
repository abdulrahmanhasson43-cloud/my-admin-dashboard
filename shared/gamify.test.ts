import { describe, expect, it } from "vitest";
import {
  POINT_VALUES,
  BADGES,
  aggregatePeerReviews,
  canAwardDailyGoal,
  canAwardWeeklyGoal,
  minutesInWeek,
  weekStreaks,
  challengeStanding,
  challengeState,
  challengeWinner,
  dayKey,
  evaluateBadges,
  goalProgress,
  liveStatus,
  pointsInWeek,
  pointsOf,
  rankLeaderboard,
  streaks,
  weekStart,
  type Challenge,
  type PointEvent,
} from "./gamify";

const ev = (kind: PointEvent["kind"], at: string, ref?: string): PointEvent => ({
  kind,
  points: POINT_VALUES[kind],
  at,
  ref,
});

const baseStats = {
  lessonsWatched: 0,
  quizzesPassed: 0,
  perfectQuizzes: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalPoints: 0,
  discussionPosts: 0,
  challengesWon: 0,
  reviewsGiven: 0,
  liveAttended: 0,
};

describe("points", () => {
  it("sums event points", () => {
    expect(pointsOf([ev("lesson_watched", "2026-11-20T10:00:00"), ev("quiz_passed", "2026-11-20T11:00:00")])).toBe(30);
  });
  it("every kind has a fixed value", () => {
    expect(Object.keys(POINT_VALUES)).toHaveLength(10);
  });
});

describe("badges", () => {
  it("unlocks nothing for a new student", () => {
    expect(evaluateBadges(baseStats)).toEqual([]);
  });
  it("unlocks first-lesson and first-quiz", () => {
    const ids = evaluateBadges({ ...baseStats, lessonsWatched: 1, quizzesPassed: 1 });
    expect(ids).toContain("first-lesson");
    expect(ids).toContain("first-quiz");
    expect(ids).not.toContain("perfect-quiz");
  });
  it("streak badges honor longest streak even after it breaks", () => {
    const ids = evaluateBadges({ ...baseStats, longestStreak: 7, currentStreak: 0 });
    expect(ids).toContain("streak-3");
    expect(ids).toContain("streak-7");
    expect(ids).not.toContain("streak-30");
  });
  it("every catalog badge is unlockable", () => {
    const ids = evaluateBadges({
      lessonsWatched: 5,
      quizzesPassed: 3,
      perfectQuizzes: 1,
      currentStreak: 30,
      longestStreak: 30,
      totalPoints: 600,
      discussionPosts: 6,
      challengesWon: 1,
      reviewsGiven: 2,
      liveAttended: 1,
    });
    expect(new Set(ids)).toEqual(new Set(BADGES.map((b) => b.id)));
  });
});

describe("streaks", () => {
  const days = ["2026-11-18", "2026-11-19", "2026-11-20", "2026-11-23", "2026-11-24", "2026-11-25"];
  it("counts a live streak ending today", () => {
    const s = streaks([...days, "2026-11-26"], "2026-11-26");
    expect(s.current).toBe(4); // 23,24,25,26
    expect(s.activeToday).toBe(true);
    expect(s.longest).toBe(4);
  });
  it("keeps the streak alive when today has no activity yet", () => {
    const s = streaks(days, "2026-11-26");
    expect(s.current).toBe(3); // 23,24,25
    expect(s.activeToday).toBe(false);
  });
  it("breaks the streak after a missed day", () => {
    const s = streaks(days, "2026-11-28");
    expect(s.current).toBe(0);
    expect(s.longest).toBe(3);
  });
  it("handles a single day", () => {
    expect(streaks(["2026-11-26"], "2026-11-26")).toEqual({ current: 1, longest: 1, activeToday: true });
  });
});

describe("weekly leaderboard", () => {
  it("week starts on Monday", () => {
    expect(dayKey(weekStart("2026-11-26T15:00:00"))).toBe("2026-11-23"); // Thursday → Monday
    expect(dayKey(weekStart("2026-11-23T00:30:00"))).toBe("2026-11-23");
    expect(dayKey(weekStart("2026-11-29T23:00:00"))).toBe("2026-11-23"); // Sunday still same week
  });
  it("sums only this week's points", () => {
    const events = [
      ev("lesson_watched", "2026-11-24T10:00:00"), // this week
      ev("quiz_passed", "2026-11-22T10:00:00"), // last week
      ev("quiz_perfect", "2026-11-30T10:00:00"), // next week
    ];
    expect(pointsInWeek(events, "2026-11-26T12:00:00")).toBe(10);
  });
  it("ranks with shared ranks on ties", () => {
    const ranked = rankLeaderboard([
      { userId: "a", name: "أحمد", points: 50 },
      { userId: "b", name: "سارة", points: 80 },
      { userId: "c", name: "مريم", points: 80 },
      { userId: "d", name: "يوسف", points: 10 },
    ]);
    expect(ranked.map((r) => r.rank)).toEqual([1, 1, 3, 4]);
    expect(ranked[0].points).toBe(80);
  });
});

describe("challenges", () => {
  const ch = (scores: (number | null)[]): Challenge => ({
    id: "ch1",
    lessonId: "l1",
    createdBy: "u1",
    createdAt: "2026-11-25T10:00:00",
    players: scores.map((s, i) => ({
      userId: `u${i + 1}`,
      name: `طالب ${i + 1}`,
      score: s,
      finishedAt: s === null ? null : `2026-11-25T1${i}:00:00`,
    })),
  });
  it("waiting until someone finishes", () => {
    expect(challengeState(ch([null, null]))).toBe("waiting");
  });
  it("running while one is still playing", () => {
    expect(challengeState(ch([80, null]))).toBe("running");
    expect(challengeWinner(ch([80, null]))).toBeNull();
  });
  it("highest score wins", () => {
    const c = ch([70, 90, 60]);
    expect(challengeState(c)).toBe("done");
    expect(challengeWinner(c)).toBe("u2");
  });
  it("tie goes to the earlier finisher", () => {
    expect(challengeWinner(ch([90, 90]))).toBe("u1");
  });
  it("standing orders unfinished players last", () => {
    const standing = challengeStanding(ch([70, null, 90]));
    expect(standing.map((p) => p.userId)).toEqual(["u3", "u1", "u2"]);
    expect(standing[0].rank).toBe(1);
  });
});

describe("live sessions", () => {
  it("reports upcoming / live / ended", () => {
    expect(liveStatus("2026-11-26T18:00:00", "2026-11-26T19:00:00", "2026-11-26T17:00:00")).toBe("upcoming");
    expect(liveStatus("2026-11-26T18:00:00", "2026-11-26T19:00:00", "2026-11-26T18:30:00")).toBe("live");
    expect(liveStatus("2026-11-26T18:00:00", "2026-11-26T19:00:00", "2026-11-26T19:01:00")).toBe("ended");
  });
});

describe("peer review", () => {
  it("aggregates rubric averages and overall pct", () => {
    const s = aggregatePeerReviews([
      { reviewerId: "a", scores: { clarity: 5, steps: 4, example: 3, accuracy: 5 }, at: "2026-11-25" },
      { reviewerId: "b", scores: { clarity: 3, steps: 4, example: 5, accuracy: 5 }, at: "2026-11-25" },
    ]);
    expect(s.count).toBe(2);
    expect(s.averages.clarity).toBe(4);
    expect(s.averages.example).toBe(4);
    expect(s.pct).toBe(85); // 34/40
  });
  it("ignores out-of-range scores", () => {
    const s = aggregatePeerReviews([{ reviewerId: "a", scores: { clarity: 9, steps: 2 }, at: "2026-11-25" } as never]);
    expect(s.averages.clarity).toBeUndefined();
    expect(s.averages.steps).toBe(2);
  });
  it("empty reviews give 0", () => {
    expect(aggregatePeerReviews([]).pct).toBe(0);
  });
});

describe("weekly goals (single-subject rhythm)", () => {
  const wk = (isoDay: string, minutes: number) => ({ day: isoDay, minutes });

  it("met when the week's minutes reach the goal even with empty days", () => {
    // Two study days only — a daily system would punish the gaps.
    const rows = [wk("2026-11-23", 80), wk("2026-11-26", 80)];
    expect(minutesInWeek(rows, "2026-11-26T10:00:00")).toBe(160);
    const st = weekStreaks(rows, 150, "2026-11-26");
    expect(st.current).toBe(1);
    expect(st.metThisWeek).toBe(true);
  });

  it("a skipped day inside the week never breaks the streak", () => {
    const rows = [
      wk("2026-11-09", 200), // week 1 (Nov 9 Monday)
      wk("2026-11-18", 100), wk("2026-11-21", 100), // week 2, two gaps between days
    ];
    const st = weekStreaks(rows, 150, "2026-11-22");
    expect(st.current).toBe(2);
    expect(st.longest).toBe(2);
  });

  it("stays alive while the current week is still in progress", () => {
    const rows = [wk("2026-11-16", 200)]; // last week met
    const st = weekStreaks(rows, 150, "2026-11-26"); // this week: nothing yet
    expect(st.current).toBe(1);
    expect(st.metThisWeek).toBe(false);
  });

  it("breaks when a whole week is missed", () => {
    const rows = [wk("2026-11-02", 200), wk("2026-11-24", 200)]; // gap week Nov 16
    const st = weekStreaks(rows, 150, "2026-11-26");
    expect(st.current).toBe(1);
    expect(st.longest).toBe(1);
  });

  it("awards weekly-goal points once per week", () => {
    const events = [ev("weekly_goal_met", "2026-11-24T20:00:00")];
    expect(canAwardWeeklyGoal(events, "2026-11-26T10:00:00")).toBe(false);
    expect(canAwardWeeklyGoal(events, "2026-11-30T10:00:00")).toBe(true);
  });
});

describe("daily goals", () => {
  it("progress caps at 100% and met at the goal", () => {
    expect(goalProgress(15, 30)).toEqual({ goalMinutes: 30, doneMinutes: 15, pct: 50, met: false });
    expect(goalProgress(45, 30)).toEqual({ goalMinutes: 30, doneMinutes: 45, pct: 100, met: true });
  });
  it("defaults to 30 minutes and clamps silly goals", () => {
    expect(goalProgress(30).met).toBe(true);
    expect(goalProgress(0, 1).goalMinutes).toBe(5);
    expect(goalProgress(0, 9999).goalMinutes).toBe(480);
  });
  it("awards daily-goal points once per day", () => {
    const events = [ev("daily_goal_met", "2026-11-25T20:00:00")];
    expect(canAwardDailyGoal(events, "2026-11-25")).toBe(false);
    expect(canAwardDailyGoal(events, "2026-11-26")).toBe(true);
  });
});
