// ─────────────────────────────────────────────────────────────────────────────
// Learning engine — مدار trust & progress group.
// Pure logic shared by the demo store, the real server and the client, so the
// completion rule can never drift between the three:
//
//   A lesson is COMPLETE when the student actually watched >= 90% of it
//   (seconds recorded by the server, not a "done" button) AND passed its quiz.
// ─────────────────────────────────────────────────────────────────────────────

/** Share of the video that must be watched (server-counted seconds) before the quiz unlocks. */
export const WATCH_COMPLETE_PCT = 90;
/** Minimum quiz score to pass a lesson. */
export const QUIZ_PASS_PCT = 60;
/** A heartbeat can never bank more than this many seconds — faster "watching" is fake. */
export const MAX_HEARTBEAT_SEC = 30;
/** A second login on another device within this window raises the concurrency notice. */
export const DEVICE_NOTICE_WINDOW_MS = 20 * 60 * 1000;
/** After this many consecutive failed quiz attempts the quiz locks and the
 *  student must re-watch the lesson before trying again (feature 7). */
export const QUIZ_FAIL_LOCK_THRESHOLD = 3;

/**
 * Feature 7 — repeated quiz failure forces a re-watch. Feed the new
 * consecutive-fail count in; when it reaches the threshold the quiz locks and
 * the watch coverage must be revoked (the caller clears it), so the existing
 * 90%-watched gate is what reopens the quiz. The counter resets on a pass and
 * after every lock, so each lock costs one re-watch, then fresh attempts.
 */
export function quizFailOutcome(consecutiveFails: number, threshold = QUIZ_FAIL_LOCK_THRESHOLD): {
  locked: boolean;
  /** Counter to store back: kept while under the threshold, reset on lock. */
  fails: number;
  /** Attempts left before the next lock, for the UI to warn with. */
  failsLeft: number;
} {
  if (consecutiveFails >= threshold) return { locked: true, fails: 0, failsLeft: threshold };
  return { locked: false, fails: consecutiveFails, failsLeft: threshold - consecutiveFails };
}

export interface QuizQuestion {
  id: string;
  q: string;
  options: string[];
  correct: number;
}

export interface VideoQuestion extends QuizQuestion {
  /** Second of the video where the player pauses and asks. */
  atSec: number;
}

export interface Chapter {
  atSec: number;
  title: string;
}

export interface LessonQuiz {
  passPct: number;
  questions: QuizQuestion[];
}

/** Where a lesson stands for one student. */
export type LessonState = "not-started" | "watching" | "needs-quiz" | "completed";

export interface LessonProgressLike {
  watchedSec: number;
  quizPassed: boolean;
  completed: boolean;
}

/** Watched share of a lesson, 0–100, capped (a lesson never reads over 100%). */
export function watchPercent(watchedSec: number, durationSec: number): number {
  if (!durationSec || durationSec <= 0) return 0;
  return Math.min(100, Math.floor((Math.max(0, watchedSec) / durationSec) * 100));
}

/** One watched stretch of the video, [fromSec, toSec]. */
export type WatchSegment = [number, number];

/**
 * Merge one newly watched interval into the stored union of intervals.
 * Overlapping or touching stretches coalesce, so replaying the same part of
 * the video can never bank extra seconds — coverage only grows where the
 * student actually reached new ground.
 */
export function mergeWatchSegment(segments: WatchSegment[], fromSec: number, toSec: number): WatchSegment[] {
  let a = Math.max(0, Math.floor(Math.min(fromSec, toSec)));
  let b = Math.max(0, Math.ceil(Math.max(fromSec, toSec)));
  if (b <= a) return segments.map((seg) => [...seg] as WatchSegment);
  const out: WatchSegment[] = [];
  let placed = false;
  for (const [s0, s1] of segments) {
    if (s1 < a - 1) {
      out.push([s0, s1]);
      continue;
    }
    if (s0 > b + 1) {
      if (!placed) {
        out.push([a, b]);
        placed = true;
      }
      out.push([s0, s1]);
      continue;
    }
    a = Math.min(a, s0);
    b = Math.max(b, s1);
  }
  if (!placed) out.push([a, b]);
  return out;
}

/** Unique seconds actually covered by the union of watched intervals. */
export function coveredSeconds(segments: WatchSegment[]): number {
  return segments.reduce((total, [a, b]) => total + Math.max(0, b - a), 0);
}

/** The stretch one heartbeat claims: at most MAX_HEARTBEAT_SEC ending at the current position. */
export function heartbeatSegment(positionSec: number, deltaSec: number, durationSec: number): WatchSegment {
  const end = Math.max(0, durationSec > 0 ? Math.min(positionSec, durationSec) : positionSec);
  const start = Math.max(0, end - Math.max(0, Math.min(deltaSec, MAX_HEARTBEAT_SEC)));
  return [start, end];
}

