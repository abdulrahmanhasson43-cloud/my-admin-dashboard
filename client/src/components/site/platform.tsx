// Platform & admin UI (features 46–50): notifications bell, course reviews,
// global search, top-up code redeem, and the teacher studio.
import { useState } from "react";
import { Link } from "wouter";
import { Bell, Star, Search as SearchIcon, Ticket, Plus, Trash2, Link2, Copy, Check, Ban } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { publicUrl } from "@/_core/public-url";
import { SHARE_TTL_OPTIONS } from "@shared/sign";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";
import { Tip } from "@/components/ui/tip";

const card = "border-t border-white/10 pt-6";
const input =
  "w-full rounded-[var(--radius-btn)] border border-white/15 bg-black/30 px-3 py-2 text-[14px] text-white placeholder:text-white/35 focus:border-[var(--accent,#3d8bff)] focus:outline-none";
const btn =
  "rounded-[var(--radius-btn)] bg-[var(--accent,#3d8bff)] px-4 py-2 text-[14px] font-medium text-black transition-opacity disabled:opacity-40";

// ── 48 · Notifications bell (header) ─────────────────────────────────────────
export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const list = trpc.notify.list.useQuery(undefined, { refetchInterval: 60_000 });
  const readAll = trpc.notify.readAll.useMutation({ onSuccess: () => list.refetch() });
  const read = trpc.notify.read.useMutation({ onSuccess: () => list.refetch() });
  const unread = list.data?.unread ?? 0;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("notify.bell")}
        className="relative grid size-10 place-items-center rounded-[var(--radius-btn)] text-white/65 transition-colors hover:bg-white/8 hover:text-white"
      >
        <Bell className="size-5" strokeWidth={1.75} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -end-0.5 grid min-w-5 place-items-center rounded-full bg-[var(--accent,#3d8bff)] px-1 text-[11px] font-bold text-black tabular">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute end-0 top-12 z-50 w-80 rounded-2xl border border-white/12 bg-[#0d0d10] p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[14px] font-semibold text-white">{t("notify.bell")}</span>
            {unread > 0 && (
              <button type="button" onClick={() => readAll.mutate()} className="text-[12px] text-[var(--accent,#3d8bff)]">
                {t("notify.markAll")}
              </button>
            )}
          </div>
          {(list.data?.items ?? []).length === 0 && <p className="px-1 py-4 text-center text-[13px] text-white/45">{t("notify.empty")}</p>}
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {(list.data?.items ?? []).map((n: any) => (
              <button
                key={n.id}
                type="button"
                onClick={() => !n.readAt && read.mutate({ id: n.id })}
                className={cn("w-full rounded-xl px-3 py-2 text-start", n.readAt ? "opacity-55" : "bg-white/[0.05]")}
              >
                <p className="text-[13px] font-semibold text-white">{n.title}</p>
                <p className="mt-0.5 text-[12px] leading-5 text-white/60">{n.body}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 49 · Course reviews (course page) ────────────────────────────────────────
function Stars({ value, onPick }: { value: number; onPick?: (v: number) => void }) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          type="button"
          disabled={!onPick}
          onClick={() => onPick?.(v)}
          className={cn("p-0.5", onPick && "cursor-pointer")}
          aria-label={`${v}`}
        >
          <Star className={cn("size-4", v <= value ? "fill-amber-400 text-amber-400" : "text-white/25")} />
        </button>
      ))}
    </div>
  );
}

