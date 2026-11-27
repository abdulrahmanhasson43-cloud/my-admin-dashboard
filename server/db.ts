// ── AGENT-OWNED: business data-access ────────────────────────────────────────
// All Drizzle/SQL lives here so procedures in routers.ts stay thin.
// Balance is NEVER stored — it is SUM(wallet_transactions.amount_egp).
import { and, asc, desc, eq, gt, inArray, sql, type SQL } from "drizzle-orm";
import { db } from "./_core/db";
import { parentCodes, parentLinks, integrationOutbox, mockCheckouts, lessonNotes,
  aiAdaptiveSessions,
  aiEssays,
  aiMessages,
  aiPracticeAttempts,
  assignments,
  challenges,
  courses,
  dailyGoals,
  discussionPosts,
  discussionReplies,
  enrollments,
  gamifyFlags,
  lessons,
  liveMessages,
  liveSessions,
  peerReviews,
  pointEvents,
  profiles,
  settings,
  studyPlans,
  submissions,
  topupRequests,
  units,
  users,
  walletTransactions,
  activityEvents,
  signedLinks,
} from "../drizzle/schema";

// ─── helpers ────────────────────────────────────────────────────────────────

/** db.execute() types differ between the http and tcp drivers; normalise. */
async function rawRows<T>(query: SQL): Promise<T[]> {
  const res = (await db.execute(query)) as unknown as { rows?: T[] } | T[];
  return Array.isArray(res) ? res : (res.rows ?? []);
}

export type BusinessRole = "student" | "owner" | "admin" | "parent";
export function isStaff(role: string | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export class DomainError extends Error {
  code: "BAD_REQUEST" | "CONFLICT" | "FORBIDDEN" | "NOT_FOUND" | "PRECONDITION_FAILED";
  constructor(code: DomainError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

// ─── profiles ───────────────────────────────────────────────────────────────

/**
 * Resolve (and lazily create) the business profile for an account.
 * The very first account created becomes `owner`. `OWNER_EMAIL` (a secret) also
 * pins the owner, so a fresh database with someone else registering first still
 * ends up with the right person in charge.
 */
export async function ensureProfile(userId: string, email: string, name?: string | null) {
  // Read straight from process.env: importing _core/env would make this module
  // require DATABASE_URL at load time, which breaks the unit tests.
  const ownerEmail = (process.env.OWNER_EMAIL ?? "").trim().toLowerCase();
  const pinOwner = ownerEmail !== "" && email.toLowerCase() === ownerEmail;

  const inserted = await rawRows<{ id: string }>(sql`
    insert into profiles (user_id, role, display_name)
    select ${userId}::uuid,
           case
             when ${pinOwner} then 'owner'
             when not exists (select 1 from profiles p where p.role = 'owner') then 'owner'
             else 'student'
           end,
           ${name ?? null}
    on conflict (user_id) do nothing
    returning id
  `);

  if (pinOwner && inserted.length === 0) {
    await rawRows(
      sql`update profiles set role = 'owner' where user_id = ${userId}::uuid and role = 'student'`,
    );
  }

  const [row] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return row;
}

export async function getProfile(userId: string) {
  const [row] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return row ?? null;
}

export async function updateProfile(
  userId: string,
  patch: {
    displayName?: string | null;
    phone?: string | null;
    stage?: string | null;
    gradeKey?: string | null;
    track?: string | null;
    pathway?: string | null;
  },
) {
  const [row] = await db.update(profiles).set(patch).where(eq(profiles.userId, userId)).returning();
  return row;
}

// ─── settings ───────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: Record<string, string> = {
  platform_name: "مدار",
  accent_color: "#3d8bff",
  hero_tagline: "الرياضيات مش حفظ… فهم. من الصفر لحد الامتحان.",
  instapay_handle: "madar@instapay",
  wallet_number: "01000000000",
  support_whatsapp: "201000000000",
  default_term_price: "1200",
  payment_note: "بعد التحويل ارفع صورة الإيصال هنا. الاعتماد بيتم يدويًا في خلال ٢٤ ساعة.",
  // English twins (shown when a visitor switches the site to English; empty = fall back to Arabic).
  platform_name_en: "Madar",
  hero_tagline_en: "Maths isn't memorising, it's understanding. From zero to exam day.",
  payment_note_en: "After you transfer, upload the receipt photo here. Top-ups are approved by hand within 24 hours.",
};

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(settings);
  const out: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export async function setSetting(key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
  return { key, value };
}

// ─── courses / content ──────────────────────────────────────────────────────

export type CourseFilters = {
  stage?: string;
  gradeKey?: string;
  track?: string;
  pathway?: string;
  mathLevel?: string;
  search?: string;
};

export async function listCourses(f: CourseFilters = {}, opts: { includeUnpublished?: boolean } = {}) {
  const where: SQL[] = [];
  if (!opts.includeUnpublished) where.push(eq(courses.isPublished, true));
  if (f.stage) where.push(eq(courses.stage, f.stage));
  if (f.gradeKey) where.push(eq(courses.gradeKey, f.gradeKey));
  if (f.track) where.push(eq(courses.track, f.track));
  if (f.pathway) where.push(eq(courses.pathway, f.pathway));
  if (f.mathLevel) where.push(eq(courses.mathLevel, f.mathLevel));
  if (f.search)
    where.push(
      sql`(${courses.title} ilike ${"%" + f.search + "%"} or coalesce(${courses.description},'') ilike ${"%" + f.search + "%"})`,
    );

  const rows = await db
    .select()
    .from(courses)
    .where(where.length ? and(...where) : undefined)
    .orderBy(asc(courses.sortOrder), asc(courses.createdAt));

  if (rows.length === 0) return [];

  const counts = await db
    .select({ courseId: lessons.courseId, n: sql<number>`count(*)::int` })
    .from(lessons)
    .where(inArray(lessons.courseId, rows.map((r) => r.id)))
    .groupBy(lessons.courseId);
  const byId = new Map(counts.map((c) => [c.courseId, c.n]));

  return rows.map((r) => ({ ...r, lessonCount: byId.get(r.id) ?? 0 }));
}

export async function getCourseBySlug(slug: string) {
  const [row] = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  return row ?? null;
}

export async function getCourseById(id: string) {
  const [row] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return row ?? null;
}

export async function getCourseContent(courseId: string) {
  const [unitRows, lessonRows] = await Promise.all([
    db
      .select()
      .from(units)
      .where(eq(units.courseId, courseId))
      .orderBy(asc(units.sortOrder), asc(units.title)),
    db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, courseId))
      .orderBy(asc(lessons.sortOrder), asc(lessons.title)),
  ]);
  return { units: unitRows, lessons: lessonRows };
}

export async function getLessonWithCourse(lessonId: string) {
  const [row] = await db
    .select({ lesson: lessons, course: courses })
    .from(lessons)
    .innerJoin(courses, eq(lessons.courseId, courses.id))
    .where(eq(lessons.id, lessonId))
    .limit(1);
  return row ?? null;
}

export async function nextSortOrder(courseId: string): Promise<number> {
  const [r] = await rawRows<{ m: number }>(
    sql`select coalesce(max(sort_order), 0) + 10 as m from lessons where course_id = ${courseId}::uuid`,
  );
  return Number(r?.m ?? 10);
}

// ─── enrollments ────────────────────────────────────────────────────────────

export async function listMyEnrollments(userId: string) {
  const rows = await db
    .select({ enrollment: enrollments, course: courses })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.userId, userId))
    .orderBy(desc(enrollments.startsAt));
  return rows.map((r) => ({
    ...r.enrollment,
    course: r.course,
    isActive: r.enrollment.status === "active" && r.enrollment.expiresAt.getTime() > Date.now(),
  }));
}

export async function getActiveEnrollment(userId: string, courseId: string) {
  const [row] = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId),
        eq(enrollments.status, "active"),
        gt(enrollments.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return row ?? null;
}

// ─── wallet ─────────────────────────────────────────────────────────────────

export async function getBalance(userId: string): Promise<number> {
  const [r] = await rawRows<{ b: string | number | null }>(
    sql`select coalesce(sum(amount_egp), 0) as b from wallet_transactions where user_id = ${userId}::uuid`,
  );
  return Number(r?.b ?? 0);
}

