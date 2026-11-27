import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Icon label. Wrap an icon-only control and its name appears on mouse hover,
 * keyboard focus, or a long-press on touch (about half a second), then fades
 * on its own. The control itself must still carry an aria-label.
 *
 *   <Tip label={t("nav.wallet")}><Link aria-label={t("nav.wallet")}><Wallet/></Link></Tip>
 */
export function Tip({
  label,
  children,
  side = "bottom",
  className,
}: {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const press = useRef<number | undefined>(undefined);
  const hide = useRef<number | undefined>(undefined);
  const bubble = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);

  // Keep the label inside the screen: nudge it sideways when it would be clipped.
  useLayoutEffect(() => {
    if (!open || !bubble.current) return;
    const el = bubble.current;
    el.style.marginLeft = "0px";
    const r = el.getBoundingClientRect();
    const pad = 8;
    const vw = document.documentElement.clientWidth;
    setShift(r.left < pad ? pad - r.left : r.right > vw - pad ? vw - pad - r.right : 0);
  }, [open]);

  useEffect(
    () => () => {
      window.clearTimeout(press.current);
      window.clearTimeout(hide.current);
    },
    [],
  );

  function cancelPress() {
    window.clearTimeout(press.current);
  }

  return (
    <span
      className={cn("relative inline-flex", className)}
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
      onFocus={(e) => e.target.matches(":focus-visible") && setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      onTouchStart={() => {
        cancelPress();
        press.current = window.setTimeout(() => {
          setOpen(true);
          window.clearTimeout(hide.current);
          hide.current = window.setTimeout(() => setOpen(false), 1800);
        }, 450);
      }}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      onTouchCancel={cancelPress}
      onContextMenu={(e) => {
        // A long press on touch fires a context menu; keep it for our label only.
        if (open) e.preventDefault();
      }}
    >
      {children}
      <span
        ref={bubble}
        role="tooltip"
        style={{ marginLeft: shift }}
        className={cn(
          "pointer-events-none absolute start-1/2 z-[80] w-max max-w-[220px] -translate-x-1/2 rounded-full",
          "border border-white/10 bg-[var(--surface-2)] px-3 py-1.5 text-[12px] leading-none text-white/90",
          "shadow-[0_6px_24px_rgba(0,0,0,0.5)] transition-opacity duration-150 rtl:translate-x-1/2",
          side === "bottom" ? "top-[calc(100%+8px)]" : "bottom-[calc(100%+8px)]",
          open ? "opacity-100" : "opacity-0",
        )}
      >
        {label}
      </span>
    </span>
  );
}
