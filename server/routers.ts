// ── AGENT-OWNED: tRPC API surface ────────────────────────────────────────────
// Thin procedures: validate with zod, delegate to server/db.ts.
// Access: publicProcedure (anyone) / protectedProcedure (ctx.user set) / staff (owner|admin).
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { authProvider, registerLocalUser, AuthError, EmailTakenError } from "./_core/auth";
import {
  storageCommit,
  storageDeleteOwned,
  storageListByOwner,
  storagePutUrl,
  StorageError,
} from "./_core/storage";
import * as q from "./db";
import { isStaff } from "./db";
import { buildLessonContent, lessonState, publicQuestion, scoreQuiz, watchPercent } from "../shared/learning";
import { reportHtml, toExcelXml } from "../shared/export";
import { CHECKOUT_MAX, CHECKOUT_MIN, MAX_CHILDREN, PARENT_CODE_LEN, PROVIDERS, mockSend, mockTranslate, normalizeParentCode, validCheckoutAmount, whatsappLink } from "../shared/integrations";
import { shareLinkStatus, signToken, verifyToken } from "../shared/sign";

// Kept lazy so importing the router never eagerly loads server env config
// (unit tests run without DATABASE_URL/JWT_SECRET set).
const shareSecret = () => process.env.JWT_SECRET ?? "madar-demo-share-secret-v1";
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
} from "../shared/analytics";
import {
  buildSubscriptionNotices,
  generateCodeString,
  ratingSummary,
  searchCatalog,
  unreadCount,
  validateLessonInput,
} from "../shared/platform";
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
} from "../shared/ai";
import {
  BADGES,
  PEER_RUBRIC,
  POINT_VALUES,
  aggregatePeerReviews,
  challengeStanding,
  challengeState,
  challengeWinner,
  dayKey,
  evaluateBadges,
  goalProgress,
  minutesInWeek,
  weekKey,
  weekStreaks,
  liveStatus,
  pointsInWeek,
  pointsOf,
  rankLeaderboard,
  streaks,
  weekStart,
  type ChallengePlayer,
  type GamifyStats,
} from "../shared/gamify";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Map a DomainError to the matching TRPCError; anything else passes through. */
function translate<T>(fn: () => Promise<T>): Promise<T> {
  return fn().catch((e: unknown) => {
    if (e instanceof q.DomainError) throw new TRPCError({ code: e.code, message: e.message });
    throw e;
  });
}

/** staff = business role owner|admin. Checked on the SERVER, every call. */
const staffProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const profile = await q.getProfile(ctx.user.id);
  if (!isStaff(profile?.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "الصفحة دي للمالك أو المشرف فقط." });
  }
  return next({ ctx: { ...ctx, profile: profile! } });
});

const METHOD = z.enum(["instapay", "wallet", "fawry", "card"]);

// ─── auth ───────────────────────────────────────────────────────────────────

const authRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.user),

  /** `me` + the business profile, so the client never has to guess its role. */
  session: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return { user: null, profile: null };
    const profile = await q.ensureProfile(ctx.user.id, ctx.user.email, ctx.user.name);
    return { user: ctx.user, profile };
  }),

  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8, "الباسورد لازم ٨ حروف على الأقل."),
        name: z.string().optional(),
        phone: z.string().optional(),
        stage: z.string().optional(),
        gradeKey: z.string().optional(),
        track: z.string().optional(),
        pathway: z.string().optional(),
        accountType: z.enum(["student", "parent"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await registerLocalUser(input.email, input.password, input.name);
        await authProvider().login(ctx.c, input.email, input.password);
        await q.ensureProfile(user.id, user.email, user.name);
        await q.updateProfile(user.id, {
          phone: input.phone ?? null,
          stage: input.stage ?? null,
          gradeKey: input.gradeKey ?? null,
          track: input.track ?? null,
          pathway: input.pathway ?? null,
        });
        if (input.accountType === "parent") await q.setParentRole(user.id);
        await q.logActivity(user.id, "signup");
        return user;
      } catch (e: unknown) {
        if (e instanceof EmailTakenError)
          throw new TRPCError({ code: "CONFLICT", message: e.message });
        if (e instanceof AuthError) throw new TRPCError({ code: "BAD_REQUEST", message: e.message });
        throw e;
      }
    }),

  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await authProvider().login(ctx.c, input.email, input.password);
        await q.ensureProfile(user.id, user.email, user.name);
        await q.logActivity(user.id, "login");
        return user;
      } catch (e) {
        if (e instanceof AuthError)
          throw new TRPCError({ code: "UNAUTHORIZED", message: e.message });
        throw e;
      }
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    await authProvider().logout(ctx.c);
    return { ok: true };
  }),
});

// ─── catalog (public) ───────────────────────────────────────────────────────

const catalogRouter = router({
  settings: publicProcedure.query(() => q.getSettings()),

  courses: publicProcedure
    .input(
      z
        .object({
          stage: z.string().optional(),
          gradeKey: z.string().optional(),
          track: z.string().optional(),
          pathway: z.string().optional(),
          mathLevel: z.string().optional(),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(({ input }) => q.listCourses(input ?? {})),

  course: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const course = await q.getCourseBySlug(input.slug);
      if (!course || !course.isPublished) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الكورس مش موجود." });
      }
      const { units, lessons } = await q.getCourseContent(course.id);

      // Per-lesson state is resolved on the SERVER — never from a client flag.
      let entitled = false;
      let staff = false;
      let progressRows: Awaited<ReturnType<typeof q.getProgressRows>> = [];
      if (ctx.user) {
        const profile = await q.getProfile(ctx.user.id);
        staff = isStaff(profile?.role);
        entitled = staff || Boolean(await q.getActiveEnrollment(ctx.user.id, course.id));
        progressRows = await q.getProgressRows(ctx.user.id, lessons.map((l) => l.id));
      }

      return {
        course,
        units,
        lessons: decorateLessons(lessons, progressRows, { userId: ctx.user?.id ?? null, staff, entitled }),
        entitled,
      };
    }),
});

// ─── learning-state helpers (trust group) ───────────────────────────────────

function rowState(p: { watchedSec: number; quizPassed: boolean; completedAt: Date | null } | null, durationSec: number) {
  return lessonState(
    { watchedSec: p?.watchedSec ?? 0, quizPassed: Boolean(p?.quizPassed), completed: Boolean(p?.completedAt) },
    durationSec,
  );
}

/** Sequential unlocking (feature 6): lesson N opens when N-1 is completed. Staff and signed-out visitors on free lessons are exempt. */
function decorateLessons(
  lessons: { id: string; unitId: string | null; title: string; summary: string | null; durationSec: number; isFree: boolean; sortOrder: number }[],
  progressRows: { lessonId: string; watchedSec: number; quizPassed: boolean; completedAt: Date | null }[],
  ctx: { userId: string | null; staff: boolean; entitled: boolean },
) {
  const byLesson = new Map(progressRows.map((r) => [r.lessonId, r]));
  return lessons.map((l, index) => {
    const prev = index > 0 ? lessons[index - 1] : null;
    const gate =
      ctx.userId && !ctx.staff && prev && rowState(byLesson.get(prev.id) ?? null, prev.durationSec) !== "completed"
        ? ("quiz" as const)
        : null;
    return {
      id: l.id,
      unitId: l.unitId,
      title: l.title,
      summary: l.summary,
      durationSec: l.durationSec,
      isFree: l.isFree,
      sortOrder: l.sortOrder,
      locked: !(l.isFree || ctx.entitled),
      gate,
      state: rowState(byLesson.get(l.id) ?? null, l.durationSec),
    };
  });
}

/** Lesson access shared by the player, quizzes and progress: free preview or active enrollment (staff always). */
async function requireLessonAccess(userId: string, lessonId: string) {
  const row = await q.getLessonWithCourse(lessonId);
  if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "الدرس مش موجود." });
  const profile = await q.getProfile(userId);
  const staff = isStaff(profile?.role);
  const enrolled = staff || Boolean(await q.getActiveEnrollment(userId, row.course.id));
  if (!row.lesson.isFree && !enrolled) {
    throw new TRPCError({ code: "FORBIDDEN", message: "الدرس ده محتاج اشتراك ساري في الكورس." });
  }
  return { lesson: row.lesson, course: row.course, staff, enrolled };
}

// ─── my learning (student) ──────────────────────────────────────────────────

