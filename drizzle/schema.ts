import { pgTable, uuid, text, timestamp, index, bigint, integer, boolean, uniqueIndex } from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM TABLE — managed by the scaffold. The Agent MUST NOT redefine or drop
// the auth columns here; it only ADDS business tables below.
// ─────────────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"), // null for SSO-linked users (future)
  name: text("name"),
  role: text("role").notNull().default("user"), // 'user' | 'admin'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// SYSTEM TABLE — managed by the scaffold, written by server/_core/storage.ts.
export const files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(),
    ownerId: uuid("owner_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    size: bigint("size", { mode: "number" }).notNull(),
    contentType: text("content_type"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("files_owner_idx").on(t.ownerId), index("files_created_idx").on(t.createdAt)],
);

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS TABLES — مدار
// ─────────────────────────────────────────────────────────────────────────────

/** One row per account. `role` here is the BUSINESS role (student|owner|admin);
 *  `users.role` stays the platform's own auth role and is never used for access. */
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("student"), // student | owner | admin
    displayName: text("display_name"),
    phone: text("phone"),
    stage: text("stage"), // prep | secondary
    gradeKey: text("grade_key"), // prep-1 … sec-3
    track: text("track"), // general | baccalaureate
    pathway: text("pathway"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("profiles_role_idx").on(t.role)],
);

export const courses = pgTable(
  "courses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    subjectName: text("subject_name").notNull().default("الرياضيات"),
    stage: text("stage").notNull(), // prep | secondary
    gradeKey: text("grade_key").notNull(),
    track: text("track").notNull().default("general"), // general | baccalaureate
    pathway: text("pathway"),
    mathLevel: text("math_level").notNull().default("standard"), // standard | advanced
    description: text("description"),
    posterUrl: text("poster_url"),
    backdropUrl: text("backdrop_url"),
    priceEgp: integer("price_egp").notNull().default(0),
    durationMonths: integer("duration_months").notNull().default(3),
    isPublished: boolean("is_published").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("courses_stage_idx").on(t.stage),
    index("courses_grade_idx").on(t.gradeKey),
    index("courses_published_idx").on(t.isPublished),
  ],
);

export const units = pgTable(
  "units",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("units_course_idx").on(t.courseId)],
);

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    unitId: uuid("unit_id").references(() => units.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    summary: text("summary"),
    videoUrl: text("video_url"),
    durationSec: integer("duration_sec").notNull().default(0),
    isFree: boolean("is_free").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    pdfUrl: text("pdf_url"),
    vttUrl: text("vtt_url"),
  },
  (t) => [index("lessons_course_idx").on(t.courseId), index("lessons_unit_idx").on(t.unitId)],
);

/** Feature 22: timestamped notes, private per student per lesson. */
export const lessonNotes = pgTable(
  "lesson_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    second: integer("second").notNull().default(0),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("lesson_notes_user_lesson_idx").on(t.userId, t.lessonId)],
);

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("active"), // active | expired
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    uniqueIndex("enrollments_user_course_uq").on(t.userId, t.courseId),
    index("enrollments_user_idx").on(t.userId),
  ],
);

/** APPEND-ONLY ledger. The balance is SUM(amount_egp) — never a stored column. */
export const walletTransactions = pgTable(
  "wallet_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // topup | purchase | refund | adjustment
    amountEgp: integer("amount_egp").notNull(), // signed
    balanceAfter: integer("balance_after").notNull(),
    reference: text("reference"),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("wallet_user_idx").on(t.userId), index("wallet_created_idx").on(t.createdAt)],
);

export const topupRequests = pgTable(
  "topup_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amountEgp: integer("amount_egp").notNull(),
    method: text("method").notNull(), // instapay | wallet | fawry | card
    reference: text("reference"),
    receiptUrl: text("receipt_url"),
    status: text("status").notNull().default("pending"), // pending | approved | rejected
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    rejectReason: text("reject_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("topup_user_idx").on(t.userId), index("topup_status_idx").on(t.status)],
);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

/**
 * Server-counted watch progress per student+lesson (trust group). The student
 * never marks a lesson done: `completedAt` is set only when watchedSec reaches
 * 90% of the video AND the quiz is passed. `videoAnswers` is a JSON array of
 * correctly answered in-video question ids.
 */
export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    watchedSec: integer("watched_sec").notNull().default(0),
    positionSec: integer("position_sec").notNull().default(0),
    maxPositionSec: integer("max_position_sec").notNull().default(0),
    quizAttempts: integer("quiz_attempts").notNull().default(0),
    quizBestPct: integer("quiz_best_pct").notNull().default(0),
    quizPassed: boolean("quiz_passed").notNull().default(false),
    // Feature 7: consecutive failed attempts, and the re-watch lock they trigger.
    quizFails: integer("quiz_fails").notNull().default(0),
    quizLocked: boolean("quiz_locked").notNull().default(false),
    videoAnswers: text("video_answers").notNull().default("[]"),
    segments: text("segments").notNull().default("[]"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("lesson_progress_user_lesson_uq").on(t.userId, t.lessonId),
    index("lesson_progress_user_idx").on(t.userId),
    index("lesson_progress_lesson_idx").on(t.lessonId),
  ],
);

