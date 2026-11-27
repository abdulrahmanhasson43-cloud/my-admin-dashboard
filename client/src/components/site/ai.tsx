import { useEffect, useRef, useState } from "react";
import {
  BookOpenCheck,
  Bot,
  BrainCircuit,
  CalendarRange,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  ListChecks,
  MessageCircleQuestion,
  PenLine,
  Play,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/_core/trpc";
import { cn } from "@/lib/utils";
import { Tip } from "@/components/ui/tip";
import { duration } from "@shared/domain";
import { toArDigits } from "@shared/ai";
import { t } from "@/i18n";
import { errorText } from "@/i18n/errors";

/**
 * AI studio (features 38–45). Deterministic local engine — مساعد مدار answers
 * from the lesson's own content, never a general-purpose model.
 */

type StudioTab = "assistant" | "practice" | "cards" | "search" | "essay";

const DIFF_TONE: Record<number, string> = {
  1: "border-emerald-500/25 text-emerald-400/90",
  2: "border-amber-500/25 text-amber-400/90",
  3: "border-red-500/25 text-red-400/90",
};

function DiffChip({ d }: { d: number }) {
  const level = DIFF_TONE[d] ? d : 2;
  const label = t(`ai.diff.${level}` as never);
  return (
    <Tip label={label}>
      <span
        role="img"
        aria-label={label}
        className={cn("inline-flex h-5 shrink-0 items-center gap-0.5", DIFF_TONE[level].split(" ")[1])}
      >
        {[1, 2, 3].map((i) => (
          <span key={i} className={cn("h-2.5 w-1 rounded-full bg-current", i > level && "opacity-20")} />
        ))}
      </span>
    </Tip>
  );
}

/** Tabbed AI block on the Watch page (features 38, 39, 40, 42, 43). */
export function AiStudio({ lessonId, onSeek }: { lessonId: string; onSeek: (sec: number) => void }) {
  const [tab, setTab] = useState<StudioTab>("assistant");
  const tabs: { key: StudioTab; label: string; Icon: typeof Bot }[] = [
    { key: "assistant", label: t("ai.tab.assistant"), Icon: MessageCircleQuestion },
    { key: "practice", label: t("ai.tab.practice"), Icon: ListChecks },
    { key: "cards", label: t("ai.tab.cards"), Icon: Layers },
    { key: "search", label: t("ai.tab.search"), Icon: Search },
    { key: "essay", label: t("ai.tab.essay"), Icon: PenLine },
  ];
  return (
    <section className="mt-10 border-t border-white/8 pt-7">
      <h2 className="t-title flex items-center gap-2.5 text-white">
        <Sparkles className="size-5 text-[var(--accent)]" strokeWidth={1.75} />
        {t("ai.title")}
      </h2>

      <div role="tablist" aria-label={t("ai.title")} className="mt-5 flex flex-wrap gap-1.5">
        {tabs.map(({ key, label, Icon }) => (
          <Tip key={key} label={label}>
            <button
              role="tab"
              aria-selected={tab === key}
              aria-label={label}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "inline-flex size-11 items-center justify-center rounded-[var(--radius-btn)] border transition-colors",
                tab === key
                  ? "border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-white/12 text-white/55 hover:border-white/30 hover:text-white",
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} />
            </button>
          </Tip>
        ))}
      </div>

      <div className="mt-6">
        {tab === "assistant" && <AssistantPanel lessonId={lessonId} />}
        {tab === "practice" && <PracticePanel lessonId={lessonId} />}
        {tab === "cards" && <CardsPanel lessonId={lessonId} />}
        {tab === "search" && <VideoSearchPanel lessonId={lessonId} onSeek={onSeek} />}
        {tab === "essay" && <EssayPanel lessonId={lessonId} />}
      </div>
    </section>
  );
}

// ─── 38: assistant chat ──────────────────────────────────────────────────────

