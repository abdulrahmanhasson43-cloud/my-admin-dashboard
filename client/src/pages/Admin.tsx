import { Link } from "wouter";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Wallet,
  BookOpen,
  Users,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Pencil,
  ExternalLink,
  Eye,
  Link2,
  Layers,
  Banknote,
  ChevronRight,
  Video,
  ChevronDown,
  Save,
  AlertCircle,
  GraduationCap,
  ClipboardList,
} from "lucide-react";
import { trpc } from "@/_core/trpc";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Tip } from "@/components/ui/tip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Chip, PageHeader, PageShell, RowList, SectionHead } from "@/components/site/page";
import { TeacherStudio } from "@/components/site/platform";
import { RevenueReport, TeacherVideoStats } from "@/components/site/analytics";
import { useAccent } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { GRADES, MATH_LEVELS, PATHWAYS, STAGES, TRACKS, egp, gradeLabel, methodLabel, shortDate } from "@/i18n/domain";

import { contentDir, t } from "@/i18n";
import { errorText } from "@/i18n/errors";
import { IntegrationsPanel } from "@/components/site/v14";

const TABS = [
  { key: "overview", label: "admin.tab.overview", icon: LayoutDashboard },
  { key: "topups", label: "admin.tab.topups", icon: Wallet },
  { key: "courses", label: "admin.tab.courses", icon: BookOpen },
  { key: "students", label: "admin.tab.students", icon: Users },
  { key: "settings", label: "admin.tab.settings", icon: Settings },
  { key: "studio", label: "admin.tab.studio", icon: GraduationCap },
  { key: "activity", label: "admin.tab.activity", icon: ClipboardList },
  { key: "integrations", label: "v14.admin.tab", icon: Link2 },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Admin() {
  const settings = trpc.catalog.settings.useQuery();
  useAccent(settings.data?.accent_color);
  const [tab, setTab] = useState<TabKey>("overview");

  const stats = trpc.admin.stats.useQuery();

  return (
    <div className="min-h-dvh bg-black">
      <SiteHeader />

      <PageShell>
        <PageHeader
          eyebrow={t("admin.01")}
          title={t("admin.02")}
          actions={
            <Tip label={t("admin.04")}>
              <Link
                to="/"
                aria-label={t("admin.04")}
                className="grid size-11 place-items-center rounded-[var(--radius-btn)] border border-white/12 text-white/70 transition-colors duration-150 hover:border-white/30 hover:text-white"
              >
                <ExternalLink className="size-4" strokeWidth={1.75} />
              </Link>
            </Tip>
          }
        />

        {/* Needs-attention band: the one thing an owner must act on, above the tabs. */}
        {stats.data && stats.data.pendingTopups > 0 && (
          <button
            type="button"
            onClick={() => setTab("topups")}
            className="mb-8 flex w-full items-center justify-between gap-4 border-y border-amber-500/25 bg-amber-500/[0.04] px-4 py-3.5 text-start transition-colors duration-150 hover:bg-amber-500/[0.07]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-[var(--radius-btn)] border border-amber-500/30 text-amber-400">
                <Clock className="size-4" strokeWidth={2} />
              </span>
              <span className="block min-w-0 text-[13.5px] font-medium text-white">
                <span className="tabular">{stats.data.pendingTopups}</span> {t("admin.05")}
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-amber-400/90 rtl:rotate-180" strokeWidth={2} aria-hidden="true" />
          </button>
        )}

        {/* Tabs: icon-led, the name shows on hover / focus / long-press. */}
        <div
          role="tablist"
          aria-label={t("admin.08")}
          className="flex border-b border-white/8 sm:gap-2"
        >
          {TABS.map((tb) => {
            const Icon = tb.icon;
            const badge = tb.key === "topups" ? (stats.data?.pendingTopups ?? 0) : 0;
            return (
              <Tip key={tb.key} label={t(tb.label)} className="-mb-px min-w-0 flex-1 sm:flex-none">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === tb.key}
                  aria-label={t(tb.label)}
                  onClick={() => setTab(tb.key)}
                  className={cn(
                    "relative flex h-11 w-full items-center justify-center transition-colors duration-150 sm:w-auto sm:px-4",
                    tab === tb.key ? "text-white" : "text-white/40 hover:text-white/70",
                  )}
                >
                  <Icon className="size-[18px]" strokeWidth={1.75} />
                  {badge > 0 && (
                    <span className="tabular absolute end-1 top-1 grid h-[16px] min-w-[16px] place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold leading-none text-black sm:end-2">
                      {badge}
                    </span>
                  )}
                  {tab === tb.key && (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[var(--accent)]" />
                  )}
                </button>
              </Tip>
            );
          })}
        </div>

        <div className="mt-6">
          {tab === "overview" && <><Overview /><RevenueReport /></>}
          {tab === "topups" && <Topups />}
          {tab === "courses" && <Courses />}
          {tab === "students" && <Students />}
          {tab === "settings" && <SettingsTab />}
          {tab === "studio" && <><TeacherStudio /><TeacherVideoStats /></>}
          {tab === "activity" && <ActivityLog />}
          {tab === "integrations" && <IntegrationsPanel />}
        </div>
      </PageShell>
      <SiteFooter />
    </div>
  );
}