const learningRouter = router({
  /** The player payload. Access decided here, not in the browser. */
  lesson: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const row = await q.getLessonWithCourse(input.lessonId);
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "الدرس مش موجود." });

      const profile = await q.getProfile(ctx.user.id);
      const staff = isStaff(profile?.role);
      const enrolled = staff ? true : Boolean(await q.getActiveEnrollment(ctx.user.id, row.course.id));

      if (!row.lesson.isFree && !enrolled) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "الدرس ده محتاج اشتراك ساري في الكورس.",
        });
      }

      const { units, lessons } = await q.getCourseContent(row.course.id);
      const progressRows = await q.getProgressRows(ctx.user.id, lessons.map((l) => l.id));
      const ordered = decorateLessons(lessons, progressRows, { userId: ctx.user.id, staff, entitled: enrolled });
      const idx = lessons.findIndex((l) => l.id === row.lesson.id);
      if (ordered[idx]?.gate) {
        throw new TRPCError({ code: "FORBIDDEN", message: "لازم تكمّل الدرس اللي قبله وتعدي كويزه الأول." });
      }
      const content = buildLessonContent(row.lesson.id, row.lesson.title, row.lesson.durationSec ?? 0);

      return {
        lesson: {
          id: row.lesson.id,
          title: row.lesson.title,
          summary: row.lesson.summary,
          videoUrl: row.lesson.videoUrl,
          durationSec: row.lesson.durationSec,
          isFree: row.lesson.isFree,
          pdfUrl: row.lesson.pdfUrl ?? null,
          vttUrl: row.lesson.vttUrl ?? null,
        },
        course: {
          id: row.course.id,
          slug: row.course.slug,
          title: row.course.title,
          gradeKey: row.course.gradeKey,
        },
        units,
        lessons: ordered,
        nextLessonId: idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1].id : null,
        prevLessonId: idx > 0 ? ordered[idx - 1].id : null,
        entitled: enrolled,
        chapters: content.chapters,
        videoQuestions: content.videoQuestions.map((vq) => ({ ...publicQuestion(vq), atSec: vq.atSec })),
        quizCount: content.quiz.questions.length,
        quizPassPct: content.quiz.passPct,
        progress: q.publicProgress(progressRows.find((r) => r.lessonId === row.lesson.id) ?? null, row.lesson.durationSec ?? 0),
      };
    }),

  enrollments: protectedProcedure.query(({ ctx }) => q.listMyEnrollments(ctx.user.id)),

  purchase: protectedProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .mutation(({ ctx, input }) => translate(() => q.purchaseCourse(ctx.user.id, input.courseId))),
});

// ─── wallet + top-ups (student) ─────────────────────────────────────────────

const walletRouter = router({
  summary: protectedProcedure.query(async ({ ctx }) => {
    const [balance, transactions, topups, enrollments] = await Promise.all([
      q.getBalance(ctx.user.id),
      q.listWallet(ctx.user.id),
      q.listMyTopups(ctx.user.id),
      q.listMyEnrollments(ctx.user.id),
    ]);
    return { balanceEgp: balance, transactions, topups, enrollments };
  }),

  topup: protectedProcedure
    .input(
      z.object({
        amountEgp: z.number().int().min(50, "أقل مبلغ للشحن ٥٠ جنيه.").max(20_000, "أقصى مبلغ للشحن ٢٠٠٠٠ جنيه."),
        method: METHOD,
        reference: z.string().max(120).optional(),
        receiptUrl: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Manual routes need a receipt; card/fawry are recorded as awaiting a gateway.
      const manual = input.method === "instapay" || input.method === "wallet";
      if (manual && !input.receiptUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ارفع صورة الإيصال الأول — التحويل اليدوي مش بيتعتمد من غيرها.",
        });
      }
      const row = await q.createTopup({
        userId: ctx.user.id,
        amountEgp: input.amountEgp,
        method: input.method,
        reference: input.reference ?? null,
        receiptUrl: input.receiptUrl ?? null,
      });
      return {
        request: row,
        awaitingGateway: input.method === "card" || input.method === "fawry",
      };
    }),

  setGradeContext: protectedProcedure
    .input(
      z.object({
        stage: z.string().nullable().optional(),
        gradeKey: z.string().nullable().optional(),
        track: z.string().nullable().optional(),
        pathway: z.string().nullable().optional(),
        displayName: z.string().max(80).nullable().optional(),
        phone: z.string().max(30).nullable().optional(),
      }),
    )
    .mutation(({ ctx, input }) => q.updateProfile(ctx.user.id, input)),
});

// ─── admin / owner ──────────────────────────────────────────────────────────

const adminRouter = router({
  stats: staffProcedure.query(() => q.adminStats()),

  topups: staffProcedure
    .input(z.object({ status: z.enum(["pending", "approved", "rejected"]).optional() }).optional())
    .query(({ input }) => q.listTopups(input?.status)),

  approveTopup: staffProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) => translate(() => q.approveTopup(input.id, ctx.user.id))),

  rejectTopup: staffProcedure
    .input(z.object({ id: z.string().uuid(), reason: z.string().min(3, "اكتب سبب الرفض.") }))
    .mutation(({ ctx, input }) => translate(() => q.rejectTopup(input.id, ctx.user.id, input.reason))),

  students: staffProcedure.query(() => q.listStudents()),

  courses: staffProcedure.query(() => q.listCourses({}, { includeUnpublished: true })),

  course: staffProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const course = await q.getCourseById(input.id);
      if (!course) throw new TRPCError({ code: "NOT_FOUND", message: "الكورس مش موجود." });
      const content = await q.getCourseContent(course.id);
      return { course, ...content };
    }),

  saveCourse: staffProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        slug: z.string().optional(),
        title: z.string().min(2, "اكتب اسم الكورس."),
        stage: z.enum(["prep", "secondary"]),
        gradeKey: z.string().min(1),
        track: z.string().optional(),
        pathway: z.string().nullable().optional(),
        mathLevel: z.enum(["standard", "advanced"]).optional(),
        description: z.string().nullable().optional(),
        posterUrl: z.string().nullable().optional(),
        backdropUrl: z.string().nullable().optional(),
        priceEgp: z.number().int().min(0).optional(),
        durationMonths: z.number().int().min(1).max(12).optional(),
        isPublished: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      }),
    )
    .mutation(({ input }) => translate(() => q.upsertCourse(input))),

  deleteCourse: staffProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ input }) => q.deleteCourse(input.id)),

  createUnit: staffProcedure
    .input(z.object({ courseId: z.string().uuid(), title: z.string().min(1) }))
    .mutation(({ input }) => q.createUnit(input.courseId, input.title)),

  updateUnit: staffProcedure
    .input(z.object({ id: z.string().uuid(), title: z.string().min(1).optional(), sortOrder: z.number().int().optional() }))
    .mutation(({ input: { id, ...patch } }) => q.updateUnit(id, patch)),

  deleteUnit: staffProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ input }) => q.deleteUnit(input.id)),

  createLesson: staffProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
        unitId: z.string().uuid().nullable().optional(),
        title: z.string().min(1),
        summary: z.string().nullable().optional(),
        videoUrl: z.string().nullable().optional(),
        durationSec: z.number().int().min(0).optional(),
        isFree: z.boolean().optional(),
      }),
    )
    .mutation(({ input }) => q.createLesson(input)),

  updateLesson: staffProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).optional(),
        summary: z.string().nullable().optional(),
        videoUrl: z.string().nullable().optional(),
        durationSec: z.number().int().min(0).optional(),
        isFree: z.boolean().optional(),
        unitId: z.string().uuid().nullable().optional(),
        sortOrder: z.number().int().optional(),
      }),
    )
    .mutation(({ input: { id, ...patch } }) => q.updateLesson(id, patch)),

  deleteLesson: staffProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ input }) => q.deleteLesson(input.id)),

  saveSettings: staffProcedure
    .input(z.record(z.string(), z.string()))
    .mutation(async ({ input }) => {
      const allowed = new Set(Object.keys(q.DEFAULT_SETTINGS));
      for (const [k, v] of Object.entries(input)) {
        if (!allowed.has(k)) continue;
        await q.setSetting(k, v);
      }
      return q.getSettings();
    }),
});

// ─── files (receipt uploads) ────────────────────────────────────────────────

export function sanitizeBasename(name: string): string {
  const last = name.split(/[/\\]/).pop() ?? "";
  const dot = last.lastIndexOf(".");
  const rawStem = dot > 0 ? last.slice(0, dot) : last;
  const rawExt = dot > 0 ? last.slice(dot + 1) : "";
  const stem = rawStem.replace(/[^A-Za-z0-9._-]/g, "").replace(/^\.+/, "") || "upload";
  const ext = rawExt.replace(/[^A-Za-z0-9]/g, "").slice(0, 10);
  return ext ? `${stem}.${ext}` : stem;
}

const filesRouter = router({
  uploadUrl: protectedProcedure
    .input(z.object({ name: z.string().min(1), contentType: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const key = `${crypto.randomUUID()}-${sanitizeBasename(input.name)}`;
      try {
        const { uploadUrl, publicPath } = await storagePutUrl(key, input.contentType, {
          ownerId: ctx.user.id,
        });
        return { key, uploadUrl, publicPath };
      } catch (e) {
        if (e instanceof StorageError && e.code === "failed") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "نوع الملف مش مدعوم — استخدم صورة (PNG/JPG/WebP) أو PDF.",
          });
        }
        throw e;
      }
    }),

  commit: protectedProcedure
    .input(z.object({ key: z.string().min(1), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await storageCommit(input.key, { ownerId: ctx.user.id, name: input.name });
      } catch (e) {
        if (e instanceof StorageError && e.code === "not_found")
          throw new TRPCError({ code: "NOT_FOUND", message: "الملف مالوش أثر — جرّب الرفع تاني." });
        if (e instanceof StorageError && e.code === "forbidden")
          throw new TRPCError({ code: "FORBIDDEN", message: "المفتاح ده مش ملكك." });
        throw e;
      }
    }),

  list: protectedProcedure.query(({ ctx }) => storageListByOwner(ctx.user.id)),

  remove: protectedProcedure
    .input(z.object({ key: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await storageDeleteOwned(ctx.user.id, input.key);
      } catch (e) {
        if (e instanceof StorageError && e.code === "forbidden")
          throw new TRPCError({ code: "BAD_REQUEST", message: "مفتاح غير صالح." });
        throw e;
      }
    }),
});

