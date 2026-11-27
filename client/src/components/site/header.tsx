import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Menu, X, Wallet, LayoutDashboard, LogOut, User, Search, Users } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { useAuth } from "@/_core/useAuth";
import { cn } from "@/lib/utils";
import { Tip } from "@/components/ui/tip";
import { egp } from "@/i18n/domain";

import { t, type MessageKey } from "@/i18n";
import { Logo } from "./logo";
import { NotificationsBell } from "./platform";
import { LanguageSegmented, LanguageToggle } from "./language-switch";

const NAV: { href: string; label: MessageKey }[] = [
  { href: "/", label: "nav.home" },
  { href: "/courses", label: "nav.courses" },
  { href: "/courses?stage=prep", label: "nav.prep" },
  { href: "/courses?stage=secondary", label: "nav.secondary" },
];

/**
 * Sticky header that starts transparent over the hero and turns opaque on
 * scroll — the standard streaming pattern, done with transform/opacity only.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [loc] = useLocation();
  const { user, logout } = useAuth();
  const session = trpc.auth.session.useQuery(undefined, { enabled: Boolean(user) });
  const wallet = trpc.wallet.summary.useQuery(undefined, { enabled: Boolean(user) });

  const isParent = session.data?.profile?.role === "parent";
  const isStaff = session.data?.profile?.role === "owner" || session.data?.profile?.role === "admin";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [loc]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "border-b border-white/8 bg-black/92 backdrop-blur-xl"
          : "bg-gradient-to-b from-black/85 via-black/40 to-transparent",
      )}
    >
      <div className="page-x mx-auto flex h-16 max-w-[var(--page-max)] items-center gap-3 sm:h-[72px]">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 rounded-[var(--radius-btn)] py-1 text-white"
          aria-label={t("header.01")}
        >
          <Logo withName />
        </Link>

        <nav aria-label={t("header.02")} className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              to={n.href}
              className={cn(
                "rounded-[var(--radius-btn)] px-3 py-2 text-[14px] transition-colors duration-150",
                loc === n.href ? "text-white" : "text-white/60 hover:text-white",
              )}
            >
              {t(n.label)}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <Tip label={t("header.03")}>
            <Link
              to="/search"
              aria-label={t("header.03")}
              className="grid size-10 place-items-center rounded-[var(--radius-btn)] text-white/65 transition-colors hover:bg-white/8 hover:text-white"
            >
              <Search className="size-5" strokeWidth={1.75} />
            </Link>
          </Tip>

          <LanguageToggle className="hidden sm:inline-flex" />

          {user ? (
            <>
              <NotificationsBell />
              <Tip label={t("nav.wallet")} className="hidden sm:inline-flex">
                <Link
                  to="/topup"
                  aria-label={t("nav.wallet")}
                  className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-[var(--radius-btn)] px-3 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/8 hover:text-white"
                >
                  <Wallet className="size-[18px]" strokeWidth={1.75} />
                  <span className="tabular">{egp(wallet.data?.balanceEgp ?? 0)}</span>
                </Link>
              </Tip>
              {isParent && (
                <Tip label={t("v14.header.parent")} className="hidden sm:inline-flex">
                  <Link
                    to="/parent"
                    aria-label={t("v14.header.parent")}
                    className="grid size-10 place-items-center rounded-[var(--radius-btn)] text-white/65 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    <Users className="size-[18px]" strokeWidth={1.75} />
                  </Link>
                </Tip>
              )}
              {isStaff && (
                <Tip label={t("admin.02")} className="hidden sm:inline-flex">
                  <Link
                    to="/admin"
                    aria-label={t("admin.02")}
                    className="grid size-10 place-items-center rounded-[var(--radius-btn)] text-white/65 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    <LayoutDashboard className="size-[18px]" strokeWidth={1.75} />
                  </Link>
                </Tip>
              )}
              <Tip label={t("account.02")}>
                <Link
                  to="/account"
                  className="grid size-10 place-items-center rounded-[var(--radius-btn)] text-white/80 transition-colors hover:bg-white/8 hover:text-white"
                  aria-label={t("account.02")}
                >
                  <User className="size-[18px]" strokeWidth={1.75} />
                </Link>
              </Tip>
              <Tip label={t("header.04")} className="hidden sm:inline-flex">
                <button
                  type="button"
                  onClick={() => void logout()}
                  aria-label={t("header.04")}
                  className="grid size-10 place-items-center rounded-[var(--radius-btn)] text-white/50 transition-colors hover:bg-white/8 hover:text-white"
                >
                  <LogOut className="size-[18px]" strokeWidth={1.75} />
                </button>
              </Tip>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-[var(--radius-btn)] px-3 py-2 text-[14px] text-white/70 transition-colors hover:text-white sm:block"
              >
                {t("login.06")}
              </Link>
              <Link
                to="/signup"
                className="rounded-[var(--radius-btn)] bg-[var(--accent)] px-4 py-2 text-[14px] font-medium text-black transition-colors duration-150 hover:bg-[var(--accent-hover)] active:bg-[var(--accent-press)]"
              >
                {t("header.05")}
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("header.06") : t("header.07")}
            className="grid size-10 place-items-center rounded-[var(--radius-btn)] text-white/75 transition-colors hover:bg-white/8 hover:text-white md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label={t("header.08")}
          className="animate-fade-in border-t border-white/8 px-4 pb-4 pt-2 md:hidden"
        >
          {NAV.map((n) => (
            <Link
              key={n.href}
              to={n.href}
              className="flex min-h-12 items-center rounded-[var(--radius-btn)] px-3 text-[15px] text-white/80 hover:bg-white/6 hover:text-white"
            >
              {t(n.label)}
            </Link>
          ))}
          <div className="px-3 py-3">
            <LanguageSegmented />
          </div>
          {user && (
            <>
              <Link
                to="/topup"
                className="flex min-h-12 items-center gap-2 rounded-[var(--radius-btn)] px-3 text-[15px] text-white/80 hover:bg-white/6"
              >
                <Wallet className="size-4" /> {t("header.09")} <span className="tabular">{egp(wallet.data?.balanceEgp ?? 0)}</span>
              </Link>
              {isParent && (
                <Link
                  to="/parent"
                  className="flex min-h-12 items-center gap-2 rounded-[var(--radius-btn)] px-3 text-[15px] text-white/80 hover:bg-white/6"
                >
                  <Users className="size-4" /> {t("v14.header.parent")}
                </Link>
              )}
              {isStaff && (
                <Link
                  to="/admin"
                  className="flex min-h-12 items-center gap-2 rounded-[var(--radius-btn)] px-3 text-[15px] text-white/80 hover:bg-white/6"
                >
                  <LayoutDashboard className="size-4" /> {t("admin.02")}
                </Link>
              )}
              <button
                type="button"
                onClick={() => void logout()}
                className="flex min-h-12 w-full items-center gap-2 rounded-[var(--radius-btn)] px-3 text-start text-[15px] text-white/60 hover:bg-white/6"
              >
                <LogOut className="size-4" /> {t("header.04")}
              </button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
