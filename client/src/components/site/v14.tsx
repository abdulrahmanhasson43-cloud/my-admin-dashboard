import { useState } from "react";
import { Copy, Check, RefreshCw, Send, MessageCircle, BellRing, Languages, CreditCard, X, Clock, CalendarDays, BookOpen, ListChecks, Flame } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Tip } from "@/components/ui/tip";
import { t } from "@/i18n";
import { errorText } from "@/i18n/errors";

const box = "border-t border-white/10 pt-5";
const btn =
  "inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] px-4 text-[13.5px] font-medium text-black disabled:opacity-50";
const btn2 =
  "inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-btn)] border border-white/15 px-4 text-[13.5px] text-white/80 hover:border-white/30 disabled:opacity-50";

/** Student side: the code a parent enters to link their account. */
export function ParentCodePanel() {
  const toast = useToast();
  const utils = trpc.useUtils();
  const q = trpc.parent.myCode.useQuery();
  const rotate = trpc.parent.rotateCode.useMutation({
    onSuccess: async () => {
      await utils.parent.myCode.invalidate();
      toast.push("success", t("v14.parentCode.rotated"));
    },
    onError: (e) => toast.push("error", errorText(e)),
  });
  const [copied, setCopied] = useState(false);
  return (
    <section className={box} aria-label={t("v14.parentCode.title")}>
      <h2 className="text-[15px] font-semibold text-white">{t("v14.parentCode.title")}</h2>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <code dir="ltr" className="rounded-[var(--radius-btn)] border border-white/10 bg-black/40 px-4 py-2 text-[1.1rem] font-semibold tracking-[0.25em] text-white tabular">
          {q.data?.code ?? "········"}
        </code>
        <Tip label={t("v14.copy")}>
        <button
          type="button"
          aria-label={t("v14.copy")}
          className={btn2 + " w-10 px-0"}
          disabled={!q.data}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(q.data!.code);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            } catch {
              toast.push("error", t("topup.07"));
            }
          }}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </button>
        </Tip>
        <Tip label={t("v14.parentCode.rotate")}>
          <button type="button" aria-label={t("v14.parentCode.rotate")} className={btn2 + " w-10 px-0"} disabled={rotate.isPending} onClick={() => rotate.mutate()}>
            <RefreshCw className="size-4" />
          </button>
        </Tip>
      </div>
    </section>
  );
}

/** Parent side: enter a child's code. */
export function LinkChildForm() {
  const toast = useToast();
  const utils = trpc.useUtils();
  const [code, setCode] = useState("");
  const link = trpc.parent.link.useMutation({
    onSuccess: async () => {
      setCode("");
      await utils.parent.children.invalidate();
      toast.push("success", t("v14.parent.linked"));
    },
    onError: (e) => toast.push("error", errorText(e)),
  });
  return (
    <form
      className={box}
      onSubmit={(e) => {
        e.preventDefault();
        if (code.trim().length >= 4) link.mutate({ code });
      }}
    >
      <h2 className="text-[15px] font-semibold text-white">{t("v14.parent.linkTitle")}</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          dir="ltr"
          maxLength={20}
          placeholder="ABCD2345"
          aria-label={t("v14.parent.linkTitle")}
          className="h-10 w-48 tracking-[0.2em]"
        />
        <button type="submit" className={btn} disabled={link.isPending || code.trim().length < 4}>
          {t("v14.parent.linkBtn")}
        </button>
      </div>
    </form>
  );
}

const KIND_KEYS = ["login", "signup", "watch_done", "lesson_complete", "quiz_pass", "quiz_fail", "quiz_lock", "quiz_unlock", "purchase", "redeem", "note", "certificate", "share_create"];