export function ReviewsCard({ courseId, entitled }: { courseId: string; entitled: boolean }) {
  const list = trpc.reviews.list.useQuery({ courseId });
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const save = trpc.reviews.upsert.useMutation({
    onSuccess: () => {
      setDone(true);
      setText("");
      list.refetch();
    },
  });
  const summary = list.data?.summary;
  return (
    <section className={card} data-testid="reviews">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[17px] font-bold text-white">{t("reviews.title")}</h2>
        {summary && summary.count > 0 && (
          <div className="flex items-center gap-2">
            <Stars value={Math.round(summary.avg)} />
            <span className="text-[12px] text-white/50 tabular">{t("reviews.count", { count: summary.count })}</span>
          </div>
        )}
      </div>
      <div className="space-y-3">
        {(list.data?.items ?? []).map((r: any) => (
          <div key={r.id} className="border-b border-white/8 pb-3 last:border-b-0">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-white/85">{r.userName}</span>
              <Stars value={r.rating} />
            </div>
            <p className="mt-1.5 text-[13px] leading-6 text-white/65">{r.text}</p>
          </div>
        ))}
        {summary?.count === 0 && <p className="py-2 text-center text-[13px] text-white/40">{t("reviews.empty")}</p>}
      </div>
      {entitled && (
        <div className="mt-4 border-t border-white/8 pt-4">
          <p className="mb-2 text-[13px] font-semibold text-white/80">{t("reviews.yours")}</p>
          <div className="flex items-center gap-3">
            <Stars value={rating} onPick={setRating} />
          </div>
          <div className="mt-2 flex gap-2">
            <input className={input} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("reviews.placeholder")} />
            <button
              type="button"
              className={btn}
              disabled={text.trim().length < 3 || save.isPending}
              onClick={() => save.mutate({ courseId, rating, text: text.trim() })}
            >
              {t("reviews.submit")}
            </button>
          </div>
          {done && <p className="mt-2 text-[12px] text-emerald-400">{t("reviews.thanks")}</p>}
        </div>
      )}
    </section>
  );
}

