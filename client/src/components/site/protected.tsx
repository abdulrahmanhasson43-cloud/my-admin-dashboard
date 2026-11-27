import type { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/_core/useAuth";
import { t } from "@/i18n";

/** Route guard — same contract as _core/Protected, but with a branded, bilingual loading state. */
export default function Protected({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div role="status" aria-live="polite" className="grid min-h-dvh place-items-center bg-black">
        <div className="flex flex-col items-center gap-4 text-white/50">
          <span className="size-8 animate-spin rounded-full border-2 border-white/15 border-t-[var(--accent)] motion-reduce:animate-none" aria-hidden="true" />
          <span className="text-[13px]">{t("common.loading")}</span>
        </div>
      </div>
    );
  }
  if (!user) return <Redirect to="/login" />;
  return <>{children}</>;
}
