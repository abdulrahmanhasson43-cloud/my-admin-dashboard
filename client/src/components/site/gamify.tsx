import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Flame,
  MessageSquare,
  Medal,
  Radio,
  Send,
  Swords,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { trpc } from "@/_core/trpc";
import { cn } from "@/lib/utils";
import { Tip } from "@/components/ui/tip";
import { BADGES, PEER_RUBRIC } from "@shared/gamify";
import { t, pick } from "@/i18n";
import { errorText } from "@/i18n/errors";

/**
 * Motivation & engagement (features 30–35, 37). Points/badges/streaks, weekly
 * leaderboard, friend challenges, lesson discussion, live sessions with chat,
 * peer review and the daily goal. Rules live in shared/gamify.ts — the demo
 * store and the real server run the same code.
 */

const CARD = "rounded-[var(--radius-card)] border border-white/10 p-6";
const INPUT =
  "w-full rounded-[var(--radius-btn)] border border-white/12 bg-transparent px-4 py-2.5 text-[14px] text-white placeholder:text-white/30 focus:border-[var(--accent)] focus:outline-none";
const BTN =
  "inline-flex h-10 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] px-4 text-[13.5px] font-medium text-[var(--accent-fg,#fff)] transition-opacity disabled:opacity-40";
const BTN_GHOST =
  "inline-flex h-10 items-center gap-2 rounded-[var(--radius-btn)] border border-white/12 px-4 text-[13.5px] text-white/75 transition-colors hover:border-white/30 hover:text-white";

function SectionTitle({ icon: Icon, title, body }: { icon: typeof Trophy; title: string; body?: string }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-[17px] font-semibold text-white">
        <Icon className="size-[18px] text-[var(--accent)]" strokeWidth={2} />
        {title}
      </h3>
      {body && <p className="t-caption mt-1.5 max-w-[60ch] text-white/40">{body}</p>}
    </div>
  );
}

// ─── Account tab: points, streak, goal, badges, leaderboard, challenges ─────

