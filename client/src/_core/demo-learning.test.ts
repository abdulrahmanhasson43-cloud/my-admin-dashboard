import { beforeAll, describe, expect, it } from "vitest";
import { demoCall, resetDemo } from "./demo-api";
import { buildLessonContent, watchPercent } from "../../../shared/learning";

/**
 * End-to-end trust & progress group against the demo store (the same handlers
 * the UI calls). One sequential story: login → watch honestly → get gated →
 * quiz → complete → certificate.
 */

const call = (path: string, input?: unknown) => demoCall(path, input ?? {});

let course: any;
let lessons: any[];

beforeAll(async () => {
  resetDemo();
  await call("auth.login", { email: "student@madar.test", password: "Student2026!" });
  const detail: any = await call("catalog.course", { slug: "bacc-science-1" });
  course = detail.course;
  lessons = detail.lessons;
});

describe("watch tracking (feature 1)", () => {
  it("banks heartbeats, capping a single beat at 30s so fast-forwarding is fake-proof", async () => {
    const l = lessons[0];
    const r1: any = await call("progress.heartbeat", { lessonId: l.id, deltaSec: 300, positionSec: 300 });
    expect(r1.watchedSec).toBe(30); // capped, not the claimed 300
    const r2: any = await call("progress.heartbeat", { lessonId: l.id, deltaSec: 15, positionSec: 315 });
    expect(r2.watchedSec).toBe(45);
    expect(r2.positionSec).toBe(315);
    expect(r2.percent).toBe(watchPercent(45, l.durationSec));
    expect(r2.state).toBe("watching");
  });

  it("flips watchDone at 90% of the video", async () => {
    const l = lessons[0];
    let last: any;
    // Honest pass: 25s beats walking the playhead from the start to the end.
    for (let pos = 25; pos < l.durationSec; pos += 25) {
      last = await call("progress.heartbeat", { lessonId: l.id, deltaSec: 25, positionSec: pos });
    }
    expect(last.watchDone).toBe(true);
    expect(last.state).toBe("needs-quiz");
  });
});

describe("anti-cheat watch banking (feature 1)", () => {
  it("banks nothing new for replaying the same stretch over and over", async () => {
    const l = lessons[1];
    let last: any;
    for (let n = 0; n < 30; n++) {
      last = await call("progress.heartbeat", { lessonId: l.id, deltaSec: 10, positionSec: 100 });
    }
    expect(last.watchedSec).toBe(10); // 30 beats, one unique 10s stretch
    expect(last.watchDone).toBe(false);
  });

  it("banks nothing for jumping straight to the end of the video", async () => {
    const l = lessons[1];
    let last: any;
    for (let n = 0; n < 30; n++) {
      last = await call("progress.heartbeat", { lessonId: l.id, deltaSec: 30, positionSec: l.durationSec });
    }
    // Only the final 30s stretch is new coverage (the replay test above banked 10s).
    expect(last.watchedSec).toBe(40);
    expect(last.watchDone).toBe(false);
    expect(last.state).toBe("watching");
  });
});

