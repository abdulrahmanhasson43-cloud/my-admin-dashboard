import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { t, useI18n, type Lang } from "@/i18n";

/** Compact header control: one tap flips to the other language. Shows the TARGET language in its own script. */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const next: Lang = lang === "ar" ? "en" : "ar";
  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      lang={next}
      aria-label={t("lang.switchAria")}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-btn)] px-3 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/8 hover:text-white pointer-coarse:h-11",
        className,
      )}
    >
      <Globe className="size-4" strokeWidth={1.75} aria-hidden="true" />
      {next === "en" ? "English" : "العربية"}
    </button>
  );
}

/** Full two-option control for Settings and the mobile menu. */
export function LanguageSegmented({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const options: { value: Lang; label: string }[] = [
    { value: "ar", label: "العربية" },
    { value: "en", label: "English" },
  ];
  return (
    <div
      role="radiogroup"
      aria-label={t("lang.label")}
      className={cn("inline-flex rounded-[var(--radius-btn)] border border-white/12 bg-white/[0.04] p-1", className)}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={lang === o.value}
          lang={o.value}
          onClick={() => setLang(o.value)}
          className={cn(
            "min-h-10 min-w-24 rounded-[var(--radius-btn)] px-5 text-[14px] font-medium transition-colors duration-150 pointer-coarse:min-h-11",
            lang === o.value ? "bg-white text-black" : "text-white/60 hover:text-white",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
