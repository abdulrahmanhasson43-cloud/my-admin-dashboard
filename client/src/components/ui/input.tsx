import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input shell: pill, hairline border, 44px tall, 16px text on touch (no iOS zoom).
 * The border is the only chrome — no shadow, no inner glow.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-[var(--radius-input)] border border-white/12 bg-white/[0.03] px-5 text-[15px] text-white",
        "transition-colors duration-150 placeholder:text-white/28",
        "hover:border-white/20 hover:bg-white/[0.05]",
        "focus-visible:border-[var(--accent)] focus-visible:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]",
        "disabled:cursor-not-allowed disabled:opacity-45",
        "file:border-0 file:bg-transparent file:text-[13px] file:font-medium file:text-white/70",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
