import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button grammar (DESIGN.md):
 *   primary   — the single accent fill, pill, 44px tall
 *   secondary — white fill on black, same shape
 *   outline   — hairline border, no fill
 *   ghost     — text only, hover wash
 *   link      — inline accent text
 * Every action is a pill (fully rounded ends). On touch screens the small sizes
 * grow to 44px so a thumb can always hit them.
 */
const buttonVariants = cva(
  [
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap",
    "rounded-[var(--radius-btn)] font-medium",
    "transition-[background-color,border-color,color,transform,opacity] duration-150 ease-[var(--ease-out-expo)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
    "disabled:pointer-events-none disabled:opacity-40",
    "active:scale-[0.985] motion-reduce:active:scale-100",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-white/90",
        primary:
          "bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] active:bg-[var(--accent-press)]",
        destructive:
          "border border-red-500/30 text-red-300 hover:border-red-500/55 hover:bg-red-500/10",
        outline:
          "border border-white/14 text-white/85 hover:border-white/32 hover:bg-white/[0.05] hover:text-white",
        secondary: "bg-white/[0.08] text-white hover:bg-white/[0.14]",
        ghost: "text-white/60 hover:bg-white/[0.06] hover:text-white",
        link: "h-auto px-0 text-[var(--accent)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 text-[14px] [&_svg]:size-4",
        sm: "h-9 px-3.5 text-[13px] pointer-coarse:h-11 [&_svg]:size-3.5",
        lg: "h-12 px-6 text-[15px] [&_svg]:size-[18px]",
        icon: "size-10 pointer-coarse:size-11 [&_svg]:size-[18px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