export async function listWallet(userId: string, limit = 50) {
  return db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(limit);
}

/**
 * Append a ledger entry. Idempotent on `idempotencyKey`: a second call with the
 * same key inserts nothing and returns null (so approving a request twice can
 * never double-credit).
 */
export async function appendLedger(input: {
  userId: string;
  type: "topup" | "purchase" | "refund" | "adjustment";
  amountEgp: number;
  reference?: string | null;
  idempotencyKey: string;
  note?: string | null;
  /** Reject the write when it would take the balance below zero. */
  requireSufficient?: boolean;
}) {
  const guardSufficient = input.requireSufficient ? sql`and b.balance + ${input.amountEgp} >= 0` : sql``;
  const rows = await rawRows<{ id: string; balance_after: number }>(sql`
    insert into wallet_transactions
      (user_id, type, amount_egp, balance_after, reference, idempotency_key, note)
    select ${input.userId}::uuid,
           ${input.type},
           ${input.amountEgp},
           b.balance + ${input.amountEgp},
           ${input.reference ?? null},
           ${input.idempotencyKey},
           ${input.note ?? null}
    from (select coalesce(sum(amount_egp), 0)::int as balance
            from wallet_transactions where user_id = ${input.userId}::uuid) b
    where not exists (select 1 from wallet_transactions w where w.idempotency_key = ${input.idempotencyKey})
      ${guardSufficient}
    returning id, balance_after
  `);
  return rows[0] ?? null;
}

// ─── top-ups ────────────────────────────────────────────────────────────────

export async function createTopup(input: {
  userId: string;
  amountEgp: number;
  method: "instapay" | "wallet" | "fawry" | "card";
  reference?: string | null;
  receiptUrl?: string | null;
}) {
  const [row] = await db
    .insert(topupRequests)
    .values({
      userId: input.userId,
      amountEgp: input.amountEgp,
      method: input.method,
      reference: input.reference ?? null,
      receiptUrl: input.receiptUrl ?? null,
      status: "pending",
    })
    .returning();
  return row;
}

export async function listMyTopups(userId: string) {
  return db
    .select()
    .from(topupRequests)
    .where(eq(topupRequests.userId, userId))
    .orderBy(desc(topupRequests.createdAt))
    .limit(40);
}

export async function listTopups(status?: "pending" | "approved" | "rejected") {
  const rows = await db
    .select({ request: topupRequests, email: users.email, name: users.name })
    .from(topupRequests)
    .innerJoin(users, eq(topupRequests.userId, users.id))
    .where(status ? eq(topupRequests.status, status) : undefined)
    .orderBy(desc(topupRequests.createdAt))
    .limit(200);
  return rows.map((r) => ({ ...r.request, studentEmail: r.email, studentName: r.name }));
}

/**
 * Approve a manual transfer: flip the request to `approved` AND credit the
 * wallet in ONE statement. The request row is the lock: `status = 'pending'` in
 * the WHERE means two concurrent approvals credit at most once.
 */
export async function approveTopup(requestId: string, reviewerId: string) {
  const rows = await rawRows<{ id: string }>(sql`
    with req as (
      update topup_requests
         set status = 'approved', reviewed_by = ${reviewerId}::uuid, reviewed_at = now()
       where id = ${requestId}::uuid and status = 'pending'
      returning id, user_id, amount_egp
    ),
    led as (
      insert into wallet_transactions
        (user_id, type, amount_egp, balance_after, reference, idempotency_key, note)
      select r.user_id,
             'topup',
             r.amount_egp,
             (select coalesce(sum(amount_egp), 0) from wallet_transactions w where w.user_id = r.user_id) + r.amount_egp,
             r.id::text,
             'topup:' || r.id::text,
             'اعتماد شحن يدوي'
      from req r
      returning id
    )
    select id from req
  `);
  if (rows.length === 0) {
    throw new DomainError("CONFLICT", "الطلب مش في حالة «قيد المراجعة» — يمكن يكون اتعتمد أو اترفض قبل كده.");
  }
  return { ok: true };
}

export async function rejectTopup(requestId: string, reviewerId: string, reason: string) {
  const rows = await rawRows<{ id: string }>(sql`
    update topup_requests
       set status = 'rejected', reviewed_by = ${reviewerId}::uuid, reviewed_at = now(), reject_reason = ${reason}
     where id = ${requestId}::uuid and status = 'pending'
    returning id
  `);
  if (rows.length === 0) {
    throw new DomainError("CONFLICT", "الطلب مش في حالة «قيد المراجعة».");
  }
  return { ok: true };
}

// ─── purchase ───────────────────────────────────────────────────────────────

/**
 * Buy a course with wallet balance — ledger debit + enrollment in ONE statement.
 * Zero ledger rows returned means either another purchase already used this key
 * or the balance was short; we then re-read to say which.
 */
export async function purchaseCourse(userId: string, courseId: string) {
  const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course) throw new DomainError("NOT_FOUND", "الكورس مش موجود.");
  if (!course.isPublished) throw new DomainError("BAD_REQUEST", "الكورس مش متاح للشراء حاليًا.");

  const existing = await getActiveEnrollment(userId, courseId);
  if (existing) throw new DomainError("CONFLICT", "أنت مشترك في الكورس ده بالفعل.");

  const price = course.priceEgp;
  const expiresAt = new Date(Date.now() + course.durationMonths * 30 * 86_400_000);

  if (price <= 0) {
    // Free course: enroll without touching the wallet.
    await db
      .insert(enrollments)
      .values({ userId, courseId, status: "active", expiresAt })
      .onConflictDoUpdate({
        target: [enrollments.userId, enrollments.courseId],
        set: { status: "active", expiresAt },
      });
    return { ok: true, charged: 0 };
  }

  const idem = "purchase:" + userId + ":" + courseId;
  const rows = await rawRows<{ id: string }>(sql`
    with bal as (
      select coalesce(sum(amount_egp), 0)::int as balance
        from wallet_transactions where user_id = ${userId}::uuid
    ),
    led as (
      insert into wallet_transactions
        (user_id, type, amount_egp, balance_after, reference, idempotency_key, note)
      select ${userId}::uuid,
             'purchase',
             ${-price},
             b.balance - ${price},
             ${course.slug},
             ${idem},
             ${course.title}
      from bal b
      where b.balance >= ${price}
        and not exists (select 1 from wallet_transactions w where w.idempotency_key = ${idem})
      returning id
    ),
    enr as (
      insert into enrollments (user_id, course_id, status, expires_at)
      select ${userId}::uuid, ${courseId}::uuid, 'active', ${expiresAt}
      where exists (select 1 from led)
      on conflict (user_id, course_id) do nothing
      returning id
    )
    select id from led
  `);

  if (rows.length === 0) {
    const balance = await getBalance(userId);
    throw new DomainError(
      "PRECONDITION_FAILED",
      `الرصيد مش كافي. محتاج ${price.toLocaleString("ar-EG")} ج.م ورصيدك ${balance.toLocaleString("ar-EG")} ج.م — اشحن الفرق وارجع.`,
    );
  }
  return { ok: true, charged: price };
}

// ─── admin ──────────────────────────────────────────────────────────────────

export async function adminStats() {
  const [r] = await rawRows<{
    students: number;
    published: number;
    drafts: number;
    active_subs: number;
    pending_topups: number;
    revenue: number;
    topups_total: number;
    lessons_count: number;
  }>(sql`
    select
      (select count(*)::int from profiles where role = 'student') as students,
      (select count(*)::int from courses where is_published) as published,
      (select count(*)::int from courses where not is_published) as drafts,
      (select count(*)::int from enrollments where status = 'active' and expires_at > now()) as active_subs,
      (select count(*)::int from topup_requests where status = 'pending') as pending_topups,
      (select coalesce(sum(-amount_egp), 0)::int from wallet_transactions where type = 'purchase') as revenue,
      (select coalesce(sum(amount_egp), 0)::int from wallet_transactions where type = 'topup') as topups_total,
      (select count(*)::int from lessons) as lessons_count
  `);
  return {
    students: Number(r?.students ?? 0),
    published: Number(r?.published ?? 0),
    drafts: Number(r?.drafts ?? 0),
    activeSubscriptions: Number(r?.active_subs ?? 0),
    pendingTopups: Number(r?.pending_topups ?? 0),
    revenueEgp: Number(r?.revenue ?? 0),
    topupsTotalEgp: Number(r?.topups_total ?? 0),
    lessons: Number(r?.lessons_count ?? 0),
  };
}

