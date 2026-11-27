import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

import { t } from "@/i18n";
/**
 * Shared page furniture.
 *
 * The system separates blocks with hairline rules and space, never with boxes.
 * Every inner page (course, watch, account, topup, admin) is built from these
 * pieces so they read as one product with the home page.
 */

/** Page container: one max width, one gutter, one top offset under the header. */
export function PageShell({
  children,
  className,
  width = "wide",
}: {
  children: ReactNode;
  className?: string;
  width?: "wide" | "narrow" | "prose";
}) {
  return (
    <main
      className={cn(
        "page-x mx-auto pb-20 pt-24 sm:pt-28",
        width === "wide" && "max-w-[var(--page-max)]",
        width === "narrow" && "max-w-[1180px]",
        width === "prose" && "max-w-[860px]",
        className,
      )}
    >
      {children}
    </main>
  );
}

/**
 * Page header: overline, display title, one-line lead, actions on the end.
 * The title is the only thing at display size on the page — everything below
 * steps down to title/body/caption so the hierarchy is unambiguous.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-8 gap-y-5 pb-8",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <p className="t-overline mb-3 text-white/32">{eyebrow}</p>}
        <h1 className="t-display text-white">{title}</h1>
        {description && (
          <p className="t-body mt-3 max-w-[62ch] text-white/48">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Small caps section label with an optional trailing action. */
export function SectionHead({
  label,
  hint,
  action,
  className,
}: {
  label: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="t-overline text-white/38">{label}</h2>
        {hint && <p className="t-caption mt-1.5 text-white/30">{hint}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * Metric strip: numbers divided by hairlines, no card chrome. The value is the
 * loudest thing on the row, the label is a quiet caption above it.
 */
export function StatStrip({
  items,
  className,
}: {
  items: { label: string; value: ReactNode; tone?: string; note?: string }[];
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 border-y border-white/8 sm:grid-cols-4",
        className,
      )}
    >
      {items.map((it, i) => (
        <div
          key={it.label}
          className={cn(
            "py-6",
            // Hairline between columns only, never a box around each one.
            i % 2 === 1 && "border-s border-white/8 ps-5",
            i >= 2 && "border-t border-white/8 sm:border-t-0",
            "sm:border-s sm:ps-6",
            i === 0 && "sm:border-s-0 sm:ps-0",
          )}
        >
          <dt className="t-overline text-white/32">{it.label}</dt>
          <dd
            className={cn(
              "tabular mt-3 text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-none tracking-[-0.02em]",
              it.tone ?? "text-white",
            )}
          >
            {it.value}
          </dd>
          {it.note && <p className="t-caption mt-2 text-white/30">{it.note}</p>}
        </div>
      ))}
    </dl>
  );
}

/**
 * A list of rows separated by hairlines. Rows are the default container for
 * anything repeated — lessons, transactions, top-up requests, courses.
 */
export function RowList({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cn("divide-y divide-white/8 border-y border-white/8", className)}>{children}</ul>;
}

/** One row inside a RowList. */
export function Row({
  children,
  className,
  as = "li",
}: {
  children: ReactNode;
  className?: string;
  as?: "li" | "div";
}) {
  const Tag = as;
  return <Tag className={cn("flex items-center gap-3 py-4", className)}>{children}</Tag>;
}

/** Quiet status chip — tinted text on a hairline, never a saturated block. */
export function Chip({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "good" | "warn" | "bad";
  className?: string;
}) {
  const tones = {
    neutral: "border-white/12 text-white/55",
    accent: "border-[var(--accent-line)] text-[var(--accent)]",
    good: "border-emerald-500/25 text-emerald-400/90",
    warn: "border-amber-500/25 text-amber-400/90",
    bad: "border-red-500/25 text-red-400/90",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-btn)] border px-2 py-0.5 text-[11px] leading-5",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * A labelled field: overline label above the control, optional hint below.
 * Used by every form on the site so labels never drift in size or spacing.
 */
export function Field({
  label,
  hint,
  optional,
  children,
  className,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="t-overline mb-2 flex items-baseline gap-2 text-white/38">
        {label}
        {optional && <span className="normal-case tracking-normal text-white/22">{t("signup.09")}</span>}
      </span>
      {children}
      {hint && <span className="t-caption mt-2 block text-white/30">{hint}</span>}
    </label>
  );
}