// ── 50 · Global search page ───────────────────────────────────────────────────
export function SearchPage() {
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<string | null>(null);
  const res = trpc.search.query.useQuery({ q, stage }, { enabled: q.trim().length > 0 });
  const hits = res.data?.hits ?? [];
  const groups: { type: "course" | "lesson" | "teacher"; label: string }[] = [
    { type: "course", label: t("search.courses") },
    { type: "lesson", label: t("search.lessons") },
    { type: "teacher", label: t("search.teachers") },
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-5 text-2xl font-bold text-white">{t("search.title")}</h1>
      <div className="relative">
        <SearchIcon className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
        <input autoFocus className={cn(input, "ps-9")} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search.placeholder")} />
      </div>
      <div className="mt-3 flex gap-2">
        {[
          { v: null, label: t("search.allStages") },
          { v: "prep", label: t("search.prep") },
          { v: "secondary", label: t("search.secondary") },
        ].map((o) => (
          <button
            key={o.label}
            type="button"
            onClick={() => setStage(o.v)}
            className={cn(
              "rounded-full border px-3 py-1 text-[12.5px] transition-colors",
              stage === o.v ? "border-[var(--accent,#3d8bff)] bg-[var(--accent,#3d8bff)]/15 text-white" : "border-white/12 text-white/55 hover:text-white",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      {q.trim() && hits.length === 0 && !res.isLoading && (
        <p className="mt-10 text-center text-[14px] text-white/45">{t("search.empty", { q })}</p>
      )}
      {groups.map((g) => {
        const rows = hits.filter((h: any) => h.type === g.type);
        if (!rows.length) return null;
        return (
          <div key={g.type} className="mt-7">
            <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-white/45">{g.label}</h2>
            <div className="space-y-1.5">
              {rows.map((h: any) => (
                <Link
                  key={`${h.type}-${h.id}`}
                  to={h.type === "course" ? `/course/${h.slug ?? h.id}` : h.type === "lesson" ? `/watch/${h.id}` : "/courses"}
                  className="block border-b border-white/8 px-1 py-3 transition-colors hover:bg-white/[0.03]"
                >
                  <p className="text-[14.5px] font-medium text-white">{h.title}</p>
                  {h.subtitle && <p className="mt-0.5 truncate text-[12.5px] text-white/45">{h.subtitle}</p>}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 47 · Top-up code redeem (wallet page) ─────────────────────────────────────
export function TopupCodeForm() {
  const [code, setCode] = useState("");
  const [done, setDone] = useState<number | null>(null);
  const utils = trpc.useUtils();
  const redeem = trpc.codes.redeem.useMutation({
    onSuccess: (r: any) => {
      setDone(r.valueEgp);
      setCode("");
      void utils.wallet.summary.invalidate();
    },
  });
  return (
    <section className={card} data-testid="topup-code">
      <div className="mb-3 flex items-center gap-2">
        <Ticket className="size-4 text-[var(--accent,#3d8bff)]" />
        <h2 className="text-[15px] font-bold text-white">{t("codes.title")}</h2>
      </div>
      <div className="flex gap-2" dir="ltr">
        <input
          className={cn(input, "font-mono tracking-widest")}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={t("codes.placeholder")}
        />
        <button type="button" className={btn} disabled={code.trim().length < 4 || redeem.isPending} onClick={() => redeem.mutate({ code })}>
          {t("codes.redeem")}
        </button>
      </div>
      {done !== null && <p className="mt-2 text-[13px] text-emerald-400">{t("codes.done", { amount: done })}</p>}
      {redeem.error && <p className="mt-2 text-[13px] text-red-400">{redeem.error.message}</p>}
    </section>
  );
}

// ── 46 · Teacher studio (admin page) ──────────────────────────────────────────
type QuizDraft = { q: string; choices: string; correct: number };

export function TeacherStudio() {
  const utils = trpc.useUtils();
  const courses = trpc.catalog.courses.useQuery({});
  const codes = trpc.codes.list.useQuery();
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [vttUrl, setVttUrl] = useState("");
  const [minutes, setMinutes] = useState("10");
  const [isFree, setIsFree] = useState(false);
  const [quiz, setQuiz] = useState<QuizDraft[]>([]);
  const [msg, setMsg] = useState("");
  const [cTitle, setCTitle] = useState("");
  const [cPrice, setCPrice] = useState("500");
  const [codeValue, setCodeValue] = useState("100");
  const [codeCount, setCodeCount] = useState("5");

  const addLesson = trpc.teacher.addLesson.useMutation({
    onSuccess: () => {
      setMsg(t("teacher.published"));
      setTitle("");
      setVideoUrl("");
      setPdfUrl("");
      setVttUrl("");
      setQuiz([]);
      void utils.catalog.courses.invalidate();
    },
    onError: (e) => setMsg(e.message),
  });
  const addCourse = trpc.teacher.addCourse.useMutation({
    onSuccess: () => {
      setMsg(t("teacher.published"));
      setCTitle("");
      void utils.catalog.courses.invalidate();
    },
    onError: (e) => setMsg(e.message),
  });
  const gen = trpc.codes.generate.useMutation({ onSuccess: () => codes.refetch() });

  const publishLesson = () => {
    addLesson.mutate({
      courseId,
      title,
      videoUrl,
      durationSec: Math.round(Number(minutes) * 60),
      isFree,
      pdfUrl: pdfUrl.trim() || null,
      vttUrl: vttUrl.trim() || null,
      quiz: quiz.map((qq) => ({
        q: qq.q,
        choices: qq.choices.split("\n").map((x) => x.trim()).filter(Boolean),
        correct: qq.correct - 1,
      })),
    });
  };

  return (
    <section className={card} data-testid="teacher-studio">
      <h2 className="text-[17px] font-bold text-white">{t("teacher.title")}</h2>
      <div className="mb-5" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* new lesson */}
        <div>
          <h3 className="mb-3 text-[14px] font-semibold text-white/85">{t("teacher.newLesson")}</h3>
          <div className="space-y-2.5">
            <select className={input} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">{t("teacher.pickCourse")}</option>
              {(courses.data ?? []).map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("teacher.lessonTitle")} />
            <input className={input} dir="ltr" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder={t("teacher.videoUrl")} />
            <input className={input} dir="ltr" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} placeholder={t("teacher.pdfUrl")} />
            <input className={input} dir="ltr" value={vttUrl} onChange={(e) => setVttUrl(e.target.value)} placeholder={t("teacher.vttUrl")} />
            <div className="flex items-center gap-3">
              <input className={cn(input, "w-28")} type="number" min="1" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder={t("teacher.duration")} />
              <label className="flex items-center gap-2 text-[13px] text-white/65">
                <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
                {t("teacher.free")}
              </label>
            </div>
            {quiz.map((qq, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-white/10 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-white/50">سؤال {i + 1}</span>
                  <button type="button" onClick={() => setQuiz(quiz.filter((_, j) => j !== i))} aria-label="حذف">
                    <Trash2 className="size-3.5 text-white/40 hover:text-red-400" />
                  </button>
                </div>
                <input className={input} value={qq.q} onChange={(e) => setQuiz(quiz.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} placeholder={t("teacher.quizQ")} />
                <textarea className={cn(input, "min-h-16")} value={qq.choices} onChange={(e) => setQuiz(quiz.map((x, j) => (j === i ? { ...x, choices: e.target.value } : x)))} placeholder={t("teacher.choices")} />
                <input className={cn(input, "w-24")} type="number" min="1" value={qq.correct} onChange={(e) => setQuiz(quiz.map((x, j) => (j === i ? { ...x, correct: Number(e.target.value) } : x)))} placeholder={t("teacher.correct")} />
              </div>
            ))}
            <button type="button" onClick={() => setQuiz([...quiz, { q: "", choices: "", correct: 1 }])} className="flex items-center gap-1 text-[13px] text-[var(--accent,#3d8bff)]">
              <Plus className="size-3.5" /> {t("teacher.addQuestion")}
            </button>
            <button type="button" className={btn} disabled={!courseId || !title.trim() || !videoUrl.trim() || addLesson.isPending} onClick={publishLesson}>
              {t("teacher.publish")}
            </button>
          </div>
        </div>

        {/* new course + codes */}
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-[14px] font-semibold text-white/85">{t("teacher.newCourse")}</h3>
            <div className="space-y-2.5">
              <input className={input} value={cTitle} onChange={(e) => setCTitle(e.target.value)} placeholder={t("teacher.courseTitle")} />
              <input className={cn(input, "w-32")} type="number" min="0" value={cPrice} onChange={(e) => setCPrice(e.target.value)} placeholder={t("teacher.price")} />
              <button type="button" className={btn} disabled={cTitle.trim().length < 3 || addCourse.isPending} onClick={() => addCourse.mutate({ title: cTitle.trim(), stage: "secondary", priceEgp: Number(cPrice) })}>
                {t("teacher.publish")}
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-[14px] font-semibold text-white/85">{t("teacher.codesTitle")}</h3>
            <div className="flex items-center gap-2">
              <input className={cn(input, "w-24")} type="number" min="10" value={codeValue} onChange={(e) => setCodeValue(e.target.value)} placeholder={t("teacher.codeValue")} />
              <input className={cn(input, "w-20")} type="number" min="1" max="50" value={codeCount} onChange={(e) => setCodeCount(e.target.value)} placeholder={t("teacher.codeCount")} />
              <button type="button" className={btn} disabled={gen.isPending} onClick={() => gen.mutate({ count: Number(codeCount), valueEgp: Number(codeValue) })}>
                {t("teacher.genCodes")}
              </button>
            </div>
            <div className="mt-3 max-h-44 space-y-1 overflow-y-auto">
              {(codes.data ?? []).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-white/8 px-3 py-1.5 text-[12.5px]">
                  <code className="font-mono tracking-widest text-white/85" dir="ltr">{c.code}</code>
                  <span className="text-white/50 tabular">{c.valueEgp} ج.م</span>
                  <span className={c.usedBy ? "text-white/40" : "text-emerald-400"}>{c.usedBy ? `${t("teacher.usedBy")}: ${c.usedByName ?? ""}` : t("teacher.unused")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {msg && <p className="mt-4 text-[13px] text-emerald-400">{msg}</p>}
      <TempLinksPanel />
    </section>
  );
}

// ── 11 · temporary signed video links ────────────────────────────────────────
function TempLinksPanel() {
  const utils = trpc.useUtils();
  const courses = trpc.catalog.courses.useQuery({});
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [ttlMin, setTtlMin] = useState<number>(SHARE_TTL_OPTIONS[1].minutes);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const course = trpc.catalog.course.useQuery(
    { slug: (courses.data ?? []).find((c: any) => c.id === courseId)?.slug ?? "" },
    { enabled: Boolean(courseId) },
  );
  const links = trpc.share.list.useQuery();
  const create = trpc.share.create.useMutation({
    onSuccess: () => {
      setLessonId("");
      void links.refetch();
    },
  });
  const revoke = trpc.share.revoke.useMutation({ onSuccess: () => void utils.share.list.invalidate() });

  const statusLabel = { active: t("teacher.linkActive"), expired: t("teacher.linkExpired"), revoked: t("teacher.linkRevoked") } as const;
  const statusCls = { active: "text-emerald-400", expired: "text-white/40", revoked: "text-red-400/80" } as const;

  return (
    <div className="mt-8 border-t border-white/10 pt-6" data-testid="temp-links">
      <h3 className="mb-1 flex items-center gap-2 text-[14px] font-semibold text-white/85">
        <Link2 className="size-4 text-[var(--accent,#3d8bff)]" /> {t("teacher.tempLinks")}
      </h3>
      <div className="mb-4" />
      <div className="grid gap-2 sm:grid-cols-4">
        <select className={input} value={courseId} onChange={(e) => { setCourseId(e.target.value); setLessonId(""); }}>
          <option value="">{t("teacher.pickCourse")}</option>
          {(courses.data ?? []).map((c: any) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <select className={input} value={lessonId} onChange={(e) => setLessonId(e.target.value)}>
          <option value="">{t("analytics.pickLesson")}</option>
          {(course.data?.lessons ?? []).map((l: any) => (
            <option key={l.id} value={l.id}>{l.title}</option>
          ))}
        </select>
        <select className={input} value={ttlMin} onChange={(e) => setTtlMin(Number(e.target.value))}>
          {SHARE_TTL_OPTIONS.map((o) => (
            <option key={o.minutes} value={o.minutes}>{t(o.key)}</option>
          ))}
        </select>
        <button type="button" className={btn} disabled={!lessonId || create.isPending} onClick={() => create.mutate({ lessonId, ttlMin })}>
          {t("teacher.makeLink")}
        </button>
      </div>
      <div className="mt-4 space-y-1.5">
        {(links.data ?? []).length === 0 && <p className="text-[12.5px] text-white/35">{t("teacher.noLinks")}</p>}
        {(links.data ?? []).map((l) => (
          <div key={l.id} className="flex flex-wrap items-center gap-2 border-b border-white/8 px-1 py-2 text-[12.5px]">
            <span className="min-w-0 flex-1 truncate text-white/80">{l.lessonTitle}</span>
            <span className="tabular text-[11px] text-white/35">
              {t("teacher.linkExpiresAt")} {new Date(l.expiresAt).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}
            </span>
            <span className={cn("text-[11.5px] font-semibold", statusCls[l.status])}>{statusLabel[l.status]}</span>
            {l.status === "active" && (
              <>
                <Tip label={t("teacher.copyLink")}>
                <button
                  type="button"
                  aria-label={t("teacher.copyLink")}
                  className="grid size-9 place-items-center rounded-md text-white/60 hover:text-white"
                  onClick={() => {
                    void navigator.clipboard.writeText(publicUrl(l.path));
                    setCopiedId(l.id);
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                >
                  {copiedId === l.id ? <Check className="size-4" /> : <Copy className="size-4" />}
                </button>
                </Tip>
                <Tip label={t("teacher.revoke")}>
                  <button
                    type="button"
                    aria-label={t("teacher.revoke")}
                    className="grid size-9 place-items-center rounded-md text-red-300/70 hover:text-red-300"
                    onClick={() => revoke.mutate({ id: l.id })}
                  >
                    <Ban className="size-4" />
                  </button>
                </Tip>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