export async function listStudents() {
  const rows = await rawRows<{
    user_id: string;
    email: string;
    display_name: string | null;
    role: string;
    grade_key: string | null;
    balance: number;
    subs: number;
    joined: string;
  }>(sql`
    select p.user_id, u.email, p.display_name, p.role, p.grade_key,
           coalesce((select sum(amount_egp) from wallet_transactions w where w.user_id = p.user_id), 0)::int as balance,
           (select count(*)::int from enrollments e where e.user_id = p.user_id and e.status = 'active' and e.expires_at > now()) as subs,
           p.created_at::text as joined
      from profiles p
      join users u on u.id = p.user_id
     order by p.created_at desc
     limit 500
  `);
  return rows.map((r) => ({
    userId: r.user_id,
    email: r.email,
    displayName: r.display_name,
    role: r.role,
    gradeKey: r.grade_key,
    balanceEgp: Number(r.balance ?? 0),
    activeSubscriptions: Number(r.subs ?? 0),
    joinedAt: r.joined,
  }));
}

export async function upsertCourse(input: {
  id?: string;
  slug?: string;
  title: string;
  stage: string;
  gradeKey: string;
  track?: string;
  pathway?: string | null;
  mathLevel?: string;
  description?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  priceEgp?: number;
  durationMonths?: number;
  isPublished?: boolean;
  sortOrder?: number;
}) {
  if (input.id) {
    const [row] = await db
      .update(courses)
      .set({
        title: input.title,
        stage: input.stage,
        gradeKey: input.gradeKey,
        track: input.track ?? "general",
        pathway: input.pathway ?? null,
        mathLevel: input.mathLevel ?? "standard",
        description: input.description ?? null,
        posterUrl: input.posterUrl ?? null,
        backdropUrl: input.backdropUrl ?? null,
        priceEgp: input.priceEgp ?? 0,
        durationMonths: input.durationMonths ?? 3,
        isPublished: input.isPublished ?? true,
        sortOrder: input.sortOrder ?? 0,
      })
      .where(eq(courses.id, input.id))
      .returning();
    return row;
  }

  const slug = (input.slug && input.slug.trim()) || slugify(input.title) || `course-${Date.now()}`;
  const [row] = await db
    .insert(courses)
    .values({
      slug,
      title: input.title,
      stage: input.stage,
      gradeKey: input.gradeKey,
      track: input.track ?? "general",
      pathway: input.pathway ?? null,
      mathLevel: input.mathLevel ?? "standard",
      description: input.description ?? null,
      posterUrl: input.posterUrl ?? null,
      backdropUrl: input.backdropUrl ?? null,
      priceEgp: input.priceEgp ?? 0,
      durationMonths: input.durationMonths ?? 3,
      isPublished: input.isPublished ?? true,
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();
  return row;
}

export function slugify(s: string): string {
  const cleaned = s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (cleaned.length >= 2) return cleaned;
  // Fully non-ASCII title: stable short hash so the slug is still URL-safe.
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `course-${h.toString(36)}`;
}

export async function deleteCourse(id: string) {
  await db.delete(courses).where(eq(courses.id, id));
  return { ok: true };
}

export async function createUnit(courseId: string, title: string) {
  const [r] = await rawRows<{ m: number }>(
    sql`select coalesce(max(sort_order), 0) + 10 as m from units where course_id = ${courseId}::uuid`,
  );
  const [row] = await db.insert(units).values({ courseId, title, sortOrder: Number(r?.m ?? 10) }).returning();
  return row;
}

export async function updateUnit(id: string, patch: { title?: string; sortOrder?: number }) {
  const [row] = await db.update(units).set(patch).where(eq(units.id, id)).returning();
  return row;
}

export async function deleteUnit(id: string) {
  await db.delete(units).where(eq(units.id, id));
  return { ok: true };
}

export async function createLesson(input: {
  courseId: string;
  unitId?: string | null;
  title: string;
  summary?: string | null;
  videoUrl?: string | null;
  durationSec?: number;
  isFree?: boolean;
}) {
  const order = await nextSortOrder(input.courseId);
  const [row] = await db
    .insert(lessons)
    .values({
      courseId: input.courseId,
      unitId: input.unitId ?? null,
      title: input.title,
      summary: input.summary ?? null,
      videoUrl: input.videoUrl ?? null,
      durationSec: input.durationSec ?? 0,
      isFree: input.isFree ?? false,
      sortOrder: order,
    })
    .returning();
  return row;
}

export async function updateLesson(
  id: string,
  patch: {
    title?: string;
    summary?: string | null;
    videoUrl?: string | null;
    durationSec?: number;
    isFree?: boolean;
    unitId?: string | null;
    sortOrder?: number;
  },
) {
  const [row] = await db.update(lessons).set(patch).where(eq(lessons.id, id)).returning();
  return row;
}

export async function deleteLesson(id: string) {
  await db.delete(lessons).where(eq(lessons.id, id));
  return { ok: true };
}

// ─── learning progress (trust group) ────────────────────────────────────────
// Watch seconds are banked by the server from heartbeats; the student can
// never mark a lesson done. Completion needs BOTH halves of the rule:
// watched >= 90% of the video AND quiz passed (shared/learning.ts).
import {
  DEVICE_NOTICE_WINDOW_MS,
  QUIZ_FAIL_LOCK_THRESHOLD,
  quizFailOutcome,
  heartbeatSegment,
  mergeWatchSegment,
  coveredSeconds,
  certificateCode,
  isLessonComplete,
  isWatchDone,
  lessonState,
  watchPercent,
} from "../shared/learning";
import { appNotifications, certificates, courseReviews, deviceSessions, lessonProgress, topupCodes, watchEvents } from "../drizzle/schema";

export type LessonProgressRow = typeof lessonProgress.$inferSelect;

export async function getProgressRows(userId: string, lessonIds: string[]): Promise<LessonProgressRow[]> {
  if (lessonIds.length === 0) return [];
  return db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), inArray(lessonProgress.lessonId, lessonIds)));
}

export async function getProgressRow(userId: string, lessonId: string): Promise<LessonProgressRow | null> {
  const [row] = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)))
    .limit(1);
  return row ?? null;
}

/** Public shape the client renders from. */
export function publicProgress(row: LessonProgressRow | null, durationSec: number) {
  const watchedSec = row?.watchedSec ?? 0;
  return {
    watchedSec,
    positionSec: row?.positionSec ?? 0,
    percent: watchPercent(watchedSec, durationSec),
    watchDone: isWatchDone(watchedSec, durationSec),
    quizAttempts: row?.quizAttempts ?? 0,
    quizBestPct: row?.quizBestPct ?? 0,
    quizPassed: Boolean(row?.quizPassed),
    quizLocked: Boolean(row?.quizLocked),
    failsLeft: row?.quizLocked ? 0 : QUIZ_FAIL_LOCK_THRESHOLD - (row?.quizFails ?? 0),
    videoAnswers: parseVideoAnswers(row?.videoAnswers),
    completedAt: row?.completedAt ?? null,
    state: progressState(row, durationSec),
  };
}

function progressState(row: LessonProgressRow | null, durationSec: number) {
  return lessonState(
    { watchedSec: row?.watchedSec ?? 0, quizPassed: Boolean(row?.quizPassed), completed: Boolean(row?.completedAt) },
    durationSec,
  );
}