// ─── progress (trust group) ─────────────────────────────────────────────────

const progressRouter = router({
  /** One honest beat of watching. Banks capped seconds server-side and reports back the fresh state. */
  heartbeat: protectedProcedure
    .input(
      z.object({
        lessonId: z.string().uuid(),
        deltaSec: z.number().min(0).max(3600),
        positionSec: z.number().min(0),
        deviceId: z.string().max(80).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { lesson, course } = await requireLessonAccess(ctx.user.id, input.lessonId);
      const row = await q.heartbeatProgress({ userId: ctx.user.id, lesson, deltaSec: input.deltaSec, positionSec: input.positionSec });
      if (row.completedAt) await q.awardPoints(ctx.user.id, "lesson_watched", POINT_VALUES.lesson_watched, `lesson:${lesson.id}`);
      // Feature 37: bank newly-covered seconds toward today's goal, awarded once a day.
      if (row.gainedSec > 0) {
        await q.insertWatchEvent({ userId: ctx.user.id, lessonId: lesson.id, second: Math.round(input.positionSec), kind: "watched", gainedSec: row.gainedSec });
        const flags = await q.getGamifyFlags(ctx.user.id);
        const day = dayKey(new Date().toISOString());
        const goal = await q.getDailyGoalRow(ctx.user.id, day, flags.goalMinutes);
        const minutes = Math.round((goal.minutes + row.gainedSec / 60) * 10) / 10;
        await q.addDailyGoalMinutes(ctx.user.id, day, row.gainedSec / 60);
        if (!goal.awardedAt && minutes >= flags.goalMinutes) {
          await q.awardPoints(ctx.user.id, "daily_goal_met", POINT_VALUES.daily_goal_met, `goal:${day}`);
          await q.markDailyGoalAwarded(ctx.user.id, day);
        }
        const allRows = await q.listDailyGoalRows(ctx.user.id);
        if (minutesInWeek(allRows.map((r) => ({ day: r.day, minutes: r.minutes })), new Date()) >= flags.weeklyGoalMinutes) {
          await q.awardPoints(ctx.user.id, "weekly_goal_met", POINT_VALUES.weekly_goal_met, `wgoal:${weekKey(new Date())}`);
        }
      }
      const cert = row.completedAt ? await q.issueCertificateIfComplete(ctx.user.id, course.id) : null;
      return {
        ...q.publicProgress(row, lesson.durationSec ?? 0),
        concurrentDevice: input.deviceId ? await q.beatDevice(ctx.user.id, input.deviceId) : false,
        certificate: cert ? await q.publicCertificate(cert) : null,
      };
    }),

  resume: protectedProcedure.query(async ({ ctx }) => {
    const profile = await q.getProfile(ctx.user.id);
    return q.listResume(ctx.user.id, isStaff(profile?.role));
  }),

  dashboard: protectedProcedure.query(({ ctx }) => q.learningDashboard(ctx.user.id)),
});

// ─── quizzes (features 3, 6) — the answer key never leaves the server ───────

const quizRouter = router({
  get: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { lesson } = await requireLessonAccess(ctx.user.id, input.lessonId);
      const content = buildLessonContent(lesson.id, lesson.title, lesson.durationSec ?? 0);
      const row = await q.getProgressRow(ctx.user.id, lesson.id);
      return {
        passPct: content.quiz.passPct,
        questions: content.quiz.questions.map(publicQuestion),
        progress: q.publicProgress(row, lesson.durationSec ?? 0),
      };
    }),

  submit: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid(), answers: z.array(z.number().int().nullable()).max(20) }))
    .mutation(async ({ ctx, input }) => {
      const { lesson, course } = await requireLessonAccess(ctx.user.id, input.lessonId);
      const content = buildLessonContent(lesson.id, lesson.title, lesson.durationSec ?? 0);
      const score = scoreQuiz(content.quiz.questions, input.answers);
      const row = await translate(() =>
        q.recordQuizResult({ userId: ctx.user.id, lesson, pct: score.pct, passed: score.passed }),
      );
      if (score.passed) {
        await q.awardPoints(ctx.user.id, "quiz_passed", POINT_VALUES.quiz_passed, `quiz:${lesson.id}`);
        if (score.pct >= 100) await q.awardPoints(ctx.user.id, "quiz_perfect", POINT_VALUES.quiz_perfect, `quiz-perfect:${lesson.id}`);
      }
      if (row.completedAt) await q.awardPoints(ctx.user.id, "lesson_watched", POINT_VALUES.lesson_watched, `lesson:${lesson.id}`);
      const cert = score.passed ? await q.issueCertificateIfComplete(ctx.user.id, course.id) : null;
      return {
        ...score,
        lessonCompleted: Boolean(row.completedAt),
        state: rowState(row, lesson.durationSec ?? 0),
        quizLocked: Boolean(row.quizLocked),
        failsLeft: row.failsLeft,
        lockedNow: row.lockedNow,
        certificate: cert ? await q.publicCertificate(cert) : null,
      };
    }),
});

const videoQRouter = router({
  answer: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid(), questionId: z.string().min(1), answer: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const { lesson } = await requireLessonAccess(ctx.user.id, input.lessonId);
      const content = buildLessonContent(lesson.id, lesson.title, lesson.durationSec ?? 0);
      const question = content.videoQuestions.find((x) => x.id === input.questionId);
      if (!question) throw new TRPCError({ code: "NOT_FOUND", message: "السؤال مش موجود." });
      const correct = input.answer === question.correct;
      const answered = correct ? await q.recordVideoAnswer(ctx.user.id, lesson.id, question.id) : [];
      return { correct, answered };
    }),
});

// ─── certificates (feature 36) ──────────────────────────────────────────────

const certificatesRouter = router({
  list: protectedProcedure.query(({ ctx }) => q.listCertificates(ctx.user.id)),

  /** Public verification by printed code — the code itself is the capability. */
  verify: publicProcedure
    .input(z.object({ code: z.string().min(4).max(40) }))
    .query(async ({ input }) => {
      const cert = await q.getCertificateByCode(input.code.trim().toUpperCase());
      if (!cert) throw new TRPCError({ code: "NOT_FOUND", message: "الشهادة مش موجودة — اتأكد من الكود." });
      return cert;
    }),
});

// ─── AI group (features 38–45) ──────────────────────────────────────────────
// Deterministic local engine (shared/ai.ts) — no external LLM is wired, so
// every answer is derived from the lesson's own content and graded server-side.

