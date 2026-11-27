import { ArrowUp } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/_core/trpc";
import { useAuth } from "@/_core/useAuth";
import { localized, t } from "@/i18n";
import { LanguageSegmented } from "./language-switch";
import { Logo } from "./logo";

const LINK =
  "inline-flex min-h-10 items-center text-[13.5px] text-white/60 transition-colors hover:text-white pointer-coarse:min-h-11";

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-[12.5px] font-medium text-white/35">{title}</h2>
      <ul className="mt-2 space-y-0.5">{children}</ul>
    </nav>
  );
}

/** Quiet footer: the mark, three short link lists, language, copyright. No slogans. */
export function SiteFooter() {
  const settings = trpc.catalog.settings.useQuery();
  const { user } = useAuth();
  const name = localized(settings.data, "platform_name") ?? t("home.37");
  const whatsapp = settings.data?.support_whatsapp;

  return (
    <footer className="mt-16 border-t border-white/8 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-[env(safe-area-inset-bottom)]">
      <div className="page-x mx-auto max-w-[var(--page-max)] pt-10">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <Link to="/" aria-label={name} className="self-start text-white">
            <Logo withName className="size-9" />
          </Link>

          <div className="grid grid-cols-2 gap-x-14 gap-y-6 sm:grid-cols-3">
            <Column title={t("home.41")}>
              <li><Link to="/courses" className={LINK}>{t("home.42")}</Link></li>
              <li><Link to="/courses?stage=prep" className={LINK}>{t("home.21")}</Link></li>
              <li><Link to="/courses?stage=secondary" className={LINK}>{t("home.43")}</Link></li>
            </Column>

            <Column title={t("home.45")}>
              {user ? (
                <>
                  <li><Link to="/account" className={LINK}>{t("home.46")}</Link></li>
                  <li><Link to="/topup" className={LINK}>{t("home.47")}</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className={LINK}>{t("home.48")}</Link></li>
                  <li><Link to="/signup" className={LINK}>{t("login.08")}</Link></li>
                </>
              )}
            </Column>

            {whatsapp && (
              <Column title={t("footer.03")}>
                <li>
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className={LINK}>
                    {t("footer.04")}
                  </a>
                </li>
              </Column>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-white/8 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12.5px] text-white/40">{t("footer.rights", { year: new Date().getFullYear(), name })}</p>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSegmented />
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] text-white/55 transition-colors hover:bg-white/8 hover:text-white pointer-coarse:h-11"
            >
              <ArrowUp className="size-4" strokeWidth={1.75} aria-hidden="true" />
              {t("footer.top")}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
