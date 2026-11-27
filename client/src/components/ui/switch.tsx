import * as React from "react";
import { cn } from "@/lib/utils";

/** Checkbox-based switch: real form semantics, keyboard and SR support free. */
export function Switch({
  checked,
  onCheckedChange,
  label,
  id,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
  id?: string;
  disabled?: boolean;
}) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-3 select-none",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span className="relative inline-flex">
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cn(
            "block h-6 w-11 rounded-full border transition-colors duration-200",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-black",
            checked ? "border-transparent bg-[var(--accent)]" : "border-white/15 bg-white/10",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-1 size-4 rounded-full bg-white transition-transform duration-200",
            checked ? "start-6" : "start-1",
          )}
        />
      </span>
      <span className="text-sm text-white/80">{label}</span>
    </label>
  );
}
