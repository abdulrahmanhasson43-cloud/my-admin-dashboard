// Platform & admin engine (PDF features 46–50): top-up codes, notifications,
// course reviews, global search, and teacher content validation.
// Pure functions only — no storage, no network. Demo store and server both use this.

export type TopupCode = {
  id: string;
  code: string;
  valueEgp: number;
  createdBy: string;
  usedBy: string | null;
  usedAt: string | null;
  createdAt: string;
};

export type NotificationKind = "subscription_expiry" | "exam_reminder" | "general";

export type AppNotification = {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  ref: string | null;
  readAt: string | null;
  createdAt: string;
};

export type CourseReview = {
  id: string;
  courseId: string;
  userId: string;
  rating: number; // 1..5
  text: string;
  createdAt: string;
};

// ── Top-up codes (47) ─────────────────────────────────────────────────────────

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

export function generateCodeString(rand: () => number = Math.random, len = 10): string {
  let out = "";
  for (let i = 0; i < len; i++) out += CODE_ALPHABET[Math.floor(rand() * CODE_ALPHABET.length)];
  return out;
}

export function normalizeCode(input: string): string {
  return input.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export type RedeemResult =
  | { ok: true; code: TopupCode }
  | { ok: false; reason: "invalid" | "used" | "own_limit" };

export function redeemTopupCode(codes: TopupCode[], input: string, userId: string, at: string): RedeemResult {
  const norm = normalizeCode(input);
  const code = codes.find((c) => c.code === norm);
  if (!code) return { ok: false, reason: "invalid" };
  if (code.usedBy) return { ok: false, reason: code.usedBy === userId ? "used" : "used" };
  code.usedBy = userId;
  code.usedAt = at;
  return { ok: true, code };
}

// ── Notifications (48) ────────────────────────────────────────────────────────

const DAY = 24 * 3600 * 1000;

export type ExpirySource = { userId: string; courseId: string; courseTitle: string; expiresAt: string };
export type ExamSource = { userId: string; examId: string; title: string; startsAt: string };

export function buildSubscriptionNotices(subs: ExpirySource[], nowMs: number, daysBefore = 3): AppNotification[] {
  const out: AppNotification[] = [];
  for (const s of subs) {
    const left = new Date(s.expiresAt).getTime() - nowMs;
    if (left > 0 && left <= daysBefore * DAY) {
      const days = Math.max(1, Math.ceil(left / DAY));
      out.push({
        id: `subexp:${s.userId}:${s.courseId}:${s.expiresAt.slice(0, 10)}`,
        userId: s.userId,
        kind: "subscription_expiry",
        title: "اشتراكك بيقرب يخلص",
        body: `اشتراكك في «${s.courseTitle}» بينتهي خلال ${days} ${days === 1 ? "يوم" : "أيام"}. جدّد عشان ما تفقدش تقدمك.`,
        ref: s.courseId,
        readAt: null,
        createdAt: new Date(nowMs).toISOString(),
      });
    }
  }
  return out;
}

export function buildExamNotices(exams: ExamSource[], nowMs: number, daysBefore = 2): AppNotification[] {
  const out: AppNotification[] = [];
  for (const e of exams) {
    const left = new Date(e.startsAt).getTime() - nowMs;
    if (left > 0 && left <= daysBefore * DAY) {
      out.push({
        id: `exam:${e.userId}:${e.examId}:${e.startsAt.slice(0, 10)}`,
        userId: e.userId,
        kind: "exam_reminder",
        title: "امتحان قريب",
        body: `«${e.title}» يوم ${e.startsAt.slice(0, 10)}. راجع خطة مذاكرتك.`,
        ref: e.examId,
        readAt: null,
        createdAt: new Date(nowMs).toISOString(),
      });
    }
  }
  return out;
}

export function mergeNotifications(existing: AppNotification[], incoming: AppNotification[]): AppNotification[] {
  const ids = new Set(existing.map((n) => n.id));
  const merged = [...existing];
  for (const n of incoming) if (!ids.has(n.id)) merged.push(n);
  return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function unreadCount(list: AppNotification[], userId: string): number {
  return list.filter((n) => n.userId === userId && !n.readAt).length;
}

// ── Course reviews (49) ───────────────────────────────────────────────────────

export function upsertReview(list: CourseReview[], rev: CourseReview): CourseReview[] {
  const i = list.findIndex((r) => r.courseId === rev.courseId && r.userId === rev.userId);
  if (i >= 0) {
    const next = [...list];
    next[i] = { ...rev, id: list[i].id, createdAt: list[i].createdAt };
    return next;
  }
  return [...list, rev];
}

export function ratingSummary(list: CourseReview[], courseId: string): { avg: number; count: number } {
  const rs = list.filter((r) => r.courseId === courseId);
  if (!rs.length) return { avg: 0, count: 0 };
  const avg = rs.reduce((s, r) => s + r.rating, 0) / rs.length;
  return { avg: Math.round(avg * 10) / 10, count: rs.length };
}

// ── Global search (50) ────────────────────────────────────────────────────────

export function normalizeArabic(s: string): string {
  return s
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ً-ْٰ]/g, "")
    .toLowerCase()
    .trim();
}

