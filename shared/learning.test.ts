import { describe, expect, it } from "vitest";
import {
  QUIZ_FAIL_LOCK_THRESHOLD,
  quizFailOutcome,
  mergeWatchSegment,
  coveredSeconds,
  heartbeatSegment,
  WATCH_COMPLETE_PCT,
  buildLessonContent,
  certificateCode,
  isLessonComplete,
  isWatchDone,
  lessonState,
  publicQuestion,
  scoreQuiz,
  watchPercent,
} from "./learning";

describe("watchPercent", () => {
  it("is the floored watched share, capped at 100", () => {
    expect(watchPercent(0, 600)).toBe(0);
    expect(watchPercent(300, 600)).toBe(50);
    expect(watchPercent(540, 600)).toBe(90);
    expect(watchPercent(9999, 600)).toBe(100);
  });

  it("never divides by zero", () => {
    expect(watchPercent(100, 0)).toBe(0);
    expect(watchPercent(100, -5)).toBe(0);
  });
});

describe("the 90% rule", () => {
  it("flips exactly at the threshold", () => {
    expect(isWatchDone(89.9 * 6, 600)).toBe(false);
    expect(isWatchDone(540, 600)).toBe(true);
    expect(WATCH_COMPLETE_PCT).toBe(90);
  });
});

describe("lessonState", () => {
  it("walks not-started → watching → needs-quiz → completed", () => {
    expect(lessonState({ watchedSec: 0, quizPassed: false, completed: false }, 600)).toBe("not-started");
    expect(lessonState({ watchedSec: 120, quizPassed: false, completed: false }, 600)).toBe("watching");
    expect(lessonState({ watchedSec: 540, quizPassed: false, completed: false }, 600)).toBe("needs-quiz");
    expect(lessonState({ watchedSec: 540, quizPassed: true, completed: true }, 600)).toBe("completed");
  });

  it("a passed quiz without the watched seconds is NOT complete", () => {
    expect(isLessonComplete(100, 600, true)).toBe(false);
    expect(isLessonComplete(540, 600, true)).toBe(true);
    expect(isLessonComplete(540, 600, false)).toBe(false);
  });
});

describe("scoreQuiz", () => {
  const qs = [
    { id: "a", q: "", options: ["x", "y"], correct: 0 },
    { id: "b", q: "", options: ["x", "y"], correct: 1 },
    { id: "c", q: "", options: ["x", "y"], correct: 1 },
  ];

  it("passes at 60% and above", () => {
    const two = scoreQuiz(qs, [0, 1, null]);
    expect(two.correctCount).toBe(2);
    expect(two.pct).toBe(67);
    expect(two.passed).toBe(true);

    const one = scoreQuiz(qs, [0, null, null]);
    expect(one.pct).toBe(33);
    expect(one.passed).toBe(false);
  });

  it("marks per-question correctness and tolerates junk answers", () => {
    const r = scoreQuiz(qs, [0, 0, 99]);
    expect(r.perQuestion).toEqual([true, false, false]);
    expect(scoreQuiz([], [])).toMatchObject({ pct: 0, passed: false });
  });
});

describe("buildLessonContent", () => {
  it("is deterministic — the server re-derives the exact key it issued", () => {
    const a = buildLessonContent("id-1", "الجذر التربيعي — الفكرة", 840);
    const b = buildLessonContent("id-1", "الجذر التربيعي — الفكرة", 840);
    expect(a).toEqual(b);
  });

  it("keeps in-video questions inside the video, in time order", () => {
    const { videoQuestions } = buildLessonContent("id-2", "المعادلات من الدرجة الأولى", 1260);
    expect(videoQuestions).toHaveLength(2);
    for (const q of videoQuestions) {
      expect(q.atSec).toBeGreaterThan(0);
      expect(q.atSec).toBeLessThan(1260);
    }
    expect(videoQuestions[0].atSec).toBeLessThan(videoQuestions[1].atSec);
  });

  it("three quiz questions with a valid answer index each", () => {
    const { quiz } = buildLessonContent("id-3", "درس بلا موضوع معروف", 900);
    expect(quiz.questions).toHaveLength(3);
    for (const q of quiz.questions) {
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThan(q.options.length);
    }
  });

  it("chapters start at zero and stay inside the duration", () => {
    const { chapters } = buildLessonContent("id-4", "التكامل المحدود والمساحات", 1500);
    expect(chapters[0].atSec).toBe(0);
    expect(chapters.every((c) => c.atSec < 1500)).toBe(true);
  });

  it("publicQuestion strips the answer", () => {
    const p = publicQuestion({ id: "x", q: "س", options: ["1", "2"], correct: 1 });
    expect(p).toEqual({ id: "x", q: "س", options: ["1", "2"] });
    expect("correct" in p).toBe(false);
  });
});

describe("watch segments (replay/skip protection)", () => {
  it("merges overlapping and touching stretches into one", () => {
    let segs = mergeWatchSegment([], 10, 40);
    segs = mergeWatchSegment(segs, 30, 60);
    segs = mergeWatchSegment(segs, 60, 90);
    expect(segs).toEqual([[10, 90]]);
    expect(coveredSeconds(segs)).toBe(80);
  });

  it("keeps disjoint stretches separate and sorted", () => {
    let segs = mergeWatchSegment([], 100, 130);
    segs = mergeWatchSegment(segs, 10, 40);
    segs = mergeWatchSegment(segs, 200, 260);
    expect(segs).toEqual([[10, 40], [100, 130], [200, 260]]);
    expect(coveredSeconds(segs)).toBe(120);
  });

  it("replaying the same stretch adds nothing", () => {
    let segs = mergeWatchSegment([], 50, 80);
    for (let n = 0; n < 25; n++) segs = mergeWatchSegment(segs, 50, 80);
    expect(segs).toEqual([[50, 80]]);
    expect(coveredSeconds(segs)).toBe(30);
  });

  it("heartbeatSegment caps a beat at MAX_HEARTBEAT_SEC and clamps to the video", () => {
    expect(heartbeatSegment(300, 300, 900)).toEqual([270, 300]);
    expect(heartbeatSegment(5000, 20, 900)).toEqual([880, 900]);
    expect(heartbeatSegment(5, 10, 900)).toEqual([0, 5]);
  });
});

describe("certificateCode", () => {
  it("formats MDR-XXXX-XXXX from a uuid", () => {
    expect(certificateCode("3f8a2b1c-9d4e-4f5a-8b6c-7d8e9f0a1b2c")).toBe("MDR-3F8A-2B1C");
  });
});

describe("quizFailOutcome (feature 7 — re-watch lock)", () => {
  it("keeps counting under the threshold and reports attempts left", () => {
    expect(quizFailOutcome(1)).toEqual({ locked: false, fails: 1, failsLeft: 2 });
    expect(quizFailOutcome(2)).toEqual({ locked: false, fails: 2, failsLeft: 1 });
  });

  it("locks at the threshold and resets the counter for the next round", () => {
    expect(quizFailOutcome(QUIZ_FAIL_LOCK_THRESHOLD)).toEqual({ locked: true, fails: 0, failsLeft: QUIZ_FAIL_LOCK_THRESHOLD });
    expect(quizFailOutcome(QUIZ_FAIL_LOCK_THRESHOLD + 2)).toEqual({ locked: true, fails: 0, failsLeft: QUIZ_FAIL_LOCK_THRESHOLD });
  });
});
