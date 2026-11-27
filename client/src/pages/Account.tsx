import { Link, Redirect } from "wouter";
import { useAuth } from "@/_core/useAuth";
import { LanguageSegmented } from "@/components/site/language-switch";
import { useState } from "react";
import type * as React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Clock,
  Flame,
  Heart,
  Play,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import {
  IconBooks,
  IconCheck,
  IconExit,
  IconGlobe,
  IconGrade,
  IconLessons,
  IconPathway,
  IconPerson,
  IconPhone,
  IconSaved,
  IconShield,
  IconStage,
  IconTrack,
  IconWallet,
  OrbitAvatar,
} from "@/components/site/icons";
import { trpc } from "@/_core/trpc";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Tip } from "@/components/ui/tip";
import { useToast } from "@/components/ui/toast";
import { PageShell, SectionHead } from "@/components/site/page";
import { useAccent } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { GUEST_SCOPE, lastLessons, useWatchedVersion, watchedTotal } from "@/lib/progress";
import { CertificatesPanel, ProgressPanel } from "@/components/site/account-panels";
import { StudyPanel } from "@/components/site/ai";
import { GamingPanel } from "@/components/site/gamify";
import { AnalyticsPanel } from "@/components/site/analytics";
import { favoriteCount, isFavorite, toggleFavorite, useFavoritesVersion } from "@/lib/favorites";
import { daysLeft } from "@shared/domain";
import { GRADES, PATHWAYS, STAGES, TRACKS, egp, gradeLabel, shortDate } from "@/i18n/domain";

import { t } from "@/i18n";
import { ParentCodePanel } from "@/components/site/v14";
import { errorText } from "@/i18n/errors";
const TABS = [
  { key: "subs", label: "account.tab.subs", Icon: BookOpen },
  { key: "progress", label: "account.tab.progress", Icon: TrendingUp },
  { key: "study", label: "account.tab.study", Icon: Brain },
  { key: "gaming", label: "account.tab.gaming", Icon: Flame },
  { key: "analytics", label: "account.tab.analytics", Icon: BarChart3 },
  { key: "certs", label: "account.tab.certs", Icon: Award },
  { key: "favs", label: "account.tab.favs", Icon: Heart },
  { key: "wallet", label: "account.tab.wallet", Icon: Wallet },
  { key: "profile", label: "account.tab.profile", Icon: User },
] as const;

