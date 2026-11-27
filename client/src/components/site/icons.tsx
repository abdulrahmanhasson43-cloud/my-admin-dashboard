import type { SVGProps } from "react";

/**
 * Madar icon set: one hand-drawn family for the profile area.
 * 24px grid, 1.6 stroke, round caps, and one small filled "satellite" dot per
 * icon that picks up the accent colour. Everything else inherits currentColor.
 */
type P = SVGProps<SVGSVGElement>;

function Base({ children, ...p }: P) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...p}
    >
      {children}
    </svg>
  );
}
const Dot = ({ cx, cy }: { cx: number; cy: number }) => (
  <circle cx={cx} cy={cy} r={1.7} fill="var(--accent)" stroke="none" />
);

export const IconPerson = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="8.5" r="3.4" />
    <path d="M5 19.5c.9-3.3 3.6-5 7-5s6.1 1.7 7 5" />
    <Dot cx={18.6} cy={5.2} />
  </Base>
);
export const IconPhone = (p: P) => (
  <Base {...p}>
    <rect x="7" y="3" width="10" height="18" rx="3" />
    <path d="M10.5 6.5h3" />
    <Dot cx={12} cy={17.2} />
  </Base>
);
export const IconStage = (p: P) => (
  <Base {...p}>
    <path d="M4 17.5 12 5l8 12.5" />
    <path d="M8 17.5 12 11l4 6.5" />
    <Dot cx={12} cy={5} />
  </Base>
);
export const IconGrade = (p: P) => (
  <Base {...p}>
    <path d="M5 5.5h11.5a2.5 2.5 0 0 1 2.5 2.5v11H7.5A2.5 2.5 0 0 1 5 16.5v-11Z" />
    <path d="M9 10h6M9 13.5h4" />
    <Dot cx={5} cy={5.5} />
  </Base>
);
export const IconTrack = (p: P) => (
  <Base {...p}>
    <path d="M4 18c3-9 6-9 8-5s5 4 8-7" />
    <Dot cx={20} cy={6} />
  </Base>
);
export const IconPathway = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="m14.8 9.2-1.6 4-4 1.6 1.6-4 4-1.6Z" />
    <Dot cx={12} cy={12} />
  </Base>
);
export const IconWallet = (p: P) => (
  <Base {...p}>
    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H18v12H6.5A2.5 2.5 0 0 1 4 15.5v-7Z" />
    <path d="M4 9h13" />
    <Dot cx={15} cy={13.2} />
  </Base>
);
export const IconLessons = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m8.6 12.2 2.4 2.4 4.4-4.9" />
    <Dot cx={19.4} cy={6} />
  </Base>
);
export const IconSaved = (p: P) => (
  <Base {...p}>
    <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.8L6 20V5a1 1 0 0 1 1-1Z" />
    <Dot cx={12} cy={9.5} />
  </Base>
);
export const IconBooks = (p: P) => (
  <Base {...p}>
    <path d="M5 4.5v15M10 4.5v15" />
    <path d="m14.2 6 4.6-1.2 2.4 14.2-4.6 1.2L14.2 6Z" />
    <Dot cx={7.5} cy={12} />
  </Base>
);
export const IconGlobe = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.8 12h16.4M12 3.6c2.5 2.4 3.6 5.2 3.6 8.4s-1.1 6-3.6 8.4c-2.5-2.4-3.6-5.2-3.6-8.4S9.5 6 12 3.6Z" />
    <Dot cx={12} cy={12} />
  </Base>
);
export const IconExit = (p: P) => (
  <Base {...p}>
    <path d="M10 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H10" />
    <path d="M14 8l4 4-4 4M18 12H9.5" />
  </Base>
);
export const IconCheck = (p: P) => (
  <Base {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Base>
);
export const IconShield = (p: P) => (
  <Base {...p}>
    <path d="M12 3.5 5 6v5.5c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6l-7-2.5Z" />
    <path d="m9.2 12 2 2 3.6-4" />
  </Base>
);

/** Avatar ringed by an orbit whose satellite sits at the profile-completion point. */
export function OrbitAvatar({
  initial,
  progress,
  className,
}: {
  initial: string;
  progress: number; // 0..1
  className?: string;
}) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const a = -Math.PI / 2 + progress * 2 * Math.PI;
  const sx = 50 + r * Math.cos(a);
  const sy = 50 + r * Math.sin(a);
  return (
    <div className={className} style={{ position: "relative", aspectRatio: "1" }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-0" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" strokeDasharray="1 4" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${c * progress} ${c}`}
          transform="rotate(-90 50 50)"
        />
        <circle cx={sx} cy={sy} r="4.2" fill="var(--accent)" />
        <circle cx={sx} cy={sy} r="8" fill="var(--accent)" opacity="0.22" />
      </svg>
      <span
        className="absolute inset-[11%] grid place-items-center rounded-full text-[clamp(1.6rem,6vw,2.4rem)] font-semibold text-white"
        style={{
          background:
            "radial-gradient(120% 120% at 30% 20%, color-mix(in oklab, var(--accent) 55%, #111) 0%, #0c0c0e 72%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
        }}
      >
        {initial}
      </span>
    </div>
  );
}
