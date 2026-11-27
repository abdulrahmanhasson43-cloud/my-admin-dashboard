import { Link, useParams } from "wouter";
import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Lock,
  Play,
  ListVideo,
  AlertCircle,
  Clock,
  CheckCircle2,
  Gift,
  BookOpen,
  MonitorSmartphone,
} from "lucide-react";
import { trpc } from "@/_core/trpc";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Tip } from "@/components/ui/tip";
import { EmptyState } from "@/components/ui/empty";
import { Chip } from "@/components/site/page";
import { MadarPlayer, type PlayerHandle } from "@/components/site/madar-player";
import { QuestionGate, QuizPanel, SubtleWatermark } from "@/components/site/learn";
import { AiStudio } from "@/components/site/ai";
import { LessonDiscussion, LiveSessionsCard, PeerReviewCard } from "@/components/site/gamify";
import { LessonAttachments, LessonNotes } from "@/components/site/viewing";
import { useAccent } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { duration } from "@shared/domain";
import { GUEST_SCOPE, isWatched, setLastLesson, toggleWatched, useWatchedVersion } from "@/lib/progress";
import { useAuth } from "@/_core/useAuth";
import { useToast } from "@/components/ui/toast";

import { t } from "@/i18n";

const ICON_BTN =
  "inline-flex size-10 items-center justify-center rounded-full border transition-colors";

const GATE_MESSAGE = "لازم تكمّل الدرس اللي قبله وتعدي كويزه الأول.";