export default function Account() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const settings = trpc.catalog.settings.useQuery();
  useAccent(settings.data?.accent_color);

  const utils = trpc.useUtils();
  const session = trpc.auth.session.useQuery();
  const summary = trpc.wallet.summary.useQuery();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("subs");

  const profile = session.data?.profile;
  const isParentRole = profile?.role === "parent";
  const [form, setForm] = useState({
    displayName: "",
    phone: "",
    stage: "",
    gradeKey: "",
    track: "",
    pathway: "",
  });
  const [hydrated, setHydrated] = useState(false);

  if (profile && !hydrated) {
    setForm({
      displayName: profile.displayName ?? "",
      phone: profile.phone ?? "",
      stage: profile.stage ?? "",
      gradeKey: profile.gradeKey ?? "",
      track: profile.track ?? "",
      pathway: profile.pathway ?? "",
    });
    setHydrated(true);
  }

  const save = trpc.wallet.setGradeContext.useMutation({
    onSuccess: async () => {
      toast.push("success", t("account.01"));
      await utils.auth.session.invalidate();
    },
    onError: (e) => toast.push("error", errorText(e)),
  });

  const balance = summary.data?.balanceEgp ?? 0;
  const subs = summary.data?.enrollments ?? [];
  const active = subs.filter((s) => s.isActive);
  const expired = subs.filter((s) => !s.isActive);
  const grades = form.stage ? GRADES.filter((g) => g.stage === form.stage) : GRADES;

  // Suggested courses: same grade first, then anything not already owned. Fills
  // the page with a next step instead of leaving a black void under one row.
  const catalog = trpc.catalog.courses.useQuery({}, { enabled: tab === "subs" || tab === "favs" });
  const favCatalog = catalog;
  const owned = new Set(subs.map((s) => s.course.slug));
  const suggested = (catalog.data ?? [])
    .filter((c) => !owned.has(c.slug))
    .sort((a, b) => {
      const mine = profile?.gradeKey;
      const am = a.gradeKey === mine ? 0 : 1;
      const bm = b.gradeKey === mine ? 0 : 1;
      return am - bm;
    })
    .slice(0, 4);

  // On-device state: watched lessons, last stopping point per course, favorites.
  useWatchedVersion();
  useFavoritesVersion();
  const scope = user?.id ?? GUEST_SCOPE;
  const serverResume = trpc.progress.resume.useQuery(undefined, { enabled: Boolean(user) });
  const dash = trpc.progress.dashboard.useQuery(undefined, { enabled: Boolean(user) });
  const resumes = user
    ? (serverResume.data ?? []).slice(0, 3).map((r) => ({
        slug: r.slug,
        lesson: { lessonId: r.lessonId, title: r.lessonTitle },
      }))
    : lastLessons(scope)
        .filter((r) => active.some((s) => s.course.slug === r.slug))
        .slice(0, 3);
  const favs = (catalog.data ?? []).filter((c) => isFavorite(scope, c.id));

  const needed = [form.displayName, form.phone, form.stage, form.gradeKey, ...(form.stage === "secondary" ? [form.track, form.pathway] : [])];
  const completion = needed.filter(Boolean).length / needed.length;
  const dirty =
    !!profile &&
    (form.displayName !== (profile.displayName ?? "") ||
      form.phone !== (profile.phone ?? "") ||
      form.stage !== (profile.stage ?? "") ||
      form.gradeKey !== (profile.gradeKey ?? "") ||
      form.track !== (profile.track ?? "") ||
      form.pathway !== (profile.pathway ?? ""));

  const name = profile?.displayName || session.data?.user?.email || "";
  const initial = name.trim().charAt(0).toUpperCase() || t("home.36");

  return (
    <div className="min-h-dvh bg-black">
      <SiteHeader />

      <PageShell width="narrow">
        {/* ── Identity: straight on the page, no slab. Orbit avatar + one stat line ── */}
        <section className="pt-1">
          <div className="flex items-center gap-4 sm:gap-6">
            <button type="button" onClick={() => setTab("profile")} aria-label={t("account.tab.profile")} className="shrink-0">
              <OrbitAvatar initial={initial} progress={completion} className="w-[4.5rem] sm:w-24" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="break-words text-[clamp(1.5rem,5.2vw,2.25rem)] font-semibold leading-[1.2] tracking-[-0.03em] text-white">
                {name || t("account.02")}
              </h1>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 text-[13px] text-white/50">
                <span>{profile?.gradeKey ? gradeLabel(profile.gradeKey) : t("account.03")}</span>
                {profile?.phone ? (
                  <>
                    <span aria-hidden="true" className="size-[3px] rounded-full bg-white/25" />
                    <span dir="ltr" className="tabular">{profile.phone}</span>
                  </>
                ) : null}
              </p>
            </div>
          </div>

          <dl className="mt-6 flex items-center justify-between gap-2 border-y border-white/8 py-4">
            {[
              { Icon: IconWallet, label: t("account.05"), value: egp(balance), to: "/topup" },
              { Icon: IconBooks, label: t("account.07"), value: active.length },
              { Icon: IconLessons, label: t("account.stat.watched"), value: user ? (dash.data?.totals.completedLessons ?? "…") : watchedTotal(scope) },
              { Icon: IconSaved, label: t("account.stat.favs"), value: favoriteCount(scope) },
            ].map(({ Icon, label, value, to }) => {
              const body = (
                <Tip label={to ? t("account.04") : label} side="bottom">
                  <span className="inline-flex items-center gap-2">
                    <Icon className="size-[18px] shrink-0 text-white/45" />
                    <dd className="tabular text-[clamp(1rem,4.2vw,1.35rem)] font-semibold leading-none tracking-[-0.02em] text-white">
                      {value}
                    </dd>
                    <dt className="sr-only">{label}</dt>
                  </span>
                </Tip>
              );
              return (
                <div key={label} className="min-w-0">
                  {to ? (
                    <Link to={to} className="block transition-opacity hover:opacity-80" aria-label={t("account.04")}>
                      {body}
                    </Link>
                  ) : (
                    body
                  )}
                </div>
              );
            })}
          </dl>
        </section>

        {/* ── Continue learning: resume the exact lesson, one tap ── */}
        {resumes.length > 0 && (
          <section className="mt-8">
            <ul className="divide-y divide-white/8 border-b border-white/8">
              {resumes.map((r) => {
                const sub = active.find((s) => s.course.slug === r.slug)!;
                return (
                  <li key={r.slug}>
                    <Link
                      to={`/watch/${r.lesson.lessonId}`}
                      className="group flex items-center gap-4 py-3.5 transition-colors duration-150 hover:bg-white/[0.03]"
                    >
                      <div className="aspect-[2/3] w-11 shrink-0 overflow-hidden rounded-[var(--radius-media)] bg-[var(--surface-1)] ring-1 ring-white/8">
                        {sub.course.posterUrl ? (
                          <img
                            src={sub.course.posterUrl}
                            alt=""
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="t-caption text-white/38">{sub.course.title}</p>
                        <p className="clamp-2 mt-1 text-[14px] font-medium leading-snug text-white/90 group-hover:text-white">
                          {r.lesson.title}
                        </p>
                      </div>
                      <span className="grid size-9 shrink-0 place-items-center text-[var(--accent)]">
                        <Play className="size-[18px] rtl:-scale-x-100" fill="currentColor" strokeWidth={0} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* ── Tabs: icon-led, name on hover / long-press ── */}
        <div role="tablist" aria-label={t("account.12")} className="mt-7 flex border-b border-white/8">
          {TABS.map(({ key, label, Icon }) => (
            <Tip key={key} label={t(label)} className="flex-1">
              <button
                type="button"
                role="tab"
                aria-selected={tab === key}
                aria-label={t(label)}
                onClick={() => setTab(key)}
                className={cn(
                  "relative -mb-px grid h-11 w-full place-items-center transition-colors duration-150",
                  tab === key ? "text-white" : "text-white/40 hover:text-white/70",
                )}
              >
                <Icon className="size-5" strokeWidth={tab === key ? 2 : 1.75} />
                {tab === key && <span className="absolute inset-x-2 -bottom-px h-[2px] bg-[var(--accent)]" />}
              </button>
            </Tip>
          ))}
        </div>

        <div className="mt-6">
          {summary.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-[var(--radius-card)]" />
              <Skeleton className="h-20 w-full rounded-[var(--radius-card)]" />
            </div>
          ) : tab === "subs" ? (
            <>
              {active.length === 0 && expired.length === 0 ? (
                <EmptyState
                  orbit
                  icon={<IconBooks className="size-7" />}
                  title={t("account.13")}
                  body=""
                  action={
                    <Link
                      to="/courses"
                      className="inline-flex h-11 items-center rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 text-[14px] font-medium text-black"
                    >
                      {t("home.35")}
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-12">
                  {active.length > 0 && (
                    <section>
                      <ul className="divide-y divide-white/8 border-y border-white/8">
                        {active.map((s) => (
                          <SubRow key={s.id} sub={s} />
                        ))}
                      </ul>
                    </section>
                  )}
                  {expired.length > 0 && (
                    <section>
                      <SectionHead label={t("account.17")} />
                      <ul className="divide-y divide-white/8 border-y border-white/8">
                        {expired.map((s) => (
                          <SubRow key={s.id} sub={s} />
                        ))}
                      </ul>
                    </section>
                  )}

                  {suggested.length > 0 && (
                    <section>
                      <SectionHead
                        label={t("account.18")}
                        action={
                          <Link
                            to="/courses"
                            className="t-caption text-[var(--accent)] transition-opacity hover:opacity-80"
                          >
                            {t("home.42")}
                          </Link>
                        }
                      />
                      <ul className="divide-y divide-white/8 border-y border-white/8">
                        {suggested.map((c) => (
                          <li key={c.id}>
                            <Link
                              to={`/course/${c.slug}`}
                              className="group flex items-center gap-4 py-4 transition-colors hover:bg-white/[0.02]"
                            >
                              <div className="aspect-[2/3] w-11 shrink-0 overflow-hidden rounded-[var(--radius-media)] bg-[var(--surface-1)] ring-1 ring-white/8">
                                {c.posterUrl ? (
                                  <img
                                    src={c.posterUrl}
                                    alt=""
                                    className="size-full object-cover"
                                    loading="lazy"
                                  />
                                ) : null}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="clamp-2 text-[14.5px] font-medium leading-snug text-white/90 group-hover:text-white">
                                  {c.title}
                                </p>
                                <p className="mt-1.5 text-[11.5px] text-white/32">
                                  {gradeLabel(c.gradeKey)}
                                </p>
                              </div>
                              <span className="tabular shrink-0 text-[13.5px] text-white/70">
                                {egp(c.priceEgp)}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              )}
            </>
          ) : tab === "progress" ? (
            <ProgressPanel />
          ) : tab === "study" ? (
            <StudyPanel />
          ) : tab === "gaming" ? (
            <GamingPanel />
          ) : tab === "analytics" ? (
            <AnalyticsPanel />
          ) : tab === "certs" ? (
            <CertificatesPanel />
          ) : tab === "favs" ? (
            <>
              {favCatalog.isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full rounded-[var(--radius-card)]" />
                  <Skeleton className="h-20 w-full rounded-[var(--radius-card)]" />
                </div>
              ) : favs.length === 0 ? (
                <EmptyState
                  orbit
                  icon={<IconSaved className="size-7" />}
                  title={t("fav.empty.title")}
                  body=""
                  action={
                    <Link
                      to="/courses"
                      className="inline-flex h-11 items-center rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 text-[14px] font-medium text-black"
                    >
                      {t("fav.browse")}
                    </Link>
                  }
                />
              ) : (
                <ul className="divide-y divide-white/8 border-y border-white/8">
                  {favs.map((c) => (
                    <li key={c.id} className="flex items-center gap-4 py-4">
                      <Link
                        to={`/course/${c.slug}`}
                        className="group flex min-w-0 flex-1 items-center gap-4 transition-colors hover:bg-white/[0.02]"
                      >
                        <div className="aspect-[2/3] w-11 shrink-0 overflow-hidden rounded-[var(--radius-media)] bg-[var(--surface-1)] ring-1 ring-white/8">
                          {c.posterUrl ? (
                            <img
                              src={c.posterUrl}
                              alt=""
                              className="size-full object-cover"
                              loading="lazy"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="clamp-2 text-[14.5px] font-medium leading-snug text-white/90 group-hover:text-white">
                            {c.title}
                          </p>
                          <p className="mt-1.5 text-[11.5px] text-white/32">{gradeLabel(c.gradeKey)}</p>
                        </div>
                        <span className="tabular shrink-0 text-[13.5px] text-white/70">
                          {egp(c.priceEgp)}
                        </span>
                      </Link>
                      <Tip label={t("fav.remove")}>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(scope, c.id)}
                          aria-label={t("fav.remove")}
                          className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-btn)] text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft)]"
                        >
                          <Heart className="size-[18px]" fill="currentColor" />
                        </button>
                      </Tip>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : tab === "wallet" ? (
            <>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <SectionHead
                  label={t("account.20")}
                  className="mb-0"
                />
                <Link
                  to="/topup"
                  className="t-caption text-[var(--accent)] transition-opacity hover:opacity-80"
                >
                  {t("account.22")}
                </Link>
              </div>
              {(summary.data?.transactions ?? []).length === 0 ? (
                <EmptyState
                  orbit
                  icon={<IconWallet className="size-7" />}
                  title={t("account.23")}
                  body=""
                  action={
                    <Link
                      to="/topup"
                      className="inline-flex h-11 items-center rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 text-[14px] font-medium text-black"
                    >
                      {t("account.25")}
                    </Link>
                  }
                />
              ) : (
                <ul className="divide-y divide-white/8 border-y border-white/8">
                  {(summary.data?.transactions ?? []).map((row) => {
                    const credit = row.amountEgp > 0;
                    return (
                      <li key={row.id} className="flex items-center gap-4 py-4">
                        <span
                          className={cn(
                            "grid size-8 shrink-0 place-items-center rounded-[var(--radius-btn)] border",
                            credit
                              ? "border-emerald-500/25 text-emerald-400/90"
                              : "border-white/10 text-white/40",
                          )}
                        >
                          {credit ? (
                            <ArrowDownLeft className="size-3.5" strokeWidth={2} />
                          ) : (
                            <ArrowUpRight className="size-3.5" strokeWidth={2} />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] text-white/85">
                            {row.type === "topup"
                              ? t("account.26")
                              : row.type === "purchase"
                                ? row.note || t("account.27")
                                : row.type === "refund"
                                  ? t("account.28")
                                  : t("account.29")}
                          </p>
                          <p className="tabular mt-0.5 text-[11.5px] text-white/28">
                            {shortDate(row.createdAt)}
                          </p>
                        </div>
                        <div className="text-end">
                          <p
                            className={cn(
                              "tabular text-[14px] font-medium",
                              credit ? "text-emerald-400/90" : "text-white/80",
                            )}
                          >
                            {credit ? "+" : "−"}
                            {egp(Math.abs(row.amountEgp))}
                          </p>
                          <p className="tabular mt-0.5 text-[11px] text-white/22">
                            {t("account.30")} {egp(row.balanceAfter)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          ) : (
            <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate({
                  displayName: form.displayName || null,
                  phone: form.phone || null,
                  stage: form.stage || null,
                  gradeKey: form.gradeKey || null,
                  track: form.track || null,
                  pathway: form.pathway || null,
                });
              }}
              className="grid gap-x-16 gap-y-10 lg:grid-cols-2 lg:items-start"
            >
              <Panel Icon={IconPerson} title={t("profile.basics")}>
                <IconField Icon={IconPerson} label={t("signup.03")}>
                  <Input
                    value={form.displayName}
                    onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                    placeholder={t("account.31")}
                    maxLength={80}
                    className="ps-12"
                  />
                </IconField>
                <IconField Icon={IconPhone} label={t("account.32")}>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="01xxxxxxxxx"
                    inputMode="tel"
                    maxLength={30}
                    dir="ltr"
                    className="ps-12 text-start"
                  />
                </IconField>
              </Panel>

              <Panel Icon={IconStage} title={t("profile.study")}>
                <ChoiceGroup
                  Icon={IconStage}
                  label={t("courses.07")}
                  value={form.stage}
                  options={STAGES.map((s) => ({ key: s.key, label: s.label }))}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      stage: v,
                      gradeKey: "",
                      track: v === "prep" ? "" : f.track,
                    }))
                  }
                />
                <ChoiceGroup
                  Icon={IconGrade}
                  label={t("courses.09")}
                  value={form.gradeKey}
                  options={grades.map((g) => ({ key: g.key, label: g.label }))}
                  onChange={(v) => setForm((f) => ({ ...f, gradeKey: v }))}
                />
                {form.stage === "secondary" && (
                  <>
                    <ChoiceGroup
                      Icon={IconTrack}
                      label={t("courses.11")}
                      value={form.track}
                      options={TRACKS.map((x) => ({ key: x.key, label: x.label }))}
                      onChange={(v) => setForm((f) => ({ ...f, track: v }))}
                    />
                    <ChoiceGroup
                      Icon={IconPathway}
                      label={t("courses.13")}
                      value={form.pathway}
                      options={PATHWAYS.map((x) => ({ key: x.key, label: x.label }))}
                      onChange={(v) => setForm((f) => ({ ...f, pathway: v }))}
                    />
                  </>
                )}
              </Panel>

              <Panel Icon={IconGlobe} title={t("profile.prefs")} className="lg:col-span-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[14px] font-medium text-white/85">{t("lang.label")}</p>
                  <LanguageSegmented />
                </div>
                <div className="flex flex-col gap-3 border-t border-white/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[14px] font-medium text-white/85">{t("settings.signOut")}</p>
                  <Tip label={t("header.04")}>
                    <button
                      type="button"
                      onClick={() => void logout()}
                      aria-label={t("header.04")}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] border border-white/14 px-6 text-[14px] font-medium text-white transition-colors hover:border-red-400/50 hover:bg-red-500/10"
                    >
                      <IconExit className="size-[18px]" aria-hidden="true" />
                      {t("header.04")}
                    </button>
                  </Tip>
                </div>
              </Panel>

              {/* Save bar: hairline strip above the mobile nav */}
              {dirty && (
              <div className="sticky bottom-[4.6rem] z-20 -mx-4 border-t border-white/10 bg-black/95 px-4 py-3 backdrop-blur-xl sm:mx-0 lg:bottom-0 lg:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex min-w-0 items-center gap-2 text-[13px] text-white/50">
                    <span className={cn("size-2 shrink-0 rounded-full", dirty ? "bg-amber-400" : "bg-emerald-400")} />
                    <span className="truncate">{dirty ? t("profile.unsaved") : t("profile.saved")}</span>
                  </p>
                  <button
                    type="submit"
                    disabled={save.isPending || !dirty}
                    className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] px-6 text-[14px] font-semibold text-black transition-colors duration-150 hover:bg-[var(--accent-hover)] active:scale-[0.985] disabled:bg-white/10 disabled:text-white/35 motion-reduce:active:scale-100"
                  >
                    <IconCheck className="size-4" />
                    {save.isPending ? t("account.34") : t("account.35")}
                  </button>
                </div>
              </div>
              )}
            </form>
            </>
          )}
        </div>
      </PageShell>
      {isParentRole && <Redirect to="/parent" />}
      {!isParentRole && <div className="page-x mx-auto mb-10 max-w-[var(--page-max)]"><ParentCodePanel /></div>}
      <SiteFooter />
    </div>
  );
}

function SubRow({
  sub,
}: {
  sub: {
    id: string;
    isActive: boolean;
    expiresAt: string | Date;
    course: { slug: string; title: string; gradeKey: string; posterUrl: string | null };
  };
}) {
  const left = daysLeft(sub.expiresAt);
  return (
    <li>
      <Link
        to={`/course/${sub.course.slug}`}
        className="group flex items-center gap-4 py-4 transition-colors hover:bg-white/[0.02]"
      >
        <div className="aspect-[2/3] w-11 shrink-0 overflow-hidden rounded-[var(--radius-media)] bg-[var(--surface-1)] ring-1 ring-white/8">
          {sub.course.posterUrl ? (
            <img src={sub.course.posterUrl} alt="" className="size-full object-cover" loading="lazy" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="clamp-2 text-[14.5px] font-medium leading-snug text-white/90 group-hover:text-white">
            {sub.course.title}
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-white/32">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" strokeWidth={1.75} />
              {sub.isActive ? (
                <span className="tabular">{t("account.left", { left })}</span>
              ) : (
                <span>{t("account.38")} {shortDate(sub.expiresAt)}</span>
              )}
            </span>
          </p>
        </div>
      </Link>
    </li>
  );
}


function Panel({
  Icon,
  title,
  hint,
  children,
  className,
}: {
  Icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  title: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-5 border-b border-white/8 pb-3">
        <h2 className="flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.01em] text-white">
          <Icon className="size-5 text-white/45" />
          {title}
        </h2>
        {hint && <p className="mt-1.5 text-[12.5px] leading-snug text-white/38">{hint}</p>}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function IconField({
  Icon,
  label,
  children,
}: {
  Icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12.5px] text-white/50">{label}</span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-white/45" />
        {children}
      </span>
    </label>
  );
}

function ChoiceGroup({
  Icon,
  label,
  value,
  options,
  onChange,
}: {
  Icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  label: string;
  value: string;
  options: { key: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label}>
      <span className="mb-2.5 flex items-center gap-2 text-[12.5px] font-medium text-white/55">
        <Icon className="size-4 text-white/35" />
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o.key;
          return (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(on ? "" : o.key)}
              className={cn(
                "inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-btn)] border px-4 text-[13.5px] transition-colors duration-150",
                on
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] font-medium text-white"
                  : "border-white/12 bg-white/[0.02] text-white/60 hover:border-white/25 hover:text-white",
              )}
            >
              {on && <IconCheck className="size-3.5 text-[var(--accent)]" />}
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
