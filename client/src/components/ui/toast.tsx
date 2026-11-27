import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { t } from "@/i18n";
type Tone = "success" | "error" | "info";
type Toast = { id: number; tone: Tone; message: string };

const ToastCtx = createContext<{ push: (tone: Tone, message: string) => void } | null>(null);

const ICON = { success: CheckCircle2, error: AlertTriangle, info: Info };
const TONE = {
  success: "text-emerald-400",
  error: "text-red-400",
  info: "text-[var(--accent)]",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((tone: Tone, message: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev.slice(-2), { id, tone, message }]);
    window.setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 5200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      {createPortal(
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[200] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
        >
          {items.map((item) => {
            const Icon = ICON[item.tone];
            return (
              <div
                key={item.id}
                className={cn(
                  "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[var(--radius-card)] border border-white/12 bg-[#111] p-3.5 shadow-2xl animate-fade-up",
                )}
              >
                <Icon className={cn("mt-0.5 size-5 shrink-0", TONE[item.tone])} strokeWidth={1.75} />
                <p className="flex-1 text-sm leading-relaxed text-white/90">{item.message}</p>
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}
                  aria-label={t("toast.01")}
                  className="grid size-8 shrink-0 place-items-center rounded-[var(--radius-btn)] text-white/40 hover:bg-white/8 hover:text-white"
                >
                  <X className="size-4" strokeWidth={2} />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