export type SearchHit = {
  type: "course" | "lesson" | "teacher";
  id: string;
  title: string;
  subtitle: string;
  courseId?: string;
  slug?: string;
  stage?: string | null;
};

export function searchCatalog(
  input: {
    courses: { id: string; slug: string; title: string; description: string; stage: string; priceEgp?: number }[];
    lessons: { id: string; courseId: string; title: string }[];
    teachers: { userId: string; displayName: string }[];
  },
  rawQuery: string,
  filterStage?: string | null
): SearchHit[] {
  const q = normalizeArabic(rawQuery);
  if (!q) return [];
  const hits: SearchHit[] = [];
  for (const c of input.courses) {
    if (filterStage && c.stage !== filterStage) continue;
    const hay = normalizeArabic(`${c.title} ${c.description}`);
    if (hay.includes(q)) {
      hits.push({ type: "course", id: c.id, title: c.title, subtitle: c.description.slice(0, 80), slug: c.slug, stage: c.stage });
    }
  }
  for (const l of input.lessons) {
    const course = input.courses.find((c) => c.id === l.courseId);
    if (filterStage && course?.stage !== filterStage) continue;
    if (normalizeArabic(l.title).includes(q)) {
      hits.push({ type: "lesson", id: l.id, title: l.title, subtitle: course?.title ?? "", courseId: l.courseId, stage: course?.stage ?? null });
    }
  }
  for (const t of input.teachers) {
    if (normalizeArabic(t.displayName).includes(q)) {
      hits.push({ type: "teacher", id: t.userId, title: t.displayName, subtitle: "مدرس" });
    }
  }
  return hits;
}

// ── Teacher content validation (46) ───────────────────────────────────────────

export type LessonInput = {
  title: string;
  videoUrl: string;
  durationSec: number;
  isFree: boolean;
  quiz: { q: string; choices: string[]; correct: number }[];
};

export function validateLessonInput(inp: LessonInput): string[] {
  const errs: string[] = [];
  if (!inp.title.trim()) errs.push("عنوان الدرس مطلوب");
  if (!/^https?:\/\//.test(inp.videoUrl)) errs.push("رابط الفيديو لازم يبدأ بـ http");
  if (!Number.isFinite(inp.durationSec) || inp.durationSec < 30) errs.push("مدة الفيديو غير صالحة");
  inp.quiz.forEach((qq, i) => {
    if (!qq.q.trim()) errs.push(`سؤال ${i + 1}: النص مطلوب`);
    if (qq.choices.length < 2) errs.push(`سؤال ${i + 1}: لازم اختيارين على الأقل`);
    if (qq.correct < 0 || qq.correct >= qq.choices.length) errs.push(`سؤال ${i + 1}: رقم الإجابة الصحيحة غير صالح`);
  });
  return errs;
}