/** The 90% rule: enough of the video was actually watched. */
export function isWatchDone(watchedSec: number, durationSec: number): boolean {
  if (!durationSec || durationSec <= 0) return false;
  return watchPercent(watchedSec, durationSec) >= WATCH_COMPLETE_PCT;
}

/** Single source for the lesson state machine. */
export function lessonState(p: LessonProgressLike, durationSec: number): LessonState {
  if (p.completed) return "completed";
  if (isWatchDone(p.watchedSec, durationSec)) return "needs-quiz";
  if (p.watchedSec > 0) return "watching";
  return "not-started";
}

/** Completion is earned, never claimed: both halves of the rule must hold. */
export function isLessonComplete(watchedSec: number, durationSec: number, quizPassed: boolean): boolean {
  return quizPassed && isWatchDone(watchedSec, durationSec);
}

export interface QuizScore {
  correctCount: number;
  total: number;
  pct: number;
  passed: boolean;
  perQuestion: boolean[];
}

/** Score answers against the key. Out-of-range or missing answers count wrong. */
export function scoreQuiz(questions: QuizQuestion[], answers: (number | null)[]): QuizScore {
  const perQuestion = questions.map((q, i) => answers[i] === q.correct);
  const correctCount = perQuestion.filter(Boolean).length;
  const total = questions.length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  return { correctCount, total, pct, passed: pct >= QUIZ_PASS_PCT, perQuestion };
}