function parseVideoAnswers(raw: string | null | undefined): string[] {
  try {
    const v: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/**
 * One heartbeat: bank real watched seconds (capped per beat and at the video
 * length — faster "watching" is fake), remember the resume position, and flip
 * completion when the quiz was already passed. Atomic upsert; the returned row
 * is the post-write state.
 */
/** Parse the stored union of watched intervals; corrupt data degrades to none. */
function parseSegments(raw: string | null | undefined): [number, number][] {
  try {
    const v = JSON.parse(raw ?? "[]");
    return Array.isArray(v) ? v.filter((x) => Array.isArray(x) && x.length === 2) : [];
  } catch {
    return [];
  }
}

/**
 * One heartbeat: the beat claims at most MAX_HEARTBEAT_SEC ending at the
 * current position; that stretch is merged into the stored union of watched
 * intervals and the banked total is the union's coverage. Replaying one part
 * of the video, or seeking to the end, banks nothing new — only ground the
 * student actually reached counts toward the 90% rule. The total is also
 * capped at the video length. Completion flips here when the quiz was already
 * passed. Read-modify-write on the (user, lesson) row; the unique index keeps
 * concurrent beats from forking the row.
 */
export async function heartbeatProgress(input: {
  userId: string;
  lesson: { id: string; durationSec: number };
  deltaSec: number;
  positionSec: number;
}): Promise<LessonProgressRow & { gainedSec: number }> {
  const duration = input.lesson.durationSec || 0;
  const pos = Math.max(0, Math.min(input.positionSec || 0, duration > 0 ? duration : 0));
  const [from, to] = heartbeatSegment(pos, input.deltaSec || 0, duration);
  const existing = await getProgressRow(input.userId, input.lesson.id);
  const beforeWatchedSec = existing?.watchedSec ?? 0;
  const wasWatchDone = isWatchDone(existing?.watchedSec ?? 0, duration);
  const segments = mergeWatchSegment(parseSegments(existing?.segments), from, to);
  const banked = coveredSeconds(segments);
  const watchedSec = duration > 0 ? Math.min(banked, duration) : banked;
  let row: LessonProgressRow;
  if (existing) {
    const [updated] = await db
      .update(lessonProgress)
      .set({
        watchedSec,
        positionSec: pos,
        maxPositionSec: Math.max(existing.maxPositionSec, pos),
        segments: JSON.stringify(segments),
        updatedAt: new Date(),
      })
      .where(eq(lessonProgress.id, existing.id))
      .returning();
    if (!updated) throw new DomainError("BAD_REQUEST", "heartbeat failed");
    row = updated;
  } else {
    const [inserted] = await db
      .insert(lessonProgress)
      .values({
        userId: input.userId,
        lessonId: input.lesson.id,
        watchedSec,
        positionSec: pos,
        maxPositionSec: pos,
        segments: JSON.stringify(segments),
      })
      .returning();
    if (!inserted) throw new DomainError("BAD_REQUEST", "heartbeat failed");
    row = inserted;
  }
  if (!row.completedAt && isLessonComplete(row.watchedSec, duration, Boolean(row.quizPassed))) {
    const [done] = await db
      .update(lessonProgress)
      .set({ completedAt: new Date() })
      .where(and(eq(lessonProgress.id, row.id), sql`${lessonProgress.completedAt} is null`))
      .returning();
    if (done) {
      row = done;
      await logActivity(input.userId, "lesson_complete", { lessonId: input.lesson.id });
    }
  }
  // Feature 12: the moment the lesson is actually watched through.
  if (!wasWatchDone && isWatchDone(row.watchedSec, duration)) {
    await logActivity(input.userId, "watch_done", { lessonId: input.lesson.id, detail: `${Math.round(row.watchedSec)}` });
  }
  // Feature 7: re-watching to 90% after a lock reopens the quiz.
  if (row.quizLocked && isWatchDone(row.watchedSec, duration)) {
    const [unlocked] = await db
      .update(lessonProgress)
      .set({ quizLocked: false })
      .where(eq(lessonProgress.id, row.id))
      .returning();
    if (unlocked) {
      row = unlocked;
      await logActivity(input.userId, "quiz_unlock", { lessonId: input.lesson.id });
    }
  }
  return { ...row, gainedSec: Math.max(0, row.watchedSec - beforeWatchedSec) };
}

/** Record a quiz attempt; on a pass, flip quizPassed and completion when the watch rule is already met.
 *  Feature 7: QUIZ_FAIL_LOCK_THRESHOLD consecutive failures lock the quiz and
 *  revoke the stored watch coverage, so the student must re-watch the lesson
 *  before the next attempt. A pass clears both counters. */
export async function recordQuizResult(input: {
  userId: string;
  lesson: { id: string; durationSec: number };
  pct: number;
  passed: boolean;
}): Promise<LessonProgressRow & { lockedNow: boolean; failsLeft: number }> {
  const existing = await getProgressRow(input.userId, input.lesson.id);
  if (!isWatchDone(existing?.watchedSec ?? 0, input.lesson.durationSec)) {
    throw new DomainError("PRECONDITION_FAILED", "كمّل مشاهدة الدرس الأول — الكويز بيفتح بعد ما تتفرج على ٩٠٪ من الفيديو.");
  }
  const best = Math.max(existing?.quizBestPct ?? 0, input.pct);
  const passed = (existing?.quizPassed ?? false) || input.passed;
  const complete = isLessonComplete(existing?.watchedSec ?? 0, input.lesson.durationSec, passed);
  const out = input.passed ? { locked: false, fails: 0, failsLeft: QUIZ_FAIL_LOCK_THRESHOLD } : quizFailOutcome((existing?.quizFails ?? 0) + 1);
  // On lock: wipe the banked watch state — the 90% gate then demands a re-watch.
  const lockPatch = out.locked
    ? { quizLocked: true, quizFails: 0, watchedSec: 0, positionSec: 0, maxPositionSec: 0, segments: "[]" }
    : { quizLocked: false, quizFails: out.fails };
  const [row] = await db
    .insert(lessonProgress)
    .values({
      userId: input.userId,
      lessonId: input.lesson.id,
      quizAttempts: 1,
      quizBestPct: input.pct,
      quizPassed: input.passed,
      ...lockPatch,
      completedAt: complete ? new Date() : null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        quizAttempts: (existing?.quizAttempts ?? 0) + 1,
        quizBestPct: best,
        quizPassed: passed,
        ...lockPatch,
        completedAt: existing?.completedAt ?? (complete ? new Date() : null),
        updatedAt: new Date(),
      },
    })
    .returning();
  await logActivity(input.userId, input.passed ? "quiz_pass" : "quiz_fail", { lessonId: input.lesson.id, detail: `${input.pct}` });
  if (out.locked) await logActivity(input.userId, "quiz_lock", { lessonId: input.lesson.id });
  return { ...row, lockedNow: out.locked, failsLeft: row.quizLocked ? 0 : QUIZ_FAIL_LOCK_THRESHOLD - row.quizFails };
}

/** Mark an in-video question as correctly answered (wrong answers are not recorded — the gate re-asks). */
export async function recordVideoAnswer(userId: string, lessonId: string, questionId: string): Promise<string[]> {
  const existing = await getProgressRow(userId, lessonId);
  const answered = new Set(parseVideoAnswers(existing?.videoAnswers));
  answered.add(questionId);
  const next = JSON.stringify([...answered]);
  await db
    .insert(lessonProgress)
    .values({ userId, lessonId, videoAnswers: next, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: { videoAnswers: next, updatedAt: new Date() },
    });
  return [...answered];
}

/** Issue the course certificate once every lesson is complete. Idempotent on (user, course). */
export async function issueCertificateIfComplete(userId: string, courseId: string) {
  const { lessons: courseLessons } = await getCourseContent(courseId);
  if (courseLessons.length === 0) return null;
  const rows = await getProgressRows(userId, courseLessons.map((l) => l.id));
  const byLesson = new Map(rows.map((r) => [r.lessonId, r]));
  const allDone = courseLessons.every((l) => progressState(byLesson.get(l.id) ?? null, l.durationSec) === "completed");
  if (!allDone) return null;
  const id = crypto.randomUUID();
  const [row] = await db
    .insert(certificates)
    .values({ id, userId, courseId, code: certificateCode(id) })
    .onConflictDoNothing({ target: [certificates.userId, certificates.courseId] })
    .returning();
  if (row) return row;
  const [existing] = await db
    .select()
    .from(certificates)
    .where(and(eq(certificates.userId, userId), eq(certificates.courseId, courseId)))
    .limit(1);
  return existing ?? null;
}

export type CertificateRow = typeof certificates.$inferSelect;

export async function publicCertificate(row: CertificateRow) {
  const [course, profileRows] = await Promise.all([
    getCourseById(row.courseId),
    db.select({ displayName: profiles.displayName }).from(profiles).where(eq(profiles.userId, row.userId)).limit(1),
  ]);
  const [userRow] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, row.userId)).limit(1);
  return {
    code: row.code,
    issuedAt: row.issuedAt,
    studentName: profileRows[0]?.displayName ?? userRow?.name ?? userRow?.email ?? "",
    courseTitle: course?.title ?? "",
    courseSlug: course?.slug ?? "",
  };
}

