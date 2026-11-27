// ─────────────────────────────────────────────────────────────────────────────
// DEMO MODE — a tiny in-browser "server" for the whole tRPC API.
// Everything lives in localStorage (key: madar_demo_v1). No backend, no database.
// It mirrors server/routers.ts + server/db.ts so every page works unchanged.
// To go back to the real backend: restore httpBatchLink in ./trpc.ts.
// ─────────────────────────────────────────────────────────────────────────────
import { SEED } from "./demo-seed";
import { CHECKOUT_MAX, CHECKOUT_MIN, MAX_CHILDREN, PARENT_CODE_LEN, PROVIDERS, mockSend, mockTranslate, normalizeParentCode, validCheckoutAmount, whatsappLink } from "../../../shared/integrations";
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
  recommendNext,
  scorePractice,
  searchTranscript,
  type AdaptiveState,
} from "../../../shared/ai";
import {
  BADGES,
  DEFAULT_GOAL_MINUTES,
  PEER_RUBRIC,
  POINT_VALUES,
  aggregatePeerReviews,
  canAwardDailyGoal,
  challengeStanding,
  challengeState,
  challengeWinner,
  dayKey,
  evaluateBadges,
  goalProgress,
  minutesInWeek,
  weekKey,
  weekStreaks,
  canAwardWeeklyGoal,
  DEFAULT_WEEKLY_GOAL_MINUTES,
  liveStatus,
  pointsInWeek,
  pointsOf,
  rankLeaderboard,
  streaks,
  weekStart,
  type GamifyStats,
  type PointKind,
} from "../../../shared/gamify";
import {
  cohortComparison,
  dropOffPoint,
  parentWeeklyReport,
  revenueReport,
  rewatchHeatmap,
  studyMinutesByDay,
  toCsv,
  unitProgress,
  weakTopics,
} from "../../../shared/analytics";
import {
  buildSubscriptionNotices,
  generateCodeString,
  mergeNotifications,
  ratingSummary,
  redeemTopupCode,
  searchCatalog,
  unreadCount,
  upsertReview,
  validateLessonInput,
} from "../../../shared/platform";
import { shareLinkStatus, signToken, verifyToken } from "../../../shared/sign";
import { reportHtml, toExcelXml } from "../../../shared/export";
import {
  DEVICE_NOTICE_WINDOW_MS,
  QUIZ_FAIL_LOCK_THRESHOLD,
  quizFailOutcome,
  coveredSeconds,
  heartbeatSegment,
  mergeWatchSegment,
  buildLessonContent,
  certificateCode,
  isLessonComplete,
  isWatchDone,
  lessonState,
  publicQuestion,
  scoreQuiz,
  watchPercent,
} from "../../../shared/learning";

type Row = Record<string, any>;
interface Store {
  users: Row[];
  profiles: Row[];
  courses: Row[];
  units: Row[];
  lessons: Row[];
  enrollments: Row[];
  wallet: Row[];
  topups: Row[];
  progress: Row[];
  certificates: Row[];
  devices: Row[];
  aiChats: Row[];
  aiPractice: Row[];
  aiAdaptive: Row[];
  aiEssays: Row[];
  studyPlans: Row[];
  // Motivation & engagement group (features 30–35, 37).
  pointEvents: Row[];
  dailyGoals: Row[];
  gamifyFlags: Row[];
  discussionPosts: Row[];
  discussionReplies: Row[];
  liveSessions: Row[];
  liveMessages: Row[];
  challenges: Row[];
  assignments: Row[];
  submissions: Row[];
  peerReviews: Row[];
  // Platform & admin group (features 46–50).
  topupCodes: Row[];
  notifications: Row[];
  courseReviews: Row[];
  // Analytics group (features 13–20): raw watch events for drop-off/rewatch stats.
  watchEvents: Row[];
  lessonNotes: Row[];
  // Feature 12: independent student activity log (who watched what, and when).
  activityEvents: Row[];
  // Feature 11: temporary signed video links created by staff.
  signedLinks: Row[];
  // v14: parent accounts, integration outbox, mock checkouts.
  parentCodes: Row[];
  parentLinks: Row[];
  outbox: Row[];
  checkouts: Row[];
  settings: Record<string, string>;
  sessionUserId: string | null;
}

const KEY = "madar_demo_v1";
const VIDEO = "https://www.youtube.com/watch?v=WUvTyaaNkzM";
const DAY = 86_400_000;

export const DEFAULT_SETTINGS: Record<string, string> = {
  platform_name: "مدار",
  accent_color: "#3d8bff",
  hero_tagline: "الرياضيات مش حفظ… فهم. من الصفر لحد الامتحان.",
  instapay_handle: "madar@instapay",
  wallet_number: "01000000000",
  support_whatsapp: "201000000000",
  default_term_price: "1200",
  payment_note: "بعد التحويل ارفع صورة الإيصال هنا. الاعتماد بيتم يدويًا في خلال ٢٤ ساعة.",
  platform_name_en: "Madar",
  hero_tagline_en: "Maths isn't memorising, it's understanding. From zero to exam day.",
  payment_note_en: "After you transfer, upload the receipt photo here. Top-ups are approved by hand within 24 hours.",
};

export class DemoError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/** Demo-only signing secret for the temporary video links (feature 11). The
 *  real server signs with its own env secret — never this value. */
const SHARE_SECRET = "madar-demo-share-secret-v1";

const uuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 3) | 8).toString(16);
      });
const now = () => new Date().toISOString();
const D = (v: string | null | undefined) => (v ? new Date(v) : v ?? null);

// ─── seed ────────────────────────────────────────────────────────────────────

function seed(): Store {
  const courses: Row[] = [];
  const units: Row[] = [];
  const lessons: Row[] = [];
  for (const c of SEED.courses) {
    const id = uuid();
    courses.push({ id, ...c, subjectName: "الرياضيات", posterUrl: ART[c.slug] ? `/posters/${ART[c.slug]}.svg` : null, backdropUrl: ART[c.slug] ? `/media/${ART[c.slug]}.svg` : null, createdAt: now() });
    const plan = (SEED.PLAN as Record<string, any>)[c.slug];
    if (!plan) continue;
    const unitIds: string[] = plan.units.map((title: string, i: number) => {
      const uid = uuid();
      units.push({ id: uid, courseId: id, title, sortOrder: i });
      return uid;
    });
    plan.lessons.forEach(([title, unitIdx, durationSec, isFree, summary]: any[], i: number) => {
      lessons.push({
        id: uuid(), courseId: id, unitId: unitIds[unitIdx] ?? null, title, summary,
        // Feature 29 (free preview): the whole first unit is open before subscribing.
        videoUrl: VIDEO, durationSec, isFree: isFree || unitIdx === 0, sortOrder: i,
      });
    });
  }

  const ownerId = uuid();
  const studentId = uuid();
  const users = [
    { id: ownerId, email: "owner@madar.test", password: "MadarOwner2026!", name: "المالك", createdAt: now() },
    { id: studentId, email: "student@madar.test", password: "Student2026!", name: "طالب تجريبي", createdAt: now() },
  ];
  const profiles = [
    { id: uuid(), userId: ownerId, role: "owner", displayName: "المالك", phone: null, stage: null, gradeKey: null, track: null, pathway: null, createdAt: now() },
    { id: uuid(), userId: studentId, role: "student", displayName: "طالب تجريبي", phone: null, stage: "secondary", gradeKey: "sec-3", track: "general", pathway: null, createdAt: now() },
  ];
  const wallet = [
    { id: uuid(), userId: studentId, type: "topup", amountEgp: 2000, balanceAfter: 2000, reference: "demo", idempotencyKey: "demo:seed", note: "رصيد تجريبي", createdAt: now() },
  ];
  const store = {
    users, profiles, courses, units, lessons,
    enrollments: [], wallet, topups: [], progress: [], certificates: [], devices: [],
    aiChats: [], aiPractice: [], aiAdaptive: [], aiEssays: [], studyPlans: [],
    settings: {}, sessionUserId: null,
    pointEvents: [], dailyGoals: [], gamifyFlags: [], discussionPosts: [], discussionReplies: [],
    liveSessions: [], liveMessages: [], challenges: [], assignments: [], submissions: [], peerReviews: [],
    topupCodes: [], notifications: [], courseReviews: [], watchEvents: [], lessonNotes: [],
    activityEvents: [], signedLinks: [],
    parentCodes: [], parentLinks: [], outbox: [], checkouts: [],
  } as Store;
  seedEngagement(store);
  seedPlatform(store);
  seedAnalytics(store);
  // Feature 26 (PDF summaries): the first sec-3 lesson ships a sample sheet.
  const sec3 = store.courses.find((c) => c.slug === "sec-3-term-1");
  const firstSec3 = store.lessons.find((l) => l.courseId === sec3?.id && l.sortOrder === 0);
  if (firstSec3) firstSec3.pdfUrl = "/milzama-mushtaqa.pdf";
  return store;
}

// ── motivation & engagement content (features 30–35, 37) ────────────────────
// Runs on first seed AND as a backfill for stores saved by older versions, so
// upgrading in the same browser keeps the demo full. Idempotent per content.
function seedEngagement(store: Store): void {
  if (store.users.some((x) => x.email === "classmate1@madar.test")) return;
  const DAY_MS = 24 * 3600 * 1000;
  const t0 = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();
  const sec3 = store.courses.find((c) => c.slug === "sec-3-term-1");
  const owner = store.profiles.find((p) => p.role === "owner");
  const student = store.profiles.find((p) => p.role === "student" && p.gradeKey === "sec-3");
  if (!sec3 || !owner) return;
  const sec3Lessons = store.lessons.filter((l) => l.courseId === sec3.id).sort((a, b) => a.sortOrder - b.sortOrder);
  const l1 = sec3Lessons[0];
  const l2 = sec3Lessons[1];

  const classNames = ["سارة محمود", "يوسف عادل", "مريم خالد", "حبيبة سامي", "عمر طارق", "جني أيمن"];
  const classWeekPoints = [180, 150, 120, 90, 60, 40];
  const classmateIds: string[] = [];
  classNames.forEach((name, ci) => {
    const id = uuid();
    classmateIds.push(id);
    store.users.push({ id, email: `classmate${ci + 1}@madar.test`, password: "Class2026!", name, createdAt: now() });
    store.profiles.push({ id: uuid(), userId: id, role: "student", displayName: name, phone: null, stage: "secondary", gradeKey: "sec-3", track: "general", pathway: null, createdAt: now() });
    let left = classWeekPoints[ci];
    let d = 0;
    while (left > 0) {
      const pts = Math.min(left, 30);
      const kind = pts >= 30 ? "quiz_perfect" : pts >= 20 ? "quiz_passed" : "lesson_watched";
      store.pointEvents.push({ id: uuid(), userId: id, kind, points: pts, ref: null, at: iso(t0 - d * DAY_MS - 3600_000) });
      left -= pts;
      d += 1;
    }
  });

  if (student) {
    // A 3-day streak going into today, and yesterday's goal already met.
    for (let i = 1; i <= 3; i++) {
      store.pointEvents.push({ id: uuid(), userId: student.userId, kind: "lesson_watched", points: 10, ref: `seed-lesson-${i}`, at: iso(t0 - i * DAY_MS) });
    }
    store.pointEvents.push({ id: uuid(), userId: student.userId, kind: "quiz_passed", points: 20, ref: "seed-quiz", at: iso(t0 - DAY_MS) });
    store.dailyGoals.push({ id: uuid(), userId: student.userId, day: dayKey(iso(t0 - DAY_MS)), minutes: 35, goalMinutes: 30, awardedAt: iso(t0 - DAY_MS) });
  }

  if (l1) {
    const p1 = { id: uuid(), userId: classmateIds[0], lessonId: l1.id, text: "حد يقدر يوضحلي الفرق بين المعدل اللحظي للتغير ومتوسط التغير؟", createdAt: iso(t0 - 5 * 3600_000) };
    store.discussionPosts.push(p1);
    store.discussionReplies.push(
      { id: uuid(), postId: p1.id, userId: classmateIds[1], text: "متوسط التغير على فترة كاملة، أما اللحظي عند نقطة واحدة — ده الميل بتاع المماس.", createdAt: iso(t0 - 4 * 3600_000) },
      { id: uuid(), postId: p1.id, userId: owner.userId, text: "إجابة صحيحة. راجعوا الدقيقة ١٣ من الفيديو، الرسمة هناك بتوضح الفرق.", createdAt: iso(t0 - 3 * 3600_000) },
    );
  }
  if (l2) {
    store.discussionPosts.push({ id: uuid(), userId: classmateIds[2], lessonId: l2.id, text: "في مثال قاعدة الضرب، ليه بنشتق الأولى ونسيب التانية وبعدين نعكس؟", createdAt: iso(t0 - 26 * 3600_000) });
  }

  const live1 = { id: uuid(), courseId: sec3.id, lessonId: l2?.id ?? null, title: "مراجعة لايف: قواعد الاشتقاق", startsAt: iso(t0 - 10 * 60_000), endsAt: iso(t0 + 50 * 60_000), recordingUrl: null, createdAt: now() };
  const live2 = { id: uuid(), courseId: sec3.id, lessonId: l1?.id ?? null, title: "لايف مقدمة التفاضل", startsAt: iso(t0 - DAY_MS - 3600_000), endsAt: iso(t0 - DAY_MS), recordingUrl: VIDEO, createdAt: now() };
  store.liveSessions.push(live1, live2);
  store.liveMessages.push(
    { id: uuid(), sessionId: live1.id, userId: classmateIds[1], text: "يا مستر قاعدة السلسلة هتيجي في الامتحان؟", createdAt: iso(t0 - 6 * 60_000) },
    { id: uuid(), sessionId: live1.id, userId: owner.userId, text: "أيوه طبعًا، وهنحل عليها مسائل النهارده.", createdAt: iso(t0 - 5 * 60_000) },
  );

  // Peer-review assignment on the FIRST lesson so it's reachable before gating.
  if (l1) {
    const a = { id: uuid(), courseId: sec3.id, lessonId: l1.id, title: "واجب: اشرح قاعدة السلسلة", prompt: "اشرح قاعدة السلسلة بأسلوبك مع مثال محلول خطوة بخطوة.", createdAt: iso(t0 - 2 * DAY_MS) };
    store.assignments.push(a);
    store.submissions.push(
      { id: uuid(), assignmentId: a.id, userId: classmateIds[0], text: "قاعدة السلسلة بتقول لو عندي دالة جوه دالة زي (٢س+١)³، باشتق القوس الأول وبعدين أضرب في مشتقة اللي جواه: ٣(٢س+١)² × ٢ = ٦(٢س+١)².", createdAt: iso(t0 - DAY_MS) },
      { id: uuid(), assignmentId: a.id, userId: classmateIds[3], text: "بفكّ الدالة المركبة لجزئين: الخارجية والداخلية. مشتقة الخارجية في الداخلية زي ما هي، وبعدين في مشتقة الداخلية. مثال: جا(س²) مشتقتها جتا(س²) × ٢س.", createdAt: iso(t0 - 20 * 3600_000) },
    );
    if (student) {
      store.challenges.push({
        id: uuid(), lessonId: l1.id, createdBy: classmateIds[0], createdAt: iso(t0 - 2 * 3600_000),
        players: [
          { userId: classmateIds[0], name: "سارة محمود", score: 80, finishedAt: iso(t0 - 3600_000) },
          { userId: student.userId, name: student.displayName ?? "طالب تجريبي", score: null, finishedAt: null },
        ],
      });
    }
  }
}