export function GamingPanel() {
  const utils = trpc.useUtils();
  const summary = trpc.gamify.summary.useQuery();
  const leader = trpc.gamify.leaderboard.useQuery();
  const challenges = trpc.challenges.list.useQuery();
  const dash = trpc.progress.dashboard.useQuery();

  const invalidate = () => {
    void utils.gamify.summary.invalidate();
    void utils.gamify.leaderboard.invalidate();
    void utils.challenges.list.invalidate();
  };
  const opt = trpc.gamify.leaderboardOpt.useMutation({ onSuccess: invalidate });
  const setGoal = trpc.gamify.setGoal.useMutation({ onSuccess: invalidate });
  const createChallenge = trpc.challenges.create.useMutation({ onSuccess: invalidate });

  const [goalEdit, setGoalEdit] = useState("");
  const [opponent, setOpponent] = useState("");
  const [challengeLesson, setChallengeLesson] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);

  if (summary.isLoading) return <div className={cn(CARD, "t-body text-white/40")}>{t("gamify.loading")}</div>;
  const s = summary.data;
  if (!s) return null;

  const maxMin = Math.max(1, ...s.weekDays.map((d) => d.minutes));
  const lessonOptions = (dash.data?.courses ?? []).flatMap((c) =>
    c.lessons.map((l) => ({ id: l.id, title: `${c.course.title} — ${l.title}` })),
  );
  const opponents = (leader.data?.rows ?? []).filter((r) => !r.isMe);

  return (
    <div className="space-y-6">
      {/* 30: points + streak + 37: daily goal — icon + number, straight on the page */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-b border-white/8 pb-6 sm:grid-cols-3">
        <div className="flex items-center gap-3">
          <Tip label={t("gamify.totalPoints")}>
            <Trophy aria-label={t("gamify.totalPoints")} className="size-5 text-[var(--accent)]" strokeWidth={2} />
          </Tip>
          <p className="text-[28px] font-bold leading-none tabular text-white">{s.totalPoints}</p>
          <Tip label={t("gamify.weekPoints", { n: s.weekPoints })}>
            <span className="t-caption tabular text-white/40">+{s.weekPoints}</span>
          </Tip>
        </div>
        <div className="flex items-center gap-3">
          <Tip label={t("gamify.streak")}>
            <Flame aria-label={t("gamify.streak")} className="size-5 text-amber-400" strokeWidth={2} />
          </Tip>
          <p className="text-[28px] font-bold leading-none tabular text-white">{s.weekStreak.current}</p>
          <Tip label={t("gamify.streakWeeksBest", { n: s.weekStreak.longest })}>
            <span className="t-caption inline-flex items-center gap-1 tabular text-white/40">
              <Medal className="size-3.5" strokeWidth={2} />
              {s.weekStreak.longest}
            </span>
          </Tip>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-3">
            <Tip label={t("gamify.goal.title")}>
              <Target aria-label={t("gamify.goal.title")} className="size-5 text-[var(--accent)]" strokeWidth={2} />
            </Tip>
            <p className="text-[15px] font-medium tabular text-white">
              {s.weekGoal.doneMinutes}/{s.weekGoal.goalMinutes}
            </p>
            {s.weekGoal.met && (
              <Tip label={t("gamify.goal.met")}>
                <CheckCircle2 aria-label={t("gamify.goal.met")} className="size-4 text-emerald-400/90" strokeWidth={2} />
              </Tip>
            )}
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className={cn("h-full rounded-full transition-[width]", s.weekGoal.met ? "bg-emerald-400" : "bg-[var(--accent)]")}
              style={{ width: `${s.weekGoal.pct}%` }}
            />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              min={15}
              max={1680}
              value={goalEdit}
              onChange={(e) => setGoalEdit(e.target.value)}
              placeholder={t("gamify.goal.set")}
              className={cn(INPUT, "h-9 w-24 px-3 text-[13px]")}
            />
            <button
              className={cn(BTN_GHOST, "h-9 text-[13px]")}
              disabled={!goalEdit || setGoal.isPending}
              onClick={() => setGoal.mutate({ minutes: Number(goalEdit) })}
            >
              {t("gamify.goal.save")}
            </button>
          </div>
        </div>
      </div>

      {/* 37: last 7 days */}
      <div className="border-b border-white/8 pb-6 last:border-b-0">
        <SectionTitle icon={CalendarDays} title={t("gamify.week.title")} />
        <div className="mt-4 flex h-24 items-end gap-2">
          {s.weekDays.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full flex-1 items-end rounded-md bg-white/4">
                <div
                  className={cn("w-full rounded-md", d.minutes >= s.weekGoal.goalMinutes / 7 ? "bg-emerald-400/80" : "bg-[var(--accent)]/70")}
                  style={{ height: `${Math.max(4, (d.minutes / maxMin) * 100)}%` }}
                  title={`${d.minutes} ${t("gamify.minutes")}`}
                />
              </div>
              <span className="text-[10px] tabular text-white/30">{d.day.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 30: badges */}
      <div className="border-b border-white/8 pb-6 last:border-b-0">
        <SectionTitle icon={Trophy} title={t("gamify.badges.title")} />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {s.badges.map((b) => {
            const def = BADGES.find((x) => x.id === b.id)!;
            return (
              <div
                key={b.id}
                className={cn(
                  "rounded-[var(--radius-card)] border p-3.5",
                  b.unlocked ? "border-[var(--accent)]/40 bg-[var(--accent)]/5" : "border-white/8 opacity-45",
                )}
              >
                <p className="text-[13.5px] font-medium text-white">{pick(def.titleAr, def.titleEn)}</p>
                <p className="t-caption mt-0.5 text-white/45">{pick(def.descAr, def.descEn)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 31: weekly leaderboard (optional) */}
      <div className="border-b border-white/8 pb-6">
        <div className="flex items-start justify-between gap-3">
          <SectionTitle icon={Users} title={t("gamify.leader.title")} />
          <button className={cn(BTN_GHOST, "h-9 shrink-0 text-[12.5px]")} disabled={opt.isPending} onClick={() => opt.mutate({ show: s.leaderboardHidden })}>
            {s.leaderboardHidden ? t("gamify.leader.optIn") : t("gamify.leader.optOut")}
          </button>
        </div>
        <div className="mt-4 space-y-1.5">
          {(leader.data?.rows ?? []).length === 0 && <p className="t-body text-white/40">{t("gamify.leader.empty")}</p>}
          {(leader.data?.rows ?? []).slice(0, 10).map((r) => (
            <div
              key={r.userId}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-btn)] border px-3.5 py-2.5",
                r.isMe ? "border-[var(--accent)]/50 bg-[var(--accent)]/8" : "border-white/8",
              )}
            >
              <span className="w-7 text-center text-[14px] font-semibold tabular text-white/50">{r.rank}</span>
              <span className="flex-1 text-[14px] text-white/85">
                {r.name} {r.isMe && <span className="t-caption text-[var(--accent)]">({t("gamify.leader.you")})</span>}
              </span>
              <span className="text-[13.5px] tabular text-white/60">{t("gamify.pointsCount", { n: r.points })}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 32: friend challenges */}
      <div className="border-b border-white/8 pb-6 last:border-b-0">
        <SectionTitle icon={Swords} title={t("gamify.ch.title")} />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select value={opponent} onChange={(e) => setOpponent(e.target.value)} className={cn(INPUT, "h-10 w-auto")}>
            <option value="">{t("gamify.ch.pickOpponent")}</option>
            {opponents.map((o) => (
              <option key={o.userId} value={o.userId}>
                {o.name}
              </option>
            ))}
          </select>
          <select value={challengeLesson} onChange={(e) => setChallengeLesson(e.target.value)} className={cn(INPUT, "h-10 w-auto")}>
            <option value="">{t("gamify.ch.pickLesson")}</option>
            {lessonOptions.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
          <button
            className={BTN}
            disabled={!opponent || !challengeLesson || createChallenge.isPending}
            onClick={() => createChallenge.mutate({ lessonId: challengeLesson, opponentUserId: opponent })}
          >
            {t("gamify.ch.new")}
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {(challenges.data ?? []).map((c) => (
            <div key={c.id} className="rounded-[var(--radius-btn)] border border-white/8 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[14px] text-white/85">{c.lessonTitle}</p>
                <span className="t-caption text-white/40">
                  {c.state === "done" ? t("gamify.ch.done") : c.state === "running" ? t("gamify.ch.running") : t("gamify.ch.waiting")}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {c.standing.map((p) => (
                  <p key={p.userId} className="t-body text-white/60">
                    {p.rank}. {p.name} — {p.score === null ? t("gamify.ch.waiting") : t("gamify.ch.score", { pct: p.score })}
                  </p>
                ))}
              </div>
              {c.state === "done" && c.winnerId && (
                <p className="t-caption mt-2 text-emerald-400/90">
                  {t("gamify.ch.winner", { name: c.standing.find((p) => p.userId === c.winnerId)?.name ?? "" })}
                </p>
              )}
              <div className="mt-2.5">
                <ChallengePlayButton c={c} playingId={playingId} setPlayingId={setPlayingId} onDone={invalidate} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChallengePlayButton({ c, playingId, setPlayingId, onDone }: { c: any; playingId: string | null; setPlayingId: (id: string | null) => void; onDone: () => void }) {
  const utils = trpc.useUtils();
  return (
    <ChallengePlay
      c={c}
      playing={playingId === c.id}
      setPlaying={(v) => setPlayingId(v ? c.id : null)}
      onDone={() => {
        void utils.gamify.summary.invalidate();
        onDone();
      }}
    />
  );
}

function ChallengePlay({ c, playing, setPlaying, onDone }: { c: any; playing: boolean; setPlaying: (v: boolean) => void; onDone: () => void }) {
  const [questions, setQuestions] = useState<any[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any>(null);
  const play = trpc.challenges.play.useMutation({
    onSuccess: (d) => {
      setQuestions(d.questions);
      setPlaying(true);
    },
  });
  const submit = trpc.challenges.submit.useMutation({
    onSuccess: (d) => {
      setResult(d);
      setQuestions(null);
      onDone();
    },
  });

  if (result) {
    return <p className="t-body text-emerald-400/90">{t("gamify.ch.result", { pct: result.pct })}</p>;
  }
  if (!playing || !questions) {
    // Only the player who has not finished yet can play.
    const meUnfinished = (c.standing as any[]).some((p) => p.score === null && p.isMe);
    if (c.state === "done" || !meUnfinished) return null;
    return (
      <button className={cn(BTN_GHOST, "h-9 text-[13px]")} disabled={play.isPending} onClick={() => play.mutate({ challengeId: c.id })}>
        {t("gamify.ch.play")}
      </button>
    );
  }
  return (
    <div className="mt-2 space-y-3 rounded-[var(--radius-btn)] border border-white/8 p-3.5">
      {questions.map((q, qi) => (
        <div key={q.id}>
          <p className="text-[13.5px] font-medium text-white/85">
            {qi + 1}. {q.q}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {q.options.map((o: string, oi: number) => (
              <button
                key={oi}
                className={cn(
                  "rounded-[var(--radius-btn)] border px-3 py-1.5 text-[13px]",
                  answers[q.id] === oi ? "border-[var(--accent)] bg-[var(--accent)]/10 text-white" : "border-white/10 text-white/65 hover:border-white/25",
                )}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button
        className={BTN}
        disabled={submit.isPending || questions.some((q) => answers[q.id] === undefined)}
        onClick={() => submit.mutate({ challengeId: c.id, answers: questions.map((q) => answers[q.id] ?? null) })}
      >
        {t("gamify.ch.submit")}
      </button>
      {(play.isError || submit.isError) && <p className="t-caption text-red-400">{errorText((play.error ?? submit.error) as never)}</p>}
    </div>
  );
}

// ─── 33: discussion under every lesson ───────────────────────────────────────

export function LessonDiscussion({ lessonId }: { lessonId: string }) {
  const utils = trpc.useUtils();
  const list = trpc.discuss.list.useQuery({ lessonId });
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const post = trpc.discuss.post.useMutation({
    onSuccess: () => {
      setText("");
      void utils.discuss.list.invalidate({ lessonId });
      void utils.gamify.summary.invalidate();
    },
  });
  const reply = trpc.discuss.reply.useMutation({
    onSuccess: () => {
      setReplyText("");
      setReplyTo(null);
      void utils.discuss.list.invalidate({ lessonId });
      void utils.gamify.summary.invalidate();
    },
  });

  return (
    <section className="mt-10 border-t border-white/8 pt-8">
      <SectionTitle icon={MessageSquare} title={t("discuss.title")} />
      <div className="mt-4 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("discuss.placeholder")} className={INPUT} maxLength={1000} />
        <button className={BTN} disabled={text.trim().length < 3 || post.isPending} onClick={() => post.mutate({ lessonId, text: text.trim() })}>
          {t("discuss.post")}
        </button>
      </div>
      {post.isError && <p className="t-caption mt-2 text-red-400">{errorText(post.error as never)}</p>}
      <div className="mt-5 space-y-3">
        {(list.data ?? []).map((p) => (
          <div key={p.id} className={CARD}>
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-medium text-white/85">{p.authorName}</span>
              {p.authorRole !== "student" && <span className="rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-[10.5px] text-[var(--accent)]">{t("discuss.teacher")}</span>}
              {p.mine && <span className="t-caption text-white/30">({t("gamify.leader.you")})</span>}
            </div>
            <p className="mt-1.5 text-[14px] leading-relaxed text-white/80">{p.text}</p>
            <div className="mt-3 space-y-2 border-s border-white/10 ps-3.5">
              {p.replies.map((r) => (
                <div key={r.id}>
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-medium text-white/70">{r.authorName}</span>
                    {r.authorRole !== "student" && <span className="rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-[10.5px] text-[var(--accent)]">{t("discuss.teacher")}</span>}
                  </div>
                  <p className="mt-0.5 text-[13.5px] text-white/65">{r.text}</p>
                </div>
              ))}
            </div>
            {replyTo === p.id ? (
              <div className="mt-3 flex gap-2">
                <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={t("discuss.replyPlaceholder")} className={cn(INPUT, "h-9 text-[13px]")} maxLength={1000} />
                <button className={cn(BTN, "h-9 text-[13px]")} disabled={replyText.trim().length < 2 || reply.isPending} onClick={() => reply.mutate({ postId: p.id, text: replyText.trim() })}>
                  <Send className="size-3.5" strokeWidth={2} />
                </button>
              </div>
            ) : (
              <button className="t-caption mt-3 text-[var(--accent)] hover:underline" onClick={() => setReplyTo(p.id)}>
                {t("discuss.reply")}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 34: live sessions with chat ─────────────────────────────────────────────

export function LiveSessionsCard({ courseId }: { courseId: string }) {
  const utils = trpc.useUtils();
  const list = trpc.live.list.useQuery({ courseId }, { refetchInterval: 60_000 });
  const [openChat, setOpenChat] = useState<string | null>(null);
  const [chatText, setChatText] = useState("");
  const messages = trpc.live.messages.useQuery(
    { sessionId: openChat ?? "" },
    { enabled: Boolean(openChat), refetchInterval: openChat ? 10_000 : false },
  );
  const chat = trpc.live.chat.useMutation({
    onSuccess: () => {
      setChatText("");
      void utils.live.messages.invalidate();
      void utils.live.list.invalidate();
      void utils.gamify.summary.invalidate();
    },
  });

  const sessions = (list.data ?? []).filter((x) => x.status !== "ended" || x.recordingUrl);
  if (!list.isLoading && sessions.length === 0) return null;

  return (
    <section className="mt-10 border-t border-white/8 pt-8">
      <SectionTitle icon={Radio} title={t("live.title")} />
      <div className="mt-4 space-y-3">
        {sessions.map((x) => (
          <div key={x.id} className={CARD}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {x.status === "live" && (
                  <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-[11.5px] font-medium text-red-400">
                    <span className="size-1.5 animate-pulse rounded-full bg-red-400" />
                    {t("live.now")}
                  </span>
                )}
                {x.status === "upcoming" && <span className="rounded-full bg-white/8 px-2.5 py-1 text-[11.5px] text-white/60">{t("live.upcoming")}</span>}
                {x.status === "ended" && <span className="rounded-full bg-white/8 px-2.5 py-1 text-[11.5px] text-white/60">{t("live.ended")}</span>}
                <p className="text-[15px] font-medium text-white">{x.title}</p>
              </div>
              <span className="t-caption tabular text-white/40">{new Date(x.startsAt).toLocaleString("ar-EG-u-nu-latn", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {x.status === "live" && (
                <button className={BTN} onClick={() => setOpenChat(openChat === x.id ? null : x.id)}>
                  {t("live.openChat")}
                </button>
              )}
              {x.status === "ended" && x.recordingUrl && (
                <a className={BTN_GHOST} href={x.recordingUrl} target="_blank" rel="noreferrer">
                  {t("live.watchRecording")}
                </a>
              )}
              {x.attended && <span className="t-caption text-emerald-400/90">{t("live.attended")}</span>}
            </div>
            {openChat === x.id && (
              <div className="mt-4 rounded-[var(--radius-btn)] border border-white/8 p-3.5">
                <div className="max-h-56 space-y-2 overflow-y-auto">
                  {(messages.data ?? []).map((m) => (
                    <div key={m.id} className={cn("max-w-[85%] rounded-xl px-3 py-2 text-[13.5px]", m.mine ? "ms-auto bg-[var(--accent)]/15 text-white" : "bg-white/6 text-white/80")}>
                      <span className="t-caption block text-white/40">{m.authorName}</span>
                      {m.text}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input value={chatText} onChange={(e) => setChatText(e.target.value)} placeholder={t("live.chatPlaceholder")} className={cn(INPUT, "h-9 text-[13px]")} maxLength={500} />
                  <button className={cn(BTN, "h-9 text-[13px]")} disabled={!chatText.trim() || chat.isPending} onClick={() => chat.mutate({ sessionId: x.id, text: chatText.trim() })}>
                    <Send className="size-3.5" strokeWidth={2} />
                  </button>
                </div>
                {chat.isError && <p className="t-caption mt-2 text-red-400">{errorText(chat.error as never)}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 35: peer review of assignments ──────────────────────────────────────────

export function PeerReviewCard({ lessonId }: { lessonId: string }) {
  const utils = trpc.useUtils();
  const data = trpc.peers.get.useQuery({ lessonId });
  const [text, setText] = useState("");
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});
  const [reviewNote, setReviewNote] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const submit = trpc.peers.submit.useMutation({
    onSuccess: () => {
      setText("");
      void utils.peers.get.invalidate({ lessonId });
    },
  });
  const review = trpc.peers.review.useMutation({
    onSuccess: () => {
      setReviewingId(null);
      setReviewNote("");
      void utils.peers.get.invalidate({ lessonId });
      void utils.gamify.summary.invalidate();
    },
  });

  if (data.isLoading || !data.data?.assignment) return null;
  const d = data.data;

  return (
    <section className="mt-10 border-t border-white/8 pt-8">
      <SectionTitle icon={Users} title={d.assignment.title} body={`${t("peers.prompt")} ${d.assignment.prompt}`} />
      {!d.mySubmission ? (
        <div className="mt-4">
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t("peers.submitPlaceholder")} rows={4} className={INPUT} maxLength={5000} />
          <button className={cn(BTN, "mt-3")} disabled={text.trim().length < 20 || submit.isPending} onClick={() => submit.mutate({ assignmentId: d.assignment.id, text: text.trim() })}>
            {t("peers.submit")}
          </button>
          {submit.isError && <p className="t-caption mt-2 text-red-400">{errorText(submit.error as never)}</p>}
        </div>
      ) : (
        <div className="mt-4">
          <p className="t-caption text-emerald-400/90">{t("peers.submitted")}</p>
          {d.mySubmission.summary.count > 0 && (
            <p className="t-body mt-1 text-white/70">
              {t("peers.yourScore", { pct: d.mySubmission.summary.pct, count: d.mySubmission.summary.count })}
            </p>
          )}
        </div>
      )}

      {d.toReview.length > 0 && (
        <div className="mt-6">
          <p className="text-[15px] font-medium text-white/85">{t("peers.reviewTitle")}</p>
          <div className="mt-3 space-y-3">
            {d.toReview.map((sub) => (
              <div key={sub.id} className={CARD}>
                <p className="t-caption text-white/40">{sub.authorName}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-white/80">{sub.text}</p>
                {sub.reviewedByMe ? (
                  <p className="t-caption mt-3 text-emerald-400/90">{t("peers.reviewed")}</p>
                ) : reviewingId === sub.id ? (
                  <div className="mt-4 space-y-3">
                    {PEER_RUBRIC.map((c) => (
                      <div key={c.id} className="flex flex-wrap items-center gap-2">
                        <span className="w-28 text-[13px] text-white/70">{pick(c.titleAr, c.titleEn)}</span>
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            className={cn(
                              "size-8 rounded-full border text-[13px] tabular",
                              scores[sub.id]?.[c.id] === v ? "border-[var(--accent)] bg-[var(--accent)]/15 text-white" : "border-white/12 text-white/50 hover:border-white/30",
                            )}
                            onClick={() => setScores((s) => ({ ...s, [sub.id]: { ...s[sub.id], [c.id]: v } }))}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    ))}
                    <input value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder={t("peers.note")} className={cn(INPUT, "h-9 text-[13px]")} maxLength={500} />
                    <button
                      className={BTN}
                      disabled={review.isPending || PEER_RUBRIC.some((c) => !scores[sub.id]?.[c.id])}
                      onClick={() => review.mutate({ submissionId: sub.id, scores: scores[sub.id], note: reviewNote.trim() || undefined })}
                    >
                      {t("peers.send")}
                    </button>
                    {review.isError && <p className="t-caption text-red-400">{errorText(review.error as never)}</p>}
                  </div>
                ) : (
                  <button className={cn(BTN_GHOST, "mt-3 h-9 text-[13px]")} onClick={() => setReviewingId(sub.id)}>
                    {t("peers.reviewStart")}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