export async function listCertificates(userId: string) {
  const rows = await db
    .select()
    .from(certificates)
    .where(eq(certificates.userId, userId))
    .orderBy(desc(certificates.issuedAt));
  return Promise.all(rows.map(publicCertificate));
}

export async function getCertificateByCode(code: string) {
  const [row] = await db.select().from(certificates).where(eq(certificates.code, code)).limit(1);
  return row ? publicCertificate(row) : null;
}

/** Register this device; true when ANOTHER device used the account inside the notice window. */
export async function beatDevice(userId: string, deviceId: string): Promise<boolean> {
  await db
    .insert(deviceSessions)
    .values({ userId, deviceId, lastSeenAt: new Date() })
    .onConflictDoUpdate({
      target: [deviceSessions.userId, deviceSessions.deviceId],
      set: { lastSeenAt: new Date() },
    });
  const cutoff = new Date(Date.now() - DEVICE_NOTICE_WINDOW_MS);
  const [other] = await db
    .select({ id: deviceSessions.id })
    .from(deviceSessions)
    .where(
      and(
        eq(deviceSessions.userId, userId),
        gt(deviceSessions.lastSeenAt, cutoff),
        sql`${deviceSessions.deviceId} <> ${deviceId}`,
      ),
    )
    .limit(1);
  return Boolean(other);
}

/** Resume points: every course the student touched and can still open, latest first. */
export async function listResume(userId: string, staff: boolean) {
  const rows = await db
    .select({ progress: lessonProgress, lesson: lessons, course: courses })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
    .innerJoin(courses, eq(lessons.courseId, courses.id))
    .where(eq(lessonProgress.userId, userId))
    .orderBy(desc(lessonProgress.updatedAt));
  const byCourse = new Map<string, typeof rows>();
  for (const r of rows) {
    const list = byCourse.get(r.course.id) ?? [];
    list.push(r);
    byCourse.set(r.course.id, list);
  }
  const out = [];
  for (const list of byCourse.values()) {
    const pick = list.find((r) => !r.progress.completedAt) ?? list[0];
    if (!pick) continue;
    const canOpen = staff || pick.lesson.isFree || Boolean(await getActiveEnrollment(userId, pick.course.id));
    if (!canOpen) continue;
    out.push({
      slug: pick.course.slug,
      courseTitle: pick.course.title,
      posterUrl: pick.course.posterUrl,
      lessonId: pick.lesson.id,
      lessonTitle: pick.lesson.title,
      positionSec: pick.progress.positionSec,
      percent: watchPercent(pick.progress.watchedSec, pick.lesson.durationSec),
      updatedAt: pick.progress.updatedAt,
    });
  }
  return out;
}

/** The student's dashboard: honest totals + per-course lesson states. */
export async function learningDashboard(userId: string) {
  const enrollmentsRows = await listMyEnrollments(userId);
  const mine = await db.select().from(lessonProgress).where(eq(lessonProgress.userId, userId));
  const byLesson = new Map(mine.map((r) => [r.lessonId, r]));
  const courseRows = [];
  for (const e of enrollmentsRows) {
    const { units: courseUnits, lessons: courseLessons } = await getCourseContent(e.courseId);
    const states = courseLessons.map((l) => {
      const p = byLesson.get(l.id) ?? null;
      return {
        id: l.id,
        unitId: l.unitId,
        title: l.title,
        durationSec: l.durationSec,
        isFree: l.isFree,
        state: progressState(p, l.durationSec),
        percent: watchPercent(p?.watchedSec ?? 0, l.durationSec),
        quizBestPct: p?.quizBestPct ?? 0,
        quizAttempts: p?.quizAttempts ?? 0,
      };
    });
    const done = states.filter((l) => l.state === "completed").length;
    courseRows.push({
      course: e.course,
      isActive: e.isActive,
      expiresAt: e.expiresAt,
      units: courseUnits.map((u) => ({ id: u.id, title: u.title })),
      lessons: states,
      doneCount: done,
      totalCount: courseLessons.length,
      pct: courseLessons.length > 0 ? Math.round((done / courseLessons.length) * 100) : 0,
    });
  }
  const scored = mine.filter((p) => p.quizAttempts > 0);
  const [certCount] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(certificates)
    .where(eq(certificates.userId, userId));
  return {
    totals: {
      watchedSec: mine.reduce((a, p) => a + p.watchedSec, 0),
      completedLessons: mine.filter((p) => p.completedAt).length,
      quizAvgPct: scored.length > 0 ? Math.round(scored.reduce((a, p) => a + p.quizBestPct, 0) / scored.length) : 0,
      certificates: certCount?.n ?? 0,
    },
    courses: courseRows,
  };
}

// ─── AI group (features 38–45) ──────────────────────────────────────────────
// State for the deterministic local AI engine in shared/ai.ts.

export async function listAiMessages(userId: string, lessonId: string, limit = 30) {
  const rows = await db
    .select()
    .from(aiMessages)
    .where(and(eq(aiMessages.userId, userId), eq(aiMessages.lessonId, lessonId)))
    .orderBy(desc(aiMessages.createdAt))
    .limit(limit);
  return rows.reverse().map((m) => ({ role: m.role, text: m.text, createdAt: m.createdAt }));
}

export async function saveAiMessage(userId: string, lessonId: string, role: "user" | "assistant", text: string) {
  await db.insert(aiMessages).values({ userId, lessonId, role, text });
}

export async function createPracticeAttempt(userId: string, lessonId: string, questionsJson: string) {
  const [max] = await db
    .select({ n: sql<number>`coalesce(max(${aiPracticeAttempts.attemptNo}), 0)::int` })
    .from(aiPracticeAttempts)
    .where(and(eq(aiPracticeAttempts.userId, userId), eq(aiPracticeAttempts.lessonId, lessonId)));
  const attemptNo = (max?.n ?? 0) + 1;
  const [row] = await db
    .insert(aiPracticeAttempts)
    .values({ userId, lessonId, attemptNo, questions: questionsJson })
    .returning();
  return row;
}

