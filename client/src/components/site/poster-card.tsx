import { Link } from "wouter";
import { Lock, Play, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tip } from "@/components/ui/tip";
import { egp, gradeLabel } from "@/i18n/domain";

import { t } from "@/i18n";
export type PosterCourse = {
  id: string;
  slug: string;
  title: string;
  gradeKey: string;
  posterUrl: string | null;
  priceEgp: number;
  lessonCount?: number;
  mathLevel?: string;
};

/**
 * Poster tile. No card chrome: the artwork IS the tile, with a gradient scrim
 * carrying the text — the way a streaming service shows a title.
 * Hover lift is transform-only and disabled under prefers-reduced-motion.
 */
export function PosterCard({
  course,
  rank,
  className,
}: {
  course: PosterCourse;
  rank?: number;
  className?: string;
}) {
  return (
    <Link
      to={`/course/${course.slug}`}
      className={cn(
        "group relative block w-[200px] shrink-0 sm:w-[240px]",
        "transition-transform duration-300 ease-[var(--ease-out-expo)] hover:z-10 hover:scale-[1.04] motion-reduce:hover:scale-100",
        className,
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-[var(--radius-media)] bg-[var(--surface-1)] ring-1 ring-white/8 transition-shadow duration-300 group-hover:ring-white/20">
        {course.posterUrl ? (
          <img
            src={course.posterUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
          />
        ) : (
          <PosterFallback title={course.title} grade={course.gradeKey} />
        )}

        {typeof rank === "number" && (
          <span
            aria-hidden="true"
            className="on-dark absolute end-2.5 top-2 select-none text-[32px] font-bold leading-[1.1] text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] sm:text-[38px]"
            style={{ WebkitTextStroke: "1.5px rgba(0,0,0,0.5)" }}
          >
            <span className="tabular">{rank}</span>
          </span>
        )}

      </div>

      {/* Name under the poster, then grade and price on one quiet line. */}
      <p className="truncate mt-3 text-[14.5px] font-medium leading-snug text-white/90">{course.title.split(" — ")[0]}</p>
      <div className="mt-1 flex items-center justify-between gap-2 text-[12.5px] text-white/50">
        <span className="truncate">{gradeLabel(course.gradeKey)}</span>
        <span className="tabular flex shrink-0 items-center gap-2">
          {course.mathLevel === "advanced" && (
            <Tip label={t("postercard.01")} side="top">
              <span aria-label={t("postercard.01")} className="inline-flex text-white/50">
                <Flame className="size-3.5" strokeWidth={1.75} />
              </span>
            </Tip>
          )}
          {course.priceEgp > 0 ? egp(course.priceEgp) : <span className="text-emerald-400/90">{t("home.10")}</span>}
        </span>
      </div>
    </Link>
  );
}

/** Deterministic gradient + glyph when a course has no artwork yet. */
export function PosterFallback({ title, grade }: { title: string; grade?: string }) {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return (
    <div
      className="on-dark flex size-full flex-col justify-between p-4"
      style={{
        background: `linear-gradient(155deg, oklch(0.30 0.06 ${hue}) 0%, oklch(0.13 0.02 ${hue}) 55%, #000 100%)`,
      }}
    >
      <span className="text-[11px] tracking-[0.04em] text-white/45">
        {grade ? gradeLabel(grade) : t("postercard.02")}
      </span>
      <span className="text-[15px] font-semibold leading-snug text-white/90">{title}</span>
    </div>
  );
}

/** Compact horizontal row item (used in "continue watching" and search). */
export function LessonRow({
  title,
  meta,
  locked,
  href,
  thumb,
}: {
  title: string;
  meta: string;
  locked?: boolean;
  href: string;
  thumb?: string | null;
}) {
  return (
    <Link
      to={href}
      className="group flex items-center gap-3 rounded-[var(--radius-media)] p-2 transition-colors duration-150 hover:bg-white/[0.05]"
    >
      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-[var(--radius-media)] bg-[var(--surface-1)] ring-1 ring-white/8">
        {thumb ? (
          <img src={thumb} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-white/25">
            <Play className="size-5" strokeWidth={1.5} />
          </div>
        )}
        {locked && (
          <div className="absolute inset-0 grid place-items-center bg-black/65">
            <Lock className="size-4 text-white/80" strokeWidth={1.75} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="clamp-2 text-[13.5px] font-medium leading-snug text-white/90 group-hover:text-white">
          {title}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-white/45">
          <Clock className="size-3" strokeWidth={1.75} />
          <span className="tabular">{meta}</span>
        </p>
      </div>
    </Link>
  );
}