/** One stable id per browser — the "device" in the concurrency check (feature 8). */
function deviceId(): string {
  try {
    let id = localStorage.getItem("madar-device-id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("madar-device-id", id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

export default function Watch() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const settings = trpc.catalog.settings.useQuery();
  useAccent(settings.data?.accent_color);
  const toast = useToast();

  const data = trpc.learning.lesson.useQuery(
    { lessonId: lessonId ?? "" },
    { enabled: Boolean(lessonId), retry: false },
  );
  const session = trpc.auth.session.useQuery();
  const utils = trpc.useUtils();
  const [listOpen, setListOpen] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const { user } = useAuth();
  useWatchedVersion();
  const progressScope = user?.id ?? GUEST_SCOPE;

  // ── tracking state (logged-in students only) ──
  const playerRef = useRef<PlayerHandle | null>(null);
  const lastPosRef = useRef(0);
  const accumRef = useRef(0);
  const maxPosRef = useRef(0);
  const completedRef = useRef(false);
  const answeredRef = useRef<Set<string>>(new Set());
  const [progress, setProgress] = useState<NonNullable<(typeof data)["data"]>["progress"] | null>(null);
  const [gate, setGate] = useState<{ id: string; q: string; options: string[] } | null>(null);
  const [deviceNotice, setDeviceNotice] = useState(false);

  const opened = data.data;
  const videoQuestions = opened?.videoQuestions ?? [];

  const heartbeat = trpc.progress.heartbeat.useMutation({
    onSuccess: (r) => {
      setProgress((p) => (p ? { ...p, ...r } : p));
      completedRef.current = r.state === "completed";
      if (r.concurrentDevice) {
        setDeviceNotice(true);
        playerRef.current?.pause();
      }
      if (r.certificate) toast.push("success", t("cert.congrats"));
    },
  });
  const beatRef = useRef(heartbeat.mutate);
  beatRef.current = heartbeat.mutate;

  // A new lesson means a new page position and fresh tracking state.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    lastPosRef.current = 0;
    accumRef.current = 0;
    setGate(null);
    setDeviceNotice(false);
  }, [lessonId]);

  // Hydrate tracking refs from the server progress once the lesson loads.
  useEffect(() => {
    if (!opened) return;
    setProgress(opened.progress);
    maxPosRef.current = opened.progress.positionSec;
    lastPosRef.current = opened.progress.positionSec;
    completedRef.current = opened.progress.state === "completed";
    answeredRef.current = new Set(opened.progress.videoAnswers);
    setLastLesson(progressScope, opened.course.slug, {
      id: opened.lesson.id,
      title: opened.lesson.title,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened?.lesson.id]);

  function onTick(position: number, playing: boolean) {
    if (!user || !opened) return;
    const durationSec = opened.lesson.durationSec || 0;

    // In-video question reached → pause and gate (feature 3).
    if (!gate) {
      const next = videoQuestions.find(
        (q) => !answeredRef.current.has(q.id) && position >= q.atSec - 0.6 && position <= q.atSec + 12,
      );
      if (next) {
        playerRef.current?.pause();
        playerRef.current?.seekTo(next.atSec);
        setGate(next);
        return;
      }
    }

    // No skipping ahead on the first watch (feature 4): the furthest you may
    // sit is a little past what you actually watched, or the next gate.
    if (!completedRef.current && durationSec > 0) {
      const nextGateSec = videoQuestions.find((q) => !answeredRef.current.has(q.id))?.atSec ?? durationSec;
      const allowed = Math.min(nextGateSec + 2, maxPosRef.current + 12, durationSec);
      if (position > allowed) {
        playerRef.current?.seekTo(Math.max(0, Math.min(maxPosRef.current, allowed)));
        return;
      }
    }

    if (playing) {
      const delta = position - lastPosRef.current;
      if (delta > 0 && delta <= 3) {
        accumRef.current += delta;
        maxPosRef.current = Math.max(maxPosRef.current, position);
      }
      if (accumRef.current >= 10) {
        const bank = Math.round(accumRef.current);
        accumRef.current = 0;
        beatRef.current({ lessonId: opened.lesson.id, deltaSec: bank, positionSec: Math.round(position), deviceId: deviceId() });
      }
    }
    lastPosRef.current = position;
  }

  if (data.isLoading) {
    return (
      <div className="min-h-dvh bg-black">
        <SiteHeader />
        <div className="page-x mx-auto max-w-[1500px] pt-24">
          <Skeleton className="aspect-video w-full rounded-[var(--radius-media)]" />
          <Skeleton className="mt-8 h-8 w-1/2" />
        </div>
      </div>
    );
  }

  if (data.isError || !data.data) {
    const msg = data.error?.message ?? "";
    const gated = msg === GATE_MESSAGE;
    const locked = !gated && (/اشتراك|FORBIDDEN/i.test(msg) || data.error?.data?.code === "FORBIDDEN");
    return (
      <div className="min-h-dvh bg-black">
        <SiteHeader />
        <div className="page-x mx-auto max-w-xl pt-40">
          <EmptyState
            icon={locked || gated ? <Lock className="size-6" strokeWidth={1.5} /> : <AlertCircle className="size-6" strokeWidth={1.5} />}
            title={gated ? t("watch.gate.prev") : locked ? t("watch.01") : t("watch.02")}
            body={gated ? t("srv.gated") : locked ? t("watch.03") : t("watch.04")}
            action={
              <Link
                to="/courses"
                className="inline-flex h-11 items-center rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 text-[14px] font-medium text-black"
              >
                {t("home.42")}
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const { lesson, course, units, lessons, nextLessonId, prevLessonId, chapters } = data.data;
  const currentIdx = lessons.findIndex((l) => l.id === lesson.id);
  const serverState = progress?.state ?? data.data.progress.state;
  const guestWatched = !user && isWatched(progressScope, lesson.id);
  const completed = user ? serverState === "completed" : guestWatched;
  const profile = session.data?.profile;
  const watermark = [profile?.displayName ?? user?.name ?? "", profile?.phone ?? ""].filter(Boolean).join(" · ");

  return (
    <div className="min-h-dvh bg-black">
      <SiteHeader />

      <div className="mx-auto max-w-[1560px] pt-20 sm:px-6 sm:pt-24">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
          {/* ── Player column ── */}
          <div className="min-w-0 flex-1">
            <div className="on-dark relative aspect-video w-full overflow-hidden bg-[#050505] sm:rounded-[var(--radius-media)] sm:ring-1 sm:ring-white/10">
              <MadarPlayer
                videoUrl={lesson.videoUrl}
                title={lesson.title}
                startSec={user ? (data.data.progress.positionSec ?? 0) : 0}
                onTick={onTick}
                vttUrl={lesson.vttUrl}
                onReady={(h) => {
                  playerRef.current = h;
                }}
              />
              {user && <SubtleWatermark text={watermark} />}
              {gate && user && (
                <QuestionGate
                  lessonId={lesson.id}
                  question={gate}
                  onPassed={() => {
                    answeredRef.current.add(gate.id);
                    setGate(null);
                    playerRef.current?.play();
                  }}
                />
              )}
              {deviceNotice && (
                <div className="absolute inset-0 z-30 grid place-items-center bg-black/90 p-4">
                  <div className="w-full max-w-sm text-center">
                    <MonitorSmartphone className="mx-auto size-8 text-amber-300/90" strokeWidth={1.5} />
                    <p className="t-title mt-4 text-white">{t("watch.device.title")}</p>
                                        <button
                      type="button"
                      onClick={() => {
                        setDeviceNotice(false);
                        playerRef.current?.play();
                      }}
                      className="mt-5 inline-flex h-11 items-center rounded-[var(--radius-btn)] bg-white px-6 text-[14px] font-semibold text-black"
                    >
                      {t("watch.device.mine")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Lesson meta ── */}
            <div className="page-x mt-8 sm:px-0">
              <nav aria-label={t("watch.08")} className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/course/${course.slug}`}
                  className="t-caption text-white/40 transition-colors hover:text-white"
                >
                  {course.title}
                </Link>
                <ChevronLeft className="ltr:rotate-180 size-3 shrink-0 text-white/20" strokeWidth={2} />
                <span className="tabular t-caption text-white/28">
                  {currentIdx + 1} / {lessons.length}
                </span>
              </nav>

              <h1 className="t-display mt-4 max-w-[34ch] text-white">{lesson.title}</h1>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {lesson.durationSec > 0 && (
                  <Chip>
                    <Clock className="size-3" strokeWidth={1.75} />
                    <span className="tabular">{duration(lesson.durationSec)}</span>
                  </Chip>
                )}
                {lesson.isFree && (
                  <Tip label={t("watch.11")}>
                    <span
                      role="img"
                      aria-label={t("watch.11")}
                      className={cn(ICON_BTN, "border-emerald-500/25 text-emerald-400/90")}
                    >
                      <Gift className="size-4" strokeWidth={1.75} />
                    </span>
                  </Tip>
                )}
                <LessonAttachments
                  pdfUrl={lesson.pdfUrl}
                  videoUrl={lesson.videoUrl}
                  videoKind={
                    /(?:youtube\.com|youtu\.be)/.test(lesson.videoUrl ?? "")
                      ? "youtube"
                      : /\.(mp4|webm|ogg|m4v)(\?|$)/i.test(lesson.videoUrl ?? "")
                        ? "file"
                        : "embed"
                  }
                />
                <Tip label={studyMode ? t("watch.study.off") : t("watch.study.on")}>
                  <button
                    type="button"
                    onClick={() => setStudyMode((v) => !v)}
                    aria-pressed={studyMode}
                    aria-label={studyMode ? t("watch.study.off") : t("watch.study.on")}
                    className={cn(
                      ICON_BTN,
                      studyMode
                        ? "border-[var(--accent-line)] bg-[var(--accent)]/12 text-[var(--accent)]"
                        : "border-white/12 text-white/70 hover:border-white/30 hover:text-white",
                    )}
                  >
                    <BookOpen className="size-4" strokeWidth={1.75} />
                  </button>
                </Tip>
                {completed ? (
                  <Tip label={t("watch.21")}>
                    <span
                      role="img"
                      aria-label={t("watch.21")}
                      className={cn(ICON_BTN, "border-[var(--accent-line)] text-[var(--accent)]")}
                    >
                      <CheckCircle2 className="size-4" strokeWidth={2} />
                    </span>
                  </Tip>
                ) : user && progress ? (
                  <Chip tone={progress.watchDone ? "good" : "neutral"}>
                    <span className="tabular">{progress.percent}%</span>
                  </Chip>
                ) : null}
                {/* Guests keep the manual mark; signed-in students EARN the state. */}
                {!user && (
                  <Tip label={guestWatched ? t("watch.20") : t("watch.19")}>
                    <button
                      type="button"
                      onClick={() => toggleWatched(progressScope, lesson.id)}
                      aria-pressed={guestWatched}
                      aria-label={guestWatched ? t("watch.20") : t("watch.19")}
                      className={cn(
                        ICON_BTN,
                        guestWatched
                          ? "border-[var(--accent-line)] bg-[var(--accent)]/10 text-[var(--accent)]"
                          : "border-white/12 text-white/55 hover:border-white/30 hover:text-white",
                      )}
                    >
                      <CheckCircle2 className="size-4" strokeWidth={2} />
                    </button>
                  </Tip>
                )}
              </div>

              {chapters.length > 0 && (
                <div className="mt-6">
                                    <div className="flex flex-wrap gap-2">
                    {chapters.map((c) => (
                      <button
                        key={c.atSec}
                        type="button"
                        onClick={() => playerRef.current?.seekTo(c.atSec)}
                        className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-btn)] border border-white/12 px-3.5 text-[12.5px] text-white/60 transition-colors hover:border-white/30 hover:text-white"
                      >
                        <span className="tabular text-white/30">{duration(c.atSec)}</span>
                        {c.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {lesson.summary && (
                <div className="mt-6 max-w-[68ch]">
                  <p className="t-lead text-white/58">{lesson.summary}</p>
                </div>
              )}

              {user && (
                <div className="mt-7">
                  <LessonNotes lessonId={lesson.id} currentTime={() => playerRef.current?.currentTime() ?? 0} onSeek={(sec) => playerRef.current?.seekTo(sec)} />
                </div>
              )}

              {user && progress && (
                <QuizPanel
                  lessonId={lesson.id}
                  progress={progress}
                  quizPassPct={data.data.quizPassPct}
                  onChanged={() => {
                    void utils.learning.lesson.invalidate();
                    void utils.progress.dashboard.invalidate();
                    void utils.certificates.list.invalidate();
                  }}
                />
              )}

              {!studyMode && user && (
                <AiStudio lessonId={lesson.id} onSeek={(sec) => playerRef.current?.seekTo(sec)} />
              )}

              {!studyMode && user && <LiveSessionsCard courseId={course.id} />}

              {!studyMode && user && <PeerReviewCard lessonId={lesson.id} />}

              {!studyMode && user && <LessonDiscussion lessonId={lesson.id} />}

              {/* ── Prev / next ── */}
              <div className="mt-10 flex items-center justify-between gap-3 border-t border-white/8 pt-6">
                {prevLessonId ? (
                  <Tip label={t("watch.13")} side="top">
                    <Link
                      to={`/watch/${prevLessonId}`}
                      aria-label={t("watch.13")}
                      className="inline-flex size-11 items-center justify-center rounded-full border border-white/12 text-white/75 transition-colors duration-150 hover:border-white/30 hover:text-white"
                    >
                      <ChevronRight className="ltr:rotate-180 size-4" strokeWidth={2} />
                    </Link>
                  </Tip>
                ) : (
                  <span />
                )}
                <Tip label={t("watch.15")} side="top">
                  <Link
                    to={`/course/${course.slug}`}
                    aria-label={t("watch.15")}
                    className="inline-flex size-11 items-center justify-center rounded-full text-white/45 transition-colors hover:text-white"
                  >
                    <BookOpen className="size-4" strokeWidth={1.75} />
                  </Link>
                </Tip>
                {nextLessonId ? (
                  <Tip label={t("watch.14")} side="top">
                    <Link
                      to={`/watch/${nextLessonId}`}
                      aria-label={t("watch.14")}
                      className="inline-flex size-11 items-center justify-center rounded-full bg-white text-black transition-colors duration-150 hover:bg-white/90"
                    >
                      <ChevronLeft className="ltr:rotate-180 size-4" strokeWidth={2.5} />
                    </Link>
                  </Tip>
                ) : (
                  <span />
                )}
              </div>
            </div>
          </div>

          {/* ── Playlist ── */}
          <aside className={cn("w-full shrink-0 lg:w-[360px]", studyMode && "hidden")}>
            <button
              type="button"
              onClick={() => setListOpen((v) => !v)}
              aria-expanded={listOpen}
              aria-controls="playlist"
              className="page-x flex w-full items-center justify-between gap-2 border-y border-white/8 py-4 text-[13.5px] text-white/75 sm:px-0 lg:hidden"
            >
              <span className="inline-flex items-center gap-2">
                <ListVideo className="size-4" strokeWidth={1.75} />
                {t("watch.16", { n: lessons.length })}
              </span>
              <ChevronLeft
                className={cn("size-4 transition-transform duration-200", listOpen ? "-rotate-90" : "rotate-0")}
                strokeWidth={2}
              />
            </button>

            <div
              id="playlist"
              className={cn(
                "page-x overflow-hidden sm:px-0 lg:block lg:max-h-[calc(100svh-120px)] lg:overflow-y-auto",
                listOpen ? "block" : "hidden",
              )}
            >
              <div className="hidden items-baseline justify-between gap-3 border-b border-white/10 pb-3 lg:flex">
                <h2 className="t-overline text-white/38">{t("watch.17")}</h2>
                <span className="tabular t-caption shrink-0 text-white/40">{t("lessons.n", { n: lessons.length })}</span>
              </div>

              {units.length === 0 && lessons.length === 0 ? (
                <p className="t-body py-6 text-white/40">{t("watch.18")}</p>
              ) : (
                <div className="space-y-8 pb-10 pt-5">
                  {units.map((u) => {
                    const items = lessons.filter((l) => l.unitId === u.id);
                    if (items.length === 0) return null;
                    return (
                      <div key={u.id}>
                        <h3 className="t-overline mb-2 text-white/28">{u.title}</h3>
                        <ul className="divide-y divide-white/6">
                          {items.map((l) => (
                            <PlaylistItem key={l.id} lesson={l} active={l.id === lesson.id} signedIn={Boolean(user)} />
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                  {lessons.filter((l) => !l.unitId).length > 0 && (
                    <div>
                      {units.length > 0 && (
                        <h3 className="t-overline mb-2 text-white/28">{t("coursedetail.17")}</h3>
                      )}
                      <ul className="divide-y divide-white/6">
                        {lessons
                          .filter((l) => !l.unitId)
                          .map((l) => (
                            <PlaylistItem key={l.id} lesson={l} active={l.id === lesson.id} signedIn={Boolean(user)} />
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function PlaylistItem({
  lesson,
  active,
  signedIn,
}: {
  lesson: { id: string; title: string; durationSec: number; isFree: boolean; locked: boolean; gate?: "quiz" | null; state?: string };
  active: boolean;
  signedIn: boolean;
}) {
  const blocked = lesson.locked || (signedIn && lesson.gate === "quiz");
  const done = signedIn ? lesson.state === "completed" : false;
  const inner = (
    <>
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-[var(--radius-btn)] border",
          active
            ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
            : done
              ? "border-emerald-500/30 text-emerald-400/80"
              : "border-white/10 text-white/30",
        )}
      >
        {blocked ? (
          <Lock className="size-3" strokeWidth={2} />
        ) : done ? (
          <CheckCircle2 className="size-3.5" strokeWidth={2} />
        ) : (
          <Play className="size-2.5" fill="currentColor" strokeWidth={0} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "clamp-2 block text-[13px] leading-snug",
            active ? "font-medium text-white" : "text-white/72",
          )}
        >
          {lesson.title}
        </span>
        <span className="mt-1 flex items-center gap-2 text-[11px] leading-[1.6] text-white/38">
          {lesson.durationSec > 0 && <span className="tabular">{duration(lesson.durationSec)}</span>}
          {lesson.isFree && <span className="text-emerald-400/70">{t("home.10")}</span>}
        </span>
      </span>
    </>
  );

  if (blocked) {
    return <li className="flex items-center gap-2.5 py-3 opacity-45">{inner}</li>;
  }

  return (
    <li>
      <Link
        to={`/watch/${lesson.id}`}
        aria-current={active ? "page" : undefined}
        className={cn(
          "-mx-2 flex items-center gap-2.5 rounded-[var(--radius-media)] px-2 py-3 transition-colors",
          active ? "bg-white/[0.05]" : "hover:bg-white/[0.03]",
        )}
      >
        {inner}
      </Link>
    </li>
  );
}