// ── platform & admin content (features 46–50) ───────────────────────────────
function seedPlatform(store: Store): void {
  const DAY_MS = 24 * 3600 * 1000;
  const t0 = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();
  const sec3 = store.courses.find((c) => c.slug === "sec-3-term-1");
  const owner = store.profiles.find((p) => p.role === "owner");
  const student = store.profiles.find((p) => p.role === "student" && p.gradeKey === "sec-3");
  if (!sec3 || !owner) return;
  const classIds = store.users.filter((u) => u.email.startsWith("classmate")).map((u) => u.id);

  // Top-up codes (47): two fresh codes the demo student can redeem.
  store.topupCodes.push(
    { id: uuid(), code: "MADAR10001", valueEgp: 100, createdBy: owner.userId, usedBy: null, usedAt: null, createdAt: now() },
    { id: uuid(), code: "MADAR25002", valueEgp: 250, createdBy: owner.userId, usedBy: null, usedAt: null, createdAt: now() },
  );

  // Course reviews (49): classmates rate the term-1 course.
  const reviewRows = [
    { u: classIds[0], rating: 5, text: "أحسن شرح للتفاضل شفته، والكويزات بعد كل درس بتثبّت المعلومة.", at: iso(t0 - 6 * DAY_MS) },
    { u: classIds[1], rating: 4, text: "الشرح ممتاز بس ياريت ملازم PDF لكل درس.", at: iso(t0 - 4 * DAY_MS) },
    { u: classIds[2], rating: 5, text: "المستر بيرد على الأسئلة في النقاش بسرعة جدًا.", at: iso(t0 - 2 * DAY_MS) },
  ];
  for (const r of reviewRows) {
    if (r.u) store.courseReviews.push({ id: uuid(), courseId: sec3.id, userId: r.u, rating: r.rating, text: r.text, createdAt: r.at });
  }

  // Notifications (48): one exam reminder + one expiry warning for the student.
  if (student) {
    store.notifications.push(
      { id: uuid(), userId: student.userId, kind: "exam_reminder", title: "امتحان قريب", body: "«امتحان قواعد الاشتقاق» بعد يومين. راجع خطة مذاكرتك.", ref: null, readAt: null, createdAt: iso(t0 - 2 * 3600_000) },
      { id: uuid(), userId: student.userId, kind: "subscription_expiry", title: "اشتراكك بيقرب يخلص", body: "اشتراكك في «تفاضل وتكامل — الترم الأول» بينتهي خلال 3 أيام. جدّد عشان ما تفقدش تقدمك.", ref: sec3.id, readAt: null, createdAt: iso(t0 - 5 * 3600_000) },
    );
  }
}

// ── analytics content (features 13–20) ──────────────────────────────────────
function seedAnalytics(store: Store): void {
  const DAY_MS = 24 * 3600 * 1000;
  const t0 = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();
  const sec3 = store.courses.find((c) => c.slug === "sec-3-term-1");
  const student = store.profiles.find((p) => p.role === "student" && p.gradeKey === "sec-3");
  if (!sec3 || !student) return;
  const lessons = store.lessons.filter((l) => l.courseId === sec3.id).sort((a, b) => a.sortOrder - b.sortOrder);
  const l1 = lessons[0];
  if (!l1) return;
  // Classmates watch events: a shared drop-off point around second 780 and a
  // rewatched segment at ~5 minutes, so teacher stats have a story to show.
  const classIds = store.users.filter((u) => u.email.startsWith("classmate")).map((u) => u.id);
  classIds.forEach((uid, i) => {
    store.watchEvents.push(
      { id: uuid(), userId: uid, lessonId: l1.id, second: 780 + (i % 3) * 5, kind: "left", at: iso(t0 - (i + 1) * 3600_000) },
      { id: uuid(), userId: uid, lessonId: l1.id, second: 300 + (i % 2) * 10, kind: "rewatched", at: iso(t0 - (i + 1) * 3600_000) },
    );
  });
  // Student's own watch time over the last days (drives the study-minutes chart).
  for (let d = 1; d <= 5; d++) {
    store.watchEvents.push({ id: uuid(), userId: student.userId, lessonId: lessons[d % lessons.length]?.id ?? l1.id, second: 0, kind: "watched", gainedSec: 1500 + (d % 3) * 600, at: iso(t0 - d * DAY_MS) });
  }
}

// Artwork per course (client/public/posters + client/public/media). Applied on seed AND migrated into
// stores already saved in the browser, so existing demo accounts/balances survive the update.
const ART: Record<string, string> = {
  "prep-1-term-1": "numbers",
  "prep-2-term-1": "geometry",
  "prep-3-term-1": "functions",
  "sec-1-term-1": "algebra",
  "sec-2-term-1": "analytic",
  "sec-3-term-1": "calculus",
  "bacc-math-1": "trig",
  "bacc-science-1": "stats",
};
const OLD_TITLES: Record<string, string> = {
  "الرياضيات — أولى إعدادي — الترم الأول": "رياضيات أولى إعدادي",
  "الرياضيات — تانية إعدادي — الترم الأول": "رياضيات تانية إعدادي",
  "الرياضيات — تالتة إعدادي — الترم الأول": "رياضيات تالتة إعدادي",
  "الرياضيات — أولى ثانوي — الترم الأول": "رياضيات أولى ثانوي",
  "الرياضيات — تانية ثانوي (علمي) — الترم الأول": "رياضيات تانية ثانوي علمي",
  "الرياضيات — تالتة ثانوي (علمي) — الترم الأول": "رياضيات تالتة ثانوي علمي",
  "الرياضيات — البكالوريا — مسار الرياضيات — المستوى الأول": "رياضيات البكالوريا · المسار الرياضي",
  "الرياضيات — البكالوريا — مسار العلوم — المستوى الأول": "رياضيات البكالوريا · المسار العلمي"
};
function migrate(store: Store): boolean {
  let changed = false;
  for (const c of store.courses as Row[]) {
    const art = ART[c.slug as string];
    if (art && !c.posterUrl) { c.posterUrl = `/posters/${art}.svg`; c.backdropUrl = `/media/${art}.svg`; changed = true; }
    const renamed = OLD_TITLES[c.title as string];
    if (renamed) { c.title = renamed; changed = true; }
  }
  // Trust & progress group added these collections.
  if (!Array.isArray(store.progress)) { store.progress = []; changed = true; }
  if (!Array.isArray(store.certificates)) { store.certificates = []; changed = true; }
  if (!Array.isArray(store.devices)) { store.devices = []; changed = true; }
  // AI group added these collections.
  if (!Array.isArray(store.aiChats)) { store.aiChats = []; changed = true; }
  if (!Array.isArray(store.aiPractice)) { store.aiPractice = []; changed = true; }
  if (!Array.isArray(store.aiAdaptive)) { store.aiAdaptive = []; changed = true; }
  if (!Array.isArray(store.aiEssays)) { store.aiEssays = []; changed = true; }
  if (!Array.isArray(store.studyPlans)) { store.studyPlans = []; changed = true; }
  // Motivation & engagement group added these collections.
  for (const key of ["pointEvents", "dailyGoals", "gamifyFlags", "discussionPosts", "discussionReplies", "liveSessions", "liveMessages", "challenges", "assignments", "submissions", "peerReviews", "topupCodes", "notifications", "courseReviews", "watchEvents", "lessonNotes", "activityEvents", "signedLinks", "parentCodes", "parentLinks", "outbox", "checkouts"] as const) {
    if (!Array.isArray(store[key])) { (store as any)[key] = []; changed = true; }
  }
  if (!store.users.some((x) => x.email === "classmate1@madar.test")) { seedEngagement(store); changed = true; }
  if (!(store.topupCodes as Row[]).length) { seedPlatform(store); changed = true; }
  if (!(store.watchEvents as Row[]).length) { seedAnalytics(store); changed = true; }
  // Feature 29 backfill: first-unit lessons of every course are the free preview.
  for (const c of store.courses as Row[]) {
    const cUnits = (store.units as Row[]).filter((u) => u.courseId === c.id).sort(byOrder);
    const firstUnitId = cUnits[0]?.id;
    if (!firstUnitId) continue;
    for (const l of store.lessons as Row[]) {
      if (l.courseId === c.id && l.unitId === firstUnitId && !l.isFree) { l.isFree = true; changed = true; }
    }
  }
  return changed;
}

let mem: Store | null = null;
function load(): Store {
  if (mem) return mem;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      mem = JSON.parse(raw) as Store;
      if (migrate(mem)) save();
      return mem;
    }
  } catch {
    /* storage blocked — fall through to in-memory */
  }
  mem = seed();
  save();
  return mem;
}
function save() {
  try {
    if (mem) localStorage.setItem(KEY, JSON.stringify(mem));
  } catch {
    /* quota / blocked: the demo keeps working in memory for this tab */
  }
}

