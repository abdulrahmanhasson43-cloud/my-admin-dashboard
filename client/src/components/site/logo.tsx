import { cn } from "@/lib/utils";
import { t } from "@/i18n";

/**
 * The one place the brand mark is drawn.
 * The mark is /logo.svg (client/public/logo.svg): drop the real logo file over it and every
 * page — header, footer, sign-in, hero — updates. The name text comes from `home.37` in
 * i18n/ar.ts and en.ts (also a placeholder until the real name is decided).
 */
export function Logo({
  withName = false,
  className,
  nameClassName,
}: {
  withName?: boolean;
  /** Sizes the mark, e.g. "size-9". */
  className?: string;
  nameClassName?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img src="/logo.svg" alt="" aria-hidden="true" draggable={false} className={cn("size-8 shrink-0 select-none", className)} />
      {withName && <span className={cn("text-[19px] font-semibold tracking-tight", nameClassName)}>{t("home.37")}</span>}
    </span>
  );
}
