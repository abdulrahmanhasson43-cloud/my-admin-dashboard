import { beforeAll, describe, expect, it } from "vitest";
import { demoCall, resetDemo } from "./demo-api";
import { buildLessonContent } from "../../../shared/learning";
import { QUIZ_FAIL_LOCK_THRESHOLD } from "../../../shared/learning";
import { signToken, SHARE_TTL_OPTIONS } from "../../../shared/sign";

/**
 * v13 trust features, end-to-end against the demo store: quiz re-watch lock
 * (feature 7), temporary signed video links (feature 11), and the activity
 * log that records them (feature 12).
 */

const call = (path: string, input?: unknown) => demoCall(path, input ?? {});

let lesson: any;
const watchThrough = async (l: any) => {
  let last: any;
  for (let pos = 25; pos < l.durationSec; pos += 25) {
    last = await call("progress.heartbeat", { lessonId: l.id, deltaSec: 25, positionSec: pos });
  }
  return last;
};
const wrongAnswers = (l: any) =>
  buildLessonContent(l.id, l.title, l.durationSec).quiz.questions.map((q) => (q.correct + 1) % q.options.length);

beforeAll(async () => {
  resetDemo();
  await call("auth.login", { email: "student@madar.test", password: "Student2026!" });
  const detail: any = await call("catalog.course", { slug: "bacc-science-1" });
  lesson = detail.lessons[0]; // free preview, so no purchase is needed
});

describe("quiz re-watch lock (feature 7)", () => {
  it("locks the quiz after 3 consecutive failures and revokes the watch coverage", async () => {
    const done = await watchThrough(lesson);
    expect(done.watchDone).toBe(true);

    const wrong = wrongAnswers(lesson);
    for (let n = 1; n <= QUIZ_FAIL_LOCK_THRESHOLD; n++) {
      const r: any = await call("quiz.submit", { lessonId: lesson.id, answers: wrong });
      expect(r.passed).toBe(false);
      if (n < QUIZ_FAIL_LOCK_THRESHOLD) {
        expect(r.quizLocked).toBe(false);
        expect(r.failsLeft).toBe(QUIZ_FAIL_LOCK_THRESHOLD - n);
      } else {
        expect(r.quizLocked).toBe(true);
        expect(r.lockedNow).toBe(true);
      }
    }
  });

  it("refuses further attempts until the lesson is honestly re-watched", async () => {
    await expect(call("quiz.submit", { lessonId: lesson.id, answers: wrongAnswers(lesson) })).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
    });
    // A couple of beats is not a re-watch.
    await call("progress.heartbeat", { lessonId: lesson.id, deltaSec: 25, positionSec: 25 });
    const view: any = await call("learning.lesson", { lessonId: lesson.id });
    expect(view.progress.quizLocked).toBe(true);
    expect(view.progress.watchDone).toBe(false);
  });

  it("re-watching to 90% reopens the quiz, and passing clears the fail counter", async () => {
    const done = await watchThrough(lesson);
    expect(done.watchDone).toBe(true);
    const key = buildLessonContent(lesson.id, lesson.title, lesson.durationSec);
    const pass: any = await call("quiz.submit", { lessonId: lesson.id, answers: key.quiz.questions.map((q) => q.correct) });
    expect(pass.passed).toBe(true);
    expect(pass.quizLocked).toBe(false);
    expect(pass.lessonCompleted).toBe(true);
  });
});

describe("temporary signed video links (feature 11)", () => {
  it("forbids students from creating links", async () => {
    await expect(call("share.create", { lessonId: lesson.id, ttlMin: 60 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  let token = "";
  let linkId = "";

  it("lets staff mint a link that opens publicly", async () => {
    await call("auth.login", { email: "owner@madar.test", password: "MadarOwner2026!" });
    const r: any = await call("share.create", { lessonId: lesson.id, ttlMin: SHARE_TTL_OPTIONS[0].minutes });
    expect(r.path).toMatch(/^\/share\//);
    token = r.token;

    const opened: any = await call("share.open", { token });
    expect(opened.title).toBe(lesson.title);
    expect(opened.courseTitle).toBeTruthy();
    expect(new Date(opened.expiresAt).getTime()).toBeGreaterThan(Date.now());

    const list: any = await call("share.list");
    linkId = list[0].id;
    expect(list[0].status).toBe("active");
  });

  it("rejects a tampered token and an expired one", async () => {
    await expect(call("share.open", { token: token.slice(0, -2) + "xx" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    const stale = signToken({ lid: lesson.id, exp: Date.now() - 1000, jti: "stale" }, "madar-demo-share-secret-v1");
    await expect(call("share.open", { token: stale })).rejects.toMatchObject({ code: "GONE" });
  });

  it("stops opening once revoked", async () => {
    await call("share.revoke", { id: linkId });
    await expect(call("share.open", { token })).rejects.toMatchObject({ code: "GONE" });
    const list: any = await call("share.list");
    expect(list.find((l: any) => l.id === linkId).status).toBe("revoked");
  });
});

describe("student activity log (feature 12)", () => {
  it("is staff-only and records the whole story above", async () => {
    await call("auth.login", { email: "student@madar.test", password: "Student2026!" });
    await expect(call("activity.list", {})).rejects.toMatchObject({ code: "FORBIDDEN" });

    await call("auth.login", { email: "owner@madar.test", password: "MadarOwner2026!" });
    const rows: any = await call("activity.list", {});
    const kinds = rows.map((r: any) => r.kind);
    for (const k of ["watch_done", "quiz_fail", "quiz_lock", "quiz_unlock", "quiz_pass", "lesson_complete", "share_create"]) {
      expect(kinds).toContain(k);
    }
    const lock = rows.find((r: any) => r.kind === "quiz_lock");
    expect(lock.studentName).toBeTruthy();
    expect(lock.lessonTitle).toBe(lesson.title);
  });
});