export function ChildCard({ c }: { c: any }) {
  const toast = useToast();
  const utils = trpc.useUtils();
  const [phone, setPhone] = useState("");
  const unlink = trpc.parent.unlink.useMutation({
    onSuccess: () => utils.parent.children.invalidate(),
    onError: (e) => toast.push("error", errorText(e)),
  });
  const send = trpc.parent.sendReport.useMutation({
    onSuccess: (r) => {
      toast.push("success", t("v14.parent.sent"));
      if (r.link) window.open(r.link, "_blank", "noopener");
    },
    onError: (e) => toast.push("error", errorText(e)),
  });
  const stat = (label: string, v: string | number, Icon: typeof Clock) => (
    <Tip label={label}>
      <div className="flex items-center gap-2 text-white" role="group" aria-label={label}>
        <Icon className="size-4 text-white/40" strokeWidth={1.75} />
        <p className="tabular text-[1.3rem] font-semibold leading-none">{v}</p>
      </div>
    </Tip>
  );
  return (
    <article className={box}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-[1.15rem] font-semibold text-white">{c.studentName}</h3>
        <Tip label={t("v14.parent.unlink")}>
          <button type="button" aria-label={t("v14.parent.unlink")} className="grid size-10 place-items-center rounded-[var(--radius-btn)] text-white/40 hover:text-white/80" onClick={() => unlink.mutate({ childId: c.childId })}>
            <X className="size-4" />
          </button>
        </Tip>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-7 gap-y-3">
        {stat(t("v14.parent.minWeek"), c.minutesThisWeek, Clock)}
        {stat(t("v14.parent.minLast"), c.minutesLastWeek, CalendarDays)}
        {stat(t("v14.parent.lessons"), c.lessonsDone, BookOpen)}
        {stat(t("v14.parent.quizzes"), c.quizzesPassed, ListChecks)}
        {stat(t("v14.parent.streak"), c.currentStreak, Flame)}
      </div>
      <p className="mt-4 rounded-[var(--radius-btn)] bg-black/40 p-3 text-[13px] leading-relaxed text-white/70">{c.report}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          dir="ltr"
          inputMode="tel"
          placeholder="01xxxxxxxxx"
          aria-label={t("v14.parent.phone")}
          className="h-10 w-48"
        />
        <button type="button" className={btn} disabled={send.isPending || phone.trim().length < 6} onClick={() => send.mutate({ childId: c.childId, phone })}>
          <MessageCircle className="size-4" /> {t("v14.parent.sendWa")}
        </button>
      </div>
      <h4 className="mt-5 text-[12px] font-medium uppercase tracking-[0.12em] text-white/40">{t("v14.parent.recent")}</h4>
      {c.activity.length === 0 ? (
        <p className="mt-2 text-[13px] text-white/40">{t("activity.empty")}</p>
      ) : (
        <ul className="mt-2 divide-y divide-white/8 border-y border-white/8">
          {c.activity.map((e: any) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-[13px]">
              <span className="text-white/80">
                {KIND_KEYS.includes(e.kind) ? t(`activity.kind.${e.kind}` as never) : e.kind}
                {e.lessonTitle ? <span className="text-white/40"> · {e.lessonTitle}</span> : null}
              </span>
              <time className="tabular text-white/35" dateTime={new Date(e.at).toISOString()}>
                {new Date(e.at).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

/** Admin: provider status + outbox + test sends + translation try-out. */
export function IntegrationsPanel() {
  const toast = useToast();
  const utils = trpc.useUtils();
  const list = trpc.integrations.list.useQuery();
  const [kind, setKind] = useState<"push" | "whatsapp">("push");
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const [tr, setTr] = useState("");
  const [trOut, setTrOut] = useState<string | null>(null);
  const test = trpc.integrations.test.useMutation({
    onSuccess: async () => {
      setBody("");
      await utils.integrations.list.invalidate();
      toast.push("success", t("v14.int.sent"));
    },
    onError: (e) => toast.push("error", errorText(e)),
  });
  const translate = trpc.integrations.translate.useMutation({
    onSuccess: (r) => setTrOut(r.text),
    onError: (e) => toast.push("error", errorText(e)),
  });
  const icons = { push: BellRing, whatsapp: MessageCircle, payment: CreditCard, translate: Languages } as const;
  return (
    <div className="space-y-6">
      <p className="rounded-[var(--radius-btn)] border border-amber-400/25 bg-amber-400/8 p-3 text-[13px] leading-relaxed text-amber-100/90">{t("v14.int.banner")}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {(list.data?.providers ?? []).map((p) => {
          const Icon = icons[p.kind as keyof typeof icons];
          return (
            <section key={p.kind} className={box}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-[14.5px] font-semibold text-white">
                  <Icon className="size-4 text-[var(--accent)]" /> {t(`v14.int.kind.${p.kind}` as never)}
                </h3>
                <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[11px] text-white/60">
                  {p.keysPresent ? t("v14.int.keysOk") : t("v14.int.mock")}
                </span>
              </div>
              <p className="mt-2 text-[12.5px] text-white/50">{t("v14.int.live")}: {p.liveProvider}</p>
              <p dir="ltr" className="mt-1 text-start text-[11.5px] text-white/35">{p.requiredKeys.join(" · ")}</p>
            </section>
          );
        })}
      </div>

      <form
        className={box}
        onSubmit={(e) => {
          e.preventDefault();
          if (to.trim() && body.trim()) test.mutate({ kind, to, body });
        }}
      >
        <h3 className="text-[14.5px] font-semibold text-white">{t("v14.int.testTitle")}</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as "push" | "whatsapp")}
            aria-label={t("v14.int.channel")}
            className="h-10 rounded-[var(--radius-btn)] border border-white/15 bg-black px-3 text-[13px] text-white"
          >
            <option value="push">{t("v14.int.kind.push")}</option>
            <option value="whatsapp">{t("v14.int.kind.whatsapp")}</option>
          </select>
          <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder={t("v14.int.to")} aria-label={t("v14.int.to")} className="h-10 w-44" dir="ltr" />
          <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("v14.int.body")} aria-label={t("v14.int.body")} className="h-10 min-w-[220px] flex-1" maxLength={500} />
          <button type="submit" className={btn} disabled={test.isPending || !to.trim() || !body.trim()}>
            <Send className="size-4" /> {t("v14.int.send")}
          </button>
        </div>
      </form>

      <form
        className={box}
        onSubmit={(e) => {
          e.preventDefault();
          if (tr.trim()) translate.mutate({ text: tr, target: /[\u0600-\u06FF]/.test(tr) ? "en" : "ar" });
        }}
      >
        <h3 className="text-[14.5px] font-semibold text-white">{t("v14.int.trTitle")}</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          <Input value={tr} onChange={(e) => setTr(e.target.value)} placeholder={t("v14.int.trPh")} aria-label={t("v14.int.trTitle")} className="h-10 min-w-[260px] flex-1" maxLength={2000} />
          <button type="submit" className={btn2} disabled={translate.isPending || !tr.trim()}>
            <Languages className="size-4" /> {t("v14.int.trBtn")}
          </button>
        </div>
        {trOut !== null && <p className="mt-3 rounded-[var(--radius-btn)] bg-black/40 p-3 text-[13px] text-white/75">{trOut}</p>}
      </form>

      <section>
        <h3 className="mb-2 text-[14.5px] font-semibold text-white">{t("v14.int.outbox")}</h3>
        {(list.data?.outbox ?? []).length === 0 ? (
          <p className="text-[13px] text-white/40">{t("v14.int.outboxEmpty")}</p>
        ) : (
          <ul className="divide-y divide-white/8 border-y border-white/8">
            {list.data!.outbox.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-[13px]">
                <span className="text-white/80">
                  <span className="me-2 rounded bg-white/8 px-1.5 py-0.5 text-[11px] text-white/60">{t(`v14.int.kind.${o.kind}` as never)}</span>
                  <span dir="ltr" className="me-2 text-white/45">{o.to}</span>
                  {o.body.length > 90 ? o.body.slice(0, 90) + "…" : o.body}
                </span>
                <span className="text-[11.5px] text-white/35">{t("v14.int.mockDelivered")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** Topup: pay online through the mock gateway. Clearly labeled as a test. */
export function MockCheckoutPanel() {
  const toast = useToast();
  const utils = trpc.useUtils();
  const [amount, setAmount] = useState("200");
  const [pending, setPending] = useState<{ id: string; amountEgp: number } | null>(null);
  const create = trpc.checkout.create.useMutation({
    onSuccess: (r) => setPending({ id: r.id, amountEgp: r.amountEgp }),
    onError: (e) => toast.push("error", errorText(e)),
  });
  const pay = trpc.checkout.pay.useMutation({
    onSuccess: async () => {
      setPending(null);
      await utils.wallet.summary.invalidate();
      toast.push("success", t("v14.pay.done"));
    },
    onError: (e) => toast.push("error", errorText(e)),
  });
  return (
    <section className={box} aria-label={t("v14.pay.title")}>
      <h2 className="flex items-center gap-2 text-[15px] font-semibold text-white">
        <CreditCard className="size-4 text-[var(--accent)]" /> {t("v14.pay.title")}
      </h2>
      {!pending ? (
        <form
          className="mt-4 flex flex-wrap gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate({ amountEgp: Number(amount) });
          }}
        >
          <Input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" dir="ltr" className="h-10 w-32" aria-label={t("v14.pay.amount")} />
          <button type="submit" className={btn} disabled={create.isPending || !amount}>{t("v14.pay.start")}</button>
        </form>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-[13.5px] text-white/80">{t("v14.pay.pending", { amount: String(pending.amountEgp) })}</span>
          <button type="button" className={btn} disabled={pay.isPending} onClick={() => pay.mutate({ id: pending.id })}>{t("v14.pay.confirm")}</button>
          <button type="button" className={btn2} onClick={() => setPending(null)}>{t("v14.pay.cancel")}</button>
        </div>
      )}
    </section>
  );
}