/** Reset the demo to its seed (handy from the browser console: __madarDemoReset()). */
export function resetDemo() {
  mem = null;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
if (typeof window !== "undefined") (window as any).__madarDemoReset = () => { resetDemo(); location.reload(); };

// ─── helpers ─────────────────────────────────────────────────────────────────

const isStaff = (role?: string | null) => role === "owner" || role === "admin";

/** Feature 12: one row per meaningful student/staff action. The log is
 *  append-only — nothing edits or deletes rows. */
function logActivity(s: Store, userId: string, kind: string, extra: { lessonId?: string; courseId?: string; detail?: string } = {}): void {
  s.activityEvents.push({ id: uuid(), userId, kind, lessonId: extra.lessonId ?? null, courseId: extra.courseId ?? null, detail: extra.detail ?? null, at: now() });
}
const sessionUser = (s: Store) => {
  const u = s.users.find((x) => x.id === s.sessionUserId);
  return u ? { id: u.id as string, email: u.email as string, name: (u.name ?? null) as string | null, role: "user" as const } : null;
};
const profileOf = (s: Store, userId: string) => s.profiles.find((p) => p.userId === userId) ?? null;
const balanceOf = (s: Store, userId: string) => s.wallet.filter((w) => w.userId === userId).reduce((a, w) => a + w.amountEgp, 0);
function creditWallet(s: Store, userId: string, amountEgp: number, reference: string): void {
  if (s.wallet.some((w) => w.idempotencyKey === reference)) return; // idempotent
  s.wallet.push({ id: uuid(), userId, type: "topup", amountEgp, balanceAfter: balanceOf(s, userId) + amountEgp, reference, idempotencyKey: reference, note: "كود شحن", createdAt: now() });
}
const byOrder = (a: Row, b: Row) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || String(a.title).localeCompare(String(b.title), "ar");

function ensureProfile(s: Store, u: Row) {
  let p = profileOf(s, u.id);
  if (!p) {
    const hasOwner = s.profiles.some((x) => x.role === "owner");
    p = { id: uuid(), userId: u.id, role: hasOwner ? "student" : "owner", displayName: u.name ?? null, phone: null, stage: null, gradeKey: null, track: null, pathway: null, createdAt: now() };
    s.profiles.push(p);
  }
  return p;
}

const hyd = {
  course: (c: Row) => ({ ...c, createdAt: D(c.createdAt) }),
  profile: (p: Row | null) => (p ? { ...p, createdAt: D(p.createdAt) } : p),
  wallet: (w: Row) => ({ ...w, createdAt: D(w.createdAt) }),
  topup: (t: Row) => ({ ...t, createdAt: D(t.createdAt), reviewedAt: D(t.reviewedAt) }),
};

function activeEnrollment(s: Store, userId: string, courseId: string) {
  return s.enrollments.find(
    (e) => e.userId === userId && e.courseId === courseId && e.status === "active" && new Date(e.expiresAt).getTime() > Date.now(),
  ) ?? null;
}
function myEnrollments(s: Store, userId: string) {
  return s.enrollments
    .filter((e) => e.userId === userId)
    .map((e) => {
      const course = s.courses.find((c) => c.id === e.courseId);
      return {
        ...e, startsAt: D(e.startsAt), expiresAt: D(e.expiresAt), course: course ? hyd.course(course) : null,
        isActive: e.status === "active" && new Date(e.expiresAt).getTime() > Date.now(),
      };
    })
    .filter((e) => e.course)
    .sort((a, b) => (b.startsAt as Date).getTime() - (a.startsAt as Date).getTime());
}
function courseContent(s: Store, courseId: string) {
  return {
    units: s.units.filter((u) => u.courseId === courseId).sort(byOrder),
    lessons: s.lessons.filter((l) => l.courseId === courseId).sort(byOrder),
  };
}

// ─── motivation & engagement helpers (features 30–37) ───────────────────────

function flagRow(s: Store, userId: string): Row {
  let f = s.gamifyFlags.find((x) => x.userId === userId);
  if (!f) {
    f = { id: uuid(), userId, hideLeaderboard: false, goalMinutes: DEFAULT_GOAL_MINUTES, weeklyGoalMinutes: DEFAULT_WEEKLY_GOAL_MINUTES };
    s.gamifyFlags.push(f);
  }
  return f;
}

/** Award points once per (kind, ref) — replaying the same action never pays twice. */
function awardPoints(s: Store, userId: string, kind: PointKind, ref?: string): boolean {
  if (ref && s.pointEvents.some((e) => e.userId === userId && e.kind === kind && e.ref === ref)) return false;
  s.pointEvents.push({ id: uuid(), userId, kind, points: POINT_VALUES[kind], ref: ref ?? null, at: now() });
  return true;
}

function todayGoalRow(s: Store, userId: string): Row {
  const day = dayKey(now());
  let r = s.dailyGoals.find((x) => x.userId === userId && x.day === day);
  if (!r) {
    r = { id: uuid(), userId, day, minutes: 0, goalMinutes: flagRow(s, userId).goalMinutes, awardedAt: null };
    s.dailyGoals.push(r);
  } else {
    // The goal setting is live: changing it mid-day retargets today's row too.
    r.goalMinutes = flagRow(s, userId).goalMinutes;
  }
  return r;
}

function displayNameOf(s: Store, userId: string): string {
  return profileOf(s, userId)?.displayName ?? s.users.find((x) => x.id === userId)?.name ?? "طالب";
}

function myGamifyStats(s: Store, userId: string): GamifyStats {
  const events = s.pointEvents.filter((e) => e.userId === userId);
  const mine = s.progress.filter((p) => p.userId === userId);
  const days = [...new Set(events.map((e) => dayKey(e.at)).concat(s.dailyGoals.filter((g) => g.userId === userId && g.minutes > 0).map((g) => g.day)))];
  const st = streaks(days, dayKey(now()));
  return {
    lessonsWatched: mine.filter((p) => p.completedAt).length,
    quizzesPassed: mine.filter((p) => p.quizPassed).length,
    perfectQuizzes: mine.filter((p) => p.quizBestPct >= 100).length,
    currentStreak: st.current,
    longestStreak: st.longest,
    totalPoints: pointsOf(events as never[]),
    discussionPosts: s.discussionPosts.filter((p) => p.userId === userId).length,
    challengesWon: s.challenges.filter((c) => challengeWinner(c as never) === userId).length,
    reviewsGiven: s.peerReviews.filter((r) => r.reviewerId === userId).length,
    liveAttended: events.filter((e) => e.kind === "live_attended").length,
  };
}

// ─── trust & progress (features 1, 2, 3, 6, 13, 24, 36) ─────────────────────
// Watch seconds are banked HERE (the "server"), never claimed by the student.

function progressOf(s: Store, userId: string, lessonId: string): Row {
  let p = s.progress.find((x) => x.userId === userId && x.lessonId === lessonId);
  if (!p) {
    p = {
      id: uuid(), userId, lessonId,
      watchedSec: 0, positionSec: 0, maxPositionSec: 0,
      quizAttempts: 0, quizBestPct: 0, quizPassed: false,
      quizFails: 0, quizLocked: false,
      videoAnswers: [] as string[], segments: [] as [number, number][],
      completedAt: null, updatedAt: now(),
    };
    s.progress.push(p);
  }
  // Rows saved before interval tracking: trust their old total once, as [0, watchedSec].
  if (!p.segments) p.segments = p.watchedSec > 0 ? [[0, p.watchedSec]] : [];
  if (typeof p.quizFails !== "number") p.quizFails = 0;
  if (typeof p.quizLocked !== "boolean") p.quizLocked = false;
  return p;
}

function lessonStateOf(s: Store, userId: string | null, lesson: Row): string {
  if (!userId) return "not-started";
  const p = s.progress.find((x) => x.userId === userId && x.lessonId === lesson.id);
  return lessonState(
    { watchedSec: p?.watchedSec ?? 0, quizPassed: Boolean(p?.quizPassed), completed: Boolean(p?.completedAt) },
    lesson.durationSec ?? 0,
  );
}

/** Sequential unlocking (feature 6): lesson N opens when N-1 is completed. Staff and signed-out visitors on free lessons are exempt. */
function gateFor(s: Store, userId: string | null, staff: boolean, lessons: Row[], index: number): "quiz" | null {
  if (!userId || staff || index <= 0) return null;
  const prev = lessons[index - 1];
  return lessonStateOf(s, userId, prev) === "completed" ? null : "quiz";
}

function decorateLesson(s: Store, userId: string | null, staff: boolean, entitled: boolean, lessons: Row[], l: Row) {
  const index = lessons.findIndex((x) => x.id === l.id);
  const gate = gateFor(s, userId, staff, lessons, index);
  return {
    id: l.id, unitId: l.unitId, title: l.title, summary: l.summary, durationSec: l.durationSec,
    isFree: l.isFree, sortOrder: l.sortOrder,
    locked: !(l.isFree || entitled),
    gate,
    state: lessonStateOf(s, userId, l),
  };
}

function publicProgress(s: Store, userId: string, lesson: Row) {
  const p = progressOf(s, userId, lesson.id);
  return {
    watchedSec: p.watchedSec,
    positionSec: p.positionSec,
    percent: watchPercent(p.watchedSec, lesson.durationSec ?? 0),
    watchDone: isWatchDone(p.watchedSec, lesson.durationSec ?? 0),
    quizAttempts: p.quizAttempts,
    quizBestPct: p.quizBestPct,
    quizPassed: Boolean(p.quizPassed),
    // Feature 7: re-watch lock state after repeated failed attempts.
    quizLocked: Boolean(p.quizLocked),
    failsLeft: p.quizLocked ? 0 : QUIZ_FAIL_LOCK_THRESHOLD - (p.quizFails ?? 0),
    videoAnswers: [...(p.videoAnswers as string[])],
    completedAt: D(p.completedAt),
    state: lessonStateOf(s, userId, lesson),
  };
}

/** Issue the course certificate once every lesson is complete (feature 36). Idempotent. */
function maybeIssueCertificate(s: Store, userId: string, courseId: string): Row | null {
  const lessons = s.lessons.filter((l) => l.courseId === courseId);
  if (lessons.length === 0) return null;
  const allDone = lessons.every((l) => lessonStateOf(s, userId, l) === "completed");
  if (!allDone) return null;
  const existing = s.certificates.find((c) => c.userId === userId && c.courseId === courseId);
  if (existing) return existing;
  const id = uuid();
  const row = { id, userId, courseId, code: certificateCode(id), issuedAt: now() };
  s.certificates.push(row);
  logActivity(s, userId, "certificate", { courseId });
  return row;
}

function publicCertificate(s: Store, c: Row) {
  const course = s.courses.find((x) => x.id === c.courseId);
  const user = s.users.find((x) => x.id === c.userId);
  const profile = profileOf(s, c.userId);
  return {
    code: c.code,
    issuedAt: D(c.issuedAt),
    studentName: profile?.displayName ?? user?.name ?? user?.email ?? "",
    courseTitle: course?.title ?? "",
    courseSlug: course?.slug ?? "",
  };
}

/** Register this device and report whether ANOTHER one used the account recently (feature 8 — the leak deterrent that replaced the moving watermark). */
function beatDevice(s: Store, userId: string, deviceId: string | null | undefined): boolean {
  if (!deviceId) return false;
  let d = s.devices.find((x) => x.userId === userId && x.deviceId === deviceId);
  if (!d) {
    d = { id: uuid(), userId, deviceId, firstSeenAt: now(), lastSeenAt: now() };
    s.devices.push(d);
  } else {
    d.lastSeenAt = now();
  }
  const cutoff = Date.now() - DEVICE_NOTICE_WINDOW_MS;
  return s.devices.some(
    (x) => x.userId === userId && x.deviceId !== deviceId && new Date(x.lastSeenAt).getTime() > cutoff,
  );
}

function requireLessonAccess(s: Store, lessonId: string) {
  const u = requireUser(s);
  const lesson = s.lessons.find((l) => l.id === lessonId);
  const course = lesson && s.courses.find((c) => c.id === lesson.courseId);
  if (!lesson || !course) throw new DemoError("NOT_FOUND", "الدرس مش موجود.");
  const staff = isStaff(profileOf(s, u.id)?.role);
  const enrolled = staff || Boolean(activeEnrollment(s, u.id, course.id));
  if (!lesson.isFree && !enrolled) throw new DemoError("FORBIDDEN", "الدرس ده محتاج اشتراك ساري في الكورس.");
  return { u, lesson, course, staff, enrolled };
}
function listCourses(s: Store, f: Row = {}, includeUnpublished = false) {
  const q = (f.search ?? "").toString().toLowerCase();
  return s.courses
    .filter((c) => (includeUnpublished || c.isPublished)
      && (!f.stage || c.stage === f.stage) && (!f.gradeKey || c.gradeKey === f.gradeKey)
      && (!f.track || c.track === f.track) && (!f.pathway || c.pathway === f.pathway)
      && (!f.mathLevel || c.mathLevel === f.mathLevel)
      && (!q || String(c.title).toLowerCase().includes(q) || String(c.description ?? "").toLowerCase().includes(q)))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.createdAt.localeCompare(b.createdAt))
    .map((c) => ({ ...hyd.course(c), lessonCount: s.lessons.filter((l) => l.courseId === c.id).length }));
}

function requireUser(s: Store) {
  const u = sessionUser(s);
  if (!u) throw new DemoError("UNAUTHORIZED", "UNAUTHORIZED");
  return u;
}
function requireStaff(s: Store) {
  const u = requireUser(s);
  if (!isStaff(profileOf(s, u.id)?.role)) throw new DemoError("FORBIDDEN", "الصفحة دي للمالك أو المشرف فقط.");
  return u;
}

function requireParent(s: Store) {
  const u = requireUser(s);
  if (profileOf(s, u.id)?.role !== "parent") throw new DemoError("FORBIDDEN", "الصفحة دي لحساب ولي الأمر.");
  return u;
}
function childSnapshot(s: Store, userId: string) {
  const myEvents = s.watchEvents.filter((e) => e.userId === userId && e.gainedSec > 0);
  const weekStartMs = weekStart(new Date()).getTime();
  const minutesIn = (from: number, to: number) =>
    Math.round(myEvents.filter((e) => { const t = new Date(e.at).getTime(); return t >= from && t < to; }).reduce((a, e) => a + e.gainedSec, 0) / 60);
  const mine = s.progress.filter((x) => x.userId === userId);
  const st = streaks([...new Set(s.pointEvents.filter((e) => e.userId === userId).map((e) => dayKey(e.at)))], dayKey(new Date().toISOString()));
  const stats = {
    studentName: displayNameOf(s, userId),
    minutesThisWeek: minutesIn(weekStartMs, Date.now() + DAY),
    minutesLastWeek: minutesIn(weekStartMs - 7 * DAY, weekStartMs),
    lessonsDone: mine.filter((x) => x.completedAt).length,
    quizzesPassed: mine.filter((x) => x.quizPassed).length,
    currentStreak: st.current,
  };
  return { stats, text: parentWeeklyReport(stats) };
}

function slugify(str: string): string {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (cleaned.length >= 2) return cleaned;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return `course-${h.toString(36)}`;
}

// ─── procedures ──────────────────────────────────────────────────────────────

type Handler = (s: Store, input: any) => any;

