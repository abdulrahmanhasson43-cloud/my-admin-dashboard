import { beforeAll, describe, expect, it } from "vitest";
import { demoCall, resetDemo } from "./demo-api";

/**
 * Motivation & engagement group (features 30–35, 37) against the demo store —
 * the same handlers the UI calls. Covers points/badges/streaks, the weekly
 * leaderboard, discussion, live sessions with chat, friend challenges, peer
 * review and the daily goal.
 */

const call = (path: string, input?: unknown) => demoCall(path, input ?? {});

let lessons: any[];
let lesson1: string;
let lesson2: string;

beforeAll(async () => {
  resetDemo();
  await call("auth.login", { email: "student@madar.test", password: "Student2026!" });
  const detail: any = await call("catalog.course", { slug: "sec-3-term-1" });
  lessons = detail.lessons;
  lesson1 = lessons[0].id;
  lesson2 = lessons[0].id; // assignment now seeds on the first lesson
});

describe("points, badges and streaks (feature 30)", () => {
  it("summary shows the seeded streak and points", async () => {
    const r: any = await call("gamify.summary");
    expect(r.totalPoints).toBe(50); // 3 lessons + 1 quiz from the seed
    expect(r.streak.current).toBe(3);
    expect(r.streak.activeToday).toBe(false);
    const firstLesson = r.badges.find((b: any) => b.id === "points-100");
    expect(firstLesson.unlocked).toBe(false);
  });
  it("discussion posts earn points", async () => {
    const before: any = await call("gamify.summary");
    await call("discuss.post", { lessonId: lesson1, text: "سؤال: إيه الفرق بين المشتقة الأولى والتانية؟" });
    const after: any = await call("gamify.summary");
    expect(after.totalPoints).toBe(before.totalPoints + 5);
  });
});

describe("weekly leaderboard (feature 31)", () => {
  it("ranks the cohort with me in it", async () => {
    const r: any = await call("gamify.leaderboard");
    expect(r.rows.length).toBe(7); // 6 classmates + me
    expect(r.rows[0].rank).toBe(1);
    // The seed spreads 180 over 6 days; only this week's days count (week starts Monday).
    expect(r.rows[0].points).toBeGreaterThanOrEqual(100);
    expect(r.rows.some((x: any) => x.isMe)).toBe(true);
  });
  it("opting out removes me from the board", async () => {
    await call("gamify.leaderboardOpt", { show: false });
    const r: any = await call("gamify.leaderboard");
    expect(r.rows.some((x: any) => x.isMe)).toBe(false);
    await call("gamify.leaderboardOpt", { show: true });
    const r2: any = await call("gamify.leaderboard");
    expect(r2.rows.some((x: any) => x.isMe)).toBe(true);
  });
});

describe("discussion under the lesson (feature 33)", () => {
  it("lists seeded posts with replies and roles", async () => {
    const r: any = await call("discuss.list", { lessonId: lesson1 });
    expect(r.length).toBeGreaterThanOrEqual(2);
    const seeded = r.find((p: any) => p.replies.length > 0);
    expect(seeded.replies.length).toBe(2);
    expect(seeded.replies.some((x: any) => x.authorRole === "owner")).toBe(true);
  });
  it("replies earn points only on other people's posts", async () => {
    const r: any = await call("discuss.list", { lessonId: lesson1 });
    const other = r.find((p: any) => !p.mine);
    const before: any = await call("gamify.summary");
    await call("discuss.reply", { postId: other.id, text: "فيه مثال كويس في نص الدرس بيوضح ده" });
    const after: any = await call("gamify.summary");
    expect(after.totalPoints).toBe(before.totalPoints + 3);
  });
  it("rejects empty posts", async () => {
    await expect(call("discuss.post", { lessonId: lesson1, text: " " })).rejects.toThrow();
  });
});

describe("live sessions with chat (feature 34)", () => {
  it("lists a live and an ended session, recording only after the end", async () => {
    const r: any = await call("live.list", {});
    const live = r.find((x: any) => x.status === "live");
    const ended = r.find((x: any) => x.status === "ended");
    expect(live).toBeTruthy();
    expect(live.recordingUrl).toBeNull();
    expect(ended.recordingUrl).toBeTruthy();
  });
  it("chat works only while live and awards attendance once", async () => {
    const r: any = await call("live.list", {});
    const live = r.find((x: any) => x.status === "live");
    const ended = r.find((x: any) => x.status === "ended");
    await call("live.chat", { sessionId: live.id, text: "ممكن مثال تاني على قاعدة الضرب؟" });
    const msgs: any = await call("live.messages", { sessionId: live.id });
    expect(msgs.length).toBe(3);
    expect(msgs[2].mine).toBe(true);
    const summary: any = await call("gamify.summary");
    expect(summary.stats.liveAttended).toBe(1);
    const again: any = await call("live.list", {});
    expect(again.find((x: any) => x.id === live.id).attended).toBe(true);
    await expect(call("live.chat", { sessionId: ended.id, text: "هلو" })).rejects.toThrow();
  });
});

