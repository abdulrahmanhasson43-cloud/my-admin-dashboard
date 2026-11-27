import { Link, useParams } from "wouter";
import { useState } from "react";
import {
  Play,
  Lock,
  Clock,
  BookOpen,
  ChevronLeft,
  ShieldCheck,
  Wallet,
  AlertCircle,
  Layers,
  CalendarDays,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { trpc } from "@/_core/trpc";
import { useAuth } from "@/_core/useAuth";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { ReviewsCard } from "@/components/site/platform";
import { PosterFallback } from "@/components/site/poster-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty";
import { Tip } from "@/components/ui/tip";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Chip, SectionHead } from "@/components/site/page";
import { useAccent } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { GUEST_SCOPE, getLastLesson, isWatched, useWatchedVersion, watchedCount } from "@/lib/progress";
import { isFavorite, toggleFavorite, useFavoritesVersion } from "@/lib/favorites";
import { duration } from "@shared/domain";
import { egp, gradeLabel, mathLevelLabel, pathwayLabel, trackLabel } from "@/i18n/domain";

import { t } from "@/i18n";
import { errorText } from "@/i18n/errors";
export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const settings = trpc.catalog.settings.useQuery();
  useAccent(settings.data?.accent_color);

  const utils = trpc.useUtils();
  const detail = trpc.catalog.course.useQuery({ slug: slug ?? "" }, { enabled: Boolean(slug) });
  const wallet = trpc.wallet.summary.useQuery(undefined, { enabled: Boolean(user) });
  const [confirmOpen, setConfirmOpen] = useState(false);
  useWatchedVersion();
  useFavoritesVersion();
  const progressScope = user?.id ?? GUEST_SCOPE;

  const purchase = trpc.learning.purchase.useMutation({
    onSuccess: async (res) => {
      setConfirmOpen(false);
      toast.push("success", t("coursedetail.01", { p0: egp(res.charged) }));
      await Promise.all([
        utils.catalog.course.invalidate(),
        utils.wallet.summary.invalidate(),
        utils.learning.enrollments.invalidate(),
      ]);
    },
    onError: (e) => toast.push("error", errorText(e)),
  });

  if (detail.isLoading) {
    return (
      <div className="min-h-dvh bg-black">
        <SiteHeader />
        <div className="page-x mx-auto max-w-[var(--page-max)] pt-24">
          <Skeleton className="h-[46svh] w-full rounded-[var(--radius-card)]" />
          <Skeleton className="mt-10 h-9 w-1/2" />
          <Skeleton className="mt-4 h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <div className="min-h-dvh bg-black">
        <SiteHeader />
        <div className="page-x mx-auto max-w-xl pt-40">
          <EmptyState
            icon={<AlertCircle className="size-6" strokeWidth={1.5} />}
            title={t("coursedetail.02")}
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

  const { course, units, lessons, entitled } = detail.data;
  const balance = wallet.data?.balanceEgp ?? 0;
  const short = course.priceEgp > balance;
  const firstFree = lessons.find((l) => l.isFree);
  const grouped = units.map((u) => ({ unit: u, items: lessons.filter((l) => l.unitId === u.id) }));
  const loose = lessons.filter((l) => !l.unitId);
  const totalSec = lessons.reduce((n, l) => n + (l.durationSec || 0), 0);
  const done = user
    ? lessons.filter((l) => (l as { state?: string }).state === "completed").length
    : watchedCount(progressScope, lessons.map((l) => l.id));
  const progressPct = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;
  const fav = isFavorite(progressScope, course.id);
  // Resume where the student stopped; fall back to the first free lesson, then the first.
  const resumeId =
    entitled && getLastLesson(progressScope, course.slug)?.lessonId &&
    lessons.some((l) => l.id === getLastLesson(progressScope, course.slug)!.lessonId)
      ? getLastLesson(progressScope, course.slug)!.lessonId
      : (firstFree ?? lessons[0])?.id;

  return (
    <div className="min-h-dvh bg-black">
      <SiteHeader />

      {/* ── Hero: full-bleed backdrop, poster + title block on one baseline ── */}
      <section className="relative isolate overflow-hidden">
        {/* 70svh can exceed the hero's own height on short viewports; without
            clipping, the scrim bleeds over the curriculum section below and
            hides its heading (Home already clips its hero the same way). */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 h-[70svh] overflow-hidden">
          {course.backdropUrl ? (
            <img src={course.backdropUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full bg-[var(--surface-1)]" />
          )}
          {/* Two scrims: one lifts the text off the photo, one fades to black. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/88 to-black/55" />
          <div className="absolute inset-0 bg-gradient-to-l ltr:bg-gradient-to-r from-black/85 via-black/35 to-transparent" />
        </div>

        <div className="page-x mx-auto max-w-[var(--page-max)] pb-14 pt-24 sm:pt-32">
          <Link
            to="/courses"
            className="t-caption mb-10 inline-flex items-center gap-1.5 text-white/40 transition-colors hover:text-white"
          >
            <ChevronLeft className="rtl:rotate-180 size-3.5" strokeWidth={2} />
            {t("home.42")}
          </Link>

          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:gap-10 lg:gap-12">
            <div className="w-32 shrink-0 sm:w-44">
              <div className="aspect-[2/3] overflow-hidden rounded-[var(--radius-media)] bg-[var(--surface-1)] ring-1 ring-white/12">
                {course.posterUrl ? (
                  <img src={course.posterUrl} alt="" className="size-full object-cover" />
                ) : (
                  <PosterFallback title={course.title} grade={course.gradeKey} />
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-5 flex flex-wrap items-center gap-1.5">
                <Chip tone="accent">{gradeLabel(course.gradeKey)}</Chip>
                {course.stage === "secondary" && <Chip>{trackLabel(course.track)}</Chip>}
                {course.pathway && <Chip>{pathwayLabel(course.pathway)}</Chip>}
                <Chip>{mathLevelLabel(course.mathLevel)}</Chip>
              </div>

              <h1 className="t-hero max-w-[22ch] text-white">{course.title}</h1>

              <p className="t-lead mt-5 max-w-[58ch] text-white/58">
                {course.description ??
                  t("coursedetail.04")}
              </p>

              {/* Meta row: icon + number, hairline separated, no captions. */}
              <dl className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-6">
                <div>
                  <dt className="sr-only">{t("coursedetail.05")}</dt>
                  <dd>
                    <Tip label={t("coursedetail.05")}>
                      <span className="inline-flex items-center gap-2 text-[15px] text-white/80">
                        <BookOpen className="size-4 text-white/40" strokeWidth={1.75} />
                        <span className="tabular">{lessons.length}</span>
                      </span>
                    </Tip>
                  </dd>
                </div>
                {units.length > 0 && (
                  <div>
                    <dt className="sr-only">{t("coursedetail.06")}</dt>
                    <dd>
                      <Tip label={t("coursedetail.06")}>
                        <span className="inline-flex items-center gap-2 text-[15px] text-white/80">
                          <Layers className="size-4 text-white/40" strokeWidth={1.75} />
                          <span className="tabular">{units.length}</span>
                        </span>
                      </Tip>
                    </dd>
                  </div>
                )}
                {totalSec > 0 && (
                  <div>
                    <dt className="sr-only">{t("coursedetail.08")}</dt>
                    <dd>
                      <Tip label={t("coursedetail.08")}>
                        <span className="inline-flex items-center gap-2 text-[15px] text-white/80">
                          <Clock className="size-4 text-white/40" strokeWidth={1.75} />
                          <span className="tabular">{duration(totalSec)}</span>
                        </span>
                      </Tip>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="sr-only">{t("coursedetail.10")}</dt>
                  <dd>
                    <Tip label={t("coursedetail.10")}>
                      <span className="inline-flex items-center gap-2 text-[15px] text-white/80">
                        <CalendarDays className="size-4 text-white/40" strokeWidth={1.75} />
                        <span className="tabular">{course.durationMonths}</span>
                      </span>
                    </Tip>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ── Body: curriculum on the start side, purchase panel on the end ── */}
      <div className="page-x mx-auto max-w-[var(--page-max)] pb-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
          <div className="min-w-0">
            <SectionHead label={t("coursedetail.12")} />

            {done > 0 && lessons.length > 0 && (
              <div className="mb-6 mt-4">
                <div className="flex items-center justify-between gap-4 text-[12.5px]">
                  <span className="text-white/55">
                    {t("coursedetail.45", { done, total: lessons.length })}
                  </span>
                  <span className="tabular text-white/35">{progressPct}%</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-[width]"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}

            {lessons.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="size-6" strokeWidth={1.5} />}
                title={t("coursedetail.15")}
              />
            ) : (
              <div className="space-y-12">
                {grouped.map(({ unit, items }) =>
                  items.length === 0 ? null : (
                    <section key={unit.id}>
                      <div className="mb-1 flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                        <h3 className="t-title text-white/92">
                          {unit.title}
                          {!entitled && items.length > 0 && items.every((l) => l.isFree) && (
                            <Chip tone="good" className="ms-3 align-middle">{t("watch.11")}</Chip>
                          )}
                        </h3>
                        <span className="tabular t-caption shrink-0 text-white/28">
                          {t("lessons.n", { n: items.length })}
                        </span>
                      </div>
                      <ul className="divide-y divide-white/6">
                        {items.map((l, idx) => (
                          <LessonItem key={l.id} lesson={l} index={idx + 1} scope={progressScope} signedIn={Boolean(user)} />
                        ))}
                      </ul>
                    </section>
                  ),
                )}

                {loose.length > 0 && (
                  <section>
                    {grouped.length > 0 && (
                      <div className="mb-1 flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                        <h3 className="t-title text-white/92">{t("coursedetail.17")}</h3>
                        <span className="tabular t-caption shrink-0 text-white/28">
                          {t("lessons.n", { n: loose.length })}
                        </span>
                      </div>
                    )}
                    <ul className="divide-y divide-white/6">
                      {loose.map((l, idx) => (
                        <LessonItem key={l.id} lesson={l} index={idx + 1} scope={progressScope} signedIn={Boolean(user)} />
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </div>

          {/* Purchase panel — sticky on desktop, sits under the curriculum on mobile. */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border-y border-white/10 py-6">
              <p className="tabular text-[2.25rem] font-semibold leading-none tracking-[-0.03em] text-white">
                {course.priceEgp > 0 ? egp(course.priceEgp) : t("home.10")}
              </p>

              <div className="mt-6 space-y-2.5">
                {entitled ? (
                  <Link
                    to={resumeId ? `/watch/${resumeId}` : `/course/${course.slug}`}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-white text-[15px] font-semibold text-black transition-colors duration-150 hover:bg-white/90 active:scale-[0.985] motion-reduce:active:scale-100"
                  >
                    <Play className="size-[18px]" fill="currentColor" strokeWidth={0} />
                    {lessons.length > 0 ? t("coursedetail.21") : t("coursedetail.22")}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => (user ? setConfirmOpen(true) : (window.location.href = "/login"))}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] text-[15px] font-semibold text-black transition-colors duration-150 hover:bg-[var(--accent-hover)] active:scale-[0.985] motion-reduce:active:scale-100"
                  >
                    <Wallet className="size-[18px]" strokeWidth={2} />
                    {course.priceEgp > 0 ? t("coursedetail.23") : t("coursedetail.24")}
                  </button>
                )}

                <div className="flex gap-2">
                  {firstFree && !entitled && (
                    <Link
                      to={`/watch/${firstFree.id}`}
                      className="inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-[var(--radius-btn)] border border-white/14 text-[14px] text-white/85 transition-colors duration-150 hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
                    >
                      <Play className="size-4" strokeWidth={2} />
                      {t("coursedetail.25")}
                    </Link>
                  )}
                  <Tip label={fav ? t("fav.remove") : t("fav.add")} className={cn(!(firstFree && !entitled) && "w-full")}>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(progressScope, course.id)}
                      aria-pressed={fav}
                      aria-label={fav ? t("fav.remove") : t("fav.add")}
                      className={cn(
                        "inline-flex h-11 items-center justify-center rounded-[var(--radius-btn)] border transition-colors duration-150",
                        firstFree && !entitled ? "w-11" : "w-full",
                        fav
                          ? "border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border-white/14 text-white/85 hover:border-white/30 hover:bg-white/[0.05] hover:text-white",
                      )}
                    >
                      <Heart className="size-4" fill={fav ? "currentColor" : "none"} strokeWidth={fav ? 0 : 2} />
                    </button>
                  </Tip>
                </div>
              </div>

              {!entitled && user && course.priceEgp > 0 && (
                <p className="t-caption mt-4 flex items-center gap-2 text-white/35">
                  <Tip label={t("coursedetail.26")}>
                    <Wallet className="size-3.5" strokeWidth={1.75} aria-label={t("coursedetail.26")} />
                  </Tip>
                  <span className="tabular text-white/70">{egp(balance)}</span>
                  {short && (
                    <>
                      {" — "}
                      <Link to="/topup" className="text-[var(--accent)] hover:underline">
                        {t("coursedetail.27")}
                      </Link>
                    </>
                  )}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      <div className="page-x mx-auto mb-14 max-w-[var(--page-max)]">
        <ReviewsCard courseId={course.id} entitled={entitled} />
      </div>

      <SiteFooter />

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t("coursedetail.31")}
        description={t("coursedetail.32")}
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="inline-flex h-11 items-center rounded-[var(--radius-btn)] border border-white/14 px-4 text-[14px] text-white/80 transition-colors hover:border-white/30 hover:text-white"
            >
              {t("coursedetail.33")}
            </button>
            <button
              type="button"
              disabled={purchase.isPending || short}
              onClick={() => purchase.mutate({ courseId: course.id })}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 text-[14px] font-semibold text-black transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-45"
            >
              {purchase.isPending ? t("coursedetail.34") : t("coursedetail.35", { p0: egp(course.priceEgp) })}
            </button>
          </>
        }
      >
        <dl className="divide-y divide-white/8 border-y border-white/8 text-[14px]">
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-white/45">{t("coursedetail.36")}</dt>
            <dd className="text-end font-medium text-white">{course.title}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-white/45">{t("home.09")}</dt>
            <dd className="tabular text-white">{egp(course.priceEgp)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-white/45">{t("coursedetail.37")}</dt>
            <dd className="tabular text-white">{egp(balance)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-white/45">{t("coursedetail.38")}</dt>
            <dd className={cn("tabular font-semibold", short ? "text-red-400" : "text-emerald-400")}>
              {egp(balance - course.priceEgp)}
            </dd>
          </div>
        </dl>

        {short && (
          <p className="mt-4 flex items-start gap-2 border-s-2 border-red-500/40 ps-3 text-[13px] leading-relaxed text-red-300/85">
            <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            <span>
              {t("coursedetail.39")}{" "}
              <Link to="/topup" className="underline">
                {t("coursedetail.40")}
              </Link>{" "}
              {t("coursedetail.41")}
            </span>
          </p>
        )}

        <p className="mt-4 flex items-start gap-2 text-[12.5px] leading-relaxed text-white/35">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          {t("coursedetail.months2", { n: course.durationMonths })}
        </p>
      </Dialog>
    </div>
  );
}

function LessonItem({
  lesson,
  index,
  scope,
  signedIn,
}: {
  scope: string;
  signedIn: boolean;
  lesson: {
    id: string;
    title: string;
    summary: string | null;
    durationSec: number;
    isFree: boolean;
    locked: boolean;
    gate?: "quiz" | null;
    state?: string;
  };
  index: number;
}) {
  // Signed-in students see the server-earned state; guests the on-device mark.
  const watched = signedIn ? lesson.state === "completed" : isWatched(scope, lesson.id);
  const blocked = lesson.locked || (signedIn && lesson.gate === "quiz");
  const body = (
    <>
      <span className="tabular w-6 shrink-0 text-[12px] text-white/22">{index}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[14.5px] font-medium leading-snug text-white/90">
          <span className="min-w-0">{lesson.title}</span>
          {watched && (
            <CheckCircle2
              className="size-3.5 shrink-0 text-[var(--accent)]"
              strokeWidth={2}
              aria-label={t("watch.20")}
            />
          )}
        </span>
        {lesson.summary && (
          <span className="clamp-2 mt-1 block text-[13px] leading-relaxed text-white/38">
            {lesson.summary}
          </span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-3">
        {lesson.isFree && <Chip tone="good">{t("home.10")}</Chip>}
        {lesson.durationSec > 0 && (
          <span className="tabular text-[12px] text-white/28">{duration(lesson.durationSec)}</span>
        )}
        <span
          className={cn(
            "grid size-8 place-items-center transition-colors",
            blocked
              ? "text-white/22"
              : watched
                ? "text-emerald-400/80"
                : "text-white/55 group-hover:text-white",
          )}
        >
          {blocked ? (
            <Lock className="size-3.5" strokeWidth={1.75} />
          ) : (
            <Play className="size-3" fill="currentColor" strokeWidth={0} />
          )}
        </span>
      </span>
    </>
  );

  if (blocked) {
    return (
      <li className="flex items-center gap-3 py-4 opacity-50">
        {body}
        <span className="sr-only">{t("coursedetail.44")}</span>
        {!lesson.locked && signedIn && lesson.gate === "quiz" && (
          <span className="t-caption shrink-0 text-white/30">{t("watch.gate.prev")}</span>
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        to={`/watch/${lesson.id}`}
        className="group -mx-3 flex items-center gap-3 rounded-[var(--radius-media)] px-3 py-4 transition-colors hover:bg-white/[0.035]"
      >
        {body}
      </Link>
    </li>
  );
}
