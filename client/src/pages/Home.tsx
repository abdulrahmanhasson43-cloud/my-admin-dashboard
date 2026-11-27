import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { Play, ChevronLeft, ChevronRight, Sigma, Plus, Check } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { useAuth } from "@/_core/useAuth";
import { SiteHeader } from "@/components/site/header";
import { PosterCard } from "@/components/site/poster-card";
import { RowSkeleton, Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty";
import { useAccent } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { gradeLabel } from "@/i18n/domain";
import { Tip } from "@/components/ui/tip";
import { FAV_GUEST_SCOPE, isFavorite, toggleFavorite, useFavoritesVersion } from "@/lib/favorites";

import { t } from "@/i18n";
import { SiteFooter } from "@/components/site/footer";
const HERO_MS = 7000;

type Course = {
  id: string;
  slug: string;
  title: string;
  stage: string;
  gradeKey: string;
  track: string;
  pathway: string | null;
  mathLevel: string;
  description: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  priceEgp: number;
  lessonCount: number;
};

/** A horizontally scrollable row with arrow controls that appear on hover. */
function Row({
  title,
  children,
  numbered,
}: {
  title: string;
  children: React.ReactNode;
  numbered?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  function sync() {
    const el = ref.current;
    if (!el) return;
    // RTL: scrollLeft runs 0 → negative in Chrome, 0 → positive in Firefox.
    const pos = Math.abs(el.scrollLeft);
    setAtStart(pos < 8);
    setAtEnd(pos + el.clientWidth >= el.scrollWidth - 8);
  }

  useEffect(() => {
    sync();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [children]);

  // forward = toward the END of the list. In RTL the end is on the left, where
  // scrollLeft goes negative; in LTR it is on the right, where it goes positive.
  function nudge(forward: boolean) {
    const el = ref.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const sign = forward === rtl ? -1 : 1;
    el.scrollBy({ left: sign * Math.min(el.clientWidth * 0.8, 900), behavior: "smooth" });
  }

  return (
    <section className="group/row relative mt-10 first:mt-0 sm:mt-12">
      <div className="page-x mx-auto flex max-w-[var(--page-max)] items-center justify-between gap-4">
        <h2 className="text-[17px] font-semibold tracking-tight text-white sm:text-[19px]">{title}</h2>
        <div className="hidden items-center gap-1.5 sm:flex">
          <button
            type="button"
            onClick={() => nudge(false)}
            disabled={atStart}
            aria-label={t("home.01", { title: title })}
            className="grid size-9 place-items-center rounded-[var(--radius-btn)] border border-white/12 text-white/70 transition-colors hover:border-white/30 hover:text-white disabled:opacity-25"
          >
            <ChevronRight className="ltr:rotate-180 size-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => nudge(true)}
            disabled={atEnd}
            aria-label={t("home.02", { title: title })}
            className="grid size-9 place-items-center rounded-[var(--radius-btn)] border border-white/12 text-white/70 transition-colors hover:border-white/30 hover:text-white disabled:opacity-25"
          >
            <ChevronLeft className="ltr:rotate-180 size-4" strokeWidth={2} />
          </button>
        </div>
      </div>
      <div ref={ref} className="rail page-x mx-auto mt-3 max-w-[var(--page-max)]">
        {children}
      </div>
      {numbered && null}
    </section>
  );
}

function Hero({ courses }: { courses: Course[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(false);
  const slides = courses.slice(0, 5);
  const active = slides[i] ?? slides[0];
  const art = (c: Course) => c.backdropUrl ?? c.posterUrl;

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // One moving timeline drives the slideshow: when its fill completes, advance.
  const autoplay = !still && slides.length > 1;

  const { user } = useAuth();
  const scope = user?.id ?? FAV_GUEST_SCOPE;
  useFavoritesVersion();

  if (!active) return null;

  const saved = isFavorite(scope, active.id);
  const [name] = active.title.split(" — ");

  return (
    <section
      className="page-x mx-auto max-w-[var(--page-max)] pb-2 pt-[4.75rem] sm:pt-24"
      aria-roledescription={t("home.03")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* The artwork is a large rounded card. Mirrored in RTL so the drawing sits opposite the text below. */}
      <div className="relative aspect-[5/4] overflow-hidden rounded-[var(--radius-3xl)] bg-[var(--surface-3)] sm:aspect-[21/9]">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            aria-hidden="true"
            className={cn(
              "absolute inset-0 transition-opacity duration-[1100ms] ease-[var(--ease-out-expo)]",
              idx === i ? "opacity-100" : "opacity-0",
            )}
          >
            <div className="size-full rtl:-scale-x-100">
              {art(s) && (
                <img
                  src={art(s)!}
                  alt=""
                  className="size-full object-cover object-[72%_50%]"
                  style={idx === i ? { animation: "ken-burns 22s ease-out both" } : undefined}
                  fetchPriority={idx === 0 ? "high" : "low"}
                />
              )}
            </div>
          </div>
        ))}
        <Link
          to={`/course/${active.slug}`}
          aria-label={t("hero.open", { title: active.title })}
          className="absolute inset-0 z-[1] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[var(--accent)]"
        />
      </div>

      <div className="mt-6 sm:mt-8">
        <h1 className="clamp-2 max-w-[18ch] text-[clamp(1.9rem,7vw,3rem)] font-semibold leading-[1.2] text-white">{name}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 text-[14px] text-white/55">
          <span>{gradeLabel(active.gradeKey)}</span>
          {active.lessonCount > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular">{t("lessons.n", { n: active.lessonCount })}</span>
            </>
          )}
        </p>

        <div className="mt-5 flex items-center gap-3">
          <Link
            to={`/course/${active.slug}`}
            className="inline-flex h-12 items-center gap-2.5 rounded-[var(--radius-btn)] bg-white px-7 text-[15.5px] font-semibold text-black shadow-[var(--shadow-sm)] transition-colors hover:bg-white/90 active:scale-[0.98]"
          >
            <Play className="size-[17px] rtl:-scale-x-100" fill="currentColor" strokeWidth={0} />
            {t("hero.watch")}
          </Link>
          <Tip label={saved ? t("fav.remove") : t("fav.add")} side="top">
            <button
              type="button"
              aria-pressed={saved}
              aria-label={saved ? t("fav.remove") : t("fav.add")}
              onClick={() => toggleFavorite(scope, active.id)}
              className="grid size-12 place-items-center rounded-full border border-[var(--hairline)] bg-[var(--surface-1)] text-white transition-colors hover:border-[var(--hairline-strong)]"
            >
              {saved ? <Check className="size-5 text-[var(--accent)]" strokeWidth={2.2} /> : <Plus className="size-5" strokeWidth={2.2} />}
            </button>
          </Tip>
        </div>

        {slides.length > 1 && (
          <div className="mt-7 flex items-center justify-center gap-2" role="tablist" aria-label={t("home.11")}>
            {slides.map((s, idx) => {
              const on = idx === i;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-label={t("home.12", { p0: idx + 1, title: s.title })}
                  onClick={() => setI(idx)}
                  className="grid h-6 place-items-center px-0.5"
                >
                  <span className={cn("relative block h-1 overflow-hidden rounded-full bg-white/15 transition-[width] duration-300", on ? "w-10" : "w-5")}>
                    {on && (
                      <span
                        key={`run-${i}`}
                        onAnimationEnd={() => setI((v) => (v + 1) % slides.length)}
                        className={cn("absolute inset-y-0 start-0 rounded-full bg-[var(--accent)]", !autoplay && "w-full")}
                        style={autoplay ? { animation: `hero-fill ${HERO_MS}ms linear forwards`, animationPlayState: paused ? "paused" : "running" } : undefined}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const { user } = useAuth();
  const settings = trpc.catalog.settings.useQuery();
  const courses = trpc.catalog.courses.useQuery({});
  const enrollments = trpc.learning.enrollments.useQuery(undefined, { enabled: Boolean(user) });
  const resume = trpc.progress.resume.useQuery(undefined, { enabled: Boolean(user) });

  useAccent(settings.data?.accent_color);

  const all = (courses.data ?? []) as Course[];

  const top10 = useMemo(() => all.slice(0, 10), [all]);
  const prep = useMemo(() => all.filter((c) => c.stage === "prep"), [all]);
  const secondary = useMemo(() => all.filter((c) => c.stage === "secondary" && c.track === "general"), [all]);
  const bacc = useMemo(() => all.filter((c) => c.track === "baccalaureate"), [all]);
  const mine = (enrollments.data ?? []).filter((e) => e.isActive);

  return (
    <div className="min-h-dvh bg-black">
      <SiteHeader />

      {courses.isLoading ? (
        <div className="pt-24">
          <div className="page-x mx-auto max-w-[var(--page-max)]">
            <Skeleton className="h-[52svh] w-full rounded-2xl" />
          </div>
          <div className="mt-10">
            <RowSkeleton />
          </div>
        </div>
      ) : all.length === 0 ? (
        <div className="page-x mx-auto max-w-2xl pt-40">
          <EmptyState
            icon={<Sigma className="size-6" strokeWidth={1.5} />}
            title={t("home.13")}
            action={
              <Link
                to={user ? "/admin" : "/login"}
                className="inline-flex h-11 items-center rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 text-[14px] font-medium text-black"
              >
                {user ? t("home.15") : t("home.16")}
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <Hero courses={all} />

          <div className="relative z-10 -mt-8 pb-24">
            {user && (resume.data ?? []).length > 0 && (
              <Row title={t("home.17")}>
                {(resume.data ?? []).map((r) => (
                  <Link
                    key={r.slug}
                    to={`/watch/${r.lessonId}`}
                    className="group relative w-[240px] shrink-0 overflow-hidden rounded-[var(--radius-media)] border border-white/10 bg-[var(--surface-1)] transition-colors hover:border-white/25"
                  >
                    <div className="flex h-full flex-col gap-3 p-4">
                      <p className="t-caption truncate text-white/38">{r.courseTitle}</p>
                      <p className="clamp-2 min-h-10 text-[14px] font-medium leading-snug text-white/90 group-hover:text-white">
                        {r.lessonTitle}
                      </p>
                      <div className="mt-auto">
                        <div className="h-1 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${r.percent}%` }} />
                        </div>
                        <p className="tabular mt-2 flex items-center gap-1.5 text-[11.5px] text-white/40">
                          <Play className="size-3" fill="currentColor" strokeWidth={0} />
                          {r.percent}%
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </Row>
            )}
            {mine.length > 0 && (
              <Row title={t("home.18")}>
                {mine.map((e) => (
                  <PosterCard
                    key={e.id}
                    course={{
                      id: e.course.id,
                      slug: e.course.slug,
                      title: e.course.title,
                      gradeKey: e.course.gradeKey,
                      posterUrl: e.course.posterUrl,
                      priceEgp: e.course.priceEgp,
                      mathLevel: e.course.mathLevel,
                    }}
                  />
                ))}
              </Row>
            )}

            <Row title={t("home.19")} numbered>
              {top10.map((c, idx) => (
                <PosterCard key={c.id} course={c} rank={idx + 1} />
              ))}
            </Row>

            {prep.length > 0 && (
              <Row title={t("home.21")}>
                {prep.map((c) => (
                  <PosterCard key={c.id} course={c} />
                ))}
              </Row>
            )}

            {secondary.length > 0 && (
              <Row title={t("home.23")}>
                {secondary.map((c) => (
                  <PosterCard key={c.id} course={c} />
                ))}
              </Row>
            )}

            {bacc.length > 0 && (
              <Row title={t("home.25")}>
                {bacc.map((c) => (
                  <PosterCard key={c.id} course={c} />
                ))}
              </Row>
            )}
          </div>
        </>
      )}

      <SiteFooter />
    </div>
  );
}
