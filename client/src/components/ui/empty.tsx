import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Designed empty state. Every list in the app uses this: it says what the view
 * is, why it is empty, and what fills it — never a bare "No data".
 *
 * The composition is an orbit system (مدار): the icon floats as a planet in a
 * soft accent glow while two dashed rings carry dots around it. No box, no
 * frame — the emptiness is the space the orbits move through.
 */
function PlainEmpty({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-3 grid size-12 place-items-center text-white/40">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {body && <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/55">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function OrbitEmpty({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate flex flex-col items-center justify-center px-6 py-16 text-center sm:py-20",
        className,
      )}
    >
      {/* Accent glow: the light the whole system floats in. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-4 -z-10 size-[320px] -translate-x-1/2 rounded-full opacity-80 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--accent-soft) 0%, transparent 100%)" }}
      />

      <div className="relative mb-8 grid size-44 place-items-center">
        {/* Outer dashed orbit, drifting counter-clockwise with a travelling dot. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-dashed border-white/14 [animation:orbit-spin-rev_38s_linear_infinite]"
        >
          <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] shadow-[0_0_14px_var(--accent)]" />
        </span>
        {/* Inner orbit, clockwise, with a dimmer companion. */}
        <span
          aria-hidden="true"
          className="absolute inset-6 rounded-full border border-white/8 [animation:orbit-spin_26s_linear_infinite]"
        >
          <span className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/45" />
        </span>
        {/* The planet: the icon in a soft glowing orb. */}
        <span className="grid size-16 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_0_46px_var(--accent-soft)] [animation:float-y_5s_ease-in-out_infinite]">
          {icon}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {body && <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/55">{body}</p>}
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}

type EmptyProps = {
  icon: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
  /** Free-form orbit composition; used on the profile page only. */
  orbit?: boolean;
};

export function EmptyState({ orbit, ...rest }: EmptyProps) {
  return orbit ? <OrbitEmpty {...rest} /> : <PlainEmpty {...rest} />;
}