/** Completion certificate, issued once per student+course when every lesson completes. `code` is the public verification id. */
export const certificates = pgTable(
  "certificates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    code: text("code").notNull().unique(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("certificates_user_course_uq").on(t.userId, t.courseId),
    index("certificates_user_idx").on(t.userId),
  ],
);

/** Devices seen on an account; a second active device inside the notice window raises the concurrency flag (leak deterrent without a watermark). */
export const deviceSessions = pgTable(
  "device_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deviceId: text("device_id").notNull(),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("device_sessions_user_device_uq").on(t.userId, t.deviceId),
    index("device_sessions_user_idx").on(t.userId),
  ],
);

// ─── AI group (features 38–45) ──────────────────────────────────────────────
// Deterministic local engine (shared/ai.ts): no external LLM is wired, so all
// generated content is derived from lesson content and stored per student.

/** Assistant chat turns (feature 38), per student + lesson. */
export const aiMessages = pgTable(
  "ai_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // 'user' | 'assistant'
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_messages_user_lesson_idx").on(t.userId, t.lessonId)],
);

/** Practice attempts (feature 39). Questions (with the key) stay server-side. */
export const aiPracticeAttempts = pgTable(
  "ai_practice_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    attemptNo: integer("attempt_no").notNull(),
    questions: text("questions").notNull(), // JSON PracticeQuestion[] (includes the key)
    answers: text("answers"), // JSON (number|null)[] after submit
    pct: integer("pct"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_practice_user_lesson_idx").on(t.userId, t.lessonId)],
);

/** Graded essay attempts (feature 42). */
export const aiEssays = pgTable(
  "ai_essays",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    pct: integer("pct").notNull(),
    passed: boolean("passed").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_essays_user_lesson_idx").on(t.userId, t.lessonId)],
);

/** Adaptive test sessions (feature 45): state JSON holds level + asked history. */
export const aiAdaptiveSessions = pgTable(
  "ai_adaptive_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    seed: text("seed").notNull(),
    state: text("state").notNull(), // JSON AdaptiveState
    done: boolean("done").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_adaptive_user_idx").on(t.userId)],
);

/** Saved personal study plan (feature 41), one row per student. */
export const studyPlans = pgTable(
  "study_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    examDate: text("exam_date"), // ISO yyyy-mm-dd or null
    plan: text("plan").notNull(), // JSON PlanDay[]
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("study_plans_user_uq").on(t.userId)],
);

// ─── Motivation & engagement group (features 30–35, 37) ─────────────────────
// Rules live in shared/gamify.ts; these tables are its durable state.

/** Point ledger (feature 30). (userId, kind, ref) uniqueness makes awarding idempotent. */
export const pointEvents = pgTable(
  "point_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(), // PointKind
    points: integer("points").notNull(),
    ref: text("ref"),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("point_events_user_idx").on(t.userId), uniqueIndex("point_events_uq").on(t.userId, t.kind, t.ref)],
);

/** Per-day watch minutes toward the daily goal (feature 37). */
export const dailyGoals = pgTable(
  "daily_goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    day: text("day").notNull(), // YYYY-MM-DD local
    minutes: integer("minutes").notNull().default(0),
    goalMinutes: integer("goal_minutes").notNull().default(30),
    awardedAt: timestamp("awarded_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("daily_goals_user_day_uq").on(t.userId, t.day)],
);

/** Per-student motivation settings: leaderboard opt-out (31) and goal minutes (37). */
export const gamifyFlags = pgTable(
  "gamify_flags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    hideLeaderboard: boolean("hide_leaderboard").notNull().default(false),
    goalMinutes: integer("goal_minutes").notNull().default(30),
    weeklyGoalMinutes: integer("weekly_goal_minutes").notNull().default(150),
  },
  (t) => [uniqueIndex("gamify_flags_user_uq").on(t.userId)],
);