const aiRouter = router({
  chatHistory: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await requireLessonAccess(ctx.user.id, input.lessonId);
      return q.listAiMessages(ctx.user.id, input.lessonId);
    }),

  ask: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid(), message: z.string().trim().min(2, "اكتب سؤالك الأول.").max(500) }))
    .mutation(async ({ ctx, input }) => {
      const { lesson } = await requireLessonAccess(ctx.user.id, input.lessonId);
      const history = await q.listAiMessages(ctx.user.id, lesson.id, 100);
      const reply = assistantReply(input.message, { lessonTitle: lesson.title, durationSec: lesson.durationSec ?? 0 }, history.length);
      await q.saveAiMessage(ctx.user.id, lesson.id, "user", input.message);
      await q.saveAiMessage(ctx.user.id, lesson.id, "assistant", reply);
      return { reply };
    }),

  practiceStart: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { lesson } = await requireLessonAccess(ctx.user.id, input.lessonId);
      // The attempt number salts the generator so every set is fresh.
      const attemptNo = await q.nextPracticeAttemptNo(ctx.user.id, lesson.id);
      const questions = generatePractice(lesson.id, lesson.title, attemptNo);
      // The key stays in the DB; the client only sees the public shape.
      const attemptRow = await q.createPracticeAttempt(ctx.user.id, lesson.id, JSON.stringify(questions));
      return {
        attemptId: attemptRow.id,
        attemptNo: attemptRow.attemptNo,
        questions: questions.map((x) => ({ id: x.id, q: x.q, options: x.options, difficulty: x.difficulty })),
      };
    }),

  practiceSubmit: protectedProcedure
    .input(z.object({ attemptId: z.string().uuid(), answers: z.array(z.number().int().nullable()).max(20) }))
    .mutation(async ({ ctx, input }) => {
      const attempt = await q.getPracticeAttempt(input.attemptId, ctx.user.id);
      if (!attempt) throw new TRPCError({ code: "NOT_FOUND", message: "محاولة التدريب مش موجودة — ولّد أسئلة جديدة." });
      const questions = JSON.parse(attempt.questions) as Parameters<typeof scorePractice>[0];
      const result = scorePractice(questions, input.answers);
      await q.finishPracticeAttempt(attempt.id, JSON.stringify(input.answers), result.pct);
      return result;
    }),

  cards: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { lesson } = await requireLessonAccess(ctx.user.id, input.lessonId);
      return {
        summary: lessonSummary(lesson.title, lesson.durationSec ?? 0),
        flashcards: lessonFlashcards(lesson.title),
        essayPrompt: essayPromptFor(lesson.title),
      };
    }),

  essayGrade: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid(), text: z.string().trim().min(10, "اكتب إجابة أطول من كده — سطر واحد على الأقل.").max(5000) }))
    .mutation(async ({ ctx, input }) => {
      const { lesson } = await requireLessonAccess(ctx.user.id, input.lessonId);
      const grade = gradeEssay(input.text, lesson.title);
      await q.saveEssay(ctx.user.id, lesson.id, input.text, grade.pct, grade.passed);
      return grade;
    }),

  videoSearch: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid(), query: z.string().max(120) }))
    .mutation(async ({ ctx, input }) => {
      const { lesson } = await requireLessonAccess(ctx.user.id, input.lessonId);
      const transcript = buildTranscript(lesson.id, lesson.title, lesson.durationSec ?? 0);
      return { hits: searchTranscript(transcript, input.query) };
    }),

  next: protectedProcedure.query(async ({ ctx }) => {
    const dash = await q.learningDashboard(ctx.user.id);
    for (const c of dash.courses.filter((x) => x.isActive)) {
      const rec = recommendNext(
        c.lessons.map((l) => ({ id: l.id, title: l.title, state: l.state, quizBestPct: l.quizBestPct })),
      );
      if (rec) {
        const lesson = c.lessons.find((l) => l.id === rec.lessonId)!;
        return { ...rec, lessonTitle: lesson.title, courseSlug: c.course.slug, courseTitle: c.course.title };
      }
    }
    return null;
  }),

  planGet: protectedProcedure.query(({ ctx }) => q.getStudyPlan(ctx.user.id)),

  planSet: protectedProcedure
    .input(z.object({ examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "صيغة التاريخ مش صحيحة.").nullable() }))
    .mutation(async ({ ctx, input }) => {
      const dash = await q.learningDashboard(ctx.user.id);
      const lessons = dash.courses.flatMap((c) =>
        c.lessons.map((l) => ({ id: l.id, title: l.title, courseTitle: c.course.title, state: l.state, quizBestPct: l.quizBestPct })),
      );
      const today = new Date().toISOString().slice(0, 10);
      const days = buildStudyPlan(lessons, input.examDate, today);
      await q.upsertStudyPlan(ctx.user.id, input.examDate, JSON.stringify(days));
      return { examDate: input.examDate, days, updatedAt: new Date() };
    }),

  adaptiveStart: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { lesson } = await requireLessonAccess(ctx.user.id, input.lessonId);
      const seed = crypto.randomUUID();
      const state: AdaptiveState = { level: 2, asked: [] };
      const row = await q.createAdaptiveSession(ctx.user.id, lesson.id, seed, JSON.stringify(state));
      const question = nextAdaptiveQuestion(lesson.id, lesson.title, seed, state)!;
      return {
        sessionId: row.id,
        total: ADAPTIVE_LENGTH,
        question: { index: question.index, id: question.id, q: question.q, options: question.options, difficulty: question.difficulty },
      };
    }),

  adaptiveAnswer: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid(), answer: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const session = await q.getAdaptiveSession(input.sessionId, ctx.user.id);
      if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "جلسة الاختبار مش موجودة — ابدأ من الأول." });
      if (session.done) throw new TRPCError({ code: "CONFLICT", message: "الاختبار ده خلّص بالفعل — ابدأ واحد جديد." });
      const { lesson } = await requireLessonAccess(ctx.user.id, session.lessonId);
      let state = JSON.parse(session.state) as AdaptiveState;
      const current = nextAdaptiveQuestion(lesson.id, lesson.title, session.seed, state);
      if (!current) throw new TRPCError({ code: "CONFLICT", message: "الاختبار خلّص." });
      const correct = input.answer === current.correct;
      state = nextAdaptiveLevel(state, correct);
      const next = nextAdaptiveQuestion(lesson.id, lesson.title, session.seed, state);
      await q.updateAdaptiveSession(session.id, JSON.stringify(state), !next);
      if (!next) {
        return { correct, rightIndex: current.correct, explanation: current.explanation, done: true as const, result: adaptiveResult(state) };
      }
      return {
        correct,
        rightIndex: current.correct,
        explanation: current.explanation,
        done: false as const,
        question: { index: next.index, id: next.id, q: next.q, options: next.options, difficulty: next.difficulty },
      };
    }),
});

// ─── motivation & engagement (features 30–35, 37) ───────────────────────────
// Rules from shared/gamify.ts; durable state in db.ts.

const gamifyRouter = router({
  summary: protectedProcedure.query(async ({ ctx }) => {
    const [events, flags, profile] = await Promise.all([q.listPointEvents(ctx.user.id), q.getGamifyFlags(ctx.user.id), q.getProfile(ctx.user.id)]);
    const today = dayKey(new Date().toISOString());
    const goalRow = await q.getDailyGoalRow(ctx.user.id, today, flags.goalMinutes);
    const dash = await q.learningDashboard(ctx.user.id);
    const lessonsAll = dash.courses.flatMap((c) => c.lessons);
    const daySet = [...new Set(events.map((e) => dayKey(e.at.toISOString())).concat(goalRow.minutes > 0 ? [today] : []))];
    const st = streaks(daySet, today);
    const [reviews, challengesMine, posts] = await Promise.all([
      q.listReviewsBy(ctx.user.id),
      q.listChallengesFor(ctx.user.id),
      q.listCohortDiscussionCount(ctx.user.id),
    ]);
    const stats: GamifyStats = {
      lessonsWatched: lessonsAll.filter((l) => l.state === "completed").length,
      quizzesPassed: lessonsAll.filter((l) => l.quizBestPct >= 60).length,
      perfectQuizzes: lessonsAll.filter((l) => l.quizBestPct >= 100).length,
      currentStreak: st.current,
      longestStreak: st.longest,
      totalPoints: pointsOf(events as never[]),
      discussionPosts: posts,
      challengesWon: challengesMine.filter((c) => challengeWinner({ id: c.id, lessonId: c.lessonId, createdBy: c.createdBy, createdAt: c.createdAt.toISOString(), players: JSON.parse(c.players) as ChallengePlayer[] }) === ctx.user.id).length,
      reviewsGiven: reviews.length,
      liveAttended: events.filter((e) => e.kind === "live_attended").length,
    };
    const unlocked = new Set(evaluateBadges(stats));
    const weekKeys: string[] = [];
    for (let i = 6; i >= 0; i--) weekKeys.push(dayKey(new Date(Date.now() - i * 86400000).toISOString()));
    const weekRows = await q.listDailyGoalWeek(ctx.user.id, weekKeys);
    const allGoalRows = (await q.listDailyGoalRows(ctx.user.id)).map((r) => ({ day: r.day, minutes: r.minutes }));
    return {
      totalPoints: stats.totalPoints,
      weekPoints: pointsInWeek(events as never[], new Date()),
      streak: st,
      goal: goalProgress(goalRow.minutes, flags.goalMinutes),
      weekGoal: goalProgress(minutesInWeek(allGoalRows, new Date()), flags.weeklyGoalMinutes),
      weekStreak: weekStreaks(allGoalRows, flags.weeklyGoalMinutes, today),
      weekDays: weekKeys.map((day) => ({ day, minutes: weekRows.find((r) => r.day === day)?.minutes ?? 0 })),
      leaderboardHidden: flags.hideLeaderboard,
      badges: BADGES.map((b) => ({ id: b.id, unlocked: unlocked.has(b.id) })),
      stats,
      displayName: profile?.displayName ?? "طالب",
    };
  }),

  leaderboard: protectedProcedure.query(async ({ ctx }) => {
    const profile = await q.getProfile(ctx.user.id);
    if (!profile?.gradeKey) return { weekStart: weekStart(new Date()).toISOString(), rows: [] };
    const rows = await q.listCohortWeeklyPoints(profile.gradeKey, weekStart(new Date()));
    return {
      weekStart: weekStart(new Date()).toISOString(),
      rows: rankLeaderboard(rows.map((r) => ({ ...r, isMe: r.userId === ctx.user.id }))),
    };
  }),

  leaderboardOpt: protectedProcedure
    .input(z.object({ show: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await q.setGamifyFlags(ctx.user.id, { hideLeaderboard: !input.show });
      return { hidden: !input.show };
    }),

  setGoal: protectedProcedure
    .input(z.object({ minutes: z.number().int().min(15, "هدف الأسبوع بين ربع ساعة و٢٨ ساعة.").max(1680) }))
    .mutation(async ({ ctx, input }) => {
      await q.setGamifyFlags(ctx.user.id, { weeklyGoalMinutes: input.minutes });
      return { weeklyGoalMinutes: input.minutes };
    }),
});

const notesRouter = router({
  list: protectedProcedure.input(z.object({ lessonId: z.string().uuid() })).query(async ({ ctx, input }) => {
    await requireLessonAccess(ctx.user.id, input.lessonId);
    const rows = await q.listLessonNotes(ctx.user.id, input.lessonId);
    return rows.map((n) => ({ id: n.id, second: n.second, text: n.text, createdAt: n.createdAt.toISOString() }));
  }),
  add: protectedProcedure.input(z.object({ lessonId: z.string().uuid(), second: z.number().int().min(0), text: z.string().min(1).max(500) })).mutation(async ({ ctx, input }) => {
    await requireLessonAccess(ctx.user.id, input.lessonId);
    const row = await q.insertLessonNote({ userId: ctx.user.id, lessonId: input.lessonId, second: input.second, text: input.text.trim() });
    return { note: { id: row.id, second: row.second, text: row.text, createdAt: row.createdAt.toISOString() } };
  }),
  delete: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const ok = await q.deleteLessonNote(ctx.user.id, input.id);
    if (!ok) throw new TRPCError({ code: "NOT_FOUND", message: "الملاحظة مش موجودة." });
    return { deleted: true };
  }),
});