function IconStats({
  items,
  cols,
}: {
  items: { icon: typeof Clock; label: string; value: ReactNode; tone?: string }[];
  cols: string;
}) {
  return (
    <div className={cn("grid border-y border-white/8", cols)}>
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <div
            key={it.label}
            className={cn("py-5", i > 0 && "border-s border-white/8 ps-5 sm:ps-6")}
          >
            <Tip label={it.label}>
              <span aria-label={it.label} className="inline-flex text-white/35">
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
            </Tip>
            <p
              className={cn(
                "tabular mt-2.5 text-[1.5rem] font-semibold leading-none tracking-[-0.02em]",
                it.tone ?? "text-white",
              )}
            >
              {it.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Overview ───────────────────────────────────────────────────────────────

function Overview() {
  const stats = trpc.admin.stats.useQuery();
  const pending = trpc.admin.topups.useQuery({ status: "pending" });

  if (stats.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full rounded-[var(--radius-media)]" />
        <Skeleton className="h-40 w-full rounded-[var(--radius-media)]" />
      </div>
    );
  }

  const s = stats.data!;

  return (
    <div className="space-y-10">
      <IconStats
        cols="grid-cols-2 sm:grid-cols-4"
        items={[
          { icon: Banknote, label: t("admin.09"), value: egp(s.revenueEgp), tone: "text-emerald-400" },
          { icon: CheckCircle2, label: t("account.07"), value: s.activeSubscriptions },
          { icon: Users, label: t("admin.10"), value: s.students },
          {
            icon: Clock,
            label: t("admin.11"),
            value: s.pendingTopups,
            tone: s.pendingTopups > 0 ? "text-amber-400" : "text-white",
          },
        ]}
      />

      <section>
        <SectionHead label={t("admin.12")} />
        <IconStats
          cols="grid-cols-3"
          items={[
            { icon: BookOpen, label: t("admin.14"), value: s.published },
            { icon: Pencil, label: t("admin.15"), value: s.drafts },
            { icon: Layers, label: t("admin.16"), value: s.lessons },
          ]}
        />
      </section>

      <section>
        <SectionHead
          label={t("admin.17")}
          action={
            (pending.data ?? []).length > 0 ? (
              <Tip label={t("admin.19")}>
                <span
                  aria-label={t("admin.19")}
                  className="tabular inline-flex items-center gap-1.5 text-[12px] text-amber-400/80"
                >
                  <Clock className="size-3.5" strokeWidth={1.75} />
                  {(pending.data ?? []).length}
                </span>
              </Tip>
            ) : undefined
          }
        />
        {(pending.data ?? []).length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="size-6" strokeWidth={1.5} />}
            title={t("admin.20")}
            className="py-10"
          />
        ) : (
          <RowList>
            {(pending.data ?? []).slice(0, 5).map((row) => (
              <li key={row.id} className="flex items-center gap-3 py-3.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-[var(--radius-btn)] border border-white/10 text-white/35">
                  <Wallet className="size-3.5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] text-white/85">{row.studentEmail}</p>
                  <p className="mt-1 text-[11px] text-white/35">
                    {methodLabel(row.method)} · {shortDate(row.createdAt)}
                  </p>
                </div>
                <span className="tabular text-[14px] font-semibold text-white">{egp(row.amountEgp)}</span>
              </li>
            ))}
          </RowList>
        )}
      </section>
    </div>
  );
}

// ─── Top-ups ────────────────────────────────────────────────────────────────

