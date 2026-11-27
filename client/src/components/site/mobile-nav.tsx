import { Link, useLocation } from "wouter";
import { Home, BookOpen, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";

import { t } from "@/i18n";

/**
 * Thumb-reach navigation for phones: a fixed bar pinned to the bottom edge,
 * shown below the md breakpoint where the top header's links collapse into a
 * drawer. Hidden on tablets and desktops, which keep the header nav.
 * The footer leaves matching bottom room (see footer.tsx) so the bar never
 * covers content; safe-area padding keeps it clear of the iPhone home strip.
 */
const ITEMS = [
  { href: "/", label: "nav.home", icon: Home, match: (loc: string) => loc === "/" },
  {
    href: "/courses",
    label: "nav.courses",
    icon: BookOpen,
    match: (loc: string) => loc.startsWith("/courses") || loc.startsWith("/course/") || loc.startsWith("/watch/"),
  },
  {
    href: "/topup",
    label: "nav.wallet",
    icon: Wallet,
    match: (loc: string) => loc.startsWith("/topup"),
  },
  {
    href: "/account",
    label: "nav.account",
    icon: User,
    match: (loc: string) => loc.startsWith("/account"),
  },
] as const;

export function MobileNav() {
  const [loc] = useLocation();

  return (
    <nav
      aria-label={t("header.08")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const active = item.match(loc);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[56px] flex-col items-center justify-center gap-1 text-[10.5px] transition-colors duration-150",
                active ? "text-[var(--accent)]" : "text-white/55 hover:text-white/85",
              )}
            >
              <Icon className="size-[21px]" strokeWidth={active ? 2.25 : 1.75} />
              <span className={cn("leading-none", active && "font-medium")}>{t(item.label)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
