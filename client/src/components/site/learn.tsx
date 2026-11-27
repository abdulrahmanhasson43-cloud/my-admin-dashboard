import { useState } from "react";
import { Award, CheckCircle2, HelpCircle, Lock, Play, XCircle } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { t } from "@/i18n";
import { errorText } from "@/i18n/errors";

/**
 * Learn widgets for the Watch page (features 3, 6, 36 + the subtle watermark).
 */

/** In-video question gate: pauses the lesson until the student answers right. */
export function QuestionGate({
  lessonId,
  question,
  onPassed,
}: {
  lessonId: string;
  question: { id: string; q: string; options: string[] };
  onPassed: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState(false);
  const answer = trpc.videoQ.answer.useMutation({
    onSuccess: (r) => {
      if (r.correct) onPassed();
      else {
        setWrong(true);
        setPicked(null);
      }
    },
  });

  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-black/88 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <p className="t-overline flex items-center gap-2 text-[var(--accent)]">
          <HelpCircle className="size-4" strokeWidth={2} />
          {t("watch.vq.title")}
        </p>
        <p className="mt-4 text-[15.5px] font-medium leading-relaxed text-white">{question.q}</p>
        <div className="mt-4 space-y-2">
          {question.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setWrong(false);
                setPicked(i);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-[var(--radius-btn)] border px-4 py-2.5 text-start text-[13.5px] transition-colors",
                picked === i
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white"
                  : "border-white/12 text-white/70 hover:border-white/30 hover:text-white",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
        {wrong && (
          <p className="mt-3 flex items-center gap-2 text-[12.5px] text-red-400/90">
            <XCircle className="size-4 shrink-0" strokeWidth={2} />
            {t("watch.vq.wrong")}
          </p>
        )}
        <button
          type="button"
          disabled={picked === null || answer.isPending}
          onClick={() => picked !== null && answer.mutate({ lessonId, questionId: question.id, answer: picked })}
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-btn)] bg-[var(--accent)] text-[14px] font-semibold text-black transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-40"
        >
          {t("watch.vq.check")}
        </button>
      </div>
    </div>
  );
}

/** The subtle leak deterrent that replaced the moving watermark: a tiny static tag, a few seconds every few minutes. */
export function SubtleWatermark({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  useState(() => {
    if (typeof window === "undefined") return;
    const cycle = () => {
      setShow(true);
      setTimeout(() => setShow(false), 8000);
    };
    const first = setTimeout(cycle, 45_000);
    const every = setInterval(cycle, 180_000);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  });
  if (!text || !show) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-3 end-3 z-10 select-none rounded-full bg-black/45 px-3 py-1 text-[11px] tabular text-white/55"
    >
      {text}
    </div>
  );
}

type QuizPhase = "idle" | "taking" | "result";