/** Public certificate code: MDR-XXXX-XXXX, derived from a uuid, safe to print and share. */
export function certificateCode(id: string): string {
  const hex = id.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
  return `MDR-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

/** Strip the answers — the client only ever sees questions this way. */
export function publicQuestion(q: QuizQuestion): Omit<QuizQuestion, "correct"> {
  return { id: q.id, q: q.q, options: q.options };
}

// ─── Generated lesson content ────────────────────────────────────────────────
// Until the teacher dashboard (feature 46) lets staff author questions, every
// lesson gets a deterministic quiz, in-video questions and chapters built from
// its title and duration. Deterministic = the server re-derives the same key
// to grade, and tests stay stable. The bank is keyed on the topic words that
// appear in the seeded catalog's lesson titles.

interface BankEntry {
  match: RegExp;
  /** Question templates; {title} is replaced by the lesson title. */
  quiz: { q: string; options: string[]; correct: number }[];
  video: { q: string; options: string[]; correct: number }[];
}

const BANK: BankEntry[] = [
  {
    match: /جذر|جذور/,
    quiz: [
      { q: "√(٩×٤) بتساوي كام؟", options: ["٦", "٣٦", "١٣", "١٨"], correct: 0 },
      { q: "الجذر التربيعي لعدد هو عدد…", options: ["مربعه يساوي العدد الأصلي", "ضعف العدد", "نصف العدد", "سالب العدد"], correct: 0 },
      { q: "في درس «{title}»، تبسيط الجذر √٥٠ هو…", options: ["٥√٢", "٢√٥", "٢٥√٢", "١٠√٥"], correct: 0 },
    ],
    video: [
      { q: "√١٦ = ؟", options: ["٤", "٨", "٢"], correct: 0 },
      { q: "هل الجذر التربيعي ممكن يطلع عدد سالب؟", options: ["لأ، الجذر الرئيسي دايمًا موجب", "أيوه دايمًا", "بس لو العدد سالب"], correct: 0 },
    ],
  },
  {
    match: /معادل/,
    quiz: [
      { q: "حل المعادلة: س + ٥ = ١٢", options: ["٧", "١٧", "٥", "٢"], correct: 0 },
      { q: "إنك تحل معادلة يعني…", options: ["تجيب قيمة المجهول اللي تخلي الطرفين متساويين", "تحفظ المعادلة", "ترسم خط الأعداد بس", "تضرب الطرفين في صفر"], correct: 0 },
      { q: "لو ٢س = ١٠ يبقى س = ؟", options: ["٥", "٢٠", "٨", "١٢"], correct: 0 },
    ],
    video: [
      { q: "لما ننقل حد للطرف التاني بـ…", options: ["نغيّر إشارته", "نضاعفه", "نشيله خالص"], correct: 0 },
      { q: "٣س = ٩، س = ؟", options: ["٣", "٢٧", "٦"], correct: 0 },
    ],
  },
  {
    match: /دال|دوال|علاق/,
    quiz: [
      { q: "الدالة هي علاقة…", options: ["كل عنصر في المجال ليه صورة واحدة بس", "أي علاقة بين عددين", "لازم تكون خط مستقيم", "معلهاش مجال"], correct: 0 },
      { q: "مجال الدالة هو…", options: ["مجموعة القيم اللي بنعوّض بيها", "مجموعة النواتج", "أكبر قيمة للدالة", "نقطة التقاطع مع الصادات"], correct: 0 },
      { q: "في درس «{title}»، الدالة الخطية بتترسم على شكل…", options: ["خط مستقيم", "قطع مكافئ", "دائرة", "منحنى أسّي"], correct: 0 },
    ],
    video: [
      { q: "كل دالة علاقة، لكن هل كل علاقة دالة؟", options: ["لأ", "أيوه", "أحيانًا في الجبر بس"], correct: 0 },
      { q: "لو د(٢) = ٦ يبقى ٢ عنصر من…", options: ["المجال", "المدى", "الصورة"], correct: 0 },
    ],
  },
  {
    match: /مشتقة|تفاضل|اشتقاق/,
    quiz: [
      { q: "المشتقة الأولى للدالة بتمثل…", options: ["ميل المماس للمنحنى", "مساحة تحت المنحنى", "قيمة الدالة عند الصفر", "أطول مسافة على المنحنى"], correct: 0 },
      { q: "مشتقة س² هي…", options: ["٢س", "س", "س³", "٢"], correct: 0 },
      { q: "في درس «{title}»، مشتقة الدالة الثابتة تساوي…", options: ["صفر", "واحد", "الدالة نفسها", "ما لا نهاية"], correct: 0 },
    ],
    video: [
      { q: "ميل المستقيم الأفقي = ؟", options: ["صفر", "واحد", "غير معرّف"], correct: 0 },
      { q: "مشتقة ٥س = ؟", options: ["٥", "٥س", "س"], correct: 0 },
    ],
  },
  {
    match: /تكامل/,
    quiz: [
      { q: "التكامل هو العملية العكسية لـ…", options: ["التفاضل", "الضرب", "الجمع", "اللوغاريتم"], correct: 0 },
      { q: "∫ ٢س دس = ؟", options: ["س² + ث", "٢ + ث", "س + ث", "٢س² + ث"], correct: 0 },
      { q: "التكامل المحدود بيستخدم في حساب…", options: ["المساحة تحت المنحنى", "ميل المماس", "نقطة الانعطاف", "القيمة العظمى مباشرة"], correct: 0 },
    ],
    video: [
      { q: "ثابت التكامل بنرمزله بـ…", options: ["ث", "س", "ص"], correct: 0 },
      { q: "∫ دس = ؟", options: ["س + ث", "١ + ث", "صفر"], correct: 0 },
    ],
  },
  {
    match: /مثلث|زوايا|تطابق|هندس/,
    quiz: [
      { q: "مجموع زوايا المثلث = ؟", options: ["١٨٠°", "٩٠°", "٣٦٠°", "١٢٠°"], correct: 0 },
      { q: "مثلثان متطابقان يعني…", options: ["الأضلاع والزوايا المتناظرة متساوية", "نفس الشكل بس مختلفين في الحجم", "زاوية واحدة متساوية تكفي", "محيطيهما مختلفان"], correct: 0 },
      { q: "في درس «{title}»، المثلث القائم زاويته الكبرى = ؟", options: ["٩٠°", "٦٠°", "٤٥°", "١٢٠°"], correct: 0 },
    ],
    video: [
      { q: "الزاوية القائمة = ؟", options: ["٩٠°", "١٨٠°", "٤٥°"], correct: 0 },
      { q: "زاويتا مثلث ٥٠° و ٦٠°، التالتة = ؟", options: ["٧٠°", "٨٠°", "٩٠°"], correct: 0 },
    ],
  },
  {
    match: /نسبة|تناسب/,
    quiz: [
      { q: "النسبة بين ٣ و ٦ هي…", options: ["١ : ٢", "٢ : ١", "٣ : ٦ بس", "١ : ٣"], correct: 0 },
      { q: "في التناسب الطردي، لو كمية زادت للضعف التانية…", options: ["تزيد للضعف", "تقل للنصف", "تفضل ثابتة", "تزيد أربع مرات"], correct: 0 },
      { q: "في درس «{title}»، التناسب العكسي معناه حاصل ضرب الكميتين…", options: ["ثابت", "صفر", "متغير دايمًا", "يساوي واحد"], correct: 0 },
    ],
    video: [
      { q: "٢ : ٤ بتساوي…", options: ["١ : ٢", "٢ : ١", "٤ : ٢"], correct: 0 },
      { q: "كلما زاد عدد العمال يقل الزمن — ده تناسب…", options: ["عكسي", "طردي", "مفيش تناسب"], correct: 0 },
    ],
  },
  {
    match: /أعداد|عدد/,
    quiz: [
      { q: "العدد النسبي هو عدد…", options: ["يتكتب في صورة أ/ب حيث ب ≠ صفر", "موجب بس", "صحيح بس", "أكبر من واحد"], correct: 0 },
      { q: "−٣ + ٥ = ؟", options: ["٢", "−٨", "٨", "−٢"], correct: 0 },
      { q: "في درس «{title}»، ناتج (−٢) × (−٤) = ؟", options: ["٨", "−٨", "٦", "−٦"], correct: 0 },
    ],
    video: [
      { q: "سالب في سالب = ؟", options: ["موجب", "سالب", "صفر"], correct: 0 },
      { q: "−٧ − ٣ = ؟", options: ["−١٠", "١٠", "−٤"], correct: 0 },
    ],
  },
  {
    match: /نهاية|نهايات/,
    quiz: [
      { q: "نهاية الدالة عند نقطة بتصف…", options: ["القيمة اللي الدالة بتقترب منها", "قيمة الدالة عند النقطة دايمًا", "أكبر قيمة للدالة", "مجال الدالة"], correct: 0 },
      { q: "لو النهاية من اليمين = النهاية من اليسار يبقى النهاية…", options: ["موجودة", "غير موجودة", "تساوي صفر", "ما لا نهاية"], correct: 0 },
      { q: "في درس «{title}»، نهاية (١/س) لما س تكبر جدًا = ؟", options: ["صفر", "واحد", "ما لا نهاية", "غير موجودة"], correct: 0 },
    ],
    video: [
      { q: "النهاية هي نفسها قيمة الدالة عند النقطة؟", options: ["مش لازم", "أيوه دايمًا", "مستحيل تتساووا"], correct: 0 },
      { q: "نهاية ثابت = ؟", options: ["نفس الثابت", "صفر", "واحد"], correct: 0 },
    ],
  },
];

const GENERIC: BankEntry = {
  match: /.*/,
  quiz: [
    { q: "أهم خطوة قبل ما تحل أي مسألة في «{title}»؟", options: ["تفهم المطلوب وتحدد المعطيات", "تحفظ القانون من غير فهم", "تكتب الناتج الأول", "تتخطى الرسم"], correct: 0 },
    { q: "أحسن طريقة تثبّت بيها درس «{title}»؟", options: ["تحل أمثلة بنفسك بعد الشرح", "تشوف الفيديو بسرعة مضاعفة", "تكتب الخطوات من غير ما تحل", "تذاكر ليلة الامتحان بس"], correct: 0 },
    { q: "لو لقيت خطوة مش واضحة في الشرح تعمل إيه؟", options: ["ترجع للجزء ده تاني وتسأل تحت الدرس", "تتجاهلها وكمّل", "تقفل الدرس خالص", "تحفظها من غير ما تفهمها"], correct: 0 },
  ],
  video: [
    { q: "الجزء اللي فات من «{title}» بيشرح الفكرة قبل الحل. الفكرة بتيجي…", options: ["قبل القانون", "بعد القانون", "مش مهمة"], correct: 0 },
    { q: "تجرب بنفسك قبل ما تشوف الحل؟", options: ["أيوه، ده أسرع تثبيت", "لأ أبدًا", "بس في الامتحان"], correct: 0 },
  ],
};

/** Deterministic 32-bit hash — same lesson always gets the same question order. */
function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Rotate an array deterministically so adjacent lessons don't share an opener. */
function rotate<T>(arr: T[], n: number): T[] {
  if (arr.length === 0) return arr;
  const k = ((n % arr.length) + arr.length) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

/** The quiz + in-video questions + chapters for one lesson, rebuilt identically everywhere. */
export function buildLessonContent(lessonId: string, title: string, durationSec: number): {
  quiz: LessonQuiz;
  videoQuestions: VideoQuestion[];
  chapters: Chapter[];
} {
  const bank = BANK.find((b) => b.match.test(title)) ?? GENERIC;
  const h = hash32(`${lessonId}:${title}`);
  const fill = (s: string) => s.replaceAll("{title}", title);

  const quizQuestions = rotate(bank.quiz, h).slice(0, 3).map((q, i) => ({
    id: `q${i + 1}`,
    q: fill(q.q),
    options: q.options,
    correct: q.correct,
  }));

  const d = durationSec > 0 ? durationSec : 600;
  const marks = [0.45, 0.8];
  const videoQuestions = rotate(bank.video, h).slice(0, 2).map((q, i) => ({
    id: `v${i + 1}`,
    atSec: Math.round(d * marks[i]),
    q: fill(q.q),
    options: q.options,
    correct: q.correct,
  }));

  const chapterTitles = ["تمهيد وفكرة الدرس", "الشرح خطوة بخطوة", "أمثلة محلولة"];
  const chapters = chapterTitles.map((t, i) => ({ atSec: Math.round((d * i) / 3), title: t }));

  return { quiz: { passPct: QUIZ_PASS_PCT, questions: quizQuestions }, videoQuestions, chapters };
}