const H: Record<string, Handler> = {
  // auth
  "auth.me": (s) => sessionUser(s),
  "auth.session": (s) => {
    const user = sessionUser(s);
    if (!user) return { user: null, profile: null };
    const u = s.users.find((x) => x.id === user.id)!;
    return { user, profile: hyd.profile(ensureProfile(s, u)) };
  },
  "auth.signup": (s, i) => {
    const email = String(i.email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new DemoError("BAD_REQUEST", "Invalid email");
    if (String(i.password ?? "").length < 8) throw new DemoError("BAD_REQUEST", "الباسورد لازم ٨ حروف على الأقل.");
    if (s.users.some((u) => u.email === email)) throw new DemoError("CONFLICT", "That email is already registered — try logging in instead.");
    const u = { id: uuid(), email, password: i.password, name: i.name ?? null, createdAt: now() };
    s.users.push(u);
    s.sessionUserId = u.id;
    const p = ensureProfile(s, u);
    if (i.accountType === "parent" && p.role === "student") p.role = "parent";
    Object.assign(p, { phone: i.phone ?? null, stage: i.stage ?? null, gradeKey: i.gradeKey ?? null, track: i.track ?? null, pathway: i.pathway ?? null });
    logActivity(s, u.id, "signup");
    return { id: u.id, email: u.email, name: u.name, role: "user" };
  },
  "auth.login": (s, i) => {
    const email = String(i.email).trim().toLowerCase();
    const u = s.users.find((x) => x.email === email);
    if (!u || u.password !== i.password) throw new DemoError("UNAUTHORIZED", "Invalid email or password");
    s.sessionUserId = u.id;
    ensureProfile(s, u);
    logActivity(s, u.id, "login");
    return { id: u.id, email: u.email, name: u.name, role: "user" };
  },
  "auth.logout": (s) => { s.sessionUserId = null; return { ok: true }; },

  // catalog
  "catalog.settings": (s) => ({ ...DEFAULT_SETTINGS, ...s.settings }),
  "catalog.courses": (s, i) => listCourses(s, i ?? {}),
  "catalog.course": (s, i) => {
    const course = s.courses.find((c) => c.slug === i.slug);
    if (!course || !course.isPublished) throw new DemoError("NOT_FOUND", "الكورس مش موجود.");
    const { units, lessons } = courseContent(s, course.id);
    const u = sessionUser(s);
    const staff = u ? isStaff(profileOf(s, u.id)?.role) : false;
    let entitled = false;
    if (u) entitled = staff || Boolean(activeEnrollment(s, u.id, course.id));
    return {
      course: hyd.course(course), units,
      lessons: lessons.map((l) => decorateLesson(s, u?.id ?? null, staff, entitled, lessons, l)),
      entitled,
    };
  },

  // learning
  "learning.lesson": (s, i) => {
    const u = requireUser(s);
    const lesson = s.lessons.find((l) => l.id === i.lessonId);
    const course = lesson && s.courses.find((c) => c.id === lesson.courseId);
    if (!lesson || !course) throw new DemoError("NOT_FOUND", "الدرس مش موجود.");
    const enrolled = isStaff(profileOf(s, u.id)?.role) || Boolean(activeEnrollment(s, u.id, course.id));
    if (!lesson.isFree && !enrolled) throw new DemoError("FORBIDDEN", "الدرس ده محتاج اشتراك ساري في الكورس.");
    const { units, lessons } = courseContent(s, course.id);
    const staff = isStaff(profileOf(s, u.id)?.role);
    const ordered = lessons.map((l) => decorateLesson(s, u.id, staff, enrolled, lessons, l));
    const idx = lessons.findIndex((l) => l.id === lesson.id);
    const gate = gateFor(s, u.id, staff, lessons, idx);
    if (gate) throw new DemoError("FORBIDDEN", "لازم تكمّل الدرس اللي قبله وتعدي كويزه الأول.");
    const content = buildLessonContent(lesson.id, lesson.title, lesson.durationSec ?? 0);
    return {
      lesson: { id: lesson.id, title: lesson.title, summary: lesson.summary, videoUrl: lesson.videoUrl, durationSec: lesson.durationSec, isFree: lesson.isFree, pdfUrl: lesson.pdfUrl ?? null, vttUrl: lesson.vttUrl ?? null },
      course: { id: course.id, slug: course.slug, title: course.title, gradeKey: course.gradeKey },
      units, lessons: ordered,
      nextLessonId: idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1].id : null,
      prevLessonId: idx > 0 ? ordered[idx - 1].id : null,
      entitled: enrolled,
      chapters: content.chapters,
      videoQuestions: content.videoQuestions.map((q) => ({ ...publicQuestion(q), atSec: q.atSec })),
      quizCount: content.quiz.questions.length,
      quizPassPct: content.quiz.passPct,
      progress: publicProgress(s, u.id, lesson),
    };
  },
  "learning.enrollments": (s) => myEnrollments(s, requireUser(s).id),
  "learning.purchase": (s, i) => {
    const u = requireUser(s);
    const course = s.courses.find((c) => c.id === i.courseId);
    if (!course) throw new DemoError("NOT_FOUND", "الكورس مش موجود.");
    if (!course.isPublished) throw new DemoError("BAD_REQUEST", "الكورس مش متاح للشراء حاليًا.");
    if (activeEnrollment(s, u.id, course.id)) throw new DemoError("CONFLICT", "أنت مشترك في الكورس ده بالفعل.");
    const expiresAt = new Date(Date.now() + course.durationMonths * 30 * DAY).toISOString();
    const price = course.priceEgp as number;
    if (price > 0) {
      const balance = balanceOf(s, u.id);
      if (balance < price) {
        throw new DemoError("PRECONDITION_FAILED",
          `الرصيد مش كافي. محتاج ${price.toLocaleString("ar-EG")} ج.م ورصيدك ${balance.toLocaleString("ar-EG")} ج.م — اشحن الفرق وارجع.`);
      }
      s.wallet.push({ id: uuid(), userId: u.id, type: "purchase", amountEgp: -price, balanceAfter: balance - price, reference: course.slug, idempotencyKey: `purchase:${u.id}:${course.id}:${Date.now()}`, note: course.title, createdAt: now() });
    }
    s.enrollments = s.enrollments.filter((e) => !(e.userId === u.id && e.courseId === course.id));
    s.enrollments.push({ id: uuid(), userId: u.id, courseId: course.id, status: "active", startsAt: now(), expiresAt });
    logActivity(s, u.id, "purchase", { courseId: course.id, detail: course.title });
    return { ok: true, charged: price > 0 ? price : 0 };
  },

  // progress (features 1, 2, 13, 24)
  "progress.heartbeat": (s, i) => {
    const { u, lesson, course } = requireLessonAccess(s, i.lessonId);
    const p = progressOf(s, u.id, lesson.id);
    const beforeWatchedSec = p.watchedSec;
    const wasWatchDone = isWatchDone(p.watchedSec, lesson.durationSec ?? 0);
    // Bank unique coverage, never raw sums: the beat claims at most
    // MAX_HEARTBEAT_SEC ending at the current position, merged into the stored
    // union of watched stretches. Replaying one part — or jumping to the end —
    // adds nothing; only ground actually reached counts.
    const pos = Math.max(0, Math.min(Number(i.positionSec) || 0, lesson.durationSec || 0));
    const [from, to] = heartbeatSegment(pos, Number(i.deltaSec) || 0, lesson.durationSec ?? 0);
    p.segments = mergeWatchSegment(p.segments, from, to);
    p.watchedSec = Math.min(coveredSeconds(p.segments), lesson.durationSec || Number.MAX_SAFE_INTEGER);
    p.positionSec = pos;
    p.maxPositionSec = Math.max(p.maxPositionSec, pos);
    // Completion can also land here when the quiz was already passed earlier.
    if (!p.completedAt && isLessonComplete(p.watchedSec, lesson.durationSec ?? 0, Boolean(p.quizPassed))) {
      p.completedAt = now();
      awardPoints(s, u.id, "lesson_watched", `lesson:${lesson.id}`);
      logActivity(s, u.id, "lesson_complete", { lessonId: lesson.id, courseId: lesson.courseId });
    }
    // Feature 12: the moment the lesson is actually watched through.
    if (!wasWatchDone && isWatchDone(p.watchedSec, lesson.durationSec ?? 0)) {
      logActivity(s, u.id, "watch_done", { lessonId: lesson.id, courseId: lesson.courseId, detail: `${Math.round(p.watchedSec)}` });
    }
    // Feature 7: re-watching to 90% after a lock reopens the quiz.
    if (p.quizLocked && isWatchDone(p.watchedSec, lesson.durationSec ?? 0)) {
      p.quizLocked = false;
      logActivity(s, u.id, "quiz_unlock", { lessonId: lesson.id, courseId: lesson.courseId });
    }
    // Feature 37: bank newly-covered seconds toward today's goal, award once a day.
    const gainedSec = Math.max(0, p.watchedSec - beforeWatchedSec);
    if (gainedSec > 0) {
      const goal = todayGoalRow(s, u.id);
      goal.minutes = Math.round((goal.minutes + gainedSec / 60) * 10) / 10;
      if (!goal.awardedAt && goal.minutes >= goal.goalMinutes && canAwardDailyGoal(s.pointEvents.filter((e) => e.userId === u.id) as never[], goal.day)) {
        awardPoints(s, u.id, "daily_goal_met", `goal:${goal.day}`);
        goal.awardedAt = now();
      }
      // Single-subject rhythm: the headline goal is weekly. Once the week's
      // minutes reach it, award once per week — empty days never punished.
      const wkMinutes = minutesInWeek(s.dailyGoals.filter((g) => g.userId === u.id && g.minutes > 0) as { day: string; minutes: number }[], now());
      const wkGoal = flagRow(s, u.id).weeklyGoalMinutes ?? DEFAULT_WEEKLY_GOAL_MINUTES;
      if (wkMinutes >= wkGoal && canAwardWeeklyGoal(s.pointEvents.filter((e) => e.userId === u.id) as never[], now())) {
        awardPoints(s, u.id, "weekly_goal_met", `wgoal:${weekKey(now())}`);
      }
    }
    if (gainedSec > 0) {
      s.watchEvents.push({ id: uuid(), userId: u.id, lessonId: lesson.id, second: Math.round(pos), kind: "watched", gainedSec, at: now() });
    }
    p.updatedAt = now();
    const cert = p.completedAt ? maybeIssueCertificate(s, u.id, course.id) : null;
    return {
      ...publicProgress(s, u.id, lesson),
      concurrentDevice: beatDevice(s, u.id, i.deviceId),
      certificate: cert ? publicCertificate(s, cert) : null,
    };
  },
  "progress.resume": (s) => {
    const u = requireUser(s);
    const staff = isStaff(profileOf(s, u.id)?.role);
    const rows: any[] = [];
    // Any course the student actually touched and can still open (enrolled or free preview).
    const courseIds = [...new Set(s.progress.filter((p) => p.userId === u.id).map((p) => s.lessons.find((l) => l.id === p.lessonId)?.courseId).filter(Boolean))] as string[];
    for (const courseId of courseIds) {
      const course = s.courses.find((c) => c.id === courseId);
      if (!course) continue;
      const lessons = s.lessons.filter((l) => l.courseId === courseId);
      const mine = s.progress
        .filter((p) => p.userId === u.id && lessons.some((l) => l.id === p.lessonId) && (p.watchedSec > 0 || p.positionSec > 0))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      // Resume the first unfinished lesson the student touched; if all done, the last one.
      const pick = mine.find((p) => !p.completedAt) ?? mine[0];
      if (!pick) continue;
      const lesson = lessons.find((l) => l.id === pick.lessonId)!;
      const canOpen = staff || lesson.isFree || Boolean(activeEnrollment(s, u.id, courseId));
      if (!canOpen) continue;
      rows.push({
        slug: course.slug, courseTitle: course.title, posterUrl: course.posterUrl,
        lessonId: lesson.id, lessonTitle: lesson.title,
        positionSec: pick.positionSec,
        percent: watchPercent(pick.watchedSec, lesson.durationSec ?? 0),
        updatedAt: D(pick.updatedAt),
      });
    }
    return rows.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  },
  "progress.dashboard": (s) => {
    const u = requireUser(s);
    const mine = s.progress.filter((p) => p.userId === u.id);
    const courses = (myEnrollments(s, u.id) as any[]).map((e) => {
      const { units, lessons } = courseContent(s, e.courseId);
      const states = lessons.map((l) => {
        const p = mine.find((x) => x.lessonId === l.id);
        return {
          id: l.id, unitId: l.unitId, title: l.title, durationSec: l.durationSec, isFree: l.isFree,
          state: lessonStateOf(s, u.id, l),
          percent: watchPercent(p?.watchedSec ?? 0, l.durationSec ?? 0),
          quizBestPct: p?.quizBestPct ?? 0,
          quizAttempts: p?.quizAttempts ?? 0,
        };
      });
      const done = states.filter((l) => l.state === "completed").length;
      return {
        course: e.course,
        isActive: e.isActive,
        expiresAt: e.expiresAt,
        units: units.map((un) => ({ id: un.id, title: un.title })),
        lessons: states,
        doneCount: done,
        totalCount: lessons.length,
        pct: lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0,
      };
    });
    const completedLessons = mine.filter((p) => p.completedAt).length;
    const scored = mine.filter((p) => p.quizAttempts > 0);
    return {
      totals: {
        watchedSec: mine.reduce((a, p) => a + p.watchedSec, 0),
        completedLessons,
        quizAvgPct: scored.length > 0 ? Math.round(scored.reduce((a, p) => a + p.quizBestPct, 0) / scored.length) : 0,
        certificates: s.certificates.filter((c) => c.userId === u.id).length,
      },
      courses,
    };
  },

  // quizzes (features 3, 6) — the key never leaves the server
  "quiz.get": (s, i) => {
    const { u, lesson } = requireLessonAccess(s, i.lessonId);
    const content = buildLessonContent(lesson.id, lesson.title, lesson.durationSec ?? 0);
    return {
      passPct: content.quiz.passPct,
      questions: content.quiz.questions.map(publicQuestion),
      progress: publicProgress(s, u.id, lesson),
    };
  },
  "quiz.submit": (s, i) => {
    const { u, lesson, course } = requireLessonAccess(s, i.lessonId);
    const p = progressOf(s, u.id, lesson.id);
    if (!isWatchDone(p.watchedSec, lesson.durationSec ?? 0)) {
      throw new DemoError("PRECONDITION_FAILED", "كمّل مشاهدة الدرس الأول — الكويز بيفتح بعد ما تتفرج على ٩٠٪ من الفيديو.");
    }
    const content = buildLessonContent(lesson.id, lesson.title, lesson.durationSec ?? 0);
    const answers = Array.isArray(i.answers) ? i.answers.map((a: any) => (typeof a === "number" ? a : null)) : [];
    const score = scoreQuiz(content.quiz.questions, answers);
    p.quizAttempts += 1;
    p.quizBestPct = Math.max(p.quizBestPct, score.pct);
    let lockedNow = false;
    if (score.passed) {
      p.quizPassed = true;
      p.quizFails = 0;
      p.quizLocked = false;
      awardPoints(s, u.id, "quiz_passed", `quiz:${lesson.id}`);
      if (score.pct >= 100) awardPoints(s, u.id, "quiz_perfect", `quiz-perfect:${lesson.id}`);
      logActivity(s, u.id, "quiz_pass", { lessonId: lesson.id, courseId: lesson.courseId, detail: `${score.pct}` });
    } else {
      // Feature 7: enough consecutive failures revoke the watch coverage, so
      // the student must actually re-watch the lesson before the next attempt.
      const out = quizFailOutcome((p.quizFails ?? 0) + 1);
      p.quizFails = out.fails;
      lockedNow = out.locked;
      logActivity(s, u.id, "quiz_fail", { lessonId: lesson.id, courseId: lesson.courseId, detail: `${score.pct}` });
      if (lockedNow) {
        p.quizLocked = true;
        p.segments = [];
        p.watchedSec = 0;
        p.positionSec = 0;
        p.maxPositionSec = 0;
        logActivity(s, u.id, "quiz_lock", { lessonId: lesson.id, courseId: lesson.courseId });
      }
    }
    if (!p.completedAt && isLessonComplete(p.watchedSec, lesson.durationSec ?? 0, Boolean(p.quizPassed))) {
      p.completedAt = now();
      awardPoints(s, u.id, "lesson_watched", `lesson:${lesson.id}`);
      logActivity(s, u.id, "lesson_complete", { lessonId: lesson.id, courseId: lesson.courseId });
    }
    p.updatedAt = now();
    const cert = score.passed ? maybeIssueCertificate(s, u.id, course.id) : null;
    return {
      ...score,
      lessonCompleted: Boolean(p.completedAt),
      state: lessonStateOf(s, u.id, lesson),
      quizLocked: Boolean(p.quizLocked),
      failsLeft: p.quizLocked ? 0 : QUIZ_FAIL_LOCK_THRESHOLD - (p.quizFails ?? 0),
      lockedNow,
      certificate: cert ? publicCertificate(s, cert) : null,
    };
  },
  "videoQ.answer": (s, i) => {
    const { u, lesson } = requireLessonAccess(s, i.lessonId);
    const content = buildLessonContent(lesson.id, lesson.title, lesson.durationSec ?? 0);
    const q = content.videoQuestions.find((x) => x.id === i.questionId);
    if (!q) throw new DemoError("NOT_FOUND", "السؤال مش موجود.");
    const p = progressOf(s, u.id, lesson.id);
    const correct = Number(i.answer) === q.correct;
    if (correct && !p.videoAnswers.includes(q.id)) {
      p.videoAnswers.push(q.id);
      p.updatedAt = now();
    }
    return { correct, answered: [...p.videoAnswers] };
  },

  // certificates (feature 36)
  "certificates.list": (s) => {
    const u = requireUser(s);
    return s.certificates
      .filter((c) => c.userId === u.id)
      .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
      .map((c) => publicCertificate(s, c));
  },
  "certificates.verify": (s, i) => {
    const c = s.certificates.find((x) => x.code === String(i.code ?? "").trim().toUpperCase());
    if (!c) throw new DemoError("NOT_FOUND", "الشهادة مش موجودة — اتأكد من الكود.");
    return publicCertificate(s, c);
  },

  // wallet
  "wallet.summary": (s) => {
    const u = requireUser(s);
    return {
      balanceEgp: balanceOf(s, u.id),
      transactions: s.wallet.filter((w) => w.userId === u.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 50).map(hyd.wallet),
      topups: s.topups.filter((t) => t.userId === u.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 40).map(hyd.topup),
      enrollments: myEnrollments(s, u.id),
    };
  },
  "wallet.topup": (s, i) => {
    const u = requireUser(s);
    if (!Number.isInteger(i.amountEgp) || i.amountEgp < 50) throw new DemoError("BAD_REQUEST", "أقل مبلغ للشحن ٥٠ جنيه.");
    if (i.amountEgp > 20_000) throw new DemoError("BAD_REQUEST", "أقصى مبلغ للشحن ٢٠٠٠٠ جنيه.");
    const manual = i.method === "instapay" || i.method === "wallet";
    if (manual && !i.receiptUrl) throw new DemoError("BAD_REQUEST", "ارفع صورة الإيصال الأول — التحويل اليدوي مش بيتعتمد من غيرها.");
    const row = { id: uuid(), userId: u.id, amountEgp: i.amountEgp, method: i.method, reference: i.reference ?? null, receiptUrl: i.receiptUrl ?? null, status: "pending", reviewedBy: null, reviewedAt: null, rejectReason: null, createdAt: now() };
    s.topups.push(row);
    return { request: hyd.topup(row), awaitingGateway: i.method === "card" || i.method === "fawry" };
  },
  "wallet.setGradeContext": (s, i) => {
    const u = requireUser(s);
    const p = ensureProfile(s, s.users.find((x) => x.id === u.id)!);
    for (const k of ["stage", "gradeKey", "track", "pathway", "displayName", "phone"]) if (k in i) p[k] = i[k] ?? null;
    return hyd.profile(p);
  },

  // admin
  "admin.stats": (s) => {
    requireStaff(s);
    const live = (e: Row) => e.status === "active" && new Date(e.expiresAt).getTime() > Date.now();
    return {
      students: s.profiles.filter((p) => p.role === "student").length,
      published: s.courses.filter((c) => c.isPublished).length,
      drafts: s.courses.filter((c) => !c.isPublished).length,
      activeSubscriptions: s.enrollments.filter(live).length,
      pendingTopups: s.topups.filter((t) => t.status === "pending").length,
      revenueEgp: s.wallet.filter((w) => w.type === "purchase").reduce((a, w) => a - w.amountEgp, 0),
      topupsTotalEgp: s.wallet.filter((w) => w.type === "topup").reduce((a, w) => a + w.amountEgp, 0),
      lessons: s.lessons.length,
    };
  },
  "admin.topups": (s, i) => {
    requireStaff(s);
    return s.topups
      .filter((t) => !i?.status || t.status === i.status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 200)
      .map((t) => {
        const u = s.users.find((x) => x.id === t.userId);
        return { ...hyd.topup(t), studentEmail: u?.email ?? "", studentName: u?.name ?? null };
      });
  },
  "admin.approveTopup": (s, i) => {
    const u = requireStaff(s);
    const t = s.topups.find((x) => x.id === i.id);
    if (!t || t.status !== "pending") throw new DemoError("CONFLICT", "الطلب مش في حالة «قيد المراجعة» — يمكن يكون اتعتمد أو اترفض قبل كده.");
    Object.assign(t, { status: "approved", reviewedBy: u.id, reviewedAt: now() });
    s.wallet.push({ id: uuid(), userId: t.userId, type: "topup", amountEgp: t.amountEgp, balanceAfter: balanceOf(s, t.userId) + t.amountEgp, reference: t.id, idempotencyKey: `topup:${t.id}`, note: "اعتماد شحن يدوي", createdAt: now() });
    return { ok: true };
  },
  "admin.rejectTopup": (s, i) => {
    const u = requireStaff(s);
    if (!i.reason || String(i.reason).length < 3) throw new DemoError("BAD_REQUEST", "اكتب سبب الرفض.");
    const t = s.topups.find((x) => x.id === i.id);
    if (!t || t.status !== "pending") throw new DemoError("CONFLICT", "الطلب مش في حالة «قيد المراجعة».");
    Object.assign(t, { status: "rejected", reviewedBy: u.id, reviewedAt: now(), rejectReason: i.reason });
    return { ok: true };
  },
  "admin.students": (s) => {
    requireStaff(s);
    return s.profiles
      .slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((p) => {
        const u = s.users.find((x) => x.id === p.userId);
        return {
          userId: p.userId, email: u?.email ?? "", displayName: p.displayName, role: p.role, gradeKey: p.gradeKey,
          balanceEgp: balanceOf(s, p.userId),
          activeSubscriptions: s.enrollments.filter((e) => e.userId === p.userId && e.status === "active" && new Date(e.expiresAt).getTime() > Date.now()).length,
          joinedAt: p.createdAt,
        };
      });
  },
  "admin.courses": (s) => { requireStaff(s); return listCourses(s, {}, true); },
  "admin.course": (s, i) => {
    requireStaff(s);
    const course = s.courses.find((c) => c.id === i.id);
    if (!course) throw new DemoError("NOT_FOUND", "الكورس مش موجود.");
    return { course: hyd.course(course), ...courseContent(s, course.id) };
  },
  "admin.saveCourse": (s, i) => {
    requireStaff(s);
    if (!i.title || String(i.title).length < 2) throw new DemoError("BAD_REQUEST", "اكتب اسم الكورس.");
    const fields = {
      title: i.title, stage: i.stage, gradeKey: i.gradeKey, track: i.track ?? "general", pathway: i.pathway ?? null,
      mathLevel: i.mathLevel ?? "standard", description: i.description ?? null, posterUrl: i.posterUrl ?? null,
      backdropUrl: i.backdropUrl ?? null, priceEgp: i.priceEgp ?? 0, durationMonths: i.durationMonths ?? 3,
      isPublished: i.isPublished ?? true, sortOrder: i.sortOrder ?? 0,
    };
    if (i.id) {
      const c = s.courses.find((x) => x.id === i.id);
      if (!c) throw new DemoError("NOT_FOUND", "الكورس مش موجود.");
      Object.assign(c, fields);
      return hyd.course(c);
    }
    let slug = (i.slug && String(i.slug).trim()) || slugify(i.title);
    while (s.courses.some((c) => c.slug === slug)) slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
    const row = { id: uuid(), slug, subjectName: "الرياضيات", ...fields, createdAt: now() };
    s.courses.push(row);
    return hyd.course(row);
  },
  "admin.deleteCourse": (s, i) => {
    requireStaff(s);
    s.courses = s.courses.filter((c) => c.id !== i.id);
    s.units = s.units.filter((u) => u.courseId !== i.id);
    s.lessons = s.lessons.filter((l) => l.courseId !== i.id);
    s.enrollments = s.enrollments.filter((e) => e.courseId !== i.id);
    return { ok: true };
  },
  "admin.createUnit": (s, i) => {
    requireStaff(s);
    const max = Math.max(0, ...s.units.filter((u) => u.courseId === i.courseId).map((u) => u.sortOrder));
    const row = { id: uuid(), courseId: i.courseId, title: i.title, sortOrder: max + 10 };
    s.units.push(row);
    return row;
  },
  "admin.updateUnit": (s, { id, ...patch }) => {
    requireStaff(s);
    const u = s.units.find((x) => x.id === id);
    if (u) Object.assign(u, patch);
    return u;
  },
  "admin.deleteUnit": (s, i) => {
    requireStaff(s);
    s.units = s.units.filter((u) => u.id !== i.id);
    s.lessons = s.lessons.filter((l) => l.unitId !== i.id);
    return { ok: true };
  },
  "admin.createLesson": (s, i) => {
    requireStaff(s);
    const max = Math.max(0, ...s.lessons.filter((l) => l.courseId === i.courseId).map((l) => l.sortOrder));
    const row = {
      id: uuid(), courseId: i.courseId, unitId: i.unitId ?? null, title: i.title, summary: i.summary ?? null,
      videoUrl: i.videoUrl ?? null, durationSec: i.durationSec ?? 0, isFree: i.isFree ?? false, sortOrder: max + 10,
    };
    s.lessons.push(row);
    return row;
  },
  "admin.updateLesson": (s, { id, ...patch }) => {
    requireStaff(s);
    const l = s.lessons.find((x) => x.id === id);
    if (l) Object.assign(l, patch);
    return l;
  },
  "admin.deleteLesson": (s, i) => {
    requireStaff(s);
    s.lessons = s.lessons.filter((l) => l.id !== i.id);
    return { ok: true };
  },
  "admin.saveSettings": (s, i) => {
    requireStaff(s);
    for (const [k, v] of Object.entries(i as Record<string, string>)) if (k in DEFAULT_SETTINGS) s.settings[k] = v;
    return { ...DEFAULT_SETTINGS, ...s.settings };
  },

  // ─── AI group (features 38–45) ────────────────────────────────────────────
  // Deterministic local engine (shared/ai.ts) — the demo's honest stand-in for
  // a wired LLM: every answer is derived from the lesson's own content.

  "ai.chatHistory": (s, i) => {
    const { u, lesson } = requireLessonAccess(s, i.lessonId);
    return s.aiChats
      .filter((m) => m.userId === u.id && m.lessonId === lesson.id)
      .slice(-30)
      .map((m) => ({ role: m.role, text: m.text, createdAt: D(m.createdAt) }));
  },
  "ai.ask": (s, i) => {
    const { u, lesson } = requireLessonAccess(s, i.lessonId);
    const message = String(i.message ?? "").trim();
    if (message.length < 2) throw new DemoError("BAD_REQUEST", "اكتب سؤالك الأول.");
    if (message.length > 500) throw new DemoError("BAD_REQUEST", "خلّي السؤال أقصر من كده شوية.");
    const salt = s.aiChats.filter((m) => m.userId === u.id && m.lessonId === lesson.id).length;
    const reply = assistantReply(message, { lessonTitle: lesson.title, durationSec: lesson.durationSec ?? 0 }, salt);
    s.aiChats.push({ id: uuid(), userId: u.id, lessonId: lesson.id, role: "user", text: message, createdAt: now() });
    s.aiChats.push({ id: uuid(), userId: u.id, lessonId: lesson.id, role: "assistant", text: reply, createdAt: now() });
    return { reply };
  },

  "ai.practiceStart": (s, i) => {
    const { u, lesson } = requireLessonAccess(s, i.lessonId);
    const attemptNo = s.aiPractice.filter((a) => a.userId === u.id && a.lessonId === lesson.id).length + 1;
    const questions = generatePractice(lesson.id, lesson.title, attemptNo);
    const attempt = { id: uuid(), userId: u.id, lessonId: lesson.id, attemptNo, questions, answers: null, pct: null, createdAt: now() };
    s.aiPractice.push(attempt);
    return {
      attemptId: attempt.id,
      attemptNo,
      questions: questions.map((q) => ({ id: q.id, q: q.q, options: q.options, difficulty: q.difficulty })),
    };
  },
  "ai.practiceSubmit": (s, i) => {
    const u = requireUser(s);
    const attempt = s.aiPractice.find((a) => a.id === i.attemptId && a.userId === u.id);
    if (!attempt) throw new DemoError("NOT_FOUND", "محاولة التدريب مش موجودة — ولّد أسئلة جديدة.");
    const answers = Array.isArray(i.answers) ? i.answers.map((a: any) => (typeof a === "number" ? a : null)) : [];
    const result = scorePractice(attempt.questions as any[], answers);
    attempt.answers = answers;
    attempt.pct = result.pct;
    return result;
  },

  "ai.cards": (s, i) => {
    const { lesson } = requireLessonAccess(s, i.lessonId);
    return {
      summary: lessonSummary(lesson.title, lesson.durationSec ?? 0),
      flashcards: lessonFlashcards(lesson.title),
      essayPrompt: essayPromptFor(lesson.title),
    };
  },

  "ai.essayGrade": (s, i) => {
    const { u, lesson } = requireLessonAccess(s, i.lessonId);
    const text = String(i.text ?? "").trim();
    if (text.length < 10) throw new DemoError("BAD_REQUEST", "اكتب إجابة أطول من كده — سطر واحد على الأقل.");
    if (text.length > 5000) throw new DemoError("BAD_REQUEST", "الإجابة أطول من اللازم — خلّيها في حدود ٥٠٠٠ حرف.");
    const grade = gradeEssay(text, lesson.title);
    s.aiEssays.push({ id: uuid(), userId: u.id, lessonId: lesson.id, text, pct: grade.pct, passed: grade.passed, createdAt: now() });
    return grade;
  },

  "ai.videoSearch": (s, i) => {
    const { lesson } = requireLessonAccess(s, i.lessonId);
    const transcript = buildTranscript(lesson.id, lesson.title, lesson.durationSec ?? 0);
    return { hits: searchTranscript(transcript, String(i.query ?? "")) };
  },

  "ai.next": (s) => {
    const u = requireUser(s);
    const enrolled = (myEnrollments(s, u.id) as any[]).filter((e) => e.isActive);
    for (const e of enrolled) {
      const { lessons } = courseContent(s, e.courseId);
      const input = lessons.map((l) => {
        const p = s.progress.find((x) => x.userId === u.id && x.lessonId === l.id);
        return { id: l.id, title: l.title, state: lessonStateOf(s, u.id, l) as any, quizBestPct: p?.quizBestPct ?? 0 };
      });
      const rec = recommendNext(input);
      if (rec) {
        const lesson = lessons.find((l) => l.id === rec.lessonId)!;
        return { ...rec, lessonTitle: lesson.title, courseSlug: e.course.slug, courseTitle: e.course.title };
      }
    }
    return null;
  },

  "ai.planGet": (s) => {
    const u = requireUser(s);
    const plan = s.studyPlans.find((p) => p.userId === u.id);
    return plan ? { examDate: plan.examDate, days: plan.days, updatedAt: D(plan.updatedAt) } : null;
  },
  "ai.planSet": (s, i) => {
    const u = requireUser(s);
    const examDate = typeof i.examDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(i.examDate) ? i.examDate : null;
    if (i.examDate && !examDate) throw new DemoError("BAD_REQUEST", "صيغة التاريخ مش صحيحة.");
    const lessons: any[] = [];
    for (const e of myEnrollments(s, u.id) as any[]) {
      const { lessons: ls } = courseContent(s, e.courseId);
      for (const l of ls) {
        const p = s.progress.find((x) => x.userId === u.id && x.lessonId === l.id);
        lessons.push({ id: l.id, title: l.title, courseTitle: e.course.title, state: lessonStateOf(s, u.id, l), quizBestPct: p?.quizBestPct ?? 0 });
      }
    }
    const today = new Date().toISOString().slice(0, 10);
    const days = buildStudyPlan(lessons, examDate, today);
    let row = s.studyPlans.find((p) => p.userId === u.id);
    if (!row) {
      row = { id: uuid(), userId: u.id };
      s.studyPlans.push(row);
    }
    Object.assign(row, { examDate, days, updatedAt: now() });
    return { examDate, days, updatedAt: D(row.updatedAt) };
  },

  "ai.adaptiveStart": (s, i) => {
    const { u, lesson } = requireLessonAccess(s, i.lessonId);
    const seed = uuid();
    const state: AdaptiveState = { level: 2, asked: [] };
    const session = { id: uuid(), userId: u.id, lessonId: lesson.id, seed, state, done: false, createdAt: now(), updatedAt: now() };
    s.aiAdaptive.push(session);
    const q = nextAdaptiveQuestion(lesson.id, lesson.title, seed, state)!;
    return {
      sessionId: session.id,
      total: ADAPTIVE_LENGTH,
      question: { index: q.index, id: q.id, q: q.q, options: q.options, difficulty: q.difficulty },
    };
  },
  "ai.adaptiveAnswer": (s, i) => {
    const u = requireUser(s);
    const session = s.aiAdaptive.find((a) => a.id === i.sessionId && a.userId === u.id);
    if (!session) throw new DemoError("NOT_FOUND", "جلسة الاختبار مش موجودة — ابدأ من الأول.");
    if (session.done) throw new DemoError("CONFLICT", "الاختبار ده خلّص بالفعل — ابدأ واحد جديد.");
    const lesson = s.lessons.find((l) => l.id === session.lessonId)!;
    const current = nextAdaptiveQuestion(lesson.id, lesson.title, session.seed, session.state as AdaptiveState);
    if (!current) throw new DemoError("CONFLICT", "الاختبار خلّص.");
    const correct = Number(i.answer) === current.correct;
    session.state = nextAdaptiveLevel(session.state as AdaptiveState, correct);
    session.updatedAt = now();
    const next = nextAdaptiveQuestion(lesson.id, lesson.title, session.seed, session.state as AdaptiveState);
    if (!next) {
      session.done = true;
      return {
        correct,
        rightIndex: current.correct,
        explanation: current.explanation,
        done: true,
        result: adaptiveResult(session.state as AdaptiveState),
      };
    }
    return {
      correct,
      rightIndex: current.correct,
      explanation: current.explanation,
      done: false,
      question: { index: next.index, id: next.id, q: next.q, options: next.options, difficulty: next.difficulty },
    };
  },

  // ─── motivation & engagement (features 30–35, 37) ─────────────────────────

  "gamify.summary": (s) => {
    const u = requireUser(s);
    const events = s.pointEvents.filter((e) => e.userId === u.id);
    const stats = myGamifyStats(s, u.id);
    const flags = flagRow(s, u.id);
    const goal = todayGoalRow(s, u.id);
    const days = [...new Set(events.map((e) => dayKey(e.at)).concat(s.dailyGoals.filter((g) => g.userId === u.id && g.minutes > 0).map((g) => g.day)))];
    const st = streaks(days, dayKey(now()));
    const unlocked = new Set(evaluateBadges(stats));
    const today = new Date(dayKey(now()) + "T00:00:00").getTime();
    const weekDays: { day: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const key = dayKey(new Date(today - i * 24 * 3600 * 1000));
      const row = s.dailyGoals.find((g) => g.userId === u.id && g.day === key);
      weekDays.push({ day: key, minutes: row?.minutes ?? 0 });
    }
    return {
      totalPoints: pointsOf(events as never[]),
      weekPoints: pointsInWeek(events as never[], now()),
      streak: st,
      goal: goalProgress(goal.minutes, goal.goalMinutes),
      weekGoal: goalProgress(minutesInWeek(s.dailyGoals.filter((g) => g.userId === u.id && g.minutes > 0) as { day: string; minutes: number }[], now()), flags.weeklyGoalMinutes ?? DEFAULT_WEEKLY_GOAL_MINUTES),
      weekStreak: weekStreaks(s.dailyGoals.filter((g) => g.userId === u.id && g.minutes > 0) as { day: string; minutes: number }[], flags.weeklyGoalMinutes ?? DEFAULT_WEEKLY_GOAL_MINUTES, now()),
      weekDays,
      leaderboardHidden: Boolean(flags.hideLeaderboard),
      badges: BADGES.map((b) => ({ id: b.id, unlocked: unlocked.has(b.id) })),
      stats,
    };
  },
  "gamify.leaderboard": (s) => {
    const u = requireUser(s);
    const profile = profileOf(s, u.id);
    const cohort = s.profiles.filter((p) => p.role === "student" && p.gradeKey && p.gradeKey === profile?.gradeKey);
    const rows = cohort
      .filter((p) => {
        const f = s.gamifyFlags.find((x) => x.userId === p.userId);
        return !f?.hideLeaderboard;
      })
      .map((p) => ({
        userId: p.userId,
        name: p.displayName ?? "طالب",
        points: pointsInWeek(s.pointEvents.filter((e) => e.userId === p.userId) as never[], now()),
        isMe: p.userId === u.id,
      }));
    return { weekStart: weekStart(now()).toISOString(), rows: rankLeaderboard(rows) };
  },
  "gamify.leaderboardOpt": (s, i) => {
    const u = requireUser(s);
    const f = flagRow(s, u.id);
    f.hideLeaderboard = !i.show;
    return { hidden: Boolean(f.hideLeaderboard) };
  },
  "gamify.setGoal": (s, i) => {
    const u = requireUser(s);
    const minutes = Number(i.minutes);
    if (!Number.isFinite(minutes) || minutes < 15 || minutes > 1680) throw new DemoError("BAD_REQUEST", "هدف الأسبوع بين ربع ساعة و٢٨ ساعة.");
    flagRow(s, u.id).weeklyGoalMinutes = Math.round(minutes);
    return { weeklyGoalMinutes: Math.round(minutes) };
  },

  // 22: timestamped notes — private per student, jump back to the moment
  "notes.list": (s, i) => {
    const u = requireUser(s);
    const { lesson } = requireLessonAccess(s, i.lessonId);
    return s.lessonNotes
      .filter((n) => n.userId === u.id && n.lessonId === lesson.id)
      .sort((a, b) => a.second - b.second)
      .map((n) => ({ id: n.id, second: n.second, text: n.text, createdAt: n.createdAt }));
  },
  "notes.add": (s, i) => {
    const u = requireUser(s);
    const { lesson } = requireLessonAccess(s, i.lessonId);
    const text = String(i.text ?? "").trim();
    const second = Math.max(0, Math.floor(Number(i.second)));
    if (!text) throw new DemoError("BAD_REQUEST", "اكتب الملاحظة الأول.");
    if (!Number.isFinite(second)) throw new DemoError("BAD_REQUEST", "الثانية غير صالحة.");
    const row = { id: uuid(), userId: u.id, lessonId: lesson.id, second, text: text.slice(0, 500), createdAt: now() };
    s.lessonNotes.push(row);
    logActivity(s, u.id, "note", { lessonId: lesson.id, courseId: lesson.courseId });
    return { note: { id: row.id, second: row.second, text: row.text, createdAt: row.createdAt } };
  },
  "notes.delete": (s, i) => {
    const u = requireUser(s);
    const idx = s.lessonNotes.findIndex((n) => n.id === i.id && n.userId === u.id);
    if (idx < 0) throw new DemoError("NOT_FOUND", "الملاحظة مش موجودة.");
    s.lessonNotes.splice(idx, 1);
    return { deleted: true };
  },

  // 33: discussion under every lesson
  "discuss.list": (s, i) => {
    const { lesson } = requireLessonAccess(s, i.lessonId);
    const me = s.sessionUserId;
    return s.discussionPosts
      .filter((p) => p.lessonId === lesson.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((p) => ({
        id: p.id,
        authorName: displayNameOf(s, p.userId),
        authorRole: profileOf(s, p.userId)?.role ?? "student",
        mine: p.userId === me,
        text: p.text,
        createdAt: D(p.createdAt),
        replies: s.discussionReplies
          .filter((r) => r.postId === p.id)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .map((r) => ({ id: r.id, authorName: displayNameOf(s, r.userId), authorRole: profileOf(s, r.userId)?.role ?? "student", mine: r.userId === me, text: r.text, createdAt: D(r.createdAt) })),
      }));
  },
  "discuss.post": (s, i) => {
    const { u, lesson } = requireLessonAccess(s, i.lessonId);
    const text = String(i.text ?? "").trim();
    if (text.length < 3) throw new DemoError("BAD_REQUEST", "اكتب سؤالك الأول.");
    if (text.length > 1000) throw new DemoError("BAD_REQUEST", "خلّي المشاركة أقصر من كده.");
    s.discussionPosts.push({ id: uuid(), userId: u.id, lessonId: lesson.id, text, createdAt: now() });
    awardPoints(s, u.id, "discussion_post");
    return { ok: true };
  },
  "discuss.reply": (s, i) => {
    const u = requireUser(s);
    const post = s.discussionPosts.find((p) => p.id === i.postId);
    if (!post) throw new DemoError("NOT_FOUND", "المشاركة مش موجودة.");
    const text = String(i.text ?? "").trim();
    if (text.length < 2) throw new DemoError("BAD_REQUEST", "اكتب ردك الأول.");
    if (text.length > 1000) throw new DemoError("BAD_REQUEST", "خلّي الرد أقصر من كده.");
    s.discussionReplies.push({ id: uuid(), postId: post.id, userId: u.id, text, createdAt: now() });
    if (post.userId !== u.id) awardPoints(s, u.id, "discussion_reply");
    return { ok: true };
  },

  // 34: live sessions with chat
  "live.list": (s, i) => {
    const u = requireUser(s);
    const sessions = s.liveSessions
      .filter((x) => !i.courseId || x.courseId === i.courseId)
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
    return sessions.map((x) => {
      const status = liveStatus(x.startsAt, x.endsAt, now());
      const lesson = s.lessons.find((l) => l.id === x.lessonId);
      return {
        id: x.id,
        title: x.title,
        lessonTitle: lesson?.title ?? null,
        startsAt: D(x.startsAt),
        endsAt: D(x.endsAt),
        status,
        recordingUrl: status === "ended" ? x.recordingUrl : null,
        attended: s.pointEvents.some((e) => e.userId === u.id && e.kind === "live_attended" && e.ref === `live:${x.id}`),
      };
    });
  },
  "live.messages": (s, i) => {
    requireUser(s);
    const me = s.sessionUserId;
    return s.liveMessages
      .filter((m) => m.sessionId === i.sessionId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((m) => ({ id: m.id, authorName: displayNameOf(s, m.userId), mine: m.userId === me, text: m.text, createdAt: D(m.createdAt) }));
  },
  "live.chat": (s, i) => {
    const u = requireUser(s);
    const session = s.liveSessions.find((x) => x.id === i.sessionId);
    if (!session) throw new DemoError("NOT_FOUND", "الحصة مش موجودة.");
    if (liveStatus(session.startsAt, session.endsAt, now()) !== "live") throw new DemoError("PRECONDITION_FAILED", "الشات بيفتح وقت اللايف بس.");
    const text = String(i.text ?? "").trim();
    if (text.length < 1) throw new DemoError("BAD_REQUEST", "اكتب رسالتك الأول.");
    if (text.length > 500) throw new DemoError("BAD_REQUEST", "خلّي الرسالة أقصر.");
    s.liveMessages.push({ id: uuid(), sessionId: session.id, userId: u.id, text, createdAt: now() });
    awardPoints(s, u.id, "live_attended", `live:${session.id}`);
    return { ok: true };
  },

  // 32: friend challenges — a quick shared quiz, same questions for everyone
  "challenges.list": (s) => {
    const u = requireUser(s);
    return s.challenges
      .filter((c) => (c.players as any[]).some((p) => p.userId === u.id))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((c) => {
        const lesson = s.lessons.find((l) => l.id === c.lessonId);
        return {
          id: c.id,
          lessonTitle: lesson?.title ?? "درس",
          createdByMe: c.createdBy === u.id,
          createdAt: D(c.createdAt),
          state: challengeState(c as never),
          winnerId: challengeWinner(c as never),
          standing: challengeStanding(c as never).map((p) => ({ ...p, isMe: p.userId === u.id })),
        };
      });
  },
  "challenges.create": (s, i) => {
    const { u, lesson } = requireLessonAccess(s, i.lessonId);
    const opponent = s.users.find((x) => x.id === i.opponentUserId);
    if (!opponent || opponent.id === u.id) throw new DemoError("BAD_REQUEST", "اختار زميل تتحدّاه.");
    const ch = {
      id: uuid(), lessonId: lesson.id, createdBy: u.id, createdAt: now(),
      players: [
        { userId: u.id, name: displayNameOf(s, u.id), score: null, finishedAt: null },
        { userId: opponent.id, name: displayNameOf(s, opponent.id), score: null, finishedAt: null },
      ],
    };
    s.challenges.push(ch);
    return { id: ch.id };
  },
  "challenges.play": (s, i) => {
    const u = requireUser(s);
    const ch = s.challenges.find((c) => c.id === i.challengeId);
    if (!ch || !(ch.players as any[]).some((p) => p.userId === u.id)) throw new DemoError("NOT_FOUND", "التحدّي مش موجود.");
    const me = (ch.players as any[]).find((p) => p.userId === u.id);
    if (me.score !== null) throw new DemoError("CONFLICT", "إنت خلّصت نصيبك في التحدّي ده.");
    const lesson = s.lessons.find((l) => l.id === ch.lessonId)!;
    // Fixed attempt number: every player gets the same questions.
    const questions = generatePractice(lesson.id, lesson.title, 7);
    return { questions: questions.map((q) => ({ id: q.id, q: q.q, options: q.options, difficulty: q.difficulty })) };
  },
  "challenges.submit": (s, i) => {
    const u = requireUser(s);
    const ch = s.challenges.find((c) => c.id === i.challengeId);
    if (!ch || !(ch.players as any[]).some((p) => p.userId === u.id)) throw new DemoError("NOT_FOUND", "التحدّي مش موجود.");
    const me = (ch.players as any[]).find((p) => p.userId === u.id);
    if (me.score !== null) throw new DemoError("CONFLICT", "إنت خلّصت نصيبك في التحدّي ده.");
    const lesson = s.lessons.find((l) => l.id === ch.lessonId)!;
    const questions = generatePractice(lesson.id, lesson.title, 7);
    const answers = Array.isArray(i.answers) ? i.answers.map((a: any) => (typeof a === "number" ? a : null)) : [];
    const result = scorePractice(questions, answers);
    me.score = result.pct;
    me.finishedAt = now();
    const winnerId = challengeWinner(ch as never);
    if (winnerId === u.id) awardPoints(s, u.id, "challenge_won", `challenge:${ch.id}`);
    return { pct: result.pct, state: challengeState(ch as never), winnerId, standing: challengeStanding(ch as never) };
  },

  // 35: peer review of assignments with a clear rubric
  "peers.get": (s, i) => {
    const { u, lesson } = requireLessonAccess(s, i.lessonId);
    const a = s.assignments.find((x) => x.lessonId === lesson.id);
    if (!a) return { assignment: null };
    const subs = s.submissions.filter((x) => x.assignmentId === a.id);
    const mySub = subs.find((x) => x.userId === u.id);
    const myReviews = s.peerReviews.filter((r) => r.reviewerId === u.id);
    return {
      assignment: { id: a.id, title: a.title, prompt: a.prompt },
      rubric: PEER_RUBRIC,
      mySubmission: mySub ? { id: mySub.id, text: mySub.text, createdAt: D(mySub.createdAt), summary: aggregatePeerReviews(s.peerReviews.filter((r) => r.submissionId === mySub.id) as never[]) } : null,
      toReview: subs
        .filter((x) => x.userId !== u.id)
        .map((x) => ({ id: x.id, authorName: displayNameOf(s, x.userId), text: x.text, createdAt: D(x.createdAt), reviewedByMe: myReviews.some((r) => r.submissionId === x.id) })),
    };
  },
  "peers.submit": (s, i) => {
    const u = requireUser(s);
    const a = s.assignments.find((x) => x.id === i.assignmentId);
    if (!a) throw new DemoError("NOT_FOUND", "الواجب مش موجود.");
    if (s.submissions.some((x) => x.assignmentId === a.id && x.userId === u.id)) throw new DemoError("CONFLICT", "إنت سلّمت الواجب ده قبل كده.");
    const text = String(i.text ?? "").trim();
    if (text.length < 20) throw new DemoError("BAD_REQUEST", "اكتب إجابة أطول من كده — سطرين على الأقل.");
    if (text.length > 5000) throw new DemoError("BAD_REQUEST", "الإجابة أطول من اللازم.");
    s.submissions.push({ id: uuid(), assignmentId: a.id, userId: u.id, text, createdAt: now() });
    return { ok: true };
  },
  "peers.review": (s, i) => {
    const u = requireUser(s);
    const sub = s.submissions.find((x) => x.id === i.submissionId);
    if (!sub) throw new DemoError("NOT_FOUND", "الواجب مش موجود.");
    if (sub.userId === u.id) throw new DemoError("BAD_REQUEST", "مينفعش تقيّم واجبك بنفسك.");
    if (s.peerReviews.some((r) => r.submissionId === sub.id && r.reviewerId === u.id)) throw new DemoError("CONFLICT", "إنت قيّمت الواجب ده قبل كده.");
    const scores = (i.scores ?? {}) as Record<string, number>;
    for (const c of PEER_RUBRIC) {
      const v = Number(scores[c.id]);
      if (!Number.isInteger(v) || v < 1 || v > 5) throw new DemoError("BAD_REQUEST", "قيّم كل معيار من ١ ل٥.");
    }
    s.peerReviews.push({ id: uuid(), submissionId: sub.id, reviewerId: u.id, scores, note: String(i.note ?? "").slice(0, 500), at: now() });
    awardPoints(s, u.id, "peer_review_given", `review:${sub.id}`);
    return { ok: true };
  },

  // ── platform & admin (features 46–50) ──────────────────────────────────────
  "codes.redeem": (s, i) => {
    const u = requireUser(s);
    const r = redeemTopupCode(s.topupCodes as any, String(i.code ?? ""), u.id, now());
    if (!r.ok) throw new DemoError("BAD_REQUEST", r.reason === "used" ? "الكود ده اتستخدم قبل كده." : "الكود مش صحيح — اتأكد من الأرقام والحروف.");
    creditWallet(s, u.id, (r as any).code.valueEgp, `code:${(r as any).code.code}`);
    logActivity(s, u.id, "redeem", { detail: `${(r as any).code.valueEgp}` });
    return { ok: true, valueEgp: (r as any).code.valueEgp, balanceEgp: balanceOf(s, u.id) };
  },
  "codes.generate": (s, i) => {
    const u = requireStaff(s);
    const count = Math.min(Math.max(Number(i.count) || 1, 1), 50);
    const valueEgp = Number(i.valueEgp);
    if (!Number.isInteger(valueEgp) || valueEgp < 10 || valueEgp > 5000) throw new DemoError("BAD_REQUEST", "قيمة الكود لازم تكون بين ١٠ و٥٠٠٠ جنيه.");
    const out: Row[] = [];
    for (let k = 0; k < count; k++) {
      let code = generateCodeString();
      while ((s.topupCodes as Row[]).some((c) => c.code === code)) code = generateCodeString();
      const row = { id: uuid(), code, valueEgp, createdBy: u.id, usedBy: null, usedAt: null, createdAt: now() };
      s.topupCodes.push(row);
      out.push(row);
    }
    return { codes: out.map((c) => ({ ...c, usedByName: null })) };
  },
  "codes.list": (s) => {
    requireStaff(s);
    return (s.topupCodes as Row[]).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 100)
      .map((c) => ({ ...c, usedByName: c.usedBy ? displayNameOf(s, c.usedBy) : null }));
  },
  "notify.list": (s) => {
    const u = requireUser(s);
    // Live regeneration: subscription expiry warnings from actual enrollments.
    const subs = (s.enrollments as Row[]).filter((e) => e.userId === u.id && e.status === "active")
      .map((e) => ({ userId: u.id, courseId: e.courseId, courseTitle: (s.courses.find((c) => c.id === e.courseId)?.title) ?? "كورس", expiresAt: e.expiresAt }));
    const incoming = buildSubscriptionNotices(subs, Date.now(), 3) as unknown as Row[];
    const merged = mergeNotifications(s.notifications as any, incoming as any);
    if (merged.length !== s.notifications.length) { s.notifications.splice(0, s.notifications.length, ...(merged as any)); }
    return {
      items: (s.notifications as Row[]).filter((n) => n.userId === u.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 30),
      unread: unreadCount(s.notifications as any, u.id),
    };
  },
  "notify.read": (s, i) => {
    const u = requireUser(s);
    const n = (s.notifications as Row[]).find((x) => x.id === i.id && x.userId === u.id);
    if (n) n.readAt = now();
    return { ok: true };
  },
  "notify.readAll": (s) => {
    const u = requireUser(s);
    for (const n of s.notifications as Row[]) if (n.userId === u.id && !n.readAt) n.readAt = now();
    return { ok: true };
  },
  "reviews.list": (s, i) => {
    const rows = (s.courseReviews as Row[]).filter((r) => r.courseId === i.courseId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 50);
    return {
      summary: ratingSummary(s.courseReviews as any, i.courseId),
      items: rows.map((r) => ({ ...r, userName: displayNameOf(s, r.userId) })),
    };
  },
  "reviews.upsert": (s, i) => {
    const u = requireUser(s);
    const course = s.courses.find((c) => c.id === i.courseId);
    if (!course) throw new DemoError("NOT_FOUND", "الكورس مش موجود.");
    const staff = isStaff(profileOf(s, u.id)?.role);
    if (!staff && !activeEnrollment(s, u.id, course.id)) throw new DemoError("FORBIDDEN", "لازم تكون مشترك في الكورس عشان تقيّمه.");
    const rating = Number(i.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new DemoError("BAD_REQUEST", "التقييم من ١ ل٥ نجوم.");
    const text = String(i.text ?? "").trim();
    if (text.length < 3) throw new DemoError("BAD_REQUEST", "اكتب رأيك في سطر على الأقل.");
    const next = upsertReview(s.courseReviews as any, { id: uuid(), courseId: course.id, userId: u.id, rating, text: text.slice(0, 500), createdAt: now() });
    s.courseReviews.splice(0, s.courseReviews.length, ...(next as any));
    return { ok: true, summary: ratingSummary(s.courseReviews as any, course.id) };
  },
  "search.query": (s, i) => {
    const courses = (s.courses as Row[]).filter((c) => c.isPublished)
      .map((c) => ({ id: c.id, slug: c.slug, title: c.title, description: c.description ?? "", stage: c.stage }));
    const lessons = (s.lessons as Row[]).map((l) => ({ id: l.id, courseId: l.courseId, title: l.title }));
    const teachers = (s.profiles as Row[]).filter((p) => p.role === "owner" || p.role === "teacher")
      .map((p) => ({ userId: p.userId, displayName: p.displayName ?? "مدرس" }));
    return { hits: searchCatalog({ courses, lessons, teachers }, String(i.q ?? ""), i.stage ?? null) };
  },
  "teacher.addLesson": (s, i) => {
    requireStaff(s);
    const course = s.courses.find((c) => c.id === i.courseId);
    if (!course) throw new DemoError("NOT_FOUND", "الكورس مش موجود.");
    const quiz = Array.isArray(i.quiz) ? i.quiz.map((q: any) => ({ q: String(q.q ?? ""), choices: (q.choices ?? []).map(String), correct: Number(q.correct) })) : [];
    const errs = validateLessonInput({ title: String(i.title ?? ""), videoUrl: String(i.videoUrl ?? ""), durationSec: Number(i.durationSec), isFree: Boolean(i.isFree), quiz });
    const pdfUrl = String(i.pdfUrl ?? "").trim();
    const vttUrl = String(i.vttUrl ?? "").trim();
    if (pdfUrl && !/^https?:\/\//.test(pdfUrl) && !pdfUrl.startsWith("/")) errs.push("رابط الملزمة لازم يبدأ بـ http");
    if (vttUrl && !/^https?:\/\//.test(vttUrl) && !vttUrl.startsWith("/")) errs.push("رابط الترجمة لازم يبدأ بـ http");
    if (errs.length) throw new DemoError("BAD_REQUEST", errs.join(" — "));
    const unitLessons = (s.lessons as Row[]).filter((l) => l.courseId === course.id && l.unitId === (i.unitId ?? null));
    const sortOrder = unitLessons.reduce((m, l) => Math.max(m, l.sortOrder), 0) + 1;
    const row = {
      id: uuid(), courseId: course.id, unitId: i.unitId ?? null, title: String(i.title).trim(),
      summary: String(i.summary ?? ""), videoUrl: String(i.videoUrl).trim(), durationSec: Number(i.durationSec),
      pdfUrl: pdfUrl || null, vttUrl: vttUrl || null,
      isFree: Boolean(i.isFree), sortOrder, quizJson: quiz.length ? quiz : null, createdAt: now(),
    };
    s.lessons.push(row);
    return { lesson: row };
  },
  "teacher.addCourse": (s, i) => {
    requireStaff(s);
    const title = String(i.title ?? "").trim();
    if (title.length < 3) throw new DemoError("BAD_REQUEST", "عنوان الكورس مطلوب.");
    const priceEgp = Number(i.priceEgp);
    if (!Number.isInteger(priceEgp) || priceEgp < 0) throw new DemoError("BAD_REQUEST", "السعر غير صالح.");
    const row = {
      id: uuid(), slug: slugify(title) + "-" + uuid().slice(0, 4), title, description: String(i.description ?? ""),
      stage: i.stage ?? "secondary", priceEgp, isPublished: true, poster: null, createdAt: now(),
    };
    s.courses.push(row);
    return { course: row };
  },

  // ── analytics (features 13–20) ─────────────────────────────────────────────
  "analytics.dashboard": (s) => {
    const u = requireUser(s);
    const dash: any = H["progress.dashboard"](s, {});
    const allCourses = dash.courses as any[];
    const facts = allCourses.flatMap((c) =>
      c.lessons.map((l: any) => ({
        lessonId: l.id, title: l.title,
        unitTitle: c.units.find((un: any) => un.id === l.unitId)?.title ?? "عام",
        state: l.state, watchPct: l.percent, quizBestPct: l.quizAttempts > 0 ? l.quizBestPct : null,
        topics: [c.units.find((un: any) => un.id === l.unitId)?.title ?? "عام"],
      })),
    );
    const weekKeys: string[] = [];
    for (let d = 6; d >= 0; d--) weekKeys.push(dayKey(new Date(Date.now() - d * DAY).toISOString()));
    const events = s.watchEvents.filter((e) => e.userId === u.id && e.gainedSec > 0);
    // Anonymous cohort comparison (18): weekly points vs classmates in the same grade.
    const myEvents = s.pointEvents.filter((e) => e.userId === u.id) as never[];
    const myWeek = pointsInWeek(myEvents, new Date());
    const p = profileOf(s, u.id);
    const cohortWeeks = s.profiles
      .filter((x) => x.role === "student" && x.gradeKey === p?.gradeKey && x.userId !== u.id)
      .map((x) => pointsInWeek(s.pointEvents.filter((e) => e.userId === x.userId) as never[], new Date()));
    return {
      units: unitProgress(facts as never[]),
      weak: weakTopics(facts as never[]),
      weekMinutes: weekKeys.map((day) => ({ day, minutes: studyMinutesByDay(events as never[], weekKeys)[day] ?? 0 })),
      cohort: cohortComparison(myWeek, cohortWeeks),
    };
  },
  "parent.report": (s) => {
    const u = requireUser(s);
    const myEvents = s.watchEvents.filter((e) => e.userId === u.id && e.gainedSec > 0);
    const weekStartMs = weekStart(new Date()).getTime();
    const lastWeekStart = weekStartMs - 7 * DAY;
    const minutesIn = (from: number, to: number) =>
      Math.round(myEvents.filter((e) => { const t = new Date(e.at).getTime(); return t >= from && t < to; }).reduce((a, e) => a + e.gainedSec, 0) / 60);
    const mine = s.progress.filter((x) => x.userId === u.id);
    const st = streaks([...new Set(s.pointEvents.filter((e) => e.userId === u.id).map((e) => dayKey(e.at)))], dayKey(new Date().toISOString()));
    return {
      text: parentWeeklyReport({
        studentName: displayNameOf(s, u.id),
        minutesThisWeek: minutesIn(weekStartMs, Date.now() + DAY),
        minutesLastWeek: minutesIn(lastWeekStart, weekStartMs),
        lessonsDone: mine.filter((x) => x.completedAt).length,
        quizzesPassed: mine.filter((x) => x.quizPassed).length,
        currentStreak: st.current,
      }),
    };
  },
  // ── v14: parent accounts (read-only view of linked children) ──
  "parent.myCode": (s) => {
    const u = requireUser(s);
    let row = (s.parentCodes as Row[]).find((c) => c.userId === u.id);
    if (!row) { row = { userId: u.id, code: generateCodeString(Math.random, PARENT_CODE_LEN), createdAt: now() }; (s.parentCodes as Row[]).push(row); }
    return { code: row.code };
  },
  "parent.rotateCode": (s) => {
    const u = requireUser(s);
    s.parentCodes = (s.parentCodes as Row[]).filter((c) => c.userId !== u.id);
    const code = generateCodeString(Math.random, PARENT_CODE_LEN);
    (s.parentCodes as Row[]).push({ userId: u.id, code, createdAt: now() });
    return { code };
  },
  "parent.link": (s, i) => {
    const u = requireParent(s);
    const row = (s.parentCodes as Row[]).find((c) => c.code === normalizeParentCode(String(i.code ?? "")));
    if (!row) throw new DemoError("BAD_REQUEST", "الكود مش صحيح — اطلبه من الطالب تاني.");
    const mine = (s.parentLinks as Row[]).filter((l) => l.parentId === u.id);
    if (mine.length >= MAX_CHILDREN) throw new DemoError("BAD_REQUEST", "وصلت للحد الأقصى من الأبناء.");
    if (mine.some((l) => l.childId === row.userId)) throw new DemoError("CONFLICT", "الطالب ده مربوط بحسابك بالفعل.");
    (s.parentLinks as Row[]).push({ id: uuid(), parentId: u.id, childId: row.userId, createdAt: now() });
    return { ok: true };
  },
  "parent.unlink": (s, i) => {
    const u = requireParent(s);
    s.parentLinks = (s.parentLinks as Row[]).filter((l) => !(l.parentId === u.id && l.childId === i.childId));
    return { ok: true };
  },
  "parent.children": (s) => {
    const u = requireParent(s);
    return (s.parentLinks as Row[]).filter((l) => l.parentId === u.id).map((l) => {
      const snap = childSnapshot(s, l.childId);
      const act = (s.activityEvents as Row[]).filter((e) => e.userId === l.childId).slice(-15).reverse().map((e) => {
        const lesson = e.lessonId ? s.lessons.find((x) => x.id === e.lessonId) : null;
        const course = e.courseId ? s.courses.find((c) => c.id === e.courseId) : lesson ? s.courses.find((c) => c.id === lesson.courseId) : null;
        return { id: e.id, kind: e.kind, at: D(e.at), lessonTitle: lesson?.title ?? null, courseTitle: course?.title ?? null, detail: e.detail ?? null };
      });
      return { childId: l.childId, ...snap.stats, report: snap.text, activity: act };
    });
  },
  "parent.sendReport": (s, i) => {
    const u = requireParent(s);
    if (!(s.parentLinks as Row[]).some((l) => l.parentId === u.id && l.childId === i.childId)) throw new DemoError("FORBIDDEN", "الطالب ده مش مربوط بحسابك.");
    const snap = childSnapshot(s, String(i.childId));
    const r = mockSend("whatsapp", String(i.phone ?? ""), snap.text, now(), uuid());
    if (!r.ok) throw new DemoError("BAD_REQUEST", "رقم الموبايل أو نص التقرير مش صالح.");
    (s.outbox as Row[]).push({ ...r.item, createdBy: u.id });
    return { status: r.item.status, link: whatsappLink(String(i.phone), snap.text) };
  },

  // ── v14: integrations (mock adapters) ──
  "integrations.list": (s) => {
    requireStaff(s);
    return {
      providers: PROVIDERS.map((p) => ({ ...p, mode: "mock" as const, keysPresent: false })),
      outbox: (s.outbox as Row[]).slice(-30).reverse().map((o) => ({ id: o.id, kind: o.kind, to: o.to, body: o.body, status: o.status, at: D(o.at) })),
    };
  },
  "integrations.test": (s, i) => {
    const u = requireStaff(s);
    const r = mockSend(i.kind, String(i.to ?? ""), String(i.body ?? ""), now(), uuid());
    if (!r.ok) throw new DemoError("BAD_REQUEST", "بيانات الرسالة مش صالحة.");
    (s.outbox as Row[]).push({ ...r.item, createdBy: u.id });
    return { status: r.item.status };
  },
  "integrations.translate": (s, i) => {
    requireUser(s);
    return mockTranslate(String(i.text ?? ""), i.target === "en" ? "en" : "ar");
  },
  "checkout.create": (s, i) => {
    const u = requireUser(s);
    if (!validCheckoutAmount(i.amountEgp)) throw new DemoError("BAD_REQUEST", `المبلغ لازم يكون من ${CHECKOUT_MIN} لـ ${CHECKOUT_MAX} جنيه.`);
    const row = { id: uuid(), userId: u.id, amountEgp: i.amountEgp, status: "pending", paidAt: null, createdAt: now() };
    (s.checkouts as Row[]).push(row);
    return { id: row.id, amountEgp: row.amountEgp, status: row.status };
  },
  "checkout.pay": (s, i) => {
    const u = requireUser(s);
    const row = (s.checkouts as Row[]).find((c) => c.id === i.id && c.userId === u.id && c.status === "pending");
    if (!row) throw new DemoError("BAD_REQUEST", "عملية الدفع دي مش موجودة أو اتدفعت قبل كده.");
    row.status = "paid"; row.paidAt = now();
    creditWallet(s, u.id, row.amountEgp, `checkout:${row.id}`);
    logActivity(s, u.id, "redeem", { detail: `${row.amountEgp}` });
    return { ok: true, amountEgp: row.amountEgp, balanceEgp: balanceOf(s, u.id) };
  },
  "videoStats.stats": (s, i) => {
    requireStaff(s);
    const lesson = s.lessons.find((l) => l.id === i.lessonId);
    if (!lesson) throw new DemoError("NOT_FOUND", "الدرس مش موجود.");
    const events = s.watchEvents.filter((e) => e.lessonId === lesson.id);
    return {
      lessonTitle: lesson.title,
      dropOff: dropOffPoint(events as never[]),
      heatmap: rewatchHeatmap(events as never[]),
      viewers: new Set(events.map((e) => e.userId)).size,
    };
  },
  "revenue.report": (s) => {
    requireStaff(s);
    const rep = revenueReport(s.wallet as never[], s.enrollments as never[]);
    const byCourse = s.courses.map((c) => ({
      title: c.title,
      sales: s.wallet.filter((w) => w.type === "purchase" && w.reference === c.slug).length,
      egp: s.wallet.filter((w) => w.type === "purchase" && w.reference === c.slug).reduce((a, w) => a - w.amountEgp, 0),
    })).filter((x) => x.sales > 0);
    return { ...rep, byCourse };
  },
  "analytics.exportCsv": (s, i) => {
    const u = requireUser(s);
    const staff = isStaff(profileOf(s, u.id)?.role);
    if (i.what === "progress" && !staff) {
      const mine = s.progress.filter((p) => p.userId === u.id && p.completedAt);
      const csv = toCsv(["الدرس", "نسبة المشاهدة", "أفضل نتيجة كويز", "تاريخ الإتمام"],
        mine.map((p) => {
          const l = s.lessons.find((x) => x.id === p.lessonId);
          return [l?.title ?? "", Math.round(watchPercent(p.watchedSec, l?.durationSec ?? 0)), p.quizBestPct ?? 0, (p.completedAt ?? "").slice(0, 10)];
        }));
      return { filename: "madar-progress.csv", csv };
    }
    if (!staff) throw new DemoError("FORBIDDEN", "التصدير ده للمالك بس.");
    const rep: any = H["revenue.report"](s, {});
    const csv = toCsv(["الكورس", "عدد المبيعات", "الإيراد (ج.م)"], rep.byCourse.map((c: any) => [c.title, c.sales, c.egp]));
    return { filename: "madar-revenue.csv", csv };
  },


  // ── activity log (feature 12): staff sees who did what, and when ──
  "activity.list": (s, i) => {
    requireStaff(s);
    const uid = i?.userId ? String(i.userId) : null;
    return (s.activityEvents as Row[])
      .filter((e) => !uid || e.userId === uid)
      .slice(-200)
      .reverse()
      .map((e) => {
        const lesson = e.lessonId ? s.lessons.find((l) => l.id === e.lessonId) : null;
        const course = e.courseId ? s.courses.find((c) => c.id === e.courseId) : lesson ? s.courses.find((c) => c.id === lesson.courseId) : null;
        return {
          id: e.id,
          kind: e.kind,
          at: D(e.at),
          studentName: displayNameOf(s, e.userId),
          lessonTitle: lesson?.title ?? null,
          courseTitle: course?.title ?? null,
          detail: e.detail ?? null,
        };
      });
  },

  // ── temporary signed video links (feature 11) ──
  "share.create": (s, i) => {
    const u = requireStaff(s);
    const lesson = s.lessons.find((l) => l.id === i.lessonId);
    if (!lesson) throw new DemoError("NOT_FOUND", "الدرس مش موجود.");
    const ttlMin = [60, 1440, 10080].includes(Number(i.ttlMin)) ? Number(i.ttlMin) : 1440;
    const jti = uuid();
    const expMs = Date.now() + ttlMin * 60_000;
    const token = signToken({ lid: lesson.id, exp: expMs, jti }, SHARE_SECRET);
    const path = `/share/${token}`;
    s.signedLinks.push({ id: uuid(), jti, token, path, lessonId: lesson.id, createdBy: u.id, createdAt: now(), expiresAt: new Date(expMs).toISOString(), revokedAt: null });
    logActivity(s, u.id, "share_create", { lessonId: lesson.id, courseId: lesson.courseId });
    return { token, path, expiresAt: new Date(expMs) };
  },
  "share.list": (s) => {
    requireStaff(s);
    return (s.signedLinks as Row[]).slice(-50).reverse().map((l) => ({
      id: l.id,
      path: l.path,
      lessonTitle: s.lessons.find((x) => x.id === l.lessonId)?.title ?? "",
      createdAt: D(l.createdAt),
      expiresAt: D(l.expiresAt),
      status: shareLinkStatus({ expiresAt: String(l.expiresAt), revokedAt: l.revokedAt ? String(l.revokedAt) : null }),
    }));
  },
  "share.revoke": (s, i) => {
    requireStaff(s);
    const l = (s.signedLinks as Row[]).find((x) => x.id === i.id);
    if (!l) throw new DemoError("NOT_FOUND", "اللينك مش موجود.");
    l.revokedAt = now();
    return { ok: true };
  },
  // Public by design: the signed, expiring token IS the access (feature 11).
  "share.open": (s, i) => {
    const token = String(i.token ?? "");
    const v = verifyToken(token, SHARE_SECRET);
    if (!v.ok) {
      if (v.reason === "expired") throw new DemoError("GONE", "اللينك ده انتهى — اطلب لينك جديد من المدرس.");
      throw new DemoError("NOT_FOUND", "اللينك ده مش صالح.");
    }
    const link = (s.signedLinks as Row[]).find((x) => x.jti === v.payload.jti);
    if (!link || link.revokedAt) throw new DemoError("GONE", "اللينك ده اتلغى — اطلب لينك جديد من المدرس.");
    const lesson = s.lessons.find((l) => l.id === v.payload.lid);
    if (!lesson) throw new DemoError("NOT_FOUND", "الدرس مش موجود.");
    const course = s.courses.find((c) => c.id === lesson.courseId);
    return {
      title: lesson.title,
      durationSec: lesson.durationSec ?? 0,
      videoUrl: lesson.videoUrl,
      courseTitle: course?.title ?? "",
      expiresAt: D(link.expiresAt),
    };
  },

  // ── Excel / PDF exports (feature 19) alongside CSV ──
  "analytics.exportExcel": (s, i) => {
    const u = requireUser(s);
    const staff = isStaff(profileOf(s, u.id)?.role);
    if (i.what === "progress" && !staff) {
      const mine = s.progress.filter((p) => p.userId === u.id && p.completedAt);
      const xml = toExcelXml([{
        name: "تقدمي",
        headers: ["الدرس", "نسبة المشاهدة", "أفضل نتيجة كويز", "تاريخ الإتمام"],
        rows: mine.map((p) => {
          const l = s.lessons.find((x) => x.id === p.lessonId);
          return [l?.title ?? "", Math.round(watchPercent(p.watchedSec, l?.durationSec ?? 0)), p.quizBestPct ?? 0, (p.completedAt ?? "").slice(0, 10)];
        }),
      }]);
      return { filename: "madar-progress.xls", xml };
    }
    if (!staff) throw new DemoError("FORBIDDEN", "التصدير ده للمالك بس.");
    const rep: any = H["revenue.report"](s, {});
    const xml = toExcelXml([{
      name: "الإيرادات",
      headers: ["الكورس", "عدد المبيعات", "الإيراد (ج.م)"],
      rows: rep.byCourse.map((c: any) => [c.title, c.sales, c.egp]),
    }]);
    return { filename: "madar-revenue.xls", xml };
  },
  // PDF export = print-ready HTML; the browser's "Save as PDF" does the rest.
  "analytics.exportReport": (s, i) => {
    const u = requireUser(s);
    const staff = isStaff(profileOf(s, u.id)?.role);
    if (i.what === "progress" && !staff) {
      const mine = s.progress.filter((p) => p.userId === u.id && p.completedAt);
      const html = reportHtml({
        title: "تقرير التقدم — منصة مدار",
        subtitle: displayNameOf(s, u.id),
        sections: [{
          heading: "الدروس المكتملة",
          headers: ["الدرس", "نسبة المشاهدة", "أفضل نتيجة كويز", "تاريخ الإتمام"],
          rows: mine.map((p) => {
            const l = s.lessons.find((x) => x.id === p.lessonId);
            return [l?.title ?? "", `${Math.round(watchPercent(p.watchedSec, l?.durationSec ?? 0))}٪`, `${p.quizBestPct ?? 0}٪`, (p.completedAt ?? "").slice(0, 10)];
          }),
        }],
        footer: "أُنشئ من منصة مدار.",
      });
      return { filename: "madar-progress.html", html };
    }
    if (!staff) throw new DemoError("FORBIDDEN", "التصدير ده للمالك بس.");
    const rep: any = H["revenue.report"](s, {});
    const html = reportHtml({
      title: "تقرير الإيرادات والاشتراكات — منصة مدار",
      subtitle: `إجمالي الشحن ${rep.topupsEgp} ج.م · إيراد الاشتراكات ${rep.purchasesEgp} ج.م · اشتراكات نشطة ${rep.activeSubscriptions} · تجديدات ${rep.renewals ?? 0}`,
      sections: [{
        heading: "الإيراد حسب الكورس",
        headers: ["الكورس", "عدد المبيعات", "الإيراد (ج.م)"],
        rows: rep.byCourse.map((c: any) => [c.title, c.sales, c.egp]),
      }],
      footer: "أُنشئ من منصة مدار.",
    });
    return { filename: "madar-revenue.html", html };
  },

  // files (receipts): the file is turned into a data URL by the Topup page itself
  "files.uploadUrl": (s, i) => {
    requireUser(s);
    const key = `${uuid()}-${String(i.name).replace(/[^A-Za-z0-9._-]/g, "") || "upload"}`;
    return { key, uploadUrl: "demo:upload", publicPath: "" };
  },
  "files.commit": (s) => { requireUser(s); return { ok: true }; },
  "files.list": (s) => { requireUser(s); return []; },
  "files.remove": (s) => { requireUser(s); return { ok: true }; },
};

/** Run one procedure. Async + a small delay so loading states look natural. */
export async function demoCall(path: string, input: unknown): Promise<unknown> {
  const handler = H[path];
  if (!handler) throw new DemoError("NOT_FOUND", `Unknown procedure: ${path}`);
  await new Promise((r) => setTimeout(r, 60));
  const s = load();
  const result = handler(s, input);
  save();
  return result;
}