function AssistantPanel({ lessonId }: { lessonId: string }) {
  const history = trpc.ai.chatHistory.useQuery({ lessonId });
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [draft, setDraft] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (history.data) setMessages(history.data.map((m) => ({ role: m.role, text: m.text })));
  }, [history.data, lessonId]);

  const ask = trpc.ai.ask.useMutation({
    onSuccess: (r) => setMessages((m) => [...m, { role: "assistant", text: r.reply }]),
    onError: () => setMessages((m) => m.slice(0, -1)),
  });

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [messages, ask.isPending]);

  function send() {
    const text = draft.trim();
    if (text.length < 2 || ask.isPending) return;
    setDraft("");
    setMessages((m) => [...m, { role: "user", text }]);
    ask.mutate({ lessonId, message: text });
  }

  return (
    <div>
      <div ref={boxRef} className="max-h-80 space-y-3 overflow-y-auto pe-1">
        {messages.length === 0 ? null : (
          messages.map((m, i) => (
            <div key={i} className={cn("flex gap-2.5", m.role === "user" && "flex-row-reverse")}>
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border",
                  m.role === "user" ? "border-white/12 text-white/50" : "border-[var(--accent-line)] text-[var(--accent)]",
                )}
              >
                <Bot className="size-3.5" strokeWidth={1.75} />
              </span>
              <p
                className={cn(
                  "max-w-[85%] whitespace-pre-line rounded-[var(--radius-card)] border px-3.5 py-2.5 text-[13.5px] leading-relaxed",
                  m.role === "user" ? "border-white/10 bg-white/[0.04] text-white/85" : "border-[var(--accent-line)]/40 bg-[var(--accent-soft)]/50 text-white/90",
                )}
              >
                {m.text}
              </p>
            </div>
          ))
        )}
        {ask.isPending && <p className="t-caption text-white/30">{t("common.loading")}</p>}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={t("ai.ask.placeholder")}
          maxLength={500}
          className="h-11 flex-1 rounded-[var(--radius-btn)] border border-white/12 bg-transparent px-4 text-[13.5px] text-white placeholder:text-white/25 focus:border-[var(--accent-line)] focus:outline-none"
        />
        <button
          type="button"
          onClick={send}
          disabled={draft.trim().length < 2 || ask.isPending}
          aria-label={t("ai.ask.send")}
          className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-btn)] bg-[var(--accent)] text-black transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-40"
        >
          <Send className="size-4 rtl:-scale-x-100" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// ─── 39: practice generation ─────────────────────────────────────────────────

