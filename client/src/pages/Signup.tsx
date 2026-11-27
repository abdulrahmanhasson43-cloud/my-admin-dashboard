import { Link, useLocation } from "wouter";
import { useState } from "react";
import { ArrowLeft, Mail, Lock, User, Users, Phone, AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAccent } from "@/lib/theme";
import { GRADES, STAGES } from "@/i18n/domain";

import { t } from "@/i18n";
import { Logo } from "@/components/site/logo";
import { errorText } from "@/i18n/errors";
export default function Signup() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const settings = trpc.catalog.settings.useQuery();
  useAccent(settings.data?.accent_color);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    stage: "",
    gradeKey: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<"student" | "parent">("student");

  const signup = trpc.auth.signup.useMutation({
    onSuccess: async (user) => {
      utils.auth.me.setData(undefined, user as never);
      await utils.auth.me.invalidate();
      navigate(accountType === "parent" ? "/parent" : "/account");
    },
    onError: (e) => setError(errorText(e)),
  });

  const grades = form.stage ? GRADES.filter((g) => g.stage === form.stage) : GRADES;
  const pwOk = form.password.length >= 8;

  return (
    <div className="relative flex min-h-dvh flex-col bg-[var(--background)]">
      <div className="relative z-10 flex min-h-dvh flex-col">
        <header className="page-x flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2.5 text-white">
            <Logo withName />
          </Link>
        </header>

        <main className="page-x flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[440px]">
            <h1 className="text-[clamp(1.6rem,4vw,2.1rem)] font-bold tracking-[-0.03em] text-white">
              {t("signup.01")}
            </h1>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                signup.mutate({
                  email: form.email.trim(),
                  password: form.password,
                  name: form.name.trim() || undefined,
                  phone: form.phone.trim() || undefined,
                  stage: form.stage || undefined,
                  gradeKey: form.gradeKey || undefined,
                  accountType,
                });
              }}
              className="mt-8 space-y-4"
            >
              <div role="radiogroup" aria-label={t("v14.signup.type")} className="grid grid-cols-2 gap-2">
                {(["student", "parent"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={accountType === k}
                    onClick={() => setAccountType(k)}
                    className={
                      "inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-btn)] border text-[14px] transition-colors " +
                      (accountType === k ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white" : "border-white/15 text-white/55 hover:border-white/30")
                    }
                  >
                    {k === "student" ? <User className="size-[18px]" strokeWidth={1.75} /> : <Users className="size-[18px]" strokeWidth={1.75} />}
                    {t(k === "student" ? "v14.signup.student" : "v14.signup.parent")}
                  </button>
                ))}
              </div>
              <label className="block">
                <div className="relative">
                  <User
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 start-3 my-auto size-[18px] text-white/30"
                    strokeWidth={1.75}
                  />
                  <Input
                    aria-label={t("signup.03")}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder={t("signup.04")}
                    autoComplete="name"
                    maxLength={80}
                    className="h-12 ps-11"
                  />
                </div>
              </label>

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
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
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
                    minLength={8}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder={t("signup.05")}
                    dir="ltr"
                    className="h-12 ps-11"
                  />
                </div>
                {form.password.length > 0 && (
                  <span
                    className={
                      pwOk
                        ? "mt-1.5 flex items-center gap-1 text-[11.5px] text-emerald-400"
                        : "mt-1.5 flex items-center gap-1 text-[11.5px] text-white/40"
                    }
                  >
                    <CheckCircle2 className="size-3.5" strokeWidth={2} />
                    {pwOk ? t("signup.06") : t("signup.07")}
                  </span>
                )}
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <div className="relative">
                    <Phone
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 start-3 my-auto size-[18px] text-white/30"
                      strokeWidth={1.75}
                    />
                    <Input
                      aria-label={t("signup.08")}
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="01xxxxxxxxx"
                      inputMode="tel"
                      maxLength={30}
                      dir="ltr"
                      className="h-12 ps-11"
                    />
                  </div>
                </label>

                <label className="block">
                  <Select
                    aria-label={t("courses.07")}
                    value={form.stage}
                    onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value, gradeKey: "" }))}
                    className="h-12"
                  >
                    <option value="">{t("signup.10")}</option>
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </label>
              </div>

              {form.stage && (
                <label className="block">
                  <Select
                    aria-label={t("courses.09")}
                    value={form.gradeKey}
                    onChange={(e) => setForm((f) => ({ ...f, gradeKey: e.target.value }))}
                    className="h-12"
                  >
                    <option value="">{t("signup.10")}</option>
                    {grades.map((g) => (
                      <option key={g.key} value={g.key}>
                        {g.label}
                      </option>
                    ))}
                  </Select>
                </label>
              )}

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
                disabled={signup.isPending || !pwOk}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] text-[15px] font-semibold text-black transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
              >
                {signup.isPending ? t("signup.11") : t("signup.12")}
              </button>
            </form>

            <p className="mt-6 text-center text-[13.5px] text-white/50">
              {t("signup.13")}{" "}
              <Link to="/login" className="text-[var(--accent)] hover:underline">
                {t("signup.14")}
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