const discussRouter = router({
  list: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await requireLessonAccess(ctx.user.id, input.lessonId);
      const posts = await q.listDiscussion(input.lessonId);
      return posts.map((p) => ({
        ...p,
        mine: p.userId === ctx.user.id,
        replies: p.replies.map((r) => ({ ...r, mine: r.userId === ctx.user.id })),
      }));
    }),

  post: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid(), text: z.string().trim().min(3, "اكتب سؤالك الأول.").max(1000) }))
    .mutation(async ({ ctx, input }) => {
      await requireLessonAccess(ctx.user.id, input.lessonId);
      await q.createDiscussionPost(ctx.user.id, input.lessonId, input.text);
      await q.awardPoints(ctx.user.id, "discussion_post", POINT_VALUES.discussion_post);
      return { ok: true as const };
    }),

  reply: protectedProcedure
    .input(z.object({ postId: z.string().uuid(), text: z.string().trim().min(2, "اكتب ردك الأول.").max(1000) }))
    .mutation(async ({ ctx, input }) => {
      const made = await q.createDiscussionReply(ctx.user.id, input.postId, input.text);
      if (!made) throw new TRPCError({ code: "NOT_FOUND", message: "المشاركة مش موجودة." });
      if (made.post.userId !== ctx.user.id) await q.awardPoints(ctx.user.id, "discussion_reply", POINT_VALUES.discussion_reply);
      return { ok: true as const };
    }),
});

const liveRouter = router({
  list: protectedProcedure
    .input(z.object({ courseId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      const sessions = await q.listLiveSessions(input.courseId);
      const events = await q.listPointEvents(ctx.user.id);
      return sessions.map((x) => {
        const status = liveStatus(x.startsAt.toISOString(), x.endsAt.toISOString(), new Date());
        return {
          id: x.id,
          title: x.title,
          startsAt: x.startsAt,
          endsAt: x.endsAt,
          status,
          recordingUrl: status === "ended" ? x.recordingUrl : null,
          attended: events.some((e) => e.kind === "live_attended" && e.ref === `live:${x.id}`),
        };
      });
    }),

  messages: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rows = await q.listLiveMessages(input.sessionId);
      return rows.map((m) => ({ ...m, mine: m.userId === ctx.user.id }));
    }),

  chat: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid(), text: z.string().trim().min(1).max(500) }))
    .mutation(async ({ ctx, input }) => {
      const session = await q.getLiveSession(input.sessionId);
      if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "الحصة مش موجودة." });
      if (liveStatus(session.startsAt.toISOString(), session.endsAt.toISOString(), new Date()) !== "live") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "الشات بيفتح وقت اللايف بس." });
      }
      await q.addLiveMessage(session.id, ctx.user.id, input.text);
      await q.awardPoints(ctx.user.id, "live_attended", POINT_VALUES.live_attended, `live:${session.id}`);
      return { ok: true as const };
    }),
});

const challengesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await q.listChallengesFor(ctx.user.id);
    const out = [];
    for (const c of rows) {
      const players = JSON.parse(c.players) as ChallengePlayer[];
      const lesson = await q.getLessonWithCourse(c.lessonId);
      const ch = { id: c.id, lessonId: c.lessonId, createdBy: c.createdBy, createdAt: c.createdAt.toISOString(), players };
      out.push({
        id: c.id,
        lessonTitle: lesson?.lesson.title ?? "درس",
        createdByMe: c.createdBy === ctx.user.id,
        createdAt: c.createdAt,
        state: challengeState(ch),
        winnerId: challengeWinner(ch),
        standing: challengeStanding(ch).map((p) => ({ ...p, isMe: p.userId === ctx.user.id })),
      });
    }
    return out;
  }),

  create: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid(), opponentUserId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await requireLessonAccess(ctx.user.id, input.lessonId);
      if (input.opponentUserId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "اختار زميل تتحدّاه." });
      const opponent = await q.getProfile(input.opponentUserId);
      if (!opponent) throw new TRPCError({ code: "NOT_FOUND", message: "الزميل مش موجود." });
      const me = await q.getProfile(ctx.user.id);
      const players: ChallengePlayer[] = [
        { userId: ctx.user.id, name: me?.displayName ?? "طالب", score: null, finishedAt: null },
        { userId: input.opponentUserId, name: opponent.displayName ?? "طالب", score: null, finishedAt: null },
      ];
      const row = await q.createChallenge(input.lessonId, ctx.user.id, JSON.stringify(players));
      return { id: row.id };
    }),

  play: protectedProcedure
    .input(z.object({ challengeId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const c = await q.getChallenge(input.challengeId);
      if (!c) throw new TRPCError({ code: "NOT_FOUND", message: "التحدّي مش موجود." });
      const players = JSON.parse(c.players) as ChallengePlayer[];
      const me = players.find((p) => p.userId === ctx.user.id);
      if (!me) throw new TRPCError({ code: "FORBIDDEN", message: "إنت مش طرف في التحدّي ده." });
      if (me.score !== null) throw new TRPCError({ code: "CONFLICT", message: "إنت خلّصت نصيبك في التحدّي ده." });
      const lessonRow = await q.getLessonWithCourse(c.lessonId);
      if (!lessonRow) throw new TRPCError({ code: "NOT_FOUND", message: "الدرس مش موجود." });
      // Fixed attempt number: every player gets the same questions.
      const questions = generatePractice(lessonRow.lesson.id, lessonRow.lesson.title, 7);
      return { questions: questions.map((x) => ({ id: x.id, q: x.q, options: x.options, difficulty: x.difficulty })) };
    }),

  submit: protectedProcedure
    .input(z.object({ challengeId: z.string().uuid(), answers: z.array(z.number().int().nullable()).max(20) }))
    .mutation(async ({ ctx, input }) => {
      const c = await q.getChallenge(input.challengeId);
      if (!c) throw new TRPCError({ code: "NOT_FOUND", message: "التحدّي مش موجود." });
      const players = JSON.parse(c.players) as ChallengePlayer[];
      const me = players.find((p) => p.userId === ctx.user.id);
      if (!me) throw new TRPCError({ code: "FORBIDDEN", message: "إنت مش طرف في التحدّي ده." });
      if (me.score !== null) throw new TRPCError({ code: "CONFLICT", message: "إنت خلّصت نصيبك في التحدّي ده." });
      const lessonRow = await q.getLessonWithCourse(c.lessonId);
      if (!lessonRow) throw new TRPCError({ code: "NOT_FOUND", message: "الدرس مش موجود." });
      const questions = generatePractice(lessonRow.lesson.id, lessonRow.lesson.title, 7);
      const result = scorePractice(questions, input.answers);
      me.score = result.pct;
      me.finishedAt = new Date().toISOString();
      await q.updateChallengePlayers(c.id, JSON.stringify(players));
      const ch = { id: c.id, lessonId: c.lessonId, createdBy: c.createdBy, createdAt: c.createdAt.toISOString(), players };
      const winnerId = challengeWinner(ch);
      if (winnerId === ctx.user.id) await q.awardPoints(ctx.user.id, "challenge_won", POINT_VALUES.challenge_won, `challenge:${c.id}`);
      return { pct: result.pct, state: challengeState(ch), winnerId, standing: challengeStanding(ch) };
    }),
});

