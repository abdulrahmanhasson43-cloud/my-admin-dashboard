import { useEffect, useMemo, useState } from "react";
import { useSearch, Link } from "wouter";
import { Search, SlidersHorizontal, X, Sigma, RotateCcw, Layers, GraduationCap, Filter, Target, BarChart3 } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { trpc } from "@/_core/trpc";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PosterCard } from "@/components/site/poster-card";
import { PosterSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tip } from "@/components/ui/tip";
import { useAccent } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { GRADES, MATH_LEVELS, PATHWAYS, STAGES, TRACKS } from "@/i18n/domain";

import { t } from "@/i18n";
type Filters = {
  stage: string;
  gradeKey: string;
  track: string;
  pathway: string;
  mathLevel: string;
  search: string;
};

/** Compact icon-led filter chip: the icon and a hover name replace the written label. */
function FilterChip({
  icon: Icon,
  label,
  disabled,
  children,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  disabled?: boolean;
  children: (props: { "aria-label": string; className: string; disabled?: boolean }) => ReactNode;
}) {
  return (
    <Tip label={label} className="block">
      <div className="relative min-w-[9.5rem]">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 start-3.5 z-[1] my-auto size-4 text-white/45"
          strokeWidth={1.75}
        />
        {children({
          "aria-label": label,
          className: "!h-10 !rounded-full !ps-10 !pe-9 !text-[13.5px]",
          disabled,
        })}
      </div>
    </Tip>
  );
}

const EMPTY: Filters = { stage: "", gradeKey: "", track: "", pathway: "", mathLevel: "", search: "" };