function Topups() {
  const toast = useToast();
  const utils = trpc.useUtils();
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const list = trpc.admin.topups.useQuery(status === "all" ? {} : { status });

  const approve = trpc.admin.approveTopup.useMutation({
    onSuccess: async () => {
      toast.push("success", t("admin.22"));
      await Promise.all([
        utils.admin.topups.invalidate(),
        utils.admin.stats.invalidate(),
        utils.wallet.summary.invalidate(),
      ]);
    },
    onError: (e) => toast.push("error", errorText(e)),
  });

  const reject = trpc.admin.rejectTopup.useMutation({
    onSuccess: async () => {
      toast.push("success", t("admin.23"));
      setRejecting(null);
      setReason("");
      await Promise.all([utils.admin.topups.invalidate(), utils.admin.stats.invalidate()]);
    },
    onError: (e) => toast.push("error", errorText(e)),
  });

  return (
    <div>
      <div className="mb-5 flex items-center gap-1 border-b border-white/8">
        {([
          { key: "pending", label: t("topup.46"), icon: Clock },
          { key: "approved", label: t("admin.24"), icon: CheckCircle2 },
          { key: "rejected", label: t("admin.25"), icon: XCircle },
          { key: "all", label: t("courses.12"), icon: Layers },
        ] as const).map((f) => {
          const Icon = f.icon;
          return (
            <Tip key={f.key} label={f.label} className="-mb-px">
              <button
                type="button"
                onClick={() => setStatus(f.key)}
                aria-pressed={status === f.key}
                aria-label={f.label}
                className={cn(
                  "relative grid h-11 w-12 place-items-center transition-colors duration-150",
                  status === f.key ? "text-white" : "text-white/40 hover:text-white/70",
                )}
              >
                <Icon className="size-[18px]" strokeWidth={1.75} />
                {status === f.key && (
                  <span className="absolute inset-x-0 bottom-0 h-px bg-[var(--accent)]" />
                )}
              </button>
            </Tip>
          );
        })}
      </div>

      {list.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      ) : (list.data ?? []).length === 0 ? (
        <EmptyState
          icon={<Wallet className="size-6" strokeWidth={1.5} />}
          title={status === "pending" ? t("admin.26") : t("admin.27")}
        />
      ) : (
        <RowList>
          {(list.data ?? []).map((row) => (
            <li key={row.id} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-white">{row.studentName || row.studentEmail}</p>
                  <p className="mt-1 text-[11px] text-white/35">
                    {row.studentEmail} · {methodLabel(row.method)} · {shortDate(row.createdAt)}
                  </p>
                  {row.reference && (
                    <p className="tabular mt-1 text-[11px] text-white/30" dir="ltr">
                      #{row.reference}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <p className="tabular text-[17px] font-semibold text-white">{egp(row.amountEgp)}</p>
                  <StatusPill status={row.status} />
                </div>
              </div>

              {row.rejectReason && (
                <p className="mt-2 border-s-2 border-red-500/40 ps-2.5 text-[11.5px] leading-relaxed text-red-300/80">
                  {t("admin.30")} {row.rejectReason}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {row.receiptUrl ? (
                  <Tip label={t("admin.31")}>
                  <a
                    href={row.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      // Demo mode stores receipts as data URLs, which browsers refuse to open
                      // in a new tab directly — turn them into a blob URL first.
                      if (!row.receiptUrl?.startsWith("data:")) return;
                      e.preventDefault();
                      fetch(row.receiptUrl).then((r) => r.blob()).then((b) => window.open(URL.createObjectURL(b), "_blank"));
                    }}
                    aria-label={t("admin.31")}
                    className="grid size-11 place-items-center rounded-[var(--radius-btn)] border border-white/12 text-white/70 transition-colors duration-150 hover:border-white/30 hover:text-white"
                  >
                    <Eye className="size-4" strokeWidth={1.75} />
                  </a>
                  </Tip>
                ) : (
                  <Tip label={t("admin.32")}>
                  <span
                    aria-label={t("admin.32")}
                    className="grid size-11 place-items-center rounded-[var(--radius-btn)] border border-amber-500/25 text-amber-400/90"
                  >
                    <AlertCircle className="size-4" strokeWidth={2} />
                  </span>
                  </Tip>
                )}

                {row.status === "pending" && (
                  <>
                    <button
                      type="button"
                      disabled={approve.isPending}
                      onClick={() => approve.mutate({ id: row.id })}
                      className="inline-flex h-11 items-center gap-1.5 rounded-[var(--radius-btn)] bg-emerald-500 px-4 text-[12.5px] font-semibold text-black transition-colors duration-150 hover:bg-emerald-400 active:translate-y-px disabled:opacity-50 motion-reduce:active:translate-y-0"
                    >
                      <CheckCircle2 className="size-3.5" strokeWidth={2.5} />
                      {t("admin.33")}
                    </button>
                    <Tip label={t("admin.34")}>
                      <button
                        type="button"
                        aria-label={t("admin.34")}
                        onClick={() => {
                          setRejecting(row.id);
                          setReason("");
                        }}
                        className="grid size-11 place-items-center rounded-[var(--radius-btn)] border border-white/12 text-white/70 transition-colors duration-150 hover:border-red-500/40 hover:text-red-300"
                      >
                        <XCircle className="size-4" strokeWidth={2} />
                      </button>
                    </Tip>
                  </>
                )}
              </div>
            </li>
          ))}
        </RowList>
      )}

      <Dialog
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        title={t("admin.35")}
        footer={
          <>
            <button
              type="button"
              onClick={() => setRejecting(null)}
              className="inline-flex h-11 items-center rounded-[var(--radius-btn)] border border-white/15 px-4 text-[14px] text-white/80 hover:border-white/30"
            >
              {t("coursedetail.33")}
            </button>
            <button
              type="button"
              disabled={reason.trim().length < 3 || reject.isPending}
              onClick={() => rejecting && reject.mutate({ id: rejecting, reason: reason.trim() })}
              className="inline-flex h-11 items-center rounded-[var(--radius-btn)] bg-red-500 px-5 text-[14px] font-semibold text-black transition-colors hover:bg-red-400 disabled:opacity-45"
            >
              {reject.isPending ? t("admin.37") : t("admin.38")}
            </button>
          </>
        }
      >
        <Textarea
          value={reason} dir={contentDir()}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("admin.39")}
          maxLength={300}
          autoFocus
        />
      </Dialog>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === "approved")
    return (
      <Chip tone="good">
        <CheckCircle2 className="size-3" strokeWidth={2.5} />
        {t("topup.44")}
      </Chip>
    );
  if (status === "rejected")
    return (
      <Chip tone="bad">
        <XCircle className="size-3" strokeWidth={2.5} />
        {t("topup.45")}
      </Chip>
    );
  return (
    <Chip tone="warn">
      <Clock className="size-3" strokeWidth={2.5} />
      {t("topup.46")}
    </Chip>
  );
}

// ─── Courses ────────────────────────────────────────────────────────────────

function Courses() {
  const toast = useToast();
  const utils = trpc.useUtils();
  const list = trpc.admin.courses.useQuery();
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const del = trpc.admin.deleteCourse.useMutation({
    onSuccess: async () => {
      toast.push("success", t("admin.40"));
      await Promise.all([utils.admin.courses.invalidate(), utils.catalog.courses.invalidate()]);
    },
    onError: (e) => toast.push("error", errorText(e)),
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/8 pb-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
          <span className="tabular">{t("courses.count", { n: (list.data ?? []).length })}</span>
        </p>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] px-4 text-[13.5px] font-semibold text-black transition-colors duration-150 hover:bg-[var(--accent-hover)] active:translate-y-px motion-reduce:active:translate-y-0"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          {t("admin.41")}
        </button>
      </div>

      {list.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      ) : (list.data ?? []).length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-6" strokeWidth={1.5} />}
          title={t("admin.42")}
          action={
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 text-[14px] font-medium text-black"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              {t("admin.44")}
            </button>
          }
        />
      ) : (
        <RowList>
          {(list.data ?? []).map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-3.5">
              <div className="aspect-[2/3] w-10 shrink-0 overflow-hidden rounded-[var(--radius-media)] bg-[var(--surface-1)] ring-1 ring-white/8">
                {c.posterUrl ? (
                  <img src={c.posterUrl} alt="" className="size-full object-cover" loading="lazy" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-[13.5px] font-medium text-white/90">{c.title}</p>
                  {!c.isPublished && (
                    <Tip label={t("admin.45")}>
                      <span aria-label={t("admin.45")} className="inline-flex text-amber-400/90">
                        <Pencil className="size-3.5" strokeWidth={1.75} />
                      </span>
                    </Tip>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-white/35">
                  {gradeLabel(c.gradeKey)} · <span className="tabular">{t("lessons.n", { n: c.lessonCount })}</span> ·{" "}
                  <span className="tabular">{egp(c.priceEgp)}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center">
                <Tip label={t("admin.47")}>
                  <Link
                    to={`/course/${c.slug}`}
                    aria-label={t("admin.47")}
                    className="grid size-11 place-items-center rounded-[var(--radius-btn)] text-white/35 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    <ExternalLink className="size-4" strokeWidth={1.75} />
                  </Link>
                </Tip>
                <Tip label={t("admin.48")}>
                  <button
                    type="button"
                    onClick={() => setEditing(c.id)}
                    aria-label={t("admin.48")}
                    className="grid size-11 place-items-center rounded-[var(--radius-btn)] text-white/35 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    <Pencil className="size-4" strokeWidth={1.75} />
                  </button>
                </Tip>
                <Tip label={t("admin.50")}>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(t("admin.49", { title: c.title }))) {
                        del.mutate({ id: c.id });
                      }
                    }}
                    aria-label={t("admin.50")}
                    className="grid size-11 place-items-center rounded-[var(--radius-btn)] text-white/35 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="size-4" strokeWidth={1.75} />
                  </button>
                </Tip>
              </div>
            </li>
          ))}
        </RowList>
      )}

      {(creating || editing) && (
        <CourseEditor
          courseId={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function CourseEditor({ courseId, onClose }: { courseId: string | null; onClose: () => void }) {
  const toast = useToast();
  const utils = trpc.useUtils();
  const detail = trpc.admin.course.useQuery({ id: courseId ?? "" }, { enabled: Boolean(courseId) });

  const [form, setForm] = useState({
    title: "",
    stage: "prep",
    gradeKey: "prep-1",
    track: "general",
    pathway: "",
    mathLevel: "standard",
    description: "",
    posterUrl: "",
    backdropUrl: "",
    priceEgp: 1200,
    durationMonths: 3,
    isPublished: true,
  });
  const [hydrated, setHydrated] = useState(false);

  if (detail.data && !hydrated) {
    const c = detail.data.course;
    setForm({
      title: c.title,
      stage: c.stage,
      gradeKey: c.gradeKey,
      track: c.track,
      pathway: c.pathway ?? "",
      mathLevel: c.mathLevel,
      description: c.description ?? "",
      posterUrl: c.posterUrl ?? "",
      backdropUrl: c.backdropUrl ?? "",
      priceEgp: c.priceEgp,
      durationMonths: c.durationMonths,
      isPublished: c.isPublished,
    });
    setHydrated(true);
  }

  const save = trpc.admin.saveCourse.useMutation({
    onSuccess: async () => {
      toast.push("success", courseId ? t("admin.51") : t("admin.52"));
      await Promise.all([
        utils.admin.courses.invalidate(),
        utils.admin.course.invalidate(),
        utils.catalog.courses.invalidate(),
      ]);
      if (!courseId) onClose();
    },
    onError: (e) => toast.push("error", errorText(e)),
  });

  const grades = GRADES.filter((g) => g.stage === form.stage);

  return (
    <Dialog
      open
      onClose={onClose}
      title={courseId ? t("admin.48") : t("admin.41")}
      className="max-w-2xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center rounded-[var(--radius-btn)] border border-white/15 px-4 text-[14px] text-white/80 hover:border-white/30"
          >
            {t("admin.55")}
          </button>
          <button
            type="button"
            disabled={save.isPending || form.title.trim().length < 2}
            onClick={() =>
              save.mutate({
                id: courseId ?? undefined,
                title: form.title.trim(),
                stage: form.stage as "prep" | "secondary",
                gradeKey: form.gradeKey,
                track: form.track,
                pathway: form.pathway || null,
                mathLevel: form.mathLevel as "standard" | "advanced",
                description: form.description || null,
                posterUrl: form.posterUrl || null,
                backdropUrl: form.backdropUrl || null,
                priceEgp: form.priceEgp,
                durationMonths: form.durationMonths,
                isPublished: form.isPublished,
              })
            }
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 text-[14px] font-semibold text-black transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-45"
          >
            <Save className="size-4" strokeWidth={2} />
            {save.isPending ? t("account.34") : t("admin.56")}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="t-overline mb-2 block text-white/38">{t("admin.57")}</span>
          <Input
            value={form.title} dir={contentDir()}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder={t("admin.58")}
            maxLength={120}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="t-overline mb-2 block text-white/38">{t("courses.07")}</span>
            <Select
              value={form.stage}
              onChange={(e) => {
                const stage = e.target.value;
                const first = GRADES.find((g) => g.stage === stage);
                setForm((f) => ({
                  ...f,
                  stage,
                  gradeKey: first?.key ?? "",
                  track: stage === "prep" ? "general" : f.track,
                }));
              }}
            >
              {STAGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="t-overline mb-2 block text-white/38">{t("courses.09")}</span>
            <Select
              value={form.gradeKey}
              onChange={(e) => setForm((f) => ({ ...f, gradeKey: e.target.value }))}
            >
              {grades.map((g) => (
                <option key={g.key} value={g.key}>
                  {g.label}
                </option>
              ))}
            </Select>
          </label>
        </div>

        {form.stage === "secondary" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="t-overline mb-2 block text-white/38">{t("courses.11")}</span>
              <Select
                value={form.track}
                onChange={(e) => setForm((f) => ({ ...f, track: e.target.value }))}
              >
                {TRACKS.map((track) => (
                  <option key={track.key} value={track.key}>
                    {track.label}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block">
              <span className="t-overline mb-2 block text-white/38">{t("admin.59")}</span>
              <Select
                value={form.pathway}
                onChange={(e) => setForm((f) => ({ ...f, pathway: e.target.value }))}
              >
                <option value="">{t("admin.60")}</option>
                {PATHWAYS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="t-overline mb-2 block text-white/38">{t("courses.15")}</span>
            <Select
              value={form.mathLevel}
              onChange={(e) => setForm((f) => ({ ...f, mathLevel: e.target.value }))}
            >
              {MATH_LEVELS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="t-overline mb-2 block text-white/38">{t("admin.61")}</span>
            <Input
              type="number"
              min={0}
              step={50}
              value={form.priceEgp}
              onChange={(e) => setForm((f) => ({ ...f, priceEgp: Number(e.target.value) || 0 }))}
              className="tabular"
              dir="ltr"
            />
          </label>
          <label className="block">
            <span className="t-overline mb-2 block text-white/38">{t("admin.62")}</span>
            <Input
              type="number"
              min={1}
              max={12}
              value={form.durationMonths}
              onChange={(e) => setForm((f) => ({ ...f, durationMonths: Number(e.target.value) || 1 }))}
              className="tabular"
              dir="ltr"
            />
          </label>
        </div>

        <label className="block">
          <span className="t-overline mb-2 block text-white/38">{t("admin.63")}</span>
          <Textarea
            value={form.description} dir={contentDir()}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder={t("admin.64")}
            maxLength={600}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="t-overline mb-2 block text-white/38">{t("admin.65")}</span>
            <Input
              value={form.posterUrl}
              onChange={(e) => setForm((f) => ({ ...f, posterUrl: e.target.value }))}
              placeholder="https://…"
              dir="ltr"
            />
          </label>
          <label className="block">
            <span className="t-overline mb-2 block text-white/38">{t("admin.66")}</span>
            <Input
              value={form.backdropUrl}
              onChange={(e) => setForm((f) => ({ ...f, backdropUrl: e.target.value }))}
              placeholder="https://…"
              dir="ltr"
            />
          </label>
        </div>

        <Switch
          checked={form.isPublished}
          onCheckedChange={(v) => setForm((f) => ({ ...f, isPublished: v }))}
          label={t("admin.67")}
        />

        {courseId && detail.data && (
          <ContentEditor
            courseId={courseId}
            units={detail.data.units}
            lessons={detail.data.lessons}
          />
        )}
      </div>
    </Dialog>
  );
}

function ContentEditor({
  courseId,
  units,
  lessons,
}: {
  courseId: string;
  units: { id: string; title: string; sortOrder: number }[];
  lessons: {
    id: string;
    title: string;
    unitId: string | null;
    videoUrl: string | null;
    durationSec: number;
    isFree: boolean;
    summary: string | null;
  }[];
}) {
  const toast = useToast();
  const utils = trpc.useUtils();
  const [unitTitle, setUnitTitle] = useState("");
  const [lessonForm, setLessonForm] = useState({
    title: "",
    unitId: "",
    videoUrl: "",
    durationSec: 0,
    isFree: false,
    summary: "",
  });
  const [open, setOpen] = useState(false);

  const refresh = () => utils.admin.course.invalidate();

  const addUnit = trpc.admin.createUnit.useMutation({
    onSuccess: async () => {
      setUnitTitle("");
      toast.push("success", t("admin.68"));
      await refresh();
    },
    onError: (e) => toast.push("error", errorText(e)),
  });
  const delUnit = trpc.admin.deleteUnit.useMutation({
    onSuccess: async () => {
      toast.push("success", t("admin.69"));
      await refresh();
    },
    onError: (e) => toast.push("error", errorText(e)),
  });
  const addLesson = trpc.admin.createLesson.useMutation({
    onSuccess: async () => {
      setLessonForm({ title: "", unitId: "", videoUrl: "", durationSec: 0, isFree: false, summary: "" });
      toast.push("success", t("admin.70"));
      await refresh();
    },
    onError: (e) => toast.push("error", errorText(e)),
  });
  const delLesson = trpc.admin.deleteLesson.useMutation({
    onSuccess: async () => {
      toast.push("success", t("admin.71"));
      await refresh();
    },
    onError: (e) => toast.push("error", errorText(e)),
  });

  return (
    <div className="mt-2 border-t border-white/10 pt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 py-1 text-[13px] font-medium text-white/70 hover:text-white"
      >
        <span>
          {t("admin.unitsLessons", { u: units.length, l: lessons.length })}
        </span>
        <ChevronDown
          className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div className="mt-3 space-y-5">
          {/* Units */}
          <div>
            <p className="mb-2 text-[12px] text-white/45">{t("admin.75")}</p>
            <div className="flex gap-2">
              <Input
                value={unitTitle} dir={contentDir()}
                onChange={(e) => setUnitTitle(e.target.value)}
                placeholder={t("admin.76")}
                maxLength={120}
                className="h-11"
              />
              <Tip label={t("admin.77")}>
                <button
                  type="button"
                  aria-label={t("admin.77")}
                  disabled={unitTitle.trim().length < 1 || addUnit.isPending}
                  onClick={() => addUnit.mutate({ courseId, title: unitTitle.trim() })}
                  className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-btn)] border border-white/15 text-white/80 hover:border-white/30 hover:text-white disabled:opacity-40"
                >
                  <Plus className="size-4" strokeWidth={2.5} />
                </button>
              </Tip>
            </div>
            {units.length > 0 && (
              <ul className="mt-2 space-y-1">
                {units.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-2 border-b border-white/8 py-1"
                  >
                    <span className="text-[12.5px] text-white/80">{u.title}</span>
                    <Tip label={t("admin.78", { title: u.title })}>
                      <button
                        type="button"
                        onClick={() => delUnit.mutate({ id: u.id })}
                        aria-label={t("admin.78", { title: u.title })}
                        className="grid size-10 place-items-center rounded text-white/35 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="size-3.5" strokeWidth={2} />
                      </button>
                    </Tip>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Lessons */}
          <div>
            <p className="mb-2 text-[12px] text-white/45">{t("admin.79")}</p>
            <div className="space-y-2">
              <Input
                value={lessonForm.title} dir={contentDir()}
                onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
                placeholder={t("admin.80")}
                maxLength={160}
                className="h-10"
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <Select
                  value={lessonForm.unitId}
                  onChange={(e) => setLessonForm((f) => ({ ...f, unitId: e.target.value }))}
                  className="h-10"
                >
                  <option value="">{t("admin.81")}</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.title}
                    </option>
                  ))}
                </Select>
                <Input
                  type="number"
                  min={0}
                  value={lessonForm.durationSec}
                  onChange={(e) =>
                    setLessonForm((f) => ({ ...f, durationSec: Number(e.target.value) || 0 }))
                  }
                  placeholder={t("admin.82")}
                  className="tabular h-10"
                  dir="ltr"
                />
              </div>
              <Input
                value={lessonForm.videoUrl}
                onChange={(e) => setLessonForm((f) => ({ ...f, videoUrl: e.target.value }))}
                placeholder={t("admin.83")}
                dir="ltr"
                className="h-10"
              />
              <Textarea
                value={lessonForm.summary} dir={contentDir()}
                onChange={(e) => setLessonForm((f) => ({ ...f, summary: e.target.value }))}
                placeholder={t("admin.84")}
                maxLength={400}
                className="min-h-16"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Switch
                  checked={lessonForm.isFree}
                  onCheckedChange={(v) => setLessonForm((f) => ({ ...f, isFree: v }))}
                  label={t("admin.85")}
                />
                <button
                  type="button"
                  disabled={lessonForm.title.trim().length < 1 || addLesson.isPending}
                  onClick={() =>
                    addLesson.mutate({
                      courseId,
                      title: lessonForm.title.trim(),
                      unitId: lessonForm.unitId || null,
                      videoUrl: lessonForm.videoUrl || null,
                      durationSec: lessonForm.durationSec,
                      isFree: lessonForm.isFree,
                      summary: lessonForm.summary || null,
                    })
                  }
                  className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-btn)] bg-[var(--accent)] px-3.5 text-[12.5px] font-semibold text-black hover:bg-[var(--accent-hover)] disabled:opacity-40"
                >
                  <Plus className="size-3.5" strokeWidth={2.5} />
                  {t("admin.86")}
                </button>
              </div>
            </div>

            {lessons.length > 0 && (
              <ul className="mt-2 space-y-1">
                {lessons.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center gap-2 border-b border-white/8 py-1"
                  >
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-white/80">{l.title}</span>
                    {l.isFree && (
                      <span className="shrink-0 rounded border border-emerald-500/30 px-1.5 text-[10px] text-emerald-400">
                        {t("home.10")}
                      </span>
                    )}
                    {!l.videoUrl && (
                      <Tip label={t("admin.87")}>
                        <span aria-label={t("admin.87")} className="inline-flex shrink-0 text-amber-400">
                          <Video className="size-3.5" strokeWidth={1.75} />
                        </span>
                      </Tip>
                    )}
                    <Tip label={t("admin.78", { title: l.title })}>
                      <button
                        type="button"
                        onClick={() => delLesson.mutate({ id: l.id })}
                        aria-label={t("admin.78", { title: l.title })}
                        className="grid size-10 shrink-0 place-items-center rounded text-white/35 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="size-3.5" strokeWidth={2} />
                      </button>
                    </Tip>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Students ───────────────────────────────────────────────────────────────

function Students() {
  const list = trpc.admin.students.useQuery();

  if (list.isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    );
  }

  if ((list.data ?? []).length === 0) {
    return (
      <EmptyState
        icon={<Users className="size-6" strokeWidth={1.5} />}
        title={t("admin.88")}
      />
    );
  }

  return (
    <div className="overflow-x-auto border-y border-white/8">
      <table className="w-full min-w-[640px] text-start">
        <thead>
          <tr className="border-b border-white/8 text-[10.5px] uppercase tracking-[0.12em] text-white/30">
            <th scope="col" className="py-3 pe-4 text-start font-medium">
              {t("admin.90")}
            </th>
            <th scope="col" className="px-4 py-3 text-start font-medium">
              {t("courses.09")}
            </th>
            <th scope="col" className="px-4 py-3 text-start font-medium">
              {t("account.30")}
            </th>
            <th scope="col" className="px-4 py-3 text-start font-medium">
              {t("admin.91")}
            </th>
            <th scope="col" className="ps-4 py-3 text-start font-medium">
              {t("admin.92")}
            </th>
          </tr>
        </thead>
        <tbody>
          {(list.data ?? []).map((s) => (
            <tr key={s.userId} className="border-b border-white/6 last:border-0">
              <td className="py-3 pe-4">
                <p className="text-[13px] text-white/90">{s.displayName || "—"}</p>
                <p className="text-[11px] text-white/30" dir="ltr">
                  {s.email}
                </p>
              </td>
              <td className="px-4 py-3 text-[12.5px] text-white/55">
                <span className="inline-flex flex-wrap items-center gap-2">
                  {s.gradeKey ? gradeLabel(s.gradeKey) : "—"}
                  {s.role !== "student" && (
                    <Chip tone="accent">{s.role === "owner" ? t("admin.93") : t("admin.94")}</Chip>
                  )}
                </span>
              </td>
              <td className="tabular px-4 py-3 text-[12.5px] text-white/80">{egp(s.balanceEgp)}</td>
              <td className="tabular px-4 py-3 text-[12.5px] text-white/80">{s.activeSubscriptions}</td>
              <td className="ps-4 py-3 text-[11.5px] text-white/35">{shortDate(s.joinedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Activity log (feature 12) ──────────────────────────────────────────────

const ACTIVITY_KINDS = [
  "login", "signup", "watch_done", "lesson_complete", "quiz_pass", "quiz_fail",
  "quiz_lock", "quiz_unlock", "purchase", "redeem", "note", "certificate", "share_create",
] as const;

function ActivityLog() {
  const list = trpc.activity.list.useQuery({});

  if (list.isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    );
  }
  const rows = list.data ?? [];
  if (rows.length === 0) {
    return <EmptyState icon={<ClipboardList className="size-6" strokeWidth={1.5} />} title={t("activity.title")} body={t("activity.empty")} />;
  }
  return (
    <div>
      <div className="overflow-x-auto border-y border-white/8">
        <table className="w-full min-w-[720px] text-start">
          <thead>
            <tr className="border-b border-white/8 text-[10.5px] uppercase tracking-[0.12em] text-white/30">
              <th scope="col" className="py-3 pe-4 text-start font-medium">{t("activity.col.when")}</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">{t("activity.col.student")}</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">{t("activity.col.event")}</th>
              <th scope="col" className="ps-4 py-3 text-start font-medium">{t("activity.col.where")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-b border-white/6 last:border-0">
                <td className="tabular whitespace-nowrap py-3 pe-4 text-[11.5px] text-white/40">
                  {new Date(e.at).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}
                </td>
                <td className="px-4 py-3 text-[13px] text-white/90">{e.studentName}</td>
                <td className="px-4 py-3 text-[12.5px] text-white/70">
                  {ACTIVITY_KINDS.includes(e.kind as never)
                    ? t(`activity.kind.${e.kind}` as never)
                    : e.kind}
                  {e.detail && (e.kind === "quiz_pass" || e.kind === "quiz_fail") ? ` (${e.detail}٪)` : e.detail && e.kind === "redeem" ? ` (${e.detail} ج.م)` : ""}
                </td>
                <td className="py-3 ps-4 text-[12px] text-white/45">
                  {[e.lessonTitle, e.courseTitle].filter(Boolean).join(" · ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Settings ───────────────────────────────────────────────────────────────

const ACCENTS = [
  { hex: "#3d8bff", label: "color.blue" },
  { hex: "#22c55e", label: "color.green" },
  { hex: "#f59e0b", label: "color.amber" },
  { hex: "#ef4444", label: "color.red" },
  { hex: "#a855f7", label: "color.purple" },
  { hex: "#14b8a6", label: "color.teal" },
] as const;

function SettingsTab() {
  const toast = useToast();
  const utils = trpc.useUtils();
  const settings = trpc.catalog.settings.useQuery();
  const [form, setForm] = useState<Record<string, string> | null>(null);

  const data = form ?? settings.data ?? {};

  const save = trpc.admin.saveSettings.useMutation({
    onSuccess: async () => {
      toast.push("success", t("admin.95"));
      await Promise.all([utils.catalog.settings.invalidate(), utils.admin.stats.invalidate()]);
    },
    onError: (e) => toast.push("error", errorText(e)),
  });

  if (settings.isLoading) return <Skeleton className="h-96 rounded-xl" />;

  function set(key: string, value: string) {
    setForm((f) => ({ ...(f ?? settings.data ?? {}), [key]: value }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(data);
      }}
      className="max-w-2xl space-y-8"
    >
      <section className="space-y-4">
        <SectionHead label={t("admin.96")} />

        <label className="block">
          <span className="t-overline mb-2 block text-white/38">{t("admin.98")}</span>
          <Input value={data.platform_name ?? ""} dir={contentDir()} onChange={(e) => set("platform_name", e.target.value)} maxLength={40} />
        </label>

        <label className="block">
          <span className="t-overline mb-2 block text-white/38">{t("admin.nameEn")}</span>
          <Input
            dir="ltr"
            value={data.platform_name_en ?? ""}
            onChange={(e) => set("platform_name_en", e.target.value)}
            maxLength={40}
          />
        </label>

        <label className="block">
          <span className="t-overline mb-2 block text-white/38">{t("admin.99")}</span>
          <Input
            value={data.hero_tagline ?? ""} dir={contentDir()}
            onChange={(e) => set("hero_tagline", e.target.value)}
            maxLength={120}
          />
        </label>

        <label className="block">
          <span className="t-overline mb-2 block text-white/38">{t("admin.taglineEn")}</span>
          <Input
            dir="ltr"
            value={data.hero_tagline_en ?? ""}
            onChange={(e) => set("hero_tagline_en", e.target.value)}
            maxLength={120}
          />
        </label>

        <div>
          <span className="mb-2.5 block text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">{t("admin.100")}</span>
          <div className="flex flex-wrap items-center gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.hex}
                type="button"
                onClick={() => set("accent_color", a.hex)}
                aria-label={t(a.label)}
                aria-pressed={data.accent_color === a.hex}
                className={cn(
                  "size-8 rounded-[var(--radius-btn)] ring-2 ring-offset-2 ring-offset-black transition-transform duration-150 hover:scale-105 motion-reduce:hover:scale-100",
                  data.accent_color === a.hex ? "ring-white" : "ring-transparent",
                )}
                style={{ background: a.hex }}
              />
            ))}
            <label className="ms-1 inline-flex h-8 items-center gap-2 text-[12px] text-white/40">
              {t("admin.101")}
              <input
                type="color"
                value={data.accent_color ?? "#3d8bff"}
                onChange={(e) => set("accent_color", e.target.value)}
                className="h-8 w-11 cursor-pointer rounded-[var(--radius-btn)] border border-white/15 bg-transparent p-0.5"
                aria-label={t("admin.102")}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-white/8 pt-6">
        <SectionHead label={t("admin.103")} />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="t-overline mb-2 block text-white/38">{t("admin.105")}</span>
            <Input
              value={data.instapay_handle ?? ""}
              onChange={(e) => set("instapay_handle", e.target.value)}
              dir="ltr"
              maxLength={80}
            />
          </label>
          <label className="block">
            <span className="t-overline mb-2 block text-white/38">{t("topup.19")}</span>
            <Input
              value={data.wallet_number ?? ""}
              onChange={(e) => set("wallet_number", e.target.value)}
              dir="ltr"
              maxLength={30}
            />
          </label>
        </div>

        <label className="block">
          <span className="t-overline mb-2 block text-white/38">{t("admin.106")}</span>
          <Textarea
            value={data.payment_note ?? ""} dir={contentDir()}
            onChange={(e) => set("payment_note", e.target.value)}
            maxLength={300}
            className="min-h-20"
          />
        </label>

        <label className="block">
          <span className="t-overline mb-2 block text-white/38">{t("admin.noteEn")}</span>
          <Textarea
            dir="ltr"
            value={data.payment_note_en ?? ""}
            onChange={(e) => set("payment_note_en", e.target.value)}
            maxLength={300}
            className="min-h-20"
          />
        </label>

        <label className="block">
          <span className="t-overline mb-2 block text-white/38">{t("admin.107")}</span>
          <Input
            value={data.support_whatsapp ?? ""}
            onChange={(e) => set("support_whatsapp", e.target.value)}
            placeholder="201000000000"
            dir="ltr"
            maxLength={20}
          />
        </label>
      </section>

      <button
        type="submit"
        disabled={save.isPending}
        className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 text-[14px] font-semibold text-black transition-colors duration-150 hover:bg-[var(--accent-hover)] active:translate-y-px disabled:opacity-45 motion-reduce:active:translate-y-0"
      >
        <Save className="size-4" strokeWidth={2} />
        {save.isPending ? t("account.34") : t("admin.108")}
      </button>
    </form>
  );
}
