import { Link } from "wouter";
import { Award, CheckCircle2, ChevronLeft, CirclePlay, ListTodo, Lock } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { EmptyState } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Tip } from "@/components/ui/tip";
import { SectionHead, StatStrip } from "@/components/site/page";
import { cn } from "@/lib/utils";
import { duration, shortDate } from "@shared/domain";
import { t } from "@/i18n";

/** Account → تقدّمي (feature 13): study time, completed lessons, quiz average, per-course bars. */
export function ProgressPanel() {
  const d = trpc.progress.dashboard.useQuery();

  if (d.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full rounded-[var(--radius-card)]" />
        <Skeleton className="h-20 w-full rounded-[var(--radius-card)]" />
      </div>
    );
  }
  if (!d.data) return null;
  const { totals, courses } = d.data;

  const studyHours = totals.watchedSec >= 3600
    ? `${Math.floor(totals.watchedSec / 3600)}:${String(Math.floor((totals.watchedSec % 3600) / 60)).padStart(2, "0")}`
    : duration(totals.watchedSec);

  return (
    <div>
      <StatStrip
        items={[
          { label: t("progress.studyTime"), value: studyHours },
          { label: t("progress.done"), value: totals.completedLessons },
          { label: t("progress.quizAvg"), value: totals.quizAvgPct > 0 ? `${totals.quizAvgPct}٪` : "—" },
          { label: t("progress.certs"), value: totals.certificates },
        ]}
      />

      {courses.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            orbit
            icon={<ListTodo className="size-7" />}
            title={t("progress.empty.title")}
            body=""
            action={
              <Link
                to="/courses"
                className="inline-flex h-11 items-center rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 text-[14px] font-medium text-black"
              >
                {t("progress.browse")}
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {courses.map((c) => (
            <section key={c.course.id}>
              <SectionHead
                label={c.course.title}
                hint={t("progress.course.done", { done: c.doneCount, total: c.totalCount })}
                action={<span className="tabular t-caption text-white/40">{c.pct}%</span>}
              />
              <div className="h-1 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-[var(--accent)] transition-[width]" style={{ width: `${c.pct}%` }} />
              </div>

              <div className="mt-5 space-y-6">
                {c.units.map((u) => {
                  const items = c.lessons.filter((l) => l.unitId === u.id);
                  if (items.length === 0) return null;
                  const uDone = items.filter((l) => l.state === "completed").length;
                  return (
                    <div key={u.id}>
                      <div className="mb-2 flex items-baseline justify-between gap-3">
                        <p className="text-[13.5px] font-medium text-white/75">{u.title}</p>
                        <span className="tabular t-caption text-white/30">
                          {uDone}/{items.length}
                        </span>
                      </div>
                      <ul className="divide-y divide-white/6 border-y border-white/6">
                        {items.map((l) => (
                          <li key={l.id} className="flex items-center gap-3 py-2.5">
                            {l.state === "completed" ? (
                              <CheckCircle2 className="size-4 shrink-0 text-emerald-400/85" strokeWidth={2} />
                            ) : l.state === "not-started" ? (
                              <Lock className="size-3.5 shrink-0 text-white/22" strokeWidth={2} />
                            ) : (
                              <CirclePlay className="size-4 shrink-0 text-[var(--accent)]" strokeWidth={1.75} />
                            )}
                            <Link to={`/watch/${l.id}`} className="min-w-0 flex-1 truncate text-[13px] text-white/70 transition-colors hover:text-white">
                              {l.title}
                            </Link>
                            {l.state !== "completed" && l.percent > 0 && (
                              <span className="h-1 w-16 overflow-hidden rounded-full bg-white/8">
                                <span className="block h-full rounded-full bg-[var(--accent)]/70" style={{ width: `${l.percent}%` }} />
                              </span>
                            )}
                            {l.quizAttempts > 0 && (
                              <span
                                className={cn(
                                  "tabular t-caption shrink-0",
                                  l.quizBestPct >= 60 ? "text-emerald-400/70" : "text-amber-300/70",
                                )}
                              >
                                {l.quizBestPct}٪
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/** Account → إنجازاتي (feature 36): certificates with verification codes. */
export function CertificatesPanel() {
  const certs = trpc.certificates.list.useQuery();

  if (certs.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-[var(--radius-card)]" />
      </div>
    );
  }
  const list = certs.data ?? [];
  if (list.length === 0) {
    return (
      <EmptyState
        orbit
        icon={<Award className="size-7" />}
        title={t("cert.empty.title")}
        body=""
        action={
          <Link
            to="/courses"
            className="inline-flex h-11 items-center rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 text-[14px] font-medium text-black"
          >
            {t("progress.browse")}
          </Link>
        }
      />
    );
  }
  return (
    <ul className="divide-y divide-white/8 border-y border-white/8">
      {list.map((c) => (
        <li key={c.code}>
          <Link to={`/certificate/${c.code}`} className="group flex items-center gap-4 py-4 transition-colors hover:bg-white/[0.02]">
            <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-btn)] border border-amber-400/25 text-amber-300/90">
              <Award className="size-5" strokeWidth={1.5} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="clamp-2 block text-[14.5px] font-medium leading-snug text-white/90 group-hover:text-white">
                {c.courseTitle}
              </span>
              <span className="tabular mt-1 block text-[11.5px] text-white/32">
                {shortDate(c.issuedAt)} · <span dir="ltr">{c.code}</span>
              </span>
            </span>
            <Tip label={t("cert.view")}>
              <ChevronLeft aria-label={t("cert.view")} className="size-5 shrink-0 text-[var(--accent)] ltr:rotate-180" />
            </Tip>
          </Link>
        </li>
      ))}
    </ul>
  );
}