/** Discussion under every lesson (feature 33). */
export const discussionPosts = pgTable(
  "discussion_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("discussion_posts_lesson_idx").on(t.lessonId)],
);

export const discussionReplies = pgTable(
  "discussion_replies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => discussionPosts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("discussion_replies_post_idx").on(t.postId)],
);

/** Live sessions with chat (feature 34). */
export const liveSessions = pgTable(
  "live_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    recordingUrl: text("recording_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("live_sessions_course_idx").on(t.courseId)],
);

export const liveMessages = pgTable(
  "live_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => liveSessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("live_messages_session_idx").on(t.sessionId)],
);

/** Friend challenges (feature 32). players JSON: [{userId,name,score,finishedAt}]. */
export const challenges = pgTable(
  "challenges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    players: text("players").notNull(), // JSON ChallengePlayer[]
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("challenges_lesson_idx").on(t.lessonId)],
);

/** Assignments for peer review (feature 35). */
export const assignments = pgTable(
  "assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    prompt: text("prompt").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("assignments_lesson_idx").on(t.lessonId)],
);

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("submissions_assignment_user_uq").on(t.assignmentId, t.userId)],
);

export const peerReviews = pgTable(
  "peer_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    reviewerId: uuid("reviewer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    scores: text("scores").notNull(), // JSON Record<criterionId, 1..5>
    note: text("note"),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("peer_reviews_sub_reviewer_uq").on(t.submissionId, t.reviewerId)],
);

// ── Platform & admin group (features 46–50) ──────────────────────────────────
export const topupCodes = pgTable(
  "topup_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    valueEgp: integer("value_egp").notNull(),
    createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
    usedBy: uuid("used_by").references(() => users.id, { onDelete: "set null" }),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("topup_codes_code_uq").on(t.code)]
);

export const appNotifications = pgTable(
  "app_notifications",
  {
    id: text("id").primaryKey(), // deterministic id for merge-dedupe
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    ref: text("ref"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("app_notifications_user_idx").on(t.userId)]
);

export const courseReviews = pgTable(
  "course_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    text: text("text").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("course_reviews_course_user_uq").on(t.courseId, t.userId)]
);

// ── Analytics group (features 13–20) ─────────────────────────────────────────
export const watchEvents = pgTable(
  "watch_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
    second: integer("second").notNull().default(0),
    kind: text("kind").notNull(), // watched | left | rewatched
    gainedSec: integer("gained_sec").notNull().default(0),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("watch_events_lesson_idx").on(t.lessonId), index("watch_events_user_idx").on(t.userId)]
);

/** Feature 12: independent, append-only student activity log — who watched
 *  what, when, and for how long (teacher/admin view; parent view pending
 *  dedicated parent accounts). */
export const activityEvents = pgTable(
  "activity_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(), // login | signup | watch_done | lesson_complete | quiz_pass | quiz_fail | quiz_lock | quiz_unlock | purchase | redeem | note | certificate | share_create
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
    courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }),
    detail: text("detail"),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("activity_events_user_idx").on(t.userId), index("activity_events_at_idx").on(t.at)],
);

/** Feature 11: temporary signed video links. The token's signature carries the
 *  lesson id + expiry; this row records issuance and lets staff revoke. */
export const signedLinks = pgTable(
  "signed_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jti: text("jti").notNull().unique(),
    token: text("token").notNull(),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("signed_links_lesson_idx").on(t.lessonId)],
);

/** v14: parent accounts. A student shows a code; a parent account redeems it to see that child's progress (read-only). */
export const parentCodes = pgTable("parent_codes", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const parentLinks = pgTable(
  "parent_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    childId: uuid("child_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("parent_links_pair_idx").on(t.parentId, t.childId), index("parent_links_child_idx").on(t.childId)],
);

/** v14: integration outbox. The mock adapters write here instead of calling push/WhatsApp providers. */
export const integrationOutbox = pgTable(
  "integration_outbox",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind").notNull(), // push | whatsapp | payment | translate
    recipient: text("recipient").notNull(),
    body: text("body").notNull(),
    status: text("status").notNull().default("mock_delivered"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("integration_outbox_at_idx").on(t.createdAt)],
);

/** v14: mock payment checkouts. Paying one credits the wallet exactly once. */
export const mockCheckouts = pgTable(
  "mock_checkouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    amountEgp: integer("amount_egp").notNull(),
    status: text("status").notNull().default("pending"), // pending | paid | canceled
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("mock_checkouts_user_idx").on(t.userId)],
);
