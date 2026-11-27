import { useRef, useState } from "react";
import {
  Wallet,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  AlertCircle,
  Info,
  ImageIcon,
  X,
  Smartphone,
  Banknote,
  CreditCard,
} from "lucide-react";
import { trpc } from "@/_core/trpc";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Chip, PageShell, SectionHead } from "@/components/site/page";
import { TopupCodeForm } from "@/components/site/platform";
import { useAccent } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { PAYMENT_METHODS, egp, methodLabel, shortDate } from "@/i18n/domain";

import { localized, t } from "@/i18n";
import { errorText } from "@/i18n/errors";
import { MockCheckoutPanel } from "@/components/site/v14";
const PRESETS = [200, 500, 1000, 1500, 2000];
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp,application/pdf";

export default function Topup() {
  const toast = useToast();
  const settings = trpc.catalog.settings.useQuery();
  useAccent(settings.data?.accent_color);

  const utils = trpc.useUtils();
  const summary = trpc.wallet.summary.useQuery();

  const [amount, setAmount] = useState<number>(500);
  const [method, setMethod] = useState<string>("instapay");
  const [reference, setReference] = useState("");
  const [receipt, setReceipt] = useState<{ key: string; url: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadUrl = trpc.files.uploadUrl.useMutation();
  const commit = trpc.files.commit.useMutation();

  const create = trpc.wallet.topup.useMutation({
    onSuccess: async (res) => {
      if (res.awaitingGateway) {
        toast.push(
          "info",
          t("topup.01"),
        );
      } else {
        toast.push("success", t("topup.02"));
      }
      setReference("");
      setReceipt(null);
      if (fileRef.current) fileRef.current.value = "";
      await Promise.all([utils.wallet.summary.invalidate(), utils.catalog.settings.invalidate()]);
    },
    onError: (e) => toast.push("error", errorText(e)),
  });

  const selected = PAYMENT_METHODS.find((m) => m.key === method)!;
  const isManual = selected.manual;
  const balance = summary.data?.balanceEgp ?? 0;
  const topups = summary.data?.topups ?? [];

  async function handleFile(file: File) {
    if (file.size > MAX_BYTES) {
      toast.push("error", t("topup.03"));
      return;
    }
    setUploading(true);
    try {
      const { key, uploadUrl: put, publicPath } = await uploadUrl.mutateAsync({
        name: file.name,
        contentType: file.type || "application/octet-stream",
      });
      let receiptUrl = publicPath;
      if (put === "demo:upload") {
        // Demo mode: no storage server — keep the receipt as a data URL in the browser.
        receiptUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onerror = () => reject(new Error(t("topup.04")));
          r.onload = () => {
            const raw = String(r.result);
            if (!file.type.startsWith("image/")) return resolve(raw);
            // Shrink photos so they fit comfortably in localStorage.
            const img = new Image();
            img.onerror = () => resolve(raw);
            img.onload = () => {
              const scale = Math.min(1, 900 / Math.max(img.width, img.height));
              const c = document.createElement("canvas");
              c.width = Math.round(img.width * scale);
              c.height = Math.round(img.height * scale);
              c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
              resolve(c.toDataURL("image/jpeg", 0.7));
            };
            img.src = raw;
          };
          r.readAsDataURL(file);
        });
      } else {
        const res = await fetch(put, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!res.ok) throw new Error(t("topup.04"));
      }
      await commit.mutateAsync({ key, name: file.name });
      setReceipt({ key, url: receiptUrl, name: file.name });
      toast.push("success", t("topup.05"));
    } catch (e) {
      toast.push("error", e instanceof Error && e.message ? errorText(e) : t("topup.06"));
    } finally {
      setUploading(false);
    }
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      toast.push("error", t("topup.07"));
    }
  }

  return (
    <div className="min-h-dvh bg-black">
      <SiteHeader />

      <PageShell width="narrow">
        <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 border-b border-white/8 pb-8">
          <div className="min-w-0">
            <p className="t-overline mb-3 text-white/32">{t("topup.08")}</p>
            <h1 className="t-display text-white">{t("home.47")}</h1>
          </div>
          <div className="shrink-0 border-s border-white/10 ps-5">
            <p className="t-overline text-white/30">{t("topup.10")}</p>
            <p className="tabular mt-2 text-[1.75rem] font-semibold leading-none tracking-[-0.02em] text-white">
              {egp(balance)}
            </p>
          </div>
        </header>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
          {/* ── Form ── */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isManual && !receipt) {
                toast.push("error", t("topup.11"));
                return;
              }
              create.mutate({
                amountEgp: amount,
                method: method as "instapay" | "wallet" | "fawry" | "card",
                reference: reference.trim() || undefined,
                receiptUrl: receipt?.url,
              });
            }}
            className="min-w-0 space-y-10"
          >
            {/* Amount */}
            <fieldset>
              <legend className="t-overline mb-3 text-white/38">{t("topup.12")}</legend>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(p)}
                    aria-pressed={amount === p}
                    className={cn(
                      "tabular h-9 rounded-[var(--radius-btn)] border px-3 text-[13.5px] transition-colors duration-150",
                      amount === p
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white"
                        : "border-white/12 text-white/65 hover:border-white/28 hover:text-white",
                    )}
                  >
                    {p.toLocaleString("en-US")}
                  </button>
                ))}
              </div>
              <div className="mt-3 max-w-[240px]">
                <Input
                  type="number"
                  min={50}
                  max={20000}
                  step={10}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  aria-label={t("topup.15")}
                  className="tabular"
                  dir="ltr"
                />
              </div>
            </fieldset>

            {/* Method */}
            <fieldset>
              <legend className="t-overline mb-3 text-white/38">{t("topup.16")}</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PAYMENT_METHODS.map((m) => {
                  const on = method === m.key;
                  return (
                    <label
                      key={m.key}
                      className={cn(
                        "relative flex min-h-[84px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-media)] border px-2 py-3 text-center transition-colors duration-150",
                        on
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white"
                          : "border-white/10 text-white/60 hover:border-white/24 hover:text-white",
                      )}
                    >
                      <input
                        type="radio"
                        name="method"
                        value={m.key}
                        checked={on}
                        onChange={() => setMethod(m.key)}
                        className="sr-only"
                      />
                      <MethodIcon k={m.key} />
                      <span className="text-[13px] font-medium leading-tight">{m.label}</span>
                      {!m.manual && (
                        <span
                          aria-hidden="true"
                          className="absolute end-2 top-2 size-1.5 rounded-full bg-amber-400/85"
                        />
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Transfer details */}
            {isManual && (
              <div className="border-y border-white/8 py-6">
                <p className="t-overline mb-4 text-white/38">{t("topup.18")}</p>
                <div className="space-y-1">
                  {method === "instapay" ? (
                    <CopyRow
                      label="InstaPay"
                      value={settings.data?.instapay_handle ?? "—"}
                      onCopy={() => copy(settings.data?.instapay_handle ?? "", "instapay")}
                      copied={copied === "instapay"}
                    />
                  ) : (
                    <CopyRow
                      label={t("topup.19")}
                      value={settings.data?.wallet_number ?? "—"}
                      onCopy={() => copy(settings.data?.wallet_number ?? "", "wallet")}
                      copied={copied === "wallet"}
                    />
                  )}
                </div>
                {localized(settings.data, "payment_note") && (
                  <p className="mt-4 flex items-start gap-2 text-[12.5px] leading-relaxed text-white/35">
                    <Info className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
                    {localized(settings.data, "payment_note")}
                  </p>
                )}
              </div>
            )}

            {/* Receipt */}
            {isManual && (
              <div>
                <p className="t-overline mb-3 text-white/38">{t("topup.20")}</p>
                {receipt ? (
                  <div className="flex items-center gap-3 border-y border-emerald-500/20 py-3.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-btn)] border border-emerald-500/25 text-emerald-400">
                      <CheckCircle2 className="size-4" strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] text-white/85">{receipt.name}</p>
                      <p className="text-[11.5px] text-emerald-400/70">{t("topup.21")}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setReceipt(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      aria-label={t("topup.22")}
                      className="grid size-9 place-items-center rounded-[var(--radius-btn)] text-white/40 transition-colors hover:bg-white/8 hover:text-white"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-4 rounded-[var(--radius-media)] border border-dashed border-white/14 px-4 py-5 transition-colors duration-150 hover:border-white/28 hover:bg-white/[0.02]",
                      uploading && "pointer-events-none opacity-60",
                    )}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept={ACCEPT}
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void handleFile(f);
                      }}
                    />
                    <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-btn)] border border-white/12 text-white/45">
                      {uploading ? (
                        <Clock className="size-4 animate-pulse" strokeWidth={1.75} />
                      ) : (
                        <Upload className="size-4" strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13.5px] text-white/80">
                        {uploading ? t("topup.23") : t("topup.24")}
                      </span>
                    </span>
                  </label>
                )}
              </div>
            )}

            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              aria-label={t("topup.26")}
              placeholder={t("topup.27")}
              maxLength={120}
              dir="ltr"
              className="tabular"
            />

            <div className="border-t border-white/8 pt-6">
              <button
                type="submit"
                disabled={create.isPending || amount < 50 || (isManual && !receipt)}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] px-6 text-[15px] font-semibold text-black transition-colors duration-150 hover:bg-[var(--accent-hover)] active:scale-[0.985] disabled:opacity-40 sm:w-auto motion-reduce:active:scale-100"
              >
                {create.isPending ? t("topup.28") : t("topup.29", { p0: egp(amount) })}
              </button>

              {!isManual && (
                <p className="mt-4 flex items-start gap-2 border-s-2 border-amber-500/40 ps-3 text-[12.5px] leading-relaxed text-amber-300/80">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
                  <span>
                    {t("topup.30")}
                  </span>
                </p>
              )}
            </div>
          </form>

          {/* ── Summary + history ── */}
          <aside className="min-w-0 lg:border-s lg:border-white/8 lg:ps-10">
            <div className="border-y border-white/10 py-5">
              <p className="t-overline text-white/32">{t("topup.31")}</p>
              <dl className="mt-4 space-y-3.5 text-[13.5px] leading-[1.5]">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-white/40">{t("topup.12")}</dt>
                  <dd className="tabular font-medium text-white">{egp(amount)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-white/40">{t("topup.32")}</dt>
                  <dd className="text-white/85">{selected.label}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-white/40">{t("topup.33")}</dt>
                  <dd className={receipt ? "text-emerald-400/90" : "text-white/35"}>
                    {receipt ? t("topup.34") : t("topup.35")}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-white/8 pt-3">
                  <dt className="text-white/40">{t("topup.36")}</dt>
                  <dd className="tabular font-semibold text-white">{egp(balance + amount)}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-10">
              <SectionHead label={t("topup.38")} />
              {summary.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full rounded-[var(--radius-card)]" />
                  <Skeleton className="h-16 w-full rounded-[var(--radius-card)]" />
                </div>
              ) : topups.length === 0 ? (
                <EmptyState
                  icon={<Wallet className="size-6" strokeWidth={1.5} />}
                  title={t("topup.41")}
                  className="py-10"
                />
              ) : (
                <ul className="divide-y divide-white/8 border-y border-white/8">
                  {topups.map((row) => (
                    <li key={row.id} className="py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="tabular text-[14.5px] font-medium text-white">
                            {egp(row.amountEgp)}
                          </p>
                          <p className="mt-1 text-[11.5px] text-white/32">
                            {methodLabel(row.method)} · {shortDate(row.createdAt)}
                          </p>
                        </div>
                        <StatusPill status={row.status} />
                      </div>
                      {row.status === "rejected" && row.rejectReason && (
                        <p className="mt-2 border-s-2 border-red-500/40 ps-2.5 text-[12px] leading-relaxed text-red-300/80">
                          {row.rejectReason}
                        </p>
                      )}
                      {row.receiptUrl && (
                        <a
                          href={row.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] text-white/32 transition-colors hover:text-white/70"
                        >
                          <ImageIcon className="size-3" strokeWidth={1.75} />
                          {t("topup.33")}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>

        <div className="mt-6 space-y-6">
          <MockCheckoutPanel />
          <TopupCodeForm />
        </div>
      </PageShell>
      <SiteFooter />
    </div>
  );
}

function MethodIcon({ k }: { k: string }) {
  const cls = "size-6";
  if (k === "wallet") return <Wallet className={cls} strokeWidth={1.5} />;
  if (k === "fawry") return <Banknote className={cls} strokeWidth={1.5} />;
  if (k === "card") return <CreditCard className={cls} strokeWidth={1.5} />;
  return <Smartphone className={cls} strokeWidth={1.5} />;
}

function CopyRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/6 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="t-overline text-white/28">{label}</p>
        <p className="tabular mt-1.5 truncate text-[15px] text-white" dir="ltr">
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={onCopy}
        aria-label={t("topup.43", { label: label })}
        className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-btn)] border border-white/10 text-white/45 transition-colors hover:border-white/28 hover:text-white"
      >
        {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
      </button>
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