const peersRouter = router({
  get: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await requireLessonAccess(ctx.user.id, input.lessonId);
      const a = await q.getAssignmentForLesson(input.lessonId);
      if (!a) return { assignment: null };
      const subs = await q.listSubmissions(a.id);
      const mySub = subs.find((x) => x.userId === ctx.user.id);
      const myReviews = await q.listReviewsBy(ctx.user.id);
      return {
        assignment: { id: a.id, title: a.title, prompt: a.prompt },
        rubric: PEER_RUBRIC,
        mySubmission: mySub
          ? {
              id: mySub.id,
              text: mySub.text,
              createdAt: mySub.createdAt,
              summary: aggregatePeerReviews(
                (await q.listReviewsFor(mySub.id)).map((r) => ({ reviewerId: r.reviewerId, scores: JSON.parse(r.scores), note: r.note ?? undefined, at: r.at.toISOString() })),
              ),
            }
          : null,
        toReview: subs
          .filter((x) => x.userId !== ctx.user.id)
          .map((x) => ({ id: x.id, authorName: x.authorName, text: x.text, createdAt: x.createdAt, reviewedByMe: myReviews.some((r) => r.submissionId === x.id) })),
      };
    }),

  submit: protectedProcedure
    .input(z.object({ assignmentId: z.string().uuid(), text: z.string().trim().min(20, "اكتب إجابة أطول من كده — سطرين على الأقل.").max(5000) }))
    .mutation(async ({ ctx, input }) => {
      const row = await q.createSubmission(input.assignmentId, ctx.user.id, input.text);
      if (!row) throw new TRPCError({ code: "CONFLICT", message: "إنت سلّمت الواجب ده قبل كده." });
      return { ok: true as const };
    }),

  review: protectedProcedure
    .input(
      z.object({
        submissionId: z.string().uuid(),
        scores: z.record(z.string(), z.number().int().min(1).max(5)),
        note: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sub = await q.getSubmission(input.submissionId);
      if (!sub) throw new TRPCError({ code: "NOT_FOUND", message: "الواجب مش موجود." });
      if (sub.userId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "مينفعش تقيّم واجبك بنفسك." });
      for (const c of PEER_RUBRIC) {
        if (typeof input.scores[c.id] !== "number") throw new TRPCError({ code: "BAD_REQUEST", message: "قيّم كل معيار من ١ ل٥." });
      }
      const row = await q.createPeerReview(sub.id, ctx.user.id, JSON.stringify(input.scores), input.note ?? "");
      if (!row) throw new TRPCError({ code: "CONFLICT", message: "إنت قيّمت الواجب ده قبل كده." });
      await q.awardPoints(ctx.user.id, "peer_review_given", POINT_VALUES.peer_review_given, `review:${sub.id}`);
      return { ok: true as const };
    }),
});

const codesRouter = router({
  redeem: protectedProcedure
    .input(z.object({ code: z.string().min(4) }))
    .mutation(async ({ ctx, input }) => {
      const norm = input.code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      const row = await q.getTopupCode(norm);
      if (!row) throw new TRPCError({ code: "BAD_REQUEST", message: "الكود مش صحيح — اتأكد من الأرقام والحروف." });
      if (row.usedBy) throw new TRPCError({ code: "BAD_REQUEST", message: "الكود ده اتستخدم قبل كده." });
      await q.markTopupCodeUsed(row.id, ctx.user.id);
      await q.creditWallet(ctx.user.id, row.valueEgp, `code:${row.code}`, "كود شحن");
      const balance = await q.walletBalance(ctx.user.id);
      return { ok: true, valueEgp: row.valueEgp, balanceEgp: balance };
    }),
  generate: staffProcedure
    .input(z.object({ count: z.number().int().min(1).max(50), valueEgp: z.number().int().min(10).max(5000) }))
    .mutation(async ({ ctx, input }) => {
      const rows = Array.from({ length: input.count }, () => ({ code: generateCodeString(), valueEgp: input.valueEgp, createdBy: ctx.user.id }));
      await q.insertTopupCodes(rows);
      return { codes: rows };
    }),
  list: staffProcedure.query(() => q.listTopupCodes()),
});

const notifyRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const enrollments = await q.listActiveEnrollments(ctx.user.id);
    const subs = enrollments.map((e) => ({ userId: ctx.user.id, courseId: e.courseId, courseTitle: e.courseTitle ?? "كورس", expiresAt: e.expiresAt.toISOString() }));
    const incoming = buildSubscriptionNotices(subs, Date.now(), 3);
    await q.insertNotificationsIgnoreDupes(incoming);
    const items = await q.listNotifications(ctx.user.id);
    return { items, unread: unreadCount(items as never[], ctx.user.id) };
  }),
  read: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await q.markNotificationRead(input.id, ctx.user.id);
      return { ok: true };
    }),
  readAll: protectedProcedure.mutation(async ({ ctx }) => {
    await q.markAllNotificationsRead(ctx.user.id);
    return { ok: true };
  }),
});

const reviewsRouter = router({
  list: publicProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .query(async ({ input }) => {
      const rows = await q.listCourseReviews(input.courseId);
      return { summary: ratingSummary(rows as never[], input.courseId), items: rows };
    }),
  upsert: protectedProcedure
    .input(z.object({ courseId: z.string().uuid(), rating: z.number().int().min(1).max(5), text: z.string().min(3).max(500) }))
    .mutation(async ({ ctx, input }) => {
      const entitled = await q.isStaffUser(ctx.user.id) || (await q.activeEnrollment(ctx.user.id, input.courseId));
      if (!entitled) throw new TRPCError({ code: "FORBIDDEN", message: "لازم تكون مشترك في الكورس عشان تقيّمه." });
      await q.upsertCourseReview(input.courseId, ctx.user.id, input.rating, input.text);
      const rows = await q.listCourseReviews(input.courseId);
      return { ok: true, summary: ratingSummary(rows as never[], input.courseId) };
    }),
});

const searchRouter = router({
  query: publicProcedure
    .input(z.object({ q: z.string().max(100), stage: z.string().nullish() }))
    .query(async ({ input }) => {
      const { courses, lessons, teachers } = await q.searchCatalogData();
      return { hits: searchCatalog({ courses, lessons, teachers }, input.q, input.stage ?? null) };
    }),
});

const teacherRouter = router({
  addLesson: staffProcedure
    .input(z.object({
      courseId: z.string().uuid(),
      unitId: z.string().uuid().nullish(),
      title: z.string().min(1).max(200),
      summary: z.string().max(1000).optional(),
      videoUrl: z.string().url(),
      durationSec: z.number().int().min(30),
      isFree: z.boolean(),
      pdfUrl: z.string().url().nullish(),
      vttUrl: z.string().url().nullish(),
      quiz: z.array(z.object({ q: z.string(), choices: z.array(z.string()), correct: z.number().int() })).max(20).optional(),
    }))
    .mutation(async ({ input }) => {
      const errs = validateLessonInput({ title: input.title, videoUrl: input.videoUrl, durationSec: input.durationSec, isFree: input.isFree, quiz: input.quiz ?? [] });
      if (errs.length) throw new TRPCError({ code: "BAD_REQUEST", message: errs.join(" — ") });
      const sortOrder = (await q.maxLessonSortOrder(input.courseId, input.unitId ?? null)) + 1;
      const lesson = await q.insertLesson({ courseId: input.courseId, unitId: input.unitId ?? null, title: input.title, summary: input.summary ?? "", videoUrl: input.videoUrl, durationSec: input.durationSec, isFree: input.isFree, sortOrder, pdfUrl: input.pdfUrl ?? null, vttUrl: input.vttUrl ?? null });
      return { lesson };
    }),
  addCourse: staffProcedure
    .input(z.object({ title: z.string().min(3).max(200), description: z.string().max(2000).optional(), stage: z.string(), priceEgp: z.number().int().min(0) }))
    .mutation(async ({ input }) => {
      const slug = input.title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/^-|-$/g, "") || `course-${Date.now()}`;
      const course = await q.insertCourse({ slug: `${slug}-${Math.random().toString(36).slice(2, 6)}`, title: input.title, description: input.description ?? "", stage: input.stage, gradeKey: input.stage === "prep" ? "prep-1" : "sec-1", priceEgp: input.priceEgp, isPublished: true });
      return { course };
    }),
});