/** Lesson quiz panel (feature 6): unlocks at 90% watched; passing completes the lesson. */
export function QuizPanel({
  lessonId,
  progress,
  quizPassPct,
  onChanged,
}: {
  lessonId: string;
  progress: {
    percent: number;
    watchDone: boolean;
    quizPassed: boolean;
    quizBestPct: number;
    quizAttempts: number;
    quizLocked?: boolean;
    failsLeft?: number;
    state: string;
  };
  quizPassPct: number;
  onChanged: (certificate: { code: string } | null) => void;
}) {
  const toast = useToast();
  const [phase, setPhase] = useState<QuizPhase>("idle");
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<{ pct: number; passed: boolean; perQuestion: boolean[]; quizLocked?: boolean; failsLeft?: number } | null>(null);

  const quiz = trpc.quiz.get.useQuery({ lessonId }, { enabled: phase === "taking" });
  const submit = trpc.quiz.submit.useMutation({
    onSuccess: (r) => {
      setResult({ pct: r.pct, passed: r.passed, perQuestion: r.perQuestion, quizLocked: r.quizLocked, failsLeft: r.failsLeft });
      setPhase("result");
      if (r.passed) {
        toast.push("success", t("watch.quiz.pass"));
        if (r.certificate) toast.push("success", t("cert.congrats"));
      }
      onChanged(r.certificate ?? null);
    },
    onError: (e) => toast.push("error", errorText(e)),
  });

  const done = progress.state === "completed";

  return (
    <section className="mt-10 border-t border-white/8 pt-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="t-title flex items-center gap-2.5 text-white">
          <Award className="size-5 text-[var(--accent)]" strokeWidth={1.75} />
          {t("watch.quiz.title")}
        </h2>
        {progress.quizAttempts > 0 && (
          <span className="t-caption tabular text-white/40">{t("watch.quiz.best", { pct: progress.quizBestPct })}</span>
        )}
      </div>

      {done ? (
        <p className="mt-4 flex items-center gap-2 text-[14px] text-emerald-400/90">
          <CheckCircle2 className="size-4" strokeWidth={2} />
          {t("watch.quiz.done", { pct: progress.quizBestPct })}
        </p>
      ) : progress.quizLocked ? (
        <div className="mt-4">
          <div className="flex items-start gap-3 text-amber-200/90">
            <Lock className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-[13.5px] font-semibold leading-relaxed">{t("watch.quiz.lockedTitle")}</p>
              <div className="mt-3 h-1 w-56 max-w-full overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-amber-400 transition-[width]" style={{ width: `${progress.percent}%` }} />
              </div>
              <p className="tabular mt-2 text-[11.5px] text-white/40">{t("watch.quiz.locked", { pct: progress.percent })}</p>
            </div>
          </div>
        </div>
      ) : !progress.watchDone ? (
        <div className="mt-4 flex items-start gap-3 text-white/45">
          <Lock className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          <div>
            <p className="text-[13.5px] leading-relaxed">{t("watch.quiz.locked", { pct: progress.percent })}</p>
            <div className="mt-3 h-1 w-56 max-w-full overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-[var(--accent)] transition-[width]" style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
        </div>
      ) : phase === "idle" ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              setAnswers([]);
              setResult(null);
              setPhase("taking");
            }}
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] px-6 text-[14px] font-semibold text-black transition-colors hover:bg-[var(--accent-hover)]"
          >
            <Play className="size-4" fill="currentColor" strokeWidth={0} />
            {t("watch.quiz.start")}
          </button>
        </div>
      ) : quiz.isLoading || !quiz.data ? (
        <p className="t-body mt-4 text-white/40">{t("common.loading")}</p>
      ) : (
        <div className="mt-5 space-y-6">
          {quiz.data.questions.map((q, qi) => (
            <div key={q.id}>
              <p className="t-caption text-white/35">{t("watch.quiz.q", { i: qi + 1, n: quiz.data.questions.length })}</p>
              <p className="mt-1.5 flex items-start gap-2 text-[14.5px] font-medium leading-relaxed text-white/90">
                {phase === "result" &&
                  (result?.perQuestion[qi] ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" strokeWidth={2} />
                  ) : (
                    <XCircle className="mt-0.5 size-4 shrink-0 text-red-400" strokeWidth={2} />
                  ))}
                {q.q}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {q.options.map((opt, oi) => {
                  const on = answers[qi] === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={phase === "result"}
                      onClick={() => setAnswers((a) => quiz.data.questions.map((_, i) => (i === qi ? oi : (a[i] ?? null))))}
                      className={cn(
                        "inline-flex min-h-10 items-center rounded-[var(--radius-btn)] border px-4 text-[13px] transition-colors",
                        on
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white"
                          : "border-white/12 text-white/60 hover:border-white/30 hover:text-white",
                        phase === "result" && "opacity-70",
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {phase === "taking" ? (
            <button
              type="button"
              disabled={submit.isPending || answers.filter((a) => a !== null && a !== undefined).length < quiz.data.questions.length}
              onClick={() => submit.mutate({ lessonId, answers: quiz.data.questions.map((_, i) => answers[i] ?? null) })}
              className="inline-flex h-11 items-center rounded-[var(--radius-btn)] bg-[var(--accent)] px-6 text-[14px] font-semibold text-black transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-40"
            >
              {t("watch.quiz.submit")}
            </button>
          ) : result ? (
            <div className="flex flex-wrap items-center gap-4">
              <p className={cn("text-[14px]", result.passed ? "text-emerald-400/90" : "text-amber-300/90")}>
                {result.passed
                  ? t("watch.quiz.pass")
                  : result.quizLocked
                    ? t("watch.quiz.lockNow")
                    : t("watch.quiz.fail", { pct: result.pct, pass: quizPassPct })}
              </p>
              {!result.passed && !result.quizLocked && (
                <button
                  type="button"
                  onClick={() => {
                    setAnswers([]);
                    setResult(null);
                    setPhase("taking");
                  }}
                  className="inline-flex h-10 items-center rounded-[var(--radius-btn)] border border-white/14 px-5 text-[13px] text-white/80 transition-colors hover:border-white/30"
                >
                  {t("watch.quiz.retry")}
                </button>
              )}
              {!result.passed && !result.quizLocked && typeof result.failsLeft === "number" && result.failsLeft < 3 && (
                <p className="t-caption text-amber-300/70">{t("watch.quiz.failsLeft", { n: result.failsLeft })}</p>
              )}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
