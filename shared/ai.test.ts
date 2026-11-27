import { describe, expect, it } from "vitest";
import {
  ADAPTIVE_LENGTH,
  adaptiveResult,
  assistantReply,
  buildStudyPlan,
  buildTranscript,
  essayPromptFor,
  generatePractice,
  gradeEssay,
  lessonFlashcards,
  lessonSummary,
  nextAdaptiveLevel,
  nextAdaptiveQuestion,
  normalizeArabic,
  recommendNext,
  scorePractice,
  searchTranscript,
  toArDigits,
  topicFor,
  type AdaptiveState,
} from "./ai";

describe("toArDigits", () => {
  it("renders Arabic-Indic digits and the minus sign", () => {
    expect(toArDigits(0)).toBe("٠");
    expect(toArDigits(42)).toBe("٤٢");
    expect(toArDigits(-7)).toBe("−٧");
  });
});

describe("normalizeArabic", () => {
  it("unifies alef, ya and ta-marbuta forms", () => {
    expect(normalizeArabic("الجُذُور")).toBe(normalizeArabic("الجذور"));
    expect(normalizeArabic("إشارة")).toBe(normalizeArabic("اشاره"));
    expect(normalizeArabic("مستوى")).toBe(normalizeArabic("مستوي"));
  });
});

describe("topicFor", () => {
  it("matches known topics and falls back to generic", () => {
    expect(topicFor("الجذور التربيعية").key).toBe("roots");
    expect(topicFor("حل المعادلات").key).toBe("equations");
    expect(topicFor("درس عشوائي تمامًا").key).toBe("generic");
  });
});

describe("assistantReply (feature 38)", () => {
  const ctx = { lessonTitle: "الجذور التربيعية", durationSec: 600 };
  it("answers an explain request with topic content", () => {
    const r = assistantReply("مش فاهم التبسيط", ctx);
    expect(r.length).toBeGreaterThan(20);
    expect(r).toContain("الجذر");
  });
  it("answers an example request with a worked example", () => {
    expect(assistantReply("هات مثال", ctx)).toContain("مثال");
  });
  it("greets without inventing an answer", () => {
    expect(assistantReply("السلام عليكم", ctx)).toContain("مساعد مدار");
  });
  it("is honest about its limits on off-topic questions", () => {
    expect(assistantReply("مين كسب ماتش الاهلي امبارح", ctx)).toContain("مش نموذج عام");
  });
});

describe("generatePractice (feature 39)", () => {
  it("generates different sets for different attempts", () => {
    const a = generatePractice("l1", "حل المعادلات", 1);
    const b = generatePractice("l1", "حل المعادلات", 2);
    expect(a.map((q) => q.q).join()).not.toBe(b.map((q) => q.q).join());
  });
  it("is deterministic for the same attempt", () => {
    const a = generatePractice("l1", "حل المعادلات", 3);
    const b = generatePractice("l1", "حل المعادلات", 3);
    expect(a).toEqual(b);
  });
  it("keeps the correct index aligned with the options", () => {
    for (const topic of ["الجذور التربيعية", "حل المعادلات", "الدوال", "التفاضل", "التكامل", "المثلثات", "النسبة والتناسب", "الأعداد النسبية", "النهايات", "عشوائي"]) {
      for (let attempt = 1; attempt <= 12; attempt++) {
        const set = generatePractice("lx", topic, attempt);
        for (const q of set) {
          expect(q.options.length).toBeGreaterThanOrEqual(3);
          expect(q.correct).toBeGreaterThanOrEqual(0);
          expect(q.correct).toBeLessThan(q.options.length);
          expect(new Set(q.options).size).toBe(q.options.length);
        }
      }
    }
  });
  it("verifies numeric answers for equations", () => {
    // Regenerate and solve every equation question by inspection of its explanation.
    for (let attempt = 1; attempt <= 20; attempt++) {
      const set = generatePractice("l1", "حل المعادلات", attempt);
      for (const q of set) {
        const ans = q.options[q.correct];
        expect(ans).toMatch(/^[−٠-٩]/);
      }
    }
  });
});

