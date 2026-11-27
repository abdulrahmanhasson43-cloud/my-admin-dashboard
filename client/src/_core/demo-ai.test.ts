import { beforeAll, describe, expect, it } from "vitest";
import { demoCall, resetDemo } from "./demo-api";
import { ADAPTIVE_LENGTH } from "../../../shared/ai";

/**
 * AI group (features 38–45) against the demo store — the same handlers the UI
 * calls. Covers assistant, practice, cards, essay, video search, next-lesson,
 * study plan and the adaptive session.
 */

const call = (path: string, input?: unknown) => demoCall(path, input ?? {});

let lessons: any[];
let lessonId: string;
let lessonTitle: string;

beforeAll(async () => {
  resetDemo();
  await call("auth.login", { email: "student@madar.test", password: "Student2026!" });
  const detail: any = await call("catalog.course", { slug: "sec-3-term-1" });
  lessons = detail.lessons;
  lessonId = lessons[0].id;
  lessonTitle = lessons[0].title;
});

describe("assistant (feature 38)", () => {
  it("replies from lesson content and stores the chat", async () => {
    const r: any = await call("ai.ask", { lessonId, message: "مش فاهم الدرس" });
    expect(typeof r.reply).toBe("string");
    expect(r.reply.length).toBeGreaterThan(20);
    const history: any = await call("ai.chatHistory", { lessonId });
    expect(history.length).toBe(2);
    expect(history[0].role).toBe("user");
    expect(history[1].role).toBe("assistant");
  });
  it("rejects empty questions", async () => {
    await expect(call("ai.ask", { lessonId, message: " " })).rejects.toThrow();
  });
  it("requires lesson access", async () => {
    await call("auth.logout");
    await expect(call("ai.ask", { lessonId, message: "سؤال" })).rejects.toThrow();
    await call("auth.login", { email: "student@madar.test", password: "Student2026!" });
  });
});

describe("practice generation (feature 39)", () => {
  it("generates, hides the key, and scores submissions", async () => {
    const start: any = await call("ai.practiceStart", { lessonId });
    expect(start.attemptId).toBeTruthy();
    expect(start.questions.length).toBe(3);
    for (const q of start.questions) {
      expect(q).not.toHaveProperty("correct");
      expect(q).not.toHaveProperty("explanation");
      expect(q.options.length).toBeGreaterThanOrEqual(3);
    }
    // Wrong on purpose: answer (correct + 1) is unknowable client-side, so
    // answer everything with option 0 and check the shape of the result.
    const result: any = await call("ai.practiceSubmit", {
      attemptId: start.attemptId,
      answers: start.questions.map(() => 0),
    });
    expect(result.total).toBe(3);
    expect(result.perQuestion.length).toBe(3);
    expect(result.perQuestion[0].explanation.length).toBeGreaterThan(0);
    expect(result.pct).toBeGreaterThanOrEqual(0);
    expect(result.pct).toBeLessThanOrEqual(100);
  });
  it("serves a fresh set on the next attempt", async () => {
    const a: any = await call("ai.practiceStart", { lessonId });
    const b: any = await call("ai.practiceStart", { lessonId });
    expect(a.attemptNo).not.toBe(b.attemptNo);
    expect(a.questions.map((q: any) => q.q).join()).not.toBe(b.questions.map((q: any) => q.q).join());
  });
  it("refuses to score someone else's attempt", async () => {
    const start: any = await call("ai.practiceStart", { lessonId });
    await call("auth.logout");
    await call("auth.login", { email: "owner@madar.test", password: "MadarOwner2026!" });
    await expect(call("ai.practiceSubmit", { attemptId: start.attemptId, answers: [0, 0, 0] })).rejects.toThrow();
    await call("auth.logout");
    await call("auth.login", { email: "student@madar.test", password: "Student2026!" });
  });
});

describe("summary, flashcards, essay (features 40, 42)", () => {
  it("returns summary, cards and an essay prompt", async () => {
    const c: any = await call("ai.cards", { lessonId });
    expect(c.summary.length).toBeGreaterThanOrEqual(4);
    expect(c.flashcards.length).toBeGreaterThanOrEqual(2);
    expect(c.essayPrompt.length).toBeGreaterThan(5);
  });
  it("grades an essay with feedback", async () => {
    const g: any = await call("ai.essayGrade", {
      lessonId,
      text: "أولًا بنفهم الدرس خطوة بخطوة، ثانيًا بنحل مثال رقمي زي ٢ + ٢ = ٤، وبعد كده بنراجع الحل بنفسنا.",
    });
    expect(g.pct).toBeGreaterThanOrEqual(0);
    expect(g.pct).toBeLessThanOrEqual(100);
    expect(Array.isArray(g.found)).toBe(true);
    expect(Array.isArray(g.missing)).toBe(true);
    expect(Array.isArray(g.notes)).toBe(true);
  });
  it("rejects a one-word essay", async () => {
    await expect(call("ai.essayGrade", { lessonId, text: "رياضيات" })).rejects.toThrow();
  });
});

describe("in-video search (feature 43)", () => {
  it("returns timestamped hits", async () => {
    const r: any = await call("ai.videoSearch", { lessonId, query: lessonTitle.split(" ")[0] });
    expect(Array.isArray(r.hits)).toBe(true);
    if (r.hits.length > 0) {
      expect(r.hits[0].atSec).toBeGreaterThanOrEqual(0);
      expect(r.hits[0].text.length).toBeGreaterThan(0);
    }
  });
});

describe("next lesson + study plan (features 44, 41)", () => {
  it("recommends the first lesson of an enrolled course", async () => {
    const detail: any = await call("catalog.course", { slug: "sec-3-term-1" });
    await call("learning.purchase", { courseId: detail.course.id });
    const rec: any = await call("ai.next");
    expect(rec).toBeTruthy();
    expect(rec.lessonTitle).toBeTruthy();
    expect(rec.reason.length).toBeGreaterThan(5);
  });
  it("builds and saves a study plan", async () => {
    const p: any = await call("ai.planSet", { examDate: "2027-01-15" });
    expect(p.days.length).toBeGreaterThan(0);
    expect(p.days[0].tasks.length).toBeGreaterThan(0);
    const again: any = await call("ai.planGet");
    expect(again.examDate).toBe("2027-01-15");
    expect(again.days.length).toBe(p.days.length);
  });
  it("rejects a malformed date", async () => {
    await expect(call("ai.planSet", { examDate: "next friday" })).rejects.toThrow();
  });
});

describe("adaptive test (feature 45)", () => {
  it("runs a full session and finishes with a level", async () => {
    const start: any = await call("ai.adaptiveStart", { lessonId });
    expect(start.total).toBe(ADAPTIVE_LENGTH);
    expect(start.question.index).toBe(0);
    let step: any = null;
    for (let i = 0; i < ADAPTIVE_LENGTH; i++) {
      step = await call("ai.adaptiveAnswer", { sessionId: start.sessionId, answer: 0 });
      expect(typeof step.correct).toBe("boolean");
      expect(step.explanation.length).toBeGreaterThan(0);
    }
    expect(step.done).toBe(true);
    expect(step.result.level.length).toBeGreaterThan(0);
    // A finished session refuses more answers.
    await expect(call("ai.adaptiveAnswer", { sessionId: start.sessionId, answer: 0 })).rejects.toThrow();
  });
});
