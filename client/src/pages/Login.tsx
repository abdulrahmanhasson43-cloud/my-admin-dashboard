import { Link, useLocation } from "wouter";
import { useState } from "react";
import { ArrowLeft, Mail, Lock, AlertCircle } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { Input } from "@/components/ui/input";
import { useAccent } from "@/lib/theme";

import { t } from "@/i18n";
import { Logo } from "@/components/site/logo";
import { errorText } from "@/i18n/errors";
export default function Login() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const settings = trpc.catalog.settings.useQuery();
  useAccent(settings.data?.accent_color);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const login = trpc.auth.login.useMutation({
    onSuccess: async (user) => {
      utils.auth.me.setData(undefined, user as never);
      await utils.auth.me.invalidate();
      navigate("/account");
    },
    onError: (e) => setError(errorText(e)),
  });

  return (
    <div className="relative flex min-h-dvh flex-col bg-[var(--background)]">
      <div className="relative z-10 flex min-h-dvh flex-col">
        <header className="page-x flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2.5 text-white">
            <Logo withName />
          </Link>
        </header>

        <main className="page-x flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">
            <h1 className="text-[clamp(1.6rem,4vw,2.1rem)] font-bold tracking-[-0.03em] text-white">
              {t("login.01")}
            </h1>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                login.mutate({ email: email.trim(), password });
              }}
              className="mt-8 space-y-4"
            >
              <label className="block">
                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 start-3 my-auto size-[18px] text-white/30"
                    strokeWidth={1.75}
                  />
                  <Input
                    type="email"
                    aria-label={t("login.03")}
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    dir="ltr"
                    className="h-12 ps-11"
                  />
                </div>
              </label>

              <label className="block">
                <div className="relative">
                  <Lock
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 start-3 my-auto size-[18px] text-white/30"
                    strokeWidth={1.75}
                  />
                  <Input
                    type="password"
                    aria-label={t("login.04")}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="h-12 ps-11"
                  />
                </div>
              </label>

              {error && (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-[var(--radius-media)] border border-red-500/25 bg-red-500/8 p-3 text-[13px] leading-relaxed text-red-300"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={login.isPending}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] text-[15px] font-semibold text-black transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
              >
                {login.isPending ? t("login.05") : t("login.06")}
              </button>
            </form>

            <p className="mt-6 text-center text-[13.5px] text-white/50">
              {t("login.07")}{" "}
              <Link to="/signup" className="text-[var(--accent)] hover:underline">
                {t("login.08")}
              </Link>
            </p>

            <Link
              to="/"
              className="mt-8 flex items-center justify-center gap-1.5 text-[12.5px] text-white/35 hover:text-white/70"
            >
              <ArrowLeft className="rtl:rotate-180 size-3.5" strokeWidth={2} />
              {t("courses.24")}
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