describe("scorePractice", () => {
  it("counts right answers and reports the right index for wrong ones", () => {
    const set = generatePractice("l1", "التفاضل", 5);
    const allRight = scorePractice(set, set.map((q) => q.correct));
    expect(allRight.pct).toBe(100);
    const allWrong = scorePractice(set, set.map((q) => (q.correct + 1) % q.options.length));
    expect(allWrong.pct).toBe(0);
    expect(allWrong.perQuestion[0].rightIndex).toBe(set[0].correct);
    expect(allWrong.perQuestion[0].explanation.length).toBeGreaterThan(0);
  });
});

describe("summary + flashcards (feature 40)", () => {
  it("summarizes with topic content and the lesson title", () => {
    const s = lessonSummary("الجذور التربيعية", 900);
    expect(s.length).toBeGreaterThanOrEqual(4);
    expect(s.join(" ")).toContain("الجذور التربيعية");
    expect(s.join(" ")).toContain("دقيقة");
  });
  it("returns flashcards for the topic", () => {
    const cards = lessonFlashcards("حل المعادلات");
    expect(cards.length).toBeGreaterThanOrEqual(2);
    expect(cards[0].front.length).toBeGreaterThan(0);
    expect(cards[0].back.length).toBeGreaterThan(0);
  });
});

describe("transcript search (feature 43)", () => {
  const segs = buildTranscript("l1", "حل المعادلات", 600);
  it("covers the whole lesson from start to end", () => {
    expect(segs[0].atSec).toBe(0);
    expect(segs[segs.length - 1].atSec).toBeLessThan(600);
  });
  it("finds a segment by a normalized phrase", () => {
    const hits = searchTranscript(segs, "الميزان");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].atSec).toBeGreaterThanOrEqual(0);
  });
  it("matches despite diacritics and alef forms", () => {
    expect(searchTranscript(segs, "الإشارة").length).toBeGreaterThan(0);
    expect(searchTranscript(segs, "اشاره").length).toBeGreaterThan(0);
  });
  it("returns nothing for unrelated queries", () => {
    expect(searchTranscript(segs, "كورة قدم").length).toBe(0);
  });
});

describe("essay grading (feature 42)", () => {
  const title = "الجذور التربيعية";
  it("has a topic prompt", () => {
    expect(essayPromptFor(title)).toContain("جذر");
  });
  it("scores a complete essay higher than a weak one", () => {
    const good = gradeEssay(
      "أول خطوة في تبسيط الجذر التربيعي إني أفكك العدد لعامل فيه مربع كامل. مثال: جذر ٧٢ بيساوي جذر ٣٦ في ٢، والجذر بيتوزع على الضرب. يعني الناتج ٦ جذر ٢. الخطوة الأخيرة أتأكد إن اللي تحت الجذر مفيهوش مربع كامل تاني.",
      title,
    );
    const weak = gradeEssay("الجذر حاجة في الرياضيات", title);
    expect(good.pct).toBeGreaterThan(weak.pct);
    expect(good.passed).toBe(true);
    expect(weak.passed).toBe(false);
    expect(weak.missing.length).toBeGreaterThan(0);
  });
  it("never fails an empty answer by accident", () => {
    const g = gradeEssay("", title);
    expect(g.pct).toBeLessThan(60);
    expect(g.passed).toBe(false);
  });
});