describe("friend challenges (feature 32)", () => {
  it("the seeded challenge is waiting for me", async () => {
    const r: any = await call("challenges.list");
    expect(r.length).toBe(1);
    expect(r[0].state).toBe("running"); // سارة finished, I didn't
    expect(r[0].standing.length).toBe(2);
  });
  it("playing twice is blocked, finishing decides the winner", async () => {
    const list: any = await call("challenges.list");
    const chId = list[0].id;
    const play: any = await call("challenges.play", { challengeId: chId });
    expect(play.questions.length).toBeGreaterThan(0);
    const answers = play.questions.map(() => 0);
    const r: any = await call("challenges.submit", { challengeId: chId, answers });
    expect(typeof r.pct).toBe("number");
    expect(r.state).toBe("done");
    expect(r.winnerId).toBeTruthy();
    await expect(call("challenges.play", { challengeId: chId })).rejects.toThrow();
  });
  it("creating a challenge with myself is rejected", async () => {
    const lb: any = await call("gamify.leaderboard");
    const me = lb.rows.find((x: any) => x.isMe);
    await expect(call("challenges.create", { lessonId: lesson1, opponentUserId: me.userId })).rejects.toThrow();
  });
});

describe("peer review (feature 35)", () => {
  it("shows the assignment with classmates' submissions", async () => {
    const r: any = await call("peers.get", { lessonId: lesson2 });
    expect(r.assignment.title).toContain("قاعدة السلسلة");
    expect(r.rubric.length).toBe(4);
    expect(r.toReview.length).toBe(2);
    expect(r.mySubmission).toBeNull();
  });
  it("submit → review → points, and no self-review", async () => {
    const r: any = await call("peers.get", { lessonId: lesson2 });
    await call("peers.submit", { assignmentId: r.assignment.id, text: "قاعدة السلسلة بتشتق الدالة الخارجية وبعدين تضرب في مشتقة الداخلية. مثال: (٣س+٢)² مشتقتها ٢(٣س+٢)×٣ = ٦(٣س+٢)." });
    const before: any = await call("gamify.summary");
    const target = r.toReview[0];
    await call("peers.review", { submissionId: target.id, scores: { clarity: 5, steps: 4, example: 4, accuracy: 5 }, note: "شرح واضح والمثال صح" });
    const after: any = await call("gamify.summary");
    expect(after.totalPoints).toBe(before.totalPoints + 10);
    expect(after.stats.reviewsGiven).toBe(1);
    const r2: any = await call("peers.get", { lessonId: lesson2 });
    expect(r2.toReview.find((x: any) => x.id === target.id).reviewedByMe).toBe(true);
    expect(r2.mySubmission).toBeTruthy();
    await expect(call("peers.review", { submissionId: r2.mySubmission.id, scores: { clarity: 5, steps: 5, example: 5, accuracy: 5 } })).rejects.toThrow();
    await expect(call("peers.review", { submissionId: target.id, scores: { clarity: 5, steps: 4, example: 4, accuracy: 5 } })).rejects.toThrow(); // already reviewed
    await expect(call("peers.review", { submissionId: r.toReview[1].id, scores: { clarity: 9, steps: 4, example: 4, accuracy: 5 } })).rejects.toThrow();
  });
});

describe("weekly goal (feature 37, single-subject rhythm)", () => {
  it("weekly goal defaults to 150 minutes and can be changed", async () => {
    const r: any = await call("gamify.summary");
    expect(r.weekGoal.goalMinutes).toBe(150);
    expect(r.goal.goalMinutes).toBe(30); // daily bonus goal unchanged under the hood
    expect(r.weekDays.length).toBe(7);
    await call("gamify.setGoal", { minutes: 200 });
    const r2: any = await call("gamify.summary");
    expect(r2.weekGoal.goalMinutes).toBe(200);
    await expect(call("gamify.setGoal", { minutes: 2 })).rejects.toThrow();
  });
  it("watching banks minutes and awards daily + weekly goals once each", async () => {
    await call("gamify.setGoal", { minutes: 15 });
    // Lesson 1 is 1260s: 42 beats × 30s covers it fully = 21 minutes banked.
    for (let i = 1; i <= 42; i++) {
      await call("progress.heartbeat", { lessonId: lesson1, positionSec: i * 30, deltaSec: 30, deviceId: "test-device" });
    }
    // 9 more minutes on the second lesson → 30 minutes today: daily goal met, weekly (15) long met.
    const secondLesson = lessons[1].id;
    for (let i = 1; i <= 18; i++) {
      await call("progress.heartbeat", { lessonId: secondLesson, positionSec: i * 30, deltaSec: 30, deviceId: "test-device" });
    }
    const r: any = await call("gamify.summary");
    expect(r.goal.met).toBe(true);
    expect(r.weekGoal.met).toBe(true);
    expect(r.weekStreak.current).toBe(1);
    const pointsAfterGoal = r.totalPoints;
    // Same day, more watching: no second daily or weekly award.
    await call("progress.heartbeat", { lessonId: secondLesson, positionSec: 19 * 30, deltaSec: 30, deviceId: "test-device" });
    const r2: any = await call("gamify.summary");
    expect(r2.totalPoints).toBe(pointsAfterGoal);
  });
});
