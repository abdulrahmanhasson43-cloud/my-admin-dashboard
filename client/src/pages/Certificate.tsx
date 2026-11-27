import { useState } from "react";
import { Link, useParams } from "wouter";
import { Award, Printer, Search, ShieldCheck } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PageShell } from "@/components/site/page";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/site/logo";
import { useAccent } from "@/lib/theme";
import { shortDate } from "@shared/domain";
import { t } from "@/i18n";

/**
 * /certificate/:code — the printable certificate. Public: the printed code is
 * the capability (feature 36), same model as Coursera's share link.
 * /certificate — enter a code to verify one.
 */
export default function Certificate() {
  const { code } = useParams<{ code?: string }>();
  const settings = trpc.catalog.settings.useQuery();
  useAccent(settings.data?.accent_color);
  const [draft, setDraft] = useState("");
  const cert = trpc.certificates.verify.useQuery(
    { code: code ?? "" },
    { enabled: Boolean(code), retry: false },
  );

  const platform = settings.data?.platform_name ?? "مدار";

  return (
    <div className="min-h-dvh bg-black print:bg-white">
      <div className="no-print">
        <SiteHeader />
      </div>

      <PageShell width="narrow">
        {!code ? (
          <div className="mx-auto max-w-md pt-16">
            <ShieldCheck className="size-8 text-[var(--accent)]" strokeWidth={1.5} />
            <h1 className="t-display mt-4 text-white">{t("verify.title")}</h1>
            <form
              className="mt-6 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const c = draft.trim().toUpperCase();
                if (c) window.location.href = `/certificate/${encodeURIComponent(c)}`;
              }}
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t("verify.prompt")}
                dir="ltr"
                className="text-start"
              />
              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 text-[14px] font-semibold text-black"
              >
                <Search className="size-4" strokeWidth={2} />
                {t("verify.check")}
              </button>
            </form>
          </div>
        ) : cert.isLoading ? (
          <p className="t-body pt-16 text-white/40">{t("common.loading")}</p>
        ) : cert.isError || !cert.data ? (
          <div className="mx-auto max-w-md pt-16 text-center">
            <ShieldCheck className="mx-auto size-8 text-red-400/80" strokeWidth={1.5} />
            <h1 className="t-title mt-4 text-white">{t("verify.notFound")}</h1>
            <Link
              to="/certificate"
              className="mt-6 inline-flex h-11 items-center rounded-[var(--radius-btn)] border border-white/14 px-5 text-[14px] text-white/80"
            >
              {t("verify.title")}
            </Link>
          </div>
        ) : (
          <>
            {/* The certificate itself — white by design so it prints cleanly. */}
            <div className="print-area mx-auto max-w-3xl rounded-2xl bg-white p-10 text-black shadow-[0_20px_80px_rgba(255,255,255,0.06)] sm:p-14">
              <div className="flex items-center justify-between gap-4 border-b-2 border-black/80 pb-6">
                <Logo className="size-12" />
                <p className="text-[13px] tabular text-black/50" dir="ltr">{cert.data.code}</p>
              </div>
              <div className="py-10 text-center">
                <Award className="mx-auto size-12 text-black/80" strokeWidth={1.25} />
                <p className="mt-6 text-[13px] tracking-wide text-black/50">{t("cert.title")}</p>
                <h1 className="mt-3 text-[clamp(1.6rem,5vw,2.4rem)] font-bold leading-tight">{cert.data.studentName}</h1>
                <p className="mx-auto mt-4 max-w-[52ch] text-[15px] leading-relaxed text-black/65">
                  {t("cert.body")}
                </p>
                <p className="mt-4 text-[18px] font-semibold">{cert.data.courseTitle}</p>
              </div>
              <dl className="grid grid-cols-2 gap-6 border-t border-black/15 pt-6 text-[13px]">
                <div>
                  <dt className="text-black/45">{t("cert.date")}</dt>
                  <dd className="tabular mt-1 font-medium">{shortDate(cert.data.issuedAt)}</dd>
                </div>
                <div>
                  <dt className="text-black/45">{t("cert.code")}</dt>
                  <dd className="tabular mt-1 font-medium" dir="ltr">{cert.data.code}</dd>
                </div>
              </dl>
              <p className="mt-8 flex items-center gap-2 text-[12px] text-emerald-700">
                <ShieldCheck className="size-4" strokeWidth={2} />
                {t("verify.valid")} — {platform}
              </p>
            </div>

            <div className="no-print mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] px-6 text-[14px] font-semibold text-black"
              >
                <Printer className="size-4" strokeWidth={2} />
                {t("cert.print")}
              </button>
              <Link
                to="/account"
                className="inline-flex h-11 items-center rounded-[var(--radius-btn)] border border-white/14 px-6 text-[14px] text-white/80"
              >
                {t("account.02")}
              </Link>
            </div>
          </>
        )}
      </PageShell>
      <div className="no-print">
        <SiteFooter />
      </div>
    </div>
  );
}