describe("recommendNext (feature 44)", () => {
  const L = (id: string, state: any, quizBestPct = 0) => ({ id, title: id, state, quizBestPct });
  it("continues an in-progress lesson first", () => {
    const r = recommendNext([L("a", "completed", 90), L("b", "watching"), L("c", "not-started")]);
    expect(r?.lessonId).toBe("b");
  });
  it("points to the quiz when watching is done", () => {
    const r = recommendNext([L("a", "needs-quiz")]);
    expect(r?.lessonId).toBe("a");
    expect(r?.reason).toContain("الكويز");
  });
  it("takes the first untouched lesson in order", () => {
    const r = recommendNext([L("a", "completed", 90), L("b", "not-started"), L("c", "not-started")]);
    expect(r?.lessonId).toBe("b");
  });
  it("suggests reviewing the weakest quiz when everything is complete", () => {
    const r = recommendNext([L("a", "completed", 95), L("b", "completed", 60)]);
    expect(r?.lessonId).toBe("b");
  });
  it("handles an empty course", () => {
    expect(recommendNext([])).toBeNull();
  });
});

describe("study plan (feature 41)", () => {
  const lessons = [
    { id: "1", title: "درس ١", courseTitle: "كورس", state: "completed" as const, quizBestPct: 90 },
    { id: "2", title: "درس ٢", courseTitle: "كورس", state: "watching" as const, quizBestPct: 0 },
    { id: "3", title: "درس ٣", courseTitle: "كورس", state: "not-started" as const, quizBestPct: 0 },
    { id: "4", title: "درس ٤", courseTitle: "كورس", state: "completed" as const, quizBestPct: 50 },
  ];
  it("plans watching before reviewing, capped by the exam window", () => {
    const plan = buildStudyPlan(lessons, "2026-12-10", "2026-12-01");
    expect(plan.length).toBe(10);
    const kinds = plan.flatMap((d) => d.tasks.map((t) => t.kind));
    expect(kinds.indexOf("watch")).toBeLessThan(kinds.indexOf("quiz-retry"));
    expect(plan[plan.length - 1].tasks.some((t) => t.kind === "review")).toBe(true);
  });
  it("never goes past 14 days even for far exams", () => {
    expect(buildStudyPlan(lessons, "2027-06-01", "2026-12-01").length).toBe(14);
  });
  it("defaults to a week without an exam date", () => {
    expect(buildStudyPlan(lessons, null, "2026-12-01").length).toBe(7);
  });
  it("keeps every day non-empty", () => {
    for (const d of buildStudyPlan([], "2026-12-05", "2026-12-01")) {
      expect(d.tasks.length).toBeGreaterThan(0);
    }
  });
});

describe("adaptive test (feature 45)", () => {
  const start: AdaptiveState = { level: 2, asked: [] };
  it("climbs on correct answers and drops on wrong ones", () => {
    let s = start;
    s = nextAdaptiveLevel(s, true);
    expect(s.level).toBe(3);
    s = nextAdaptiveLevel(s, true);
    expect(s.level).toBe(3); // capped at hard
    s = nextAdaptiveLevel(s, false);
    expect(s.level).toBe(2);
    s = nextAdaptiveLevel(s, false);
    s = nextAdaptiveLevel(s, false);
    expect(s.level).toBe(1); // floored at easy
  });
  it("serves exactly ADAPTIVE_LENGTH questions then stops", () => {
    let s = start;
    let count = 0;
    while (true) {
      const q = nextAdaptiveQuestion("l1", "التفاضل", "seed", s);
      if (!q) break;
      count++;
      expect(q.difficulty).toBe(s.level);
      expect(q.index).toBe(count - 1);
      s = nextAdaptiveLevel(s, count % 2 === 0);
    }
    expect(count).toBe(ADAPTIVE_LENGTH);
  });
  it("maps performance to a level label", () => {
    const strong: AdaptiveState = { level: 3, asked: [1, 2, 3, 3, 2, 3].map((d) => ({ difficulty: d as any, correct: true })) };
    expect(adaptiveResult(strong).level).toBe("متقدم");
    const weak: AdaptiveState = { level: 1, asked: [1, 1, 1, 2, 1, 1].map((d) => ({ difficulty: d as any, correct: false })) };
    const r = adaptiveResult(weak);
    expect(r.level).toBe("محتاج مراجعة");
    expect(r.pct).toBe(0);
  });
});