describe("sequential gating (feature 6)", () => {
  it("gates lesson 2 until lesson 1 is completed", async () => {
    const detail: any = await call("catalog.course", { slug: "bacc-science-1" });
    expect(detail.lessons[0].gate).toBeNull();
    expect(detail.lessons[1].gate).toBe("quiz");
  });

  it("refuses to open the gated lesson", async () => {
    await expect(call("learning.lesson", { lessonId: lessons[1].id })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

describe("quiz (features 2, 6)", () => {
  it("rejects a submit before the 90% watch rule is met", async () => {
    const l = lessons[1];
    await expect(call("quiz.submit", { lessonId: l.id, answers: [0, 0, 0] })).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
    });
  });

  it("serves questions without the answer key", async () => {
    const q: any = await call("quiz.get", { lessonId: lessons[0].id });
    expect(q.questions).toHaveLength(3);
    for (const question of q.questions) expect("correct" in question).toBe(false);
    expect(q.passPct).toBe(60);
  });

  it("scores honestly: all-wrong fails, all-right passes and completes the lesson", async () => {
    const l = lessons[0];
    const key = buildLessonContent(l.id, l.title, l.durationSec);
    const wrong = key.quiz.questions.map((q) => (q.correct + 1) % q.options.length);
    const fail: any = await call("quiz.submit", { lessonId: l.id, answers: wrong });
    expect(fail.passed).toBe(false);
    expect(fail.lessonCompleted).toBe(false);

    const right = key.quiz.questions.map((q) => q.correct);
    const pass: any = await call("quiz.submit", { lessonId: l.id, answers: right });
    expect(pass.passed).toBe(true);
    expect(pass.pct).toBe(100);
    expect(pass.lessonCompleted).toBe(true);
    expect(pass.state).toBe("completed");
    // Not the last lesson of the course, so no certificate yet.
    expect(pass.certificate).toBeNull();
  });

  it("ungates the next lesson after completion", async () => {
    const detail: any = await call("catalog.course", { slug: "bacc-science-1" });
    expect(detail.lessons[1].gate).toBeNull();
  });
});

describe("in-video questions (feature 3)", () => {
  it("records only correct answers", async () => {
    const l = lessons[1];
    const payload: any = await call("learning.lesson", { lessonId: l.id });
    const vq = payload.videoQuestions[0];
    const key = buildLessonContent(l.id, l.title, l.durationSec).videoQuestions[0];
    const wrong = (key.correct + 1) % key.options.length;
    const bad: any = await call("videoQ.answer", { lessonId: l.id, questionId: vq.id, answer: wrong });
    expect(bad.correct).toBe(false);
    expect(bad.answered).not.toContain(vq.id);
    const good: any = await call("videoQ.answer", { lessonId: l.id, questionId: vq.id, answer: key.correct });
    expect(good.correct).toBe(true);
    expect(good.answered).toContain(vq.id);
  });
});

describe("certificate (feature 36)", () => {
  it("issues once the whole course is complete, and verifies by code", async () => {
    const l = lessons[1];
    // Watch lesson 2 honestly, then pass its quiz.
    const target = Math.ceil(l.durationSec * 0.9);
    for (let banked = 0; banked < target; banked += 25) {
      await call("progress.heartbeat", { lessonId: l.id, deltaSec: 25, positionSec: banked + 25 });
    }
    const key = buildLessonContent(l.id, l.title, l.durationSec);
    const res: any = await call("quiz.submit", { lessonId: l.id, answers: key.quiz.questions.map((q) => q.correct) });
    expect(res.certificate).not.toBeNull();
    expect(res.certificate.code).toMatch(/^MDR-[0-9A-F]{4}-[0-9A-F]{4}$/);
    expect(res.certificate.courseTitle).toBe(course.title);

    const list: any = await call("certificates.list");
    expect(list).toHaveLength(1);
    const verified: any = await call("certificates.verify", { code: res.certificate.code });
    expect(verified.studentName).toBeTruthy();
    expect(verified.courseTitle).toBe(course.title);
    await expect(call("certificates.verify", { code: "MDR-XXXX-XXXX" })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

describe("resume + dashboard + devices (features 13, 24, 8)", () => {
  it("resumes the latest touched lesson with its position", async () => {
    const rows: any = await call("progress.resume");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].slug).toBe("bacc-science-1");
    expect(rows[0].lessonId).toBe(lessons[1].id);
  });

  it("reports honest totals on the dashboard", async () => {
    const d: any = await call("progress.dashboard");
    expect(d.totals.completedLessons).toBe(2);
    expect(d.totals.certificates).toBe(1);
    expect(d.totals.watchedSec).toBeGreaterThan(0);
    const c = d.courses.find((x: any) => x.course.slug === "bacc-science-1");
    // No enrollment (both lessons were the free preview) — dashboard lists enrolled courses only.
    expect(c).toBeUndefined();
  });

  it("flags a second active device on the same account", async () => {
    const l = lessons[0];
    const a: any = await call("progress.heartbeat", { lessonId: l.id, deltaSec: 5, positionSec: 10, deviceId: "phone-1" });
    expect(a.concurrentDevice).toBe(false);
    const b: any = await call("progress.heartbeat", { lessonId: l.id, deltaSec: 5, positionSec: 10, deviceId: "laptop-2" });
    expect(b.concurrentDevice).toBe(true);
  });
});
