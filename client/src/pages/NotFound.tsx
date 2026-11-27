import { Link } from "wouter";
import { Compass } from "lucide-react";
import { SiteHeader } from "@/components/site/header";

import { t } from "@/i18n";
export default function NotFound() {
  return (
    <div className="min-h-dvh bg-black">
      <SiteHeader />
      <main className="page-x mx-auto flex min-h-[70svh] max-w-lg flex-col items-center justify-center text-center">
        <Compass className="mb-5 size-10 text-white/35" strokeWidth={1.25} />
        <p className="tabular text-[13px] tracking-[0.2em] text-white/35">404</p>
        <h1 className="mt-2 text-[clamp(1.5rem,4vw,2.2rem)] font-bold tracking-[-0.03em] text-white">
          {t("notfound.01")}
        </h1>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 text-[14px] font-semibold text-black"
          >
            {t("notfound.03")}
          </Link>
          <Link
            to="/courses"
            className="inline-flex h-11 items-center rounded-[var(--radius-btn)] border border-white/15 px-5 text-[14px] text-white/80 hover:border-white/30 hover:text-white"
          >
            {t("home.35")}
          </Link>
        </div>
      </main>
    </div>
  );
}