const analyticsRouter = router({
  dashboard: protectedProcedure.query(async ({ ctx }) => {
    const dash = await q.learningDashboard(ctx.user.id);
    const facts = dash.courses.flatMap((c) =>
      c.lessons.map((l) => ({
        lessonId: l.id, title: l.title,
        unitTitle: c.units.find((un) => un.id === l.unitId)?.title ?? "عام",
        state: l.state, watchPct: l.percent, quizBestPct: l.quizAttempts > 0 ? l.quizBestPct : null,
        topics: [c.units.find((un) => un.id === l.unitId)?.title ?? "عام"],
      })),
    );
    const weekKeys: string[] = [];
    for (let d = 6; d >= 0; d--) weekKeys.push(dayKey(new Date(Date.now() - d * 86400000).toISOString()));
    const events = await q.listWatchEventsForUser(ctx.user.id, new Date(Date.now() - 7 * 86400000));
    const eventsMin = events.map((e) => ({ at: e.at.toISOString(), gainedSec: e.gainedSec }));
    const myEvents = await q.listPointEvents(ctx.user.id);
    const myWeek = pointsInWeek(myEvents as never[], new Date());
    const profile = await q.getProfile(ctx.user.id);
    const cohort = profile?.gradeKey
      ? await q.cohortWeeklyPointTotals(profile.gradeKey, weekStart(new Date()), ctx.user.id)
      : [];
    return {
      units: unitProgress(facts as never[]),
      weak: weakTopics(facts as never[]),
      weekMinutes: weekKeys.map((day) => ({ day, minutes: studyMinutesByDay(eventsMin, weekKeys)[day] ?? 0 })),
      cohort: cohortComparison(myWeek, cohort),
    };
  }),


  exportCsv: protectedProcedure
    .input(z.object({ what: z.enum(["progress", "revenue"]) }))
    .query(async ({ ctx, input }) => {
      if (input.what === "progress") {
        const rows = await q.listProgressForUser(ctx.user.id);
        const csv = toCsv(["الدرس", "نسبة المشاهدة", "أفضل نتيجة كويز", "تاريخ الإتمام"],
          rows.map((p) => [p.lessonTitle ?? "", Math.round(watchPercent(p.watchedSec ?? 0, p.durationSec ?? 0)), p.quizBestPct ?? 0, p.completedAt ? p.completedAt.toISOString().slice(0, 10) : ""]));
        return { filename: "madar-progress.csv", csv };
      }
      if (!(await q.isStaffUser(ctx.user.id))) throw new TRPCError({ code: "FORBIDDEN", message: "التصدير ده للمالك بس." });
      const wallet = await q.listAllWalletRows();
      const courseRows = await q.searchCatalogData();
      const byCourse = courseRows.courses.map((c) => ({
        title: c.title,
        sales: wallet.filter((w) => w.type === "purchase" && w.reference === c.slug).length,
        egp: wallet.filter((w) => w.type === "purchase" && w.reference === c.slug).reduce((a, w) => a - w.amountEgp, 0),
      })).filter((x) => x.sales > 0);
      const csv = toCsv(["الكورس", "عدد المبيعات", "الإيراد (ج.م)"], byCourse.map((c) => [c.title, c.sales, c.egp]));
      return { filename: "madar-revenue.csv", csv };
    }),

  exportExcel: protectedProcedure
    .input(z.object({ what: z.enum(["progress", "revenue"]) }))
    .query(async ({ ctx, input }) => {
      if (input.what === "progress") {
        const rows = await q.listProgressForUser(ctx.user.id);
        const xml = toExcelXml([{
          name: "تقدمي",
          headers: ["الدرس", "نسبة المشاهدة", "أفضل نتيجة كويز", "تاريخ الإتمام"],
          rows: rows.map((p) => [p.lessonTitle ?? "", Math.round(watchPercent(p.watchedSec ?? 0, p.durationSec ?? 0)), p.quizBestPct ?? 0, p.completedAt ? p.completedAt.toISOString().slice(0, 10) : ""]),
        }]);
        return { filename: "madar-progress.xls", xml };
      }
      if (!(await q.isStaffUser(ctx.user.id))) throw new TRPCError({ code: "FORBIDDEN", message: "التصدير ده للمالك بس." });
      const wallet = await q.listAllWalletRows();
      const courseRows = await q.searchCatalogData();
      const byCourse = courseRows.courses.map((c) => ({
        title: c.title,
        sales: wallet.filter((w) => w.type === "purchase" && w.reference === c.slug).length,
        egp: wallet.filter((w) => w.type === "purchase" && w.reference === c.slug).reduce((a, w) => a - w.amountEgp, 0),
      })).filter((x) => x.sales > 0);
      const xml = toExcelXml([{ name: "الإيرادات", headers: ["الكورس", "عدد المبيعات", "الإيراد (ج.م)"], rows: byCourse.map((c) => [c.title, c.sales, c.egp]) }]);
      return { filename: "madar-revenue.xls", xml };
    }),

  // PDF export = print-ready HTML; the browser's "Save as PDF" finishes it.
  exportReport: protectedProcedure
    .input(z.object({ what: z.enum(["progress", "revenue"]) }))
    .query(async ({ ctx, input }) => {
      if (input.what === "progress") {
        const rows = await q.listProgressForUser(ctx.user.id);
        const profile = await q.getProfile(ctx.user.id);
        const html = reportHtml({
          title: "تقرير التقدم — منصة مدار",
          subtitle: profile?.displayName ?? ctx.user.email,
          sections: [{
            heading: "الدروس",
            headers: ["الدرس", "نسبة المشاهدة", "أفضل نتيجة كويز", "تاريخ الإتمام"],
            rows: rows.map((p) => [p.lessonTitle ?? "", `${Math.round(watchPercent(p.watchedSec ?? 0, p.durationSec ?? 0))}٪`, `${p.quizBestPct ?? 0}٪`, p.completedAt ? p.completedAt.toISOString().slice(0, 10) : ""]),
          }],
          footer: "أُنشئ من منصة مدار.",
        });
        return { filename: "madar-progress.html", html };
      }
      if (!(await q.isStaffUser(ctx.user.id))) throw new TRPCError({ code: "FORBIDDEN", message: "التصدير ده للمالك بس." });
      const wallet = await q.listAllWalletRows();
      const courseRows = await q.searchCatalogData();
      const byCourse = courseRows.courses.map((c) => ({
        title: c.title,
        sales: wallet.filter((w) => w.type === "purchase" && w.reference === c.slug).length,
        egp: wallet.filter((w) => w.type === "purchase" && w.reference === c.slug).reduce((a, w) => a - w.amountEgp, 0),
      })).filter((x) => x.sales > 0);
      const rep = revenueReport(
        wallet.map((w) => ({ type: w.type, amountEgp: w.amountEgp })),
        (await q.listAllEnrollments()).map((e) => ({ status: e.status, renewedAt: null as string | null })),
      );
      const html = reportHtml({
        title: "تقرير الإيرادات والاشتراكات — منصة مدار",
        subtitle: `إجمالي الشحن ${rep.topupsEgp} ج.م · إيراد الاشتراكات ${rep.purchasesEgp} ج.م · اشتراكات نشطة ${rep.activeSubscriptions}`,
        sections: [{ heading: "الإيراد حسب الكورس", headers: ["الكورس", "عدد المبيعات", "الإيراد (ج.م)"], rows: byCourse.map((c) => [c.title, c.sales, c.egp]) }],
        footer: "أُنشئ من منصة مدار.",
      });
      return { filename: "madar-revenue.html", html };
    }),
});

const videoStatsRouter = router({
  stats: staffProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .query(async ({ input }) => {
      const events = await q.listWatchEventsForLesson(input.lessonId);
      const mapped = events.map((e) => ({ lessonId: e.lessonId, second: e.second, kind: e.kind as "watched" | "left" | "rewatched" }));
      return {
        dropOff: dropOffPoint(mapped),
        heatmap: rewatchHeatmap(mapped),
        viewers: new Set(events.map((e) => e.userId)).size,
      };
    }),
});

const revenueRouter = router({
  report: staffProcedure.query(async () => {
    const wallet = await q.listAllWalletRows();
    const enrollments = await q.listAllEnrollments();
    const pairCounts = new Map<string, number>();
    for (const e of enrollments) {
      const k = `${e.userId}:${e.courseId}`;
      pairCounts.set(k, (pairCounts.get(k) ?? 0) + 1);
    }
    const renewals = [...pairCounts.values()].filter((n) => n > 1).length;
    const rep = revenueReport(
      wallet.map((w) => ({ type: w.type, amountEgp: w.amountEgp })),
      enrollments.map((e) => ({ status: e.status, renewedAt: null as string | null })),
    );
    const courseRows = await q.searchCatalogData();
    const byCourse = courseRows.courses.map((c) => ({
      title: c.title,
      sales: wallet.filter((w) => w.type === "purchase" && w.reference === c.slug).length,
      egp: wallet.filter((w) => w.type === "purchase" && w.reference === c.slug).reduce((a, w) => a - w.amountEgp, 0),
    })).filter((x) => x.sales > 0);
    return { ...rep, renewals, byCourse };
  }),
});


async function childSnapshot(userId: string) {
  const ws = weekStart(new Date()).getTime();
  const events = await q.listWatchEventsForUser(userId, new Date(ws - 7 * 86400000));
  const minutesIn = (from: number, to: number) =>
    Math.round(events.filter((e) => { const t = e.at.getTime(); return t >= from && t < to; }).reduce((a, e) => a + e.gainedSec, 0) / 60);
  const dash = await q.learningDashboard(userId);
  const lessonsAll = dash.courses.flatMap((c) => c.lessons);
  const profile = await q.getProfile(userId);
  const myPoints = await q.listPointEvents(userId);
  const st = streaks([...new Set(myPoints.map((e) => dayKey(e.at.toISOString())))], dayKey(new Date().toISOString()));
  const stats = {
    studentName: profile?.displayName ?? "الطالب",
    minutesThisWeek: minutesIn(ws, Date.now() + 86400000),
    minutesLastWeek: minutesIn(ws - 7 * 86400000, ws),
    lessonsDone: lessonsAll.filter((l) => l.state === "completed").length,
    quizzesPassed: lessonsAll.filter((l) => l.quizBestPct >= 60).length,
    currentStreak: st.current,
  };
  return { userId, stats, text: parentWeeklyReport(stats), phone: profile?.phone ?? null };
}

const parentOnly = protectedProcedure.use(async ({ ctx, next }) => {
  const profile = await q.getProfile(ctx.user.id);
  if (profile?.role !== "parent") throw new TRPCError({ code: "FORBIDDEN", message: "الصفحة دي لحساب ولي الأمر." });
  return next({ ctx });
});