function PracticePanel({ lessonId }: { lessonId: string }) {
  const [attempt, setAttempt] = useState<{ attemptId: string; questions: { id: string; q: string; options: string[]; difficulty: number }[] } | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<{ pct: number; perQuestion: { correct: boolean; rightIndex: number; explanation: string }[] } | null>(null);

  const start = trpc.ai.practiceStart.useMutation({
    onSuccess: (r) => {
      setAttempt(r);
      setAnswers(r.questions.map(() => null));
      setResult(null);
    },
  });
  const submit = trpc.ai.practiceSubmit.useMutation({ onSuccess: (r) => setResult(r) });

  if (!attempt) {
    return (
      <div>
        <button
          type="button"
          onClick={() => start.mutate({ lessonId })}
          disabled={start.isPending}
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] px-6 text-[14px] font-semibold text-black transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-40"
        >
          <Play className="size-4" fill="currentColor" strokeWidth={0} />
          {t("ai.practice.start")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {attempt.questions.map((q, qi) => {
          const res = result?.perQuestion[qi];
          return (
            <div key={q.id}>
              <p className="flex items-start gap-2 text-[14.5px] font-medium leading-relaxed text-white/90">
                <DiffChip d={q.difficulty} />
                {res &&
                  (res.correct ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" strokeWidth={2} />
                  ) : (
                    <XCircle className="mt-0.5 size-4 shrink-0 text-red-400" strokeWidth={2} />
                  ))}
                {q.q}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    type="button"
                    disabled={Boolean(result)}
                    onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                    className={cn(
                      "inline-flex min-h-10 items-center rounded-[var(--radius-btn)] border px-4 text-[13px] transition-colors",
                      answers[qi] === oi ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white" : "border-white/12 text-white/60 hover:border-white/30 hover:text-white",
                      result && res && oi === res.rightIndex && "border-emerald-500/40 text-emerald-300",
                      result && "opacity-80",
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {res && (
                <p className="mt-2 text-[12.5px] leading-relaxed text-white/40">
                  <span className="text-white/55">{t("ai.practice.explain")}</span> {res.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {result ? (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <p className={cn("text-[14px]", result.pct >= 60 ? "text-emerald-400/90" : "text-amber-300/90")}>
            {t("ai.practice.score", { pct: result.pct })}
          </p>
          <button
            type="button"
            onClick={() => start.mutate({ lessonId })}
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-btn)] border border-white/14 px-5 text-[13px] text-white/80 transition-colors hover:border-white/30"
          >
            <RefreshCw className="size-3.5" strokeWidth={2} />
            {t("ai.practice.again")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={submit.isPending || answers.some((a) => a === null)}
          onClick={() => submit.mutate({ attemptId: attempt.attemptId, answers })}
          className="mt-6 inline-flex h-11 items-center rounded-[var(--radius-btn)] bg-[var(--accent)] px-6 text-[14px] font-semibold text-black transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-40"
        >
          {t("ai.practice.submit")}
        </button>
      )}
    </div>
  );
}

// ─── 40: summary + flashcards ────────────────────────────────────────────────

function CardsPanel({ lessonId }: { lessonId: string }) {
  const data = trpc.ai.cards.useQuery({ lessonId });
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const cards = data.data?.flashcards ?? [];
  const card = cards[idx];

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <p className="t-overline mb-3 text-white/30">{t("ai.cards.summary")}</p>
        <ul className="space-y-2.5">
          {(data.data?.summary ?? []).map((line, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-white/60">
              <span className="tabular mt-0.5 text-white/25">{toArDigits(i + 1)}.</span>
              {line}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="t-overline mb-3 text-white/30">{t("ai.cards.cards")}</p>
        {card && (
          <div>
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              aria-live="polite"
              className="grid min-h-36 w-full place-items-center rounded-[var(--radius-card)] border border-white/12 bg-white/[0.03] p-6 text-center transition-colors hover:border-white/30"
            >
              <span className="text-[15px] font-medium leading-relaxed text-white/90">{flipped ? card.back : card.front}</span>
              <span className="mt-3 block text-[11px] text-white/30">{flipped ? t("ai.cards.front") : t("ai.cards.flip")}</span>
            </button>
            <div className="mt-3 flex items-center justify-between">
              <Tip label={t("ai.cards.prev")}>
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => {
                    setIdx((i) => i - 1);
                    setFlipped(false);
                  }}
                  aria-label={t("ai.cards.prev")}
                  className="inline-flex size-11 items-center justify-center rounded-[var(--radius-btn)] border border-white/12 text-white/70 disabled:opacity-30"
                >
                  <ChevronRight className="size-4 ltr:rotate-180" strokeWidth={2} />
                </button>
              </Tip>
              <span className="tabular t-caption text-white/35">
                {toArDigits(idx + 1)} / {toArDigits(cards.length)}
              </span>
              <Tip label={t("ai.cards.next")}>
                <button
                  type="button"
                  disabled={idx >= cards.length - 1}
                  onClick={() => {
                    setIdx((i) => i + 1);
                    setFlipped(false);
                  }}
                  aria-label={t("ai.cards.next")}
                  className="inline-flex size-11 items-center justify-center rounded-[var(--radius-btn)] border border-white/12 text-white/70 disabled:opacity-30"
                >
                  <ChevronLeft className="size-4 ltr:rotate-180" strokeWidth={2} />
                </button>
              </Tip>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 43: in-video search ─────────────────────────────────────────────────────

function VideoSearchPanel({ lessonId, onSeek }: { lessonId: string; onSeek: (sec: number) => void }) {
  const [query, setQuery] = useState("");
  const search = trpc.ai.videoSearch.useMutation();
  const hits = search.data?.hits ?? [];
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim().length > 1) search.mutate({ lessonId, query: query.trim() });
        }}
        className="flex gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("ai.search.placeholder")}
          maxLength={120}
          className="h-11 flex-1 rounded-[var(--radius-btn)] border border-white/12 bg-transparent px-4 text-[13.5px] text-white placeholder:text-white/25 focus:border-[var(--accent-line)] focus:outline-none"
        />
        <Tip label={t("ai.search.button")}>
          <button
            type="submit"
            disabled={query.trim().length < 2 || search.isPending}
            aria-label={t("ai.search.button")}
            className="inline-flex size-11 items-center justify-center rounded-[var(--radius-btn)] bg-[var(--accent)] text-black transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-40"
          >
            <Search className="size-4" strokeWidth={2} />
          </button>
        </Tip>
      </form>
      {search.isSuccess && hits.length === 0 && <p className="t-body mt-4 text-white/40">{t("ai.search.empty")}</p>}
      {hits.length > 0 && (
        <ul className="mt-4 divide-y divide-white/6 border-y border-white/8">
          {hits.map((h: { atSec: number; text: string; score: number }) => (
            <li key={h.atSec}>
              <button
                type="button"
                onClick={() => onSeek(h.atSec)}
                className="flex w-full items-center gap-3 py-3 text-start transition-colors hover:bg-white/[0.03]"
              >
                <span className="tabular inline-flex h-7 shrink-0 items-center rounded-[var(--radius-btn)] border border-[var(--accent-line)] px-2 text-[11.5px] text-[var(--accent)]">
                  {duration(h.atSec)}
                </span>
                <span className="text-[13.5px] leading-relaxed text-white/65">…{h.text}…</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── 42: essay grading ───────────────────────────────────────────────────────

function EssayPanel({ lessonId }: { lessonId: string }) {
  const cards = trpc.ai.cards.useQuery({ lessonId });
  const [text, setText] = useState("");
  const grade = trpc.ai.essayGrade.useMutation();
  const g = grade.data;
  return (
    <div>
      <p className="text-[14.5px] font-medium leading-relaxed text-white/90">{cards.data?.essayPrompt}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("ai.essay.placeholder")}
        rows={5}
        maxLength={5000}
        className="mt-4 w-full rounded-[var(--radius-card)] border border-white/12 bg-transparent p-4 text-[13.5px] leading-relaxed text-white placeholder:text-white/25 focus:border-[var(--accent-line)] focus:outline-none"
      />
      <button
        type="button"
        disabled={text.trim().length < 10 || grade.isPending}
        onClick={() => grade.mutate({ lessonId, text: text.trim() })}
        className="mt-3 inline-flex h-11 items-center rounded-[var(--radius-btn)] bg-[var(--accent)] px-6 text-[14px] font-semibold text-black transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-40"
      >
        {t("ai.essay.submit")}
      </button>
      {g && (
        <div className="mt-6 border-t border-white/8 pt-5">
          <div className="flex items-center justify-between gap-3">
            <p className={cn("text-[15px] font-semibold", g.passed ? "text-emerald-400" : "text-amber-300")}>
              {t("ai.essay.score", { pct: g.pct })} — {g.passed ? t("ai.essay.passed") : t("ai.essay.failed")}
            </p>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div className={cn("h-full rounded-full", g.passed ? "bg-emerald-400" : "bg-amber-300")} style={{ width: `${g.pct}%` }} />
          </div>
          {g.found.length > 0 && (
            <p className="mt-4 text-[13px] leading-relaxed text-white/55">
              <span className="text-emerald-400/90">{t("ai.essay.found")}</span> {g.found.join("، ")}
            </p>
          )}
          {g.missing.length > 0 && (
            <p className="mt-2 text-[13px] leading-relaxed text-white/55">
              <span className="text-amber-300/90">{t("ai.essay.missing")}</span> {g.missing.join("، ")}
            </p>
          )}
          {g.notes.length > 0 && (
            <ul className="mt-3 space-y-1.5 border-t border-white/8 pt-3">
              {g.notes.map((n, i) => (
                <li key={i} className="text-[12.5px] leading-relaxed text-white/45">
                  • {n}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 41 + 44 + 45: study tab (plan, next lesson, adaptive test) ──────────────

export function StudyPanel() {
  const plan = trpc.ai.planGet.useQuery();
  const next = trpc.ai.next.useQuery();
  const dash = trpc.progress.dashboard.useQuery();
  const utils = trpc.useUtils();
  const [examDate, setExamDate] = useState("");
  useEffect(() => {
    if (plan.data?.examDate) setExamDate(plan.data.examDate);
  }, [plan.data?.examDate]);

  const savePlan = trpc.ai.planSet.useMutation({
    onSuccess: () => utils.ai.planGet.invalidate(),
  });

  const lessonsForAdaptive = (dash.data?.courses ?? []).flatMap((c) =>
    c.lessons.map((l) => ({ id: l.id, title: l.title, courseTitle: c.course.title })),
  );
  const [adaptiveLessonId, setAdaptiveLessonId] = useState("");
  useEffect(() => {
    if (!adaptiveLessonId && lessonsForAdaptive.length > 0) setAdaptiveLessonId(lessonsForAdaptive[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonsForAdaptive.length]);

  return (
    <div className="space-y-12">
      {/* ── 44: next lesson ── */}
      {next.data && (
        <div className="border-b border-white/8 pb-8">
          <p className="t-overline flex items-center gap-2 text-[var(--accent)]">
            <BookOpenCheck className="size-4" strokeWidth={1.75} />
            {t("study.next.title")}
          </p>
          <p className="mt-3 text-[15px] font-medium text-white">{next.data.lessonTitle}</p>
          <p className="t-caption mt-1 text-white/45">{next.data.courseTitle}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-white/55">{next.data.reason}</p>
          <Link
            to={`/watch/${next.data.lessonId}`}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-[var(--radius-btn)] bg-white px-5 text-[13px] font-semibold text-black transition-colors hover:bg-white/90"
          >
            <Play className="size-3.5" fill="currentColor" strokeWidth={0} />
            {t("study.next.go")}
          </Link>
        </div>
      )}

      {/* ── 41: study plan ── */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="t-title flex items-center gap-2 text-white">
              <CalendarRange className="size-5 text-[var(--accent)]" strokeWidth={1.75} />
              {t("study.plan.title")}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              aria-label={t("study.plan.exam")}
              className="h-11 rounded-[var(--radius-btn)] border border-white/12 bg-transparent px-3.5 text-[13px] text-white [color-scheme:dark]"
            />
            <button
              type="button"
              disabled={savePlan.isPending}
              onClick={() => savePlan.mutate({ examDate: examDate || null })}
              className="inline-flex h-11 items-center rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 text-[13.5px] font-semibold text-black transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-40"
            >
              {t("study.plan.build")}
            </button>
          </div>
        </div>
        {savePlan.isError && <p className="t-caption mt-3 text-red-400/90">{errorText(savePlan.error)}</p>}
        {plan.data && plan.data.days.length > 0 ? (
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {plan.data.days.map((d: { date: string; tasks: { kind: string; lessonId?: string; label: string }[] }) => (
              <li key={d.date} className="border-t border-white/8 pt-3">
                <p className="tabular t-caption text-white/40">{d.date}</p>
                <ul className="mt-2.5 space-y-2">
                  {d.tasks.map((task: { kind: string; lessonId?: string; label: string }, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-white/70">
                      <span
                        className={cn(
                          "mt-1 size-1.5 shrink-0 rounded-full",
                          task.kind === "watch" && "bg-[var(--accent)]",
                          task.kind === "quiz-retry" && "bg-amber-400",
                          task.kind === "adaptive" && "bg-violet-400",
                          task.kind === "review" && "bg-emerald-400",
                          task.kind === "rest" && "bg-white/30",
                        )}
                      />
                      {task.lessonId ? (
                        <Link to={`/watch/${task.lessonId}`} className="transition-colors hover:text-white">
                          {task.label}
                        </Link>
                      ) : (
                        task.label
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        ) : null}
      </section>

      {/* ── 45: adaptive test ── */}
      <section>
        <h3 className="t-title flex items-center gap-2 text-white">
          <BrainCircuit className="size-5 text-[var(--accent)]" strokeWidth={1.75} />
          {t("study.adaptive.title")}
        </h3>
        {lessonsForAdaptive.length === 0 ? (
          <p className="t-body mt-4 text-white/40">{t("study.adaptive.noLessons")}</p>
        ) : (
          <AdaptiveRunner lessons={lessonsForAdaptive} lessonId={adaptiveLessonId} onLessonChange={setAdaptiveLessonId} />
        )}
      </section>
    </div>
  );
}

function AdaptiveRunner({
  lessons,
  lessonId,
  onLessonChange,
}: {
  lessons: { id: string; title: string; courseTitle: string }[];
  lessonId: string;
  onLessonChange: (id: string) => void;
}) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [total, setTotal] = useState(6);
  const [question, setQuestion] = useState<{ index: number; id: string; q: string; options: string[]; difficulty: number } | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [result, setResult] = useState<{ pct: number; level: string; note: string } | null>(null);

  const start = trpc.ai.adaptiveStart.useMutation({
    onSuccess: (r) => {
      setSessionId(r.sessionId);
      setTotal(r.total);
      setQuestion(r.question);
      setPicked(null);
      setFeedback(null);
      setResult(null);
    },
  });
  const answer = trpc.ai.adaptiveAnswer.useMutation({
    onSuccess: (r) => {
      setFeedback({ correct: r.correct, explanation: r.explanation });
      if (r.done) {
        setResult(r.result);
        setQuestion(null);
      } else {
        setTimeout(() => {
          setQuestion(r.question ?? null);
          setPicked(null);
          setFeedback(null);
        }, 1400);
      }
    },
  });

  if (result) {
    return (
      <div className="mt-5">
        <p className="text-[16px] font-semibold text-white">{t("study.adaptive.level", { level: result.level })}</p>
        <p className="tabular t-caption mt-1 text-white/40">{t("ai.practice.score", { pct: result.pct })}</p>
        <p className="mt-3 text-[13.5px] leading-relaxed text-white/60">{result.note}</p>
        <button
          type="button"
          onClick={() => {
            setResult(null);
            setSessionId(null);
          }}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-[var(--radius-btn)] border border-white/14 px-5 text-[13px] text-white/80 transition-colors hover:border-white/30"
        >
          <RefreshCw className="size-3.5" strokeWidth={2} />
          {t("study.adaptive.again")}
        </button>
      </div>
    );
  }

  if (!sessionId || !question) {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select
          value={lessonId}
          onChange={(e) => onLessonChange(e.target.value)}
          aria-label={t("study.adaptive.pick")}
          className="h-11 max-w-full rounded-[var(--radius-btn)] border border-white/12 bg-[#0b0b0d] px-3.5 text-[13px] text-white"
        >
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {l.courseTitle} — {l.title}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!lessonId || start.isPending}
          onClick={() => start.mutate({ lessonId })}
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] px-6 text-[13.5px] font-semibold text-black transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-40"
        >
          <Play className="size-4" fill="currentColor" strokeWidth={0} />
          {t("study.adaptive.start")}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between gap-3">
        <p className="t-caption tabular text-white/40">{t("study.adaptive.q", { i: question.index + 1, n: total })}</p>
        <DiffChip d={question.difficulty} />
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full bg-[var(--accent)] transition-[width]" style={{ width: `${(question.index / total) * 100}%` }} />
      </div>
      <p className="mt-4 text-[15px] font-medium leading-relaxed text-white/90">{question.q}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {question.options.map((opt, oi) => (
          <button
            key={oi}
            type="button"
            disabled={feedback !== null}
            onClick={() => setPicked(oi)}
            className={cn(
              "inline-flex min-h-10 items-center rounded-[var(--radius-btn)] border px-4 text-[13px] transition-colors",
              picked === oi ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white" : "border-white/12 text-white/60 hover:border-white/30 hover:text-white",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
      {feedback ? (
        <p className={cn("mt-4 flex items-start gap-2 text-[13px] leading-relaxed", feedback.correct ? "text-emerald-400/90" : "text-red-400/90")}>
          {feedback.correct ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" strokeWidth={2} /> : <XCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />}
          <span>
            {feedback.correct ? t("study.adaptive.correct") : t("study.adaptive.wrong")} — {feedback.explanation}
          </span>
        </p>
      ) : (
        <button
          type="button"
          disabled={picked === null || answer.isPending}
          onClick={() => picked !== null && answer.mutate({ sessionId, answer: picked })}
          className="mt-5 inline-flex h-10 items-center rounded-[var(--radius-btn)] bg-[var(--accent)] px-6 text-[13px] font-semibold text-black transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-40"
        >
          {t("study.adaptive.submit")}
        </button>
      )}
    </div>
  );
}