export default function Courses() {
  const qs = useSearch();
  const settings = trpc.catalog.settings.useQuery();
  useAccent(settings.data?.accent_color);

  const [f, setF] = useState<Filters>(() => {
    const p = new URLSearchParams(qs);
    return {
      stage: p.get("stage") ?? "",
      gradeKey: p.get("gradeKey") ?? "",
      track: p.get("track") ?? "",
      pathway: p.get("pathway") ?? "",
      mathLevel: p.get("mathLevel") ?? "",
      search: p.get("search") ?? "",
    };
  });
  const [showFilters, setShowFilters] = useState(false);

  // Keep the URL in step with the filters so a filtered view is shareable.
  useEffect(() => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(f)) if (v) p.set(k, v);
    const next = p.toString();
    const target = next ? `/courses?${next}` : "/courses";
    if (window.location.pathname + window.location.search !== target) {
      window.history.replaceState(null, "", target);
    }
  }, [f]);

  const query = useMemo(
    () => ({
      stage: f.stage || undefined,
      gradeKey: f.gradeKey || undefined,
      track: f.track || undefined,
      pathway: f.pathway || undefined,
      mathLevel: f.mathLevel || undefined,
      search: f.search.trim() || undefined,
    }),
    [f],
  );

  const courses = trpc.catalog.courses.useQuery(query);
  const activeCount = Object.values(f).filter(Boolean).length;

  const grades = f.stage ? GRADES.filter((g) => g.stage === f.stage) : GRADES;
  const showTrack = f.stage === "secondary" || f.track !== "";

  function set<K extends keyof Filters>(key: K, value: string) {
    setF((prev) => {
      const next = { ...prev, [key]: value };
      // A grade belongs to one stage — clear it when the stage changes.
      if (key === "stage" && value) {
        const g = GRADES.find((x) => x.key === next.gradeKey);
        if (g && g.stage !== value) next.gradeKey = "";
      }
      if (key === "stage" && value === "prep") next.track = "";
      return next;
    });
  }

  return (
    <div className="min-h-dvh bg-black">
      <SiteHeader />

      <main className="page-x mx-auto max-w-[var(--page-max)] pb-24 pt-24 sm:pt-28">
        <header className="max-w-2xl">
          <h1 className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.03em] text-white">
            {t("courses.01")}
          </h1>
        </header>

        {/* Search + filter toggle */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 start-3 my-auto size-[18px] text-white/35"
              strokeWidth={1.75}
            />
            <Input
              type="search"
              value={f.search}
              onChange={(e) => set("search", e.target.value)}
              placeholder={t("courses.03")}
              aria-label={t("courses.04")}
              className="h-11 rounded-[var(--radius-btn)] border-white/12 bg-white/[0.04] ps-11 text-[14px]"
            />
            {f.search && (
              <button
                type="button"
                onClick={() => set("search", "")}
                aria-label={t("courses.05")}
                className="absolute inset-y-0 end-2 my-auto grid size-8 place-items-center rounded-[var(--radius-btn)] text-white/40 hover:bg-white/8 hover:text-white"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Tip label={t("courses.06")}>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              aria-controls="filters"
              aria-label={t("courses.06")}
              className={cn(
                "relative inline-flex size-11 items-center justify-center rounded-[var(--radius-btn)] border transition-colors duration-150",
                showFilters || activeCount > 0
                  ? "border-[var(--accent-line)] bg-[var(--accent-soft)] text-white"
                  : "border-white/12 text-white/70 hover:border-white/25 hover:text-white",
              )}
            >
              <SlidersHorizontal className="size-[18px]" strokeWidth={1.75} />
              {activeCount > 0 && (
                <span className="tabular absolute -end-1 -top-1 grid size-5 place-items-center rounded-full bg-[var(--accent)] text-[11px] font-semibold text-black">
                  {activeCount}
                </span>
              )}
            </button>
          </Tip>
        </div>

        {/* Filters */}
        <div
          id="filters"
          className={cn(
            "grid overflow-hidden transition-all duration-300 ease-[var(--ease-out-expo)]",
            showFilters ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0">
            <div className="flex flex-wrap items-center gap-2 border-y border-white/8 py-4">
              <FilterChip icon={Layers} label={t("courses.07")}>
                {(p) => (
                  <Select {...p} value={f.stage} onChange={(e) => set("stage", e.target.value)}>
                    <option value="">{t("courses.08")}</option>
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                )}
              </FilterChip>

              <FilterChip icon={GraduationCap} label={t("courses.09")}>
                {(p) => (
                  <Select {...p} value={f.gradeKey} onChange={(e) => set("gradeKey", e.target.value)}>
                    <option value="">{t("courses.10")}</option>
                    {grades.map((g) => (
                      <option key={g.key} value={g.key}>
                        {g.label}
                      </option>
                    ))}
                  </Select>
                )}
              </FilterChip>

              <FilterChip icon={Filter} label={t("courses.11")} disabled={!showTrack}>
                {(p) => (
                  <Select {...p} value={f.track} onChange={(e) => set("track", e.target.value)}>
                    <option value="">{t("courses.12")}</option>
                    {TRACKS.map((track) => (
                      <option key={track.key} value={track.key}>
                        {track.label}
                      </option>
                    ))}
                  </Select>
                )}
              </FilterChip>

              <FilterChip icon={Target} label={t("courses.13")}>
                {(p) => (
                  <Select {...p} value={f.pathway} onChange={(e) => set("pathway", e.target.value)}>
                    <option value="">{t("courses.14")}</option>
                    {PATHWAYS.map((x) => (
                      <option key={x.key} value={x.key}>
                        {x.label}
                      </option>
                    ))}
                  </Select>
                )}
              </FilterChip>

              <FilterChip icon={BarChart3} label={t("courses.15")}>
                {(p) => (
                  <Select {...p} value={f.mathLevel} onChange={(e) => set("mathLevel", e.target.value)}>
                    <option value="">{t("courses.12")}</option>
                    {MATH_LEVELS.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.label}
                      </option>
                    ))}
                  </Select>
                )}
              </FilterChip>

              {activeCount > 0 && (
                <Tip label={t("courses.16")}>
                  <button
                    type="button"
                    onClick={() => setF(EMPTY)}
                    aria-label={t("courses.16")}
                    className="grid size-10 place-items-center rounded-full text-white/55 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    <RotateCcw className="size-4" strokeWidth={1.75} />
                  </button>
                </Tip>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-8">
          {courses.isLoading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <PosterSkeleton key={i} />
              ))}
            </div>
          ) : courses.isError ? (
            <EmptyState
              icon={<X className="size-6" strokeWidth={1.5} />}
              title={t("courses.17")}
              body={t("courses.18")}
              action={
                <button
                  type="button"
                  onClick={() => void courses.refetch()}
                  className="inline-flex h-11 items-center rounded-[var(--radius-btn)] border border-white/15 px-5 text-[14px] text-white hover:border-white/30"
                >
                  {t("courses.19")}
                </button>
              }
            />
          ) : (courses.data ?? []).length === 0 ? (
            <EmptyState
              icon={<Sigma className="size-6" strokeWidth={1.5} />}
              title={activeCount > 0 ? t("courses.20") : t("home.13")}
              action={
                activeCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setF(EMPTY)}
                    className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 text-[14px] font-medium text-black"
                  >
                    <RotateCcw className="size-4" strokeWidth={2} />
                    {t("courses.23")}
                  </button>
                ) : (
                  <Link
                    to="/"
                    className="inline-flex h-11 items-center rounded-[var(--radius-btn)] border border-white/15 px-5 text-[14px] text-white hover:border-white/30"
                  >
                    {t("courses.24")}
                  </Link>
                )
              }
            />
          ) : (
            <>
              <p className="mb-5 text-[13px] text-white/40">
                <span className="tabular">{t("courses.count", { n: (courses.data ?? []).length })}</span>
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {(courses.data ?? []).map((c) => (
                  <PosterCard key={c.id} course={c} className="w-full sm:w-full" />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