const parentRouter = router({
  report: protectedProcedure.query(async ({ ctx }) => {
    const snap = await childSnapshot(ctx.user.id);
    return { text: snap.text };
  }),

  /** Student side: the code a parent enters to link. */
  myCode: protectedProcedure.query(async ({ ctx }) => ({ code: await q.getOrCreateParentCode(ctx.user.id, () => generateCodeString(Math.random, PARENT_CODE_LEN)) })),

  rotateCode: protectedProcedure.mutation(async ({ ctx }) => {
    const code = generateCodeString(Math.random, PARENT_CODE_LEN);
    await q.rotateParentCode(ctx.user.id, code);
    return { code };
  }),

  /** Parent side: redeem a student's code. Read-only access to that child's progress. */
  link: parentOnly.input(z.object({ code: z.string().min(4) })).mutation(async ({ ctx, input }) => {
    const childId = await q.findChildByParentCode(normalizeParentCode(input.code));
    if (!childId) throw new TRPCError({ code: "BAD_REQUEST", message: "الكود مش صحيح — اطلبه من الطالب تاني." });
    if ((await q.countParentLinks(ctx.user.id)) >= MAX_CHILDREN) throw new TRPCError({ code: "BAD_REQUEST", message: "وصلت للحد الأقصى من الأبناء." });
    const added = await q.linkParent(ctx.user.id, childId);
    if (!added) throw new TRPCError({ code: "CONFLICT", message: "الطالب ده مربوط بحسابك بالفعل." });
    return { ok: true };
  }),

  unlink: parentOnly.input(z.object({ childId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    await q.unlinkParent(ctx.user.id, input.childId);
    return { ok: true };
  }),

  children: parentOnly.query(async ({ ctx }) => {
    const ids = await q.listChildIds(ctx.user.id);
    const out = [];
    for (const id of ids) {
      const snap = await childSnapshot(id);
      const act = (await q.listActivityEvents({ userId: id, limit: 15 })).map((e) => ({
        id: e.id, kind: e.kind, at: e.at, lessonTitle: e.lessonTitle ?? null, courseTitle: e.courseTitle ?? null, detail: e.detail ?? null,
      }));
      out.push({ childId: id, ...snap.stats, report: snap.text, activity: act });
    }
    return out;
  }),

  /** Send the weekly report to the parent's own phone via the WhatsApp adapter (mock + a real click-to-chat link). */
  sendReport: parentOnly.input(z.object({ childId: z.string().uuid(), phone: z.string().min(6) })).mutation(async ({ ctx, input }) => {
    if (!(await q.isParentOf(ctx.user.id, input.childId))) throw new TRPCError({ code: "FORBIDDEN", message: "الطالب ده مش مربوط بحسابك." });
    const snap = await childSnapshot(input.childId);
    const r = mockSend("whatsapp", input.phone, snap.text, new Date().toISOString(), crypto.randomUUID());
    if (!r.ok) throw new TRPCError({ code: "BAD_REQUEST", message: "رقم الموبايل أو نص التقرير مش صالح." });
    await q.addOutbox({ kind: "whatsapp", recipient: r.item.to, body: r.item.body, status: r.item.status, createdBy: ctx.user.id });
    return { status: r.item.status, link: whatsappLink(input.phone, snap.text) };
  }),
});

// ─── v14: external-service seams (mock adapters) ────────────────────────────

const integrationsRouter = router({
  list: staffProcedure.query(async () => ({
    providers: PROVIDERS.map((p) => ({
      ...p,
      mode: "mock" as const,
      keysPresent: p.requiredKeys.every((k) => Boolean(process.env[k])),
    })),
    outbox: (await q.listOutbox(30)).map((o) => ({ id: o.id, kind: o.kind, to: o.recipient, body: o.body, status: o.status, at: o.createdAt })),
  })),

  test: staffProcedure
    .input(z.object({ kind: z.enum(["push", "whatsapp"]), to: z.string().min(1), body: z.string().min(1).max(500) }))
    .mutation(async ({ ctx, input }) => {
      const r = mockSend(input.kind, input.to, input.body, new Date().toISOString(), crypto.randomUUID());
      if (!r.ok) throw new TRPCError({ code: "BAD_REQUEST", message: "بيانات الرسالة مش صالحة." });
      await q.addOutbox({ kind: input.kind, recipient: r.item.to, body: r.item.body, status: r.item.status, createdBy: ctx.user.id });
      return { status: r.item.status };
    }),

  translate: protectedProcedure
    .input(z.object({ text: z.string().min(1).max(2000), target: z.enum(["ar", "en"]) }))
    .mutation(async ({ input }) => mockTranslate(input.text, input.target)),
});

const checkoutRouter = router({
  create: protectedProcedure.input(z.object({ amountEgp: z.number().int() })).mutation(async ({ ctx, input }) => {
    if (!validCheckoutAmount(input.amountEgp)) throw new TRPCError({ code: "BAD_REQUEST", message: `المبلغ لازم يكون من ${CHECKOUT_MIN} لـ ${CHECKOUT_MAX} جنيه.` });
    const row = await q.createMockCheckout(ctx.user.id, input.amountEgp);
    return { id: row.id, amountEgp: row.amountEgp, status: row.status };
  }),
  /** Stands in for the payment gateway's webhook: marks paid and credits once. */
  pay: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const row = await q.payMockCheckout(ctx.user.id, input.id);
    if (!row) throw new TRPCError({ code: "BAD_REQUEST", message: "عملية الدفع دي مش موجودة أو اتدفعت قبل كده." });
    await q.creditWallet(ctx.user.id, row.amountEgp, `checkout:${row.id}`, "دفع أونلاين (تجريبي)");
    await q.logActivity(ctx.user.id, "redeem", { detail: `${row.amountEgp}` });
    return { ok: true, amountEgp: row.amountEgp, balanceEgp: await q.walletBalance(ctx.user.id) };
  }),
});

// ─── activity log (feature 12): staff-only listing ─────────────────────────

const activityRouter = router({
  list: staffProcedure
    .input(z.object({ userId: z.string().uuid().optional() }).optional())
    .query(async ({ input }) => q.listActivityEvents({ userId: input?.userId })),
});

// ─── temporary signed video links (feature 11) ──────────────────────────────
// The HMAC secret is the platform-injected JWT secret — nothing to configure.

const shareRouter = router({
  create: staffProcedure
    .input(z.object({ lessonId: z.string().uuid(), ttlMin: z.number().int().min(5).max(60 * 24 * 30) }))
    .mutation(async ({ ctx, input }) => {
      const row = await q.getLessonWithCourse(input.lessonId);
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "الدرس مش موجود." });
      const ttlMin = [60, 1440, 10080].includes(input.ttlMin) ? input.ttlMin : 1440;
      const jti = crypto.randomUUID();
      const expMs = Date.now() + ttlMin * 60_000;
      const token = signToken({ lid: row.lesson.id, exp: expMs, jti }, shareSecret());
      await q.createSignedLink({ jti, token, lessonId: row.lesson.id, createdBy: ctx.user.id, expiresAt: new Date(expMs) });
      await q.logActivity(ctx.user.id, "share_create", { lessonId: row.lesson.id });
      return { token, path: `/share/${token}`, expiresAt: new Date(expMs) };
    }),

  list: staffProcedure.query(async () => {
    const rows = await q.listSignedLinks();
    return rows.map((l) => ({
      id: l.id,
      path: `/share/${l.token}`,
      lessonTitle: l.lessonTitle,
      createdAt: l.createdAt,
      expiresAt: l.expiresAt,
      status: shareLinkStatus({ expiresAt: l.expiresAt.toISOString(), revokedAt: l.revokedAt?.toISOString() ?? null }),
    }));
  }),

  revoke: staffProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const ok = await q.revokeSignedLink(input.id);
      if (!ok) throw new TRPCError({ code: "NOT_FOUND", message: "اللينك مش موجود." });
      return { ok: true };
    }),

  // Public by design: the signed, expiring token IS the access.
  open: publicProcedure
    .input(z.object({ token: z.string().min(10).max(4000) }))
    .query(async ({ input }) => {
      const v = verifyToken(input.token, shareSecret());
      if (!v.ok) {
        if (v.reason === "expired") throw new TRPCError({ code: "NOT_FOUND", message: "اللينك ده انتهى — اطلب لينك جديد من المدرس." });
        throw new TRPCError({ code: "NOT_FOUND", message: "اللينك ده مش صالح." });
      }
      const link = await q.getSignedLinkByJti(v.payload.jti);
      if (!link || link.revokedAt) throw new TRPCError({ code: "NOT_FOUND", message: "اللينك ده اتلغى — اطلب لينك جديد من المدرس." });
      const row = await q.getLessonWithCourse(link.lessonId);
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "الدرس مش موجود." });
      return {
        title: row.lesson.title,
        durationSec: row.lesson.durationSec ?? 0,
        videoUrl: row.lesson.videoUrl,
        courseTitle: row.course.title,
        expiresAt: link.expiresAt,
      };
    }),
});

export const appRouter = router({
  auth: authRouter,
  catalog: catalogRouter,
  learning: learningRouter,
  progress: progressRouter,
  quiz: quizRouter,
  videoQ: videoQRouter,
  certificates: certificatesRouter,
  wallet: walletRouter,
  admin: adminRouter,
  files: filesRouter,
  ai: aiRouter,
  gamify: gamifyRouter,
  notes: notesRouter,
  discuss: discussRouter,
  live: liveRouter,
  challenges: challengesRouter,
  peers: peersRouter,
  codes: codesRouter,
  notify: notifyRouter,
  reviews: reviewsRouter,
  search: searchRouter,
  teacher: teacherRouter,
  analytics: analyticsRouter,
  activity: activityRouter,
  share: shareRouter,
  parent: parentRouter,
  integrations: integrationsRouter,
  checkout: checkoutRouter,
  videoStats: videoStatsRouter,
  revenue: revenueRouter,
});

export type AppRouter = typeof appRouter;