export async function getPracticeAttempt(id: string, userId: string) {
  const [row] = await db
    .select()
    .from(aiPracticeAttempts)
    .where(and(eq(aiPracticeAttempts.id, id), eq(aiPracticeAttempts.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function finishPracticeAttempt(id: string, answersJson: string, pct: number) {
  await db.update(aiPracticeAttempts).set({ answers: answersJson, pct }).where(eq(aiPracticeAttempts.id, id));
}

export async function saveEssay(userId: string, lessonId: string, text: string, pct: number, passed: boolean) {
  await db.insert(aiEssays).values({ userId, lessonId, text, pct, passed });
}

export async function createAdaptiveSession(userId: string, lessonId: string, seed: string, stateJson: string) {
  const [row] = await db
    .insert(aiAdaptiveSessions)
    .values({ userId, lessonId, seed, state: stateJson })
    .returning();
  return row;
}

export async function getAdaptiveSession(id: string, userId: string) {
  const [row] = await db
    .select()
    .from(aiAdaptiveSessions)
    .where(and(eq(aiAdaptiveSessions.id, id), eq(aiAdaptiveSessions.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function updateAdaptiveSession(id: string, stateJson: string, done: boolean) {
  await db
    .update(aiAdaptiveSessions)
    .set({ state: stateJson, done, updatedAt: new Date() })
    .where(eq(aiAdaptiveSessions.id, id));
}

export async function getStudyPlan(userId: string) {
  const [row] = await db.select().from(studyPlans).where(eq(studyPlans.userId, userId)).limit(1);
  if (!row) return null;
  return { examDate: row.examDate, days: JSON.parse(row.plan), updatedAt: row.updatedAt };
}

export async function upsertStudyPlan(userId: string, examDate: string | null, planJson: string) {
  const existing = await getStudyPlan(userId);
  if (existing) {
    await db.update(studyPlans).set({ examDate, plan: planJson, updatedAt: new Date() }).where(eq(studyPlans.userId, userId));
  } else {
    await db.insert(studyPlans).values({ userId, examDate, plan: planJson });
  }
}

export async function nextPracticeAttemptNo(userId: string, lessonId: string): Promise<number> {
  const [max] = await db
    .select({ n: sql<number>`coalesce(max(${aiPracticeAttempts.attemptNo}), 0)::int` })
    .from(aiPracticeAttempts)
    .where(and(eq(aiPracticeAttempts.userId, userId), eq(aiPracticeAttempts.lessonId, lessonId)));
  return (max?.n ?? 0) + 1;
}

// ─── Motivation & engagement group (features 30–35, 37) ─────────────────────
// Rules in shared/gamify.ts; these functions are its Postgres-backed state.

export async function awardPoints(userId: string, kind: string, points: number, ref?: string) {
  // (userId, kind, ref) is unique; a replayed action never pays twice.
  await db
    .insert(pointEvents)
    .values({ userId, kind, points, ref: ref ?? null })
    .onConflictDoNothing({ target: [pointEvents.userId, pointEvents.kind, pointEvents.ref] });
}

export async function listPointEvents(userId: string) {
  return db.select().from(pointEvents).where(eq(pointEvents.userId, userId)).orderBy(asc(pointEvents.at));
}

export async function getGamifyFlags(userId: string) {
  const [row] = await db.select().from(gamifyFlags).where(eq(gamifyFlags.userId, userId));
  if (row) return row;
  const [created] = await db
    .insert(gamifyFlags)
    .values({ userId })
    .onConflictDoNothing({ target: [gamifyFlags.userId] })
    .returning();
  return created ?? (await db.select().from(gamifyFlags).where(eq(gamifyFlags.userId, userId)))[0];
}

export async function setGamifyFlags(userId: string, patch: { hideLeaderboard?: boolean; goalMinutes?: number; weeklyGoalMinutes?: number }) {
  await getGamifyFlags(userId);
  await db.update(gamifyFlags).set(patch).where(eq(gamifyFlags.userId, userId));
}

export async function getDailyGoalRow(userId: string, day: string, goalMinutes: number) {
  const [row] = await db.select().from(dailyGoals).where(and(eq(dailyGoals.userId, userId), eq(dailyGoals.day, day)));
  if (row) return row;
  const [created] = await db
    .insert(dailyGoals)
    .values({ userId, day, goalMinutes })
    .onConflictDoNothing({ target: [dailyGoals.userId, dailyGoals.day] })
    .returning();
  return created ?? (await db.select().from(dailyGoals).where(and(eq(dailyGoals.userId, userId), eq(dailyGoals.day, day))))[0];
}

export async function addDailyGoalMinutes(userId: string, day: string, addMinutes: number) {
  await db
    .update(dailyGoals)
    .set({ minutes: sql`${dailyGoals.minutes} + ${addMinutes}` })
    .where(and(eq(dailyGoals.userId, userId), eq(dailyGoals.day, day)));
}

export async function markDailyGoalAwarded(userId: string, day: string) {
  await db
    .update(dailyGoals)
    .set({ awardedAt: new Date() })
    .where(and(eq(dailyGoals.userId, userId), eq(dailyGoals.day, day)));
}

export async function listDailyGoalRows(userId: string) {
  return db.select().from(dailyGoals).where(eq(dailyGoals.userId, userId));
}

export async function listDailyGoalWeek(userId: string, days: string[]) {
  return db.select().from(dailyGoals).where(and(eq(dailyGoals.userId, userId), inArray(dailyGoals.day, days)));
}

export async function listCohortWeeklyPoints(gradeKey: string, since: Date) {
  const cohort = await db.select().from(profiles).where(and(eq(profiles.role, "student"), eq(profiles.gradeKey, gradeKey)));
  const out: { userId: string; name: string; points: number }[] = [];
  for (const p of cohort) {
    const flags = await getGamifyFlags(p.userId);
    if (flags.hideLeaderboard) continue;
    const rows = await db
      .select({ points: pointEvents.points })
      .from(pointEvents)
      .where(and(eq(pointEvents.userId, p.userId), gt(pointEvents.at, since)));
    out.push({ userId: p.userId, name: p.displayName ?? "طالب", points: rows.reduce((s, r) => s + r.points, 0) });
  }
  return out;
}

export async function createDiscussionPost(userId: string, lessonId: string, text: string) {
  const [row] = await db.insert(discussionPosts).values({ userId, lessonId, text }).returning();
  return row;
}

export async function listDiscussion(lessonId: string) {
  const posts = await db.select().from(discussionPosts).where(eq(discussionPosts.lessonId, lessonId)).orderBy(desc(discussionPosts.createdAt));
  const replies = await db
    .select()
    .from(discussionReplies)
    .where(inArray(discussionReplies.postId, posts.length ? posts.map((p) => p.id) : ["00000000-0000-0000-0000-000000000000"]))
    .orderBy(asc(discussionReplies.createdAt));
  const authorIds = [...new Set([...posts.map((p) => p.userId), ...replies.map((r) => r.userId)])];
  const authorRows = authorIds.length
    ? await db.select().from(profiles).where(inArray(profiles.userId, authorIds))
    : [];
  const nameOf = (id: string) => authorRows.find((p) => p.userId === id)?.displayName ?? "طالب";
  const roleOf = (id: string) => authorRows.find((p) => p.userId === id)?.role ?? "student";
  return posts.map((p) => ({
    id: p.id,
    authorName: nameOf(p.userId),
    authorRole: roleOf(p.userId),
    userId: p.userId,
    text: p.text,
    createdAt: p.createdAt,
    replies: replies
      .filter((r) => r.postId === p.id)
      .map((r) => ({ id: r.id, authorName: nameOf(r.userId), authorRole: roleOf(r.userId), userId: r.userId, text: r.text, createdAt: r.createdAt })),
  }));
}

export async function createDiscussionReply(userId: string, postId: string, text: string) {
  const [post] = await db.select().from(discussionPosts).where(eq(discussionPosts.id, postId));
  if (!post) return null;
  const [row] = await db.insert(discussionReplies).values({ postId, userId, text }).returning();
  return { post, row };
}

export async function listLiveSessions(courseId?: string) {
  const rows = courseId
    ? await db.select().from(liveSessions).where(eq(liveSessions.courseId, courseId)).orderBy(desc(liveSessions.startsAt))
    : await db.select().from(liveSessions).orderBy(desc(liveSessions.startsAt));
  return rows;
}

export async function getLiveSession(id: string) {
  const [row] = await db.select().from(liveSessions).where(eq(liveSessions.id, id));
  return row ?? null;
}

export async function listLiveMessages(sessionId: string) {
  const rows = await db.select().from(liveMessages).where(eq(liveMessages.sessionId, sessionId)).orderBy(asc(liveMessages.createdAt));
  const authorIds = [...new Set(rows.map((m) => m.userId))];
  const authorRows = authorIds.length ? await db.select().from(profiles).where(inArray(profiles.userId, authorIds)) : [];
  const nameOf = (id: string) => authorRows.find((p) => p.userId === id)?.displayName ?? "طالب";
  return rows.map((m) => ({ id: m.id, userId: m.userId, authorName: nameOf(m.userId), text: m.text, createdAt: m.createdAt }));
}

export async function addLiveMessage(sessionId: string, userId: string, text: string) {
  await db.insert(liveMessages).values({ sessionId, userId, text });
}

export async function listChallengesFor(userId: string) {
  const rows = await db.select().from(challenges).orderBy(desc(challenges.createdAt));
  return rows.filter((c) => (JSON.parse(c.players) as { userId: string }[]).some((p) => p.userId === userId));
}

export async function getChallenge(id: string) {
  const [row] = await db.select().from(challenges).where(eq(challenges.id, id));
  return row ?? null;
}

export async function createChallenge(lessonId: string, createdBy: string, playersJson: string) {
  const [row] = await db.insert(challenges).values({ lessonId, createdBy, players: playersJson }).returning();
  return row;
}

export async function updateChallengePlayers(id: string, playersJson: string) {
  await db.update(challenges).set({ players: playersJson }).where(eq(challenges.id, id));
}

export async function getAssignmentForLesson(lessonId: string) {
  const [row] = await db.select().from(assignments).where(eq(assignments.lessonId, lessonId));
  return row ?? null;
}

export async function listSubmissions(assignmentId: string) {
  const rows = await db.select().from(submissions).where(eq(submissions.assignmentId, assignmentId)).orderBy(asc(submissions.createdAt));
  const authorIds = [...new Set(rows.map((x) => x.userId))];
  const authorRows = authorIds.length ? await db.select().from(profiles).where(inArray(profiles.userId, authorIds)) : [];
  const nameOf = (id: string) => authorRows.find((p) => p.userId === id)?.displayName ?? "طالب";
  return rows.map((x) => ({ ...x, authorName: nameOf(x.userId) }));
}

export async function createSubmission(assignmentId: string, userId: string, text: string) {
  const [row] = await db
    .insert(submissions)
    .values({ assignmentId, userId, text })
    .onConflictDoNothing({ target: [submissions.assignmentId, submissions.userId] })
    .returning();
  return row ?? null;
}

export async function getSubmission(id: string) {
  const [row] = await db.select().from(submissions).where(eq(submissions.id, id));
  return row ?? null;
}

export async function listReviewsFor(submissionId: string) {
  return db.select().from(peerReviews).where(eq(peerReviews.submissionId, submissionId));
}

export async function listReviewsBy(reviewerId: string) {
  return db.select().from(peerReviews).where(eq(peerReviews.reviewerId, reviewerId));
}

export async function createPeerReview(submissionId: string, reviewerId: string, scoresJson: string, note: string) {
  const [row] = await db
    .insert(peerReviews)
    .values({ submissionId, reviewerId, scores: scoresJson, note })
    .onConflictDoNothing({ target: [peerReviews.submissionId, peerReviews.reviewerId] })
    .returning();
  return row ?? null;
}

export async function listCohortDiscussionCount(userId: string) {
  const rows = await db.select({ id: discussionPosts.id }).from(discussionPosts).where(eq(discussionPosts.userId, userId));
  return rows.length;
}

// ── Platform & admin group (features 46–50) ──────────────────────────────────

export async function getTopupCode(code: string) {
  const [row] = await db.select().from(topupCodes).where(eq(topupCodes.code, code));
  return row ?? null;
}

export async function markTopupCodeUsed(id: string, userId: string) {
  await db.update(topupCodes).set({ usedBy: userId, usedAt: new Date() }).where(eq(topupCodes.id, id));
}

export async function insertTopupCodes(rows: { code: string; valueEgp: number; createdBy: string }[]) {
  await db.insert(topupCodes).values(rows);
}

export async function listTopupCodes(limit = 100) {
  return db.select().from(topupCodes).orderBy(desc(topupCodes.createdAt)).limit(limit);
}

export async function listNotifications(userId: string, limit = 30) {
  return db.select().from(appNotifications).where(eq(appNotifications.userId, userId)).orderBy(desc(appNotifications.createdAt)).limit(limit);
}

export async function insertNotificationsIgnoreDupes(rows: { id: string; userId: string; kind: string; title: string; body: string; ref?: string | null }[]) {
  if (!rows.length) return;
  await db.insert(appNotifications).values(rows).onConflictDoNothing({ target: appNotifications.id });
}

export async function markNotificationRead(id: string, userId: string) {
  await db.update(appNotifications).set({ readAt: new Date() }).where(and(eq(appNotifications.id, id), eq(appNotifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: string) {
  await db.update(appNotifications).set({ readAt: new Date() }).where(and(eq(appNotifications.userId, userId), sql`${appNotifications.readAt} is null`));
}

export async function listCourseReviews(courseId: string, limit = 50) {
  return db.select().from(courseReviews).where(eq(courseReviews.courseId, courseId)).orderBy(desc(courseReviews.createdAt)).limit(limit);
}

export async function upsertCourseReview(courseId: string, userId: string, rating: number, text: string) {
  await db
    .insert(courseReviews)
    .values({ courseId, userId, rating, text })
    .onConflictDoUpdate({ target: [courseReviews.courseId, courseReviews.userId], set: { rating, text } });
}

export async function insertLesson(row: { courseId: string; unitId: string | null; title: string; summary: string; videoUrl: string; durationSec: number; isFree: boolean; sortOrder: number; pdfUrl?: string | null; vttUrl?: string | null }) {
  const [created] = await db.insert(lessons).values(row).returning();
  return created;
}

export async function listLessonNotes(userId: string, lessonId: string) {
  return db.select().from(lessonNotes).where(and(eq(lessonNotes.userId, userId), eq(lessonNotes.lessonId, lessonId))).orderBy(asc(lessonNotes.second));
}

export async function insertLessonNote(row: { userId: string; lessonId: string; second: number; text: string }) {
  const [created] = await db.insert(lessonNotes).values(row).returning();
  return created;
}

export async function deleteLessonNote(userId: string, id: string) {
  const res = await db.delete(lessonNotes).where(and(eq(lessonNotes.id, id), eq(lessonNotes.userId, userId))).returning({ id: lessonNotes.id });
  return res.length > 0;
}

export async function maxLessonSortOrder(courseId: string, unitId: string | null) {
  const rows = await db.select({ sortOrder: lessons.sortOrder }).from(lessons).where(and(eq(lessons.courseId, courseId), unitId ? eq(lessons.unitId, unitId) : sql`${lessons.unitId} is null`));
  return rows.reduce((m, r) => Math.max(m, r.sortOrder ?? 0), 0);
}

export async function insertCourse(row: { slug: string; title: string; description: string; stage: string; gradeKey: string; priceEgp: number; isPublished: boolean }) {
  const [created] = await db.insert(courses).values(row).returning();
  return created;
}

export async function walletBalance(userId: string) {
  const rows = await db.select({ amountEgp: walletTransactions.amountEgp }).from(walletTransactions).where(eq(walletTransactions.userId, userId));
  return rows.reduce((a, r) => a + r.amountEgp, 0);
}

export async function creditWallet(userId: string, amountEgp: number, reference: string, note: string) {
  const existing = await db.select({ id: walletTransactions.id }).from(walletTransactions).where(eq(walletTransactions.idempotencyKey, reference)).limit(1);
  if (existing.length) return; // idempotent
  const balance = await walletBalance(userId);
  await db.insert(walletTransactions).values({ userId, type: "topup", amountEgp, balanceAfter: balance + amountEgp, reference, idempotencyKey: reference, note });
}

export async function listActiveEnrollments(userId: string) {
  const rows = await db
    .select({ enrollment: enrollments, courseTitle: courses.title })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(and(eq(enrollments.userId, userId), eq(enrollments.status, "active"), gt(enrollments.expiresAt, new Date())));
  return rows.map((r) => ({ courseId: r.enrollment.courseId, courseTitle: r.courseTitle, expiresAt: r.enrollment.expiresAt }));
}

export async function isStaffUser(userId: string) {
  const p = await getProfile(userId);
  return p ? isStaff(p.role) : false;
}

export async function activeEnrollment(userId: string, courseId: string) {
  return Boolean(await getActiveEnrollment(userId, courseId));
}

export async function searchCatalogData() {
  const [cs, ls, ts] = await Promise.all([
    db.select({ id: courses.id, slug: courses.slug, title: courses.title, description: courses.description, stage: courses.stage }).from(courses).where(eq(courses.isPublished, true)),
    db.select({ id: lessons.id, courseId: lessons.courseId, title: lessons.title }).from(lessons),
    db.select({ userId: profiles.userId, displayName: profiles.displayName }).from(profiles).where(inArray(profiles.role, ["owner", "teacher"])),
  ]);
  return { courses: cs.map((c) => ({ ...c, description: c.description ?? "" })), lessons: ls, teachers: ts.map((t) => ({ userId: t.userId, displayName: t.displayName ?? "مدرس" })) };
}

// ── Analytics group (features 13–20) ─────────────────────────────────────────

export async function insertWatchEvent(row: { userId: string; lessonId: string; second: number; kind: string; gainedSec: number }) {
  await db.insert(watchEvents).values(row);
}

export async function listWatchEventsForLesson(lessonId: string) {
  return db.select().from(watchEvents).where(eq(watchEvents.lessonId, lessonId));
}

export async function listWatchEventsForUser(userId: string, since?: Date) {
  if (!since) return db.select().from(watchEvents).where(eq(watchEvents.userId, userId));
  return db.select().from(watchEvents).where(and(eq(watchEvents.userId, userId), gt(watchEvents.at, since)));
}

export async function cohortWeeklyPointTotals(gradeKey: string, since: Date, excludeUserId: string) {
  const rows = await db
    .select({ userId: pointEvents.userId, points: pointEvents.points, at: pointEvents.at, gradeKey: profiles.gradeKey })
    .from(pointEvents)
    .innerJoin(profiles, eq(profiles.userId, pointEvents.userId))
    .where(and(eq(profiles.gradeKey, gradeKey), gt(pointEvents.at, since)));
  const totals = new Map<string, number>();
  for (const r of rows) {
    if (r.userId === excludeUserId) continue;
    totals.set(r.userId, (totals.get(r.userId) ?? 0) + r.points);
  }
  return [...totals.values()];
}

export async function listAllWalletRows() {
  return db.select({ type: walletTransactions.type, amountEgp: walletTransactions.amountEgp, reference: walletTransactions.reference }).from(walletTransactions);
}

export async function listAllEnrollments() {
  // No renewedAt column: a repeat enrollment by the same user in the same
  // course counts as a renewal.
  return db.select({ status: enrollments.status, courseId: enrollments.courseId, userId: enrollments.userId }).from(enrollments);
}

export async function listProgressForUser(userId: string) {
  const rows = await db
    .select({
      lessonTitle: lessons.title,
      durationSec: lessons.durationSec,
      watchedSec: lessonProgress.watchedSec,
      quizBestPct: lessonProgress.quizBestPct,
      completedAt: lessonProgress.completedAt,
    })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
    .where(eq(lessonProgress.userId, userId));
  return rows;
}

// ─── activity log (feature 12) ──────────────────────────────────────────────

/** Append one row to the activity log. The log is append-only by design. */
export async function logActivity(
  userId: string,
  kind: string,
  extra: { lessonId?: string | null; courseId?: string | null; detail?: string | null } = {},
): Promise<void> {
  await db.insert(activityEvents).values({
    userId,
    kind,
    lessonId: extra.lessonId ?? null,
    courseId: extra.courseId ?? null,
    detail: extra.detail ?? null,
  });
}

/** Staff view: newest first, joined with the student's display name and lesson/course titles. */
export async function listActivityEvents(opts: { userId?: string; limit?: number } = {}) {
  const limit = Math.min(Math.max(opts.limit ?? 200, 1), 500);
  const rows = await db
    .select({
      id: activityEvents.id,
      kind: activityEvents.kind,
      at: activityEvents.at,
      detail: activityEvents.detail,
      lessonId: activityEvents.lessonId,
      courseId: activityEvents.courseId,
      studentName: profiles.displayName,
      studentEmail: users.email,
      lessonTitle: lessons.title,
      courseTitle: courses.title,
    })
    .from(activityEvents)
    .innerJoin(users, eq(users.id, activityEvents.userId))
    .leftJoin(profiles, eq(profiles.userId, activityEvents.userId))
    .leftJoin(lessons, eq(lessons.id, activityEvents.lessonId))
    .leftJoin(courses, eq(courses.id, activityEvents.courseId))
    .where(opts.userId ? eq(activityEvents.userId, opts.userId) : undefined)
    .orderBy(desc(activityEvents.at))
    .limit(limit);
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    at: r.at,
    detail: r.detail,
    studentName: r.studentName ?? r.studentEmail,
    lessonTitle: r.lessonTitle,
    courseTitle: r.courseTitle,
  }));
}

// ─── temporary signed video links (feature 11) ──────────────────────────────

export async function createSignedLink(input: { jti: string; token: string; lessonId: string; createdBy: string; expiresAt: Date }) {
  const [row] = await db.insert(signedLinks).values(input).returning();
  return row;
}

export async function getSignedLinkByJti(jti: string) {
  const [row] = await db.select().from(signedLinks).where(eq(signedLinks.jti, jti)).limit(1);
  return row ?? null;
}

export async function listSignedLinks(limit = 50) {
  const rows = await db
    .select({
      id: signedLinks.id,
      jti: signedLinks.jti,
      token: signedLinks.token,
      expiresAt: signedLinks.expiresAt,
      revokedAt: signedLinks.revokedAt,
      createdAt: signedLinks.createdAt,
      lessonTitle: lessons.title,
    })
    .from(signedLinks)
    .innerJoin(lessons, eq(lessons.id, signedLinks.lessonId))
    .orderBy(desc(signedLinks.createdAt))
    .limit(Math.min(Math.max(limit, 1), 200));
  return rows;
}

export async function revokeSignedLink(id: string): Promise<boolean> {
  const [row] = await db
    .update(signedLinks)
    .set({ revokedAt: new Date() })
    .where(and(eq(signedLinks.id, id), sql`${signedLinks.revokedAt} is null`))
    .returning();
  return Boolean(row);
}


// ─── v14: parent accounts ───────────────────────────────────────────────────

export async function setParentRole(userId: string) {
  await rawRows(sql`update profiles set role = 'parent' where user_id = ${userId}::uuid and role = 'student'`);
}

export async function getOrCreateParentCode(userId: string, makeCode: () => string): Promise<string> {
  const [existing] = await db.select().from(parentCodes).where(eq(parentCodes.userId, userId)).limit(1);
  if (existing) return existing.code;
  for (let i = 0; i < 5; i++) {
    const code = makeCode();
    const rows = await db.insert(parentCodes).values({ userId, code }).onConflictDoNothing().returning();
    if (rows[0]) return rows[0].code;
    const [again] = await db.select().from(parentCodes).where(eq(parentCodes.userId, userId)).limit(1);
    if (again) return again.code;
  }
  throw new DomainError("CONFLICT", "جرّب تاني.");
}

export async function rotateParentCode(userId: string, code: string) {
  await db.delete(parentCodes).where(eq(parentCodes.userId, userId));
  await db.insert(parentCodes).values({ userId, code });
}

export async function findChildByParentCode(code: string): Promise<string | null> {
  const [row] = await db.select().from(parentCodes).where(eq(parentCodes.code, code)).limit(1);
  return row?.userId ?? null;
}

export async function linkParent(parentId: string, childId: string): Promise<boolean> {
  const rows = await db.insert(parentLinks).values({ parentId, childId }).onConflictDoNothing().returning();
  return rows.length > 0;
}

export async function unlinkParent(parentId: string, childId: string) {
  await db.delete(parentLinks).where(and(eq(parentLinks.parentId, parentId), eq(parentLinks.childId, childId)));
}

export async function listChildIds(parentId: string): Promise<string[]> {
  const rows = await db.select({ childId: parentLinks.childId }).from(parentLinks).where(eq(parentLinks.parentId, parentId));
  return rows.map((r) => r.childId);
}

export async function isParentOf(parentId: string, childId: string): Promise<boolean> {
  const rows = await db.select({ id: parentLinks.id }).from(parentLinks).where(and(eq(parentLinks.parentId, parentId), eq(parentLinks.childId, childId))).limit(1);
  return rows.length > 0;
}

export async function countParentLinks(parentId: string): Promise<number> {
  return (await listChildIds(parentId)).length;
}

// ─── v14: integration outbox + mock checkouts ───────────────────────────────

export async function addOutbox(row: { kind: string; recipient: string; body: string; status: string; createdBy: string | null }) {
  const [r] = await db.insert(integrationOutbox).values(row).returning();
  return r;
}

export async function listOutbox(limit = 50) {
  return db.select().from(integrationOutbox).orderBy(desc(integrationOutbox.createdAt)).limit(limit);
}

export async function createMockCheckout(userId: string, amountEgp: number) {
  const [r] = await db.insert(mockCheckouts).values({ userId, amountEgp }).returning();
  return r;
}

/** Pending -> paid in ONE statement, so a double click can never credit twice. */
export async function payMockCheckout(userId: string, id: string) {
  const [r] = await db
    .update(mockCheckouts)
    .set({ status: "paid", paidAt: new Date() })
    .where(and(eq(mockCheckouts.id, id), eq(mockCheckouts.userId, userId), eq(mockCheckouts.status, "pending")))
    .returning();
  return r ?? null;
}
