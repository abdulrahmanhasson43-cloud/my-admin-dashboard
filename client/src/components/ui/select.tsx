import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Native <select> under a designed shell.
 * Native on purpose: it keeps the platform picker on mobile, full keyboard
 * support, and screen-reader semantics for free — none of which a div-based
 * listbox gets right without a lot of code.
 */
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          "h-11 w-full appearance-none rounded-[var(--radius-input)] border border-white/12 bg-white/[0.03] ps-5 pe-11 text-[15px] text-white",
          "transition-colors duration-150 hover:border-white/20 hover:bg-white/[0.05]",
          "focus-visible:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]",
          "disabled:cursor-not-allowed disabled:opacity-45",
          "[&>option]:bg-[#111] [&>option]:text-white",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 end-3 my-auto size-4 text-white/40"
        strokeWidth={1.75}
      />
    </div>
  );
}

export { Select };
