import { createContext, Fragment, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ar, type MessageKey } from "./ar";
import { en } from "./en";

/**
 * Two languages, one source of truth.
 *
 * - `ar.ts` is the Arabic copy (Egyptian, spoken-register) and defines the key set.
 * - `en.ts` is typed as Record<MessageKey, string>, so a missing English line is a
 *   compile error, not a blank spot on the page.
 * - `t()` is a plain function (no hook needed) because switching language remounts
 *   the tree under <I18nProvider>; module-level data must store KEYS, not text.
 */

export type Lang = "ar" | "en";
export type { MessageKey };

const STORAGE_KEY = "madar-lang";
const DICT: Record<Lang, Record<MessageKey, string>> = { ar, en };

function readStored(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "ar" || v === "en") return v;
  } catch {
    /* storage can be blocked (private mode, embedded frames) — fall through */
  }
  return "ar";
}

let current: Lang = readStored();

/** Keep <html lang dir> in step so layout, fonts and screen readers all agree. */
function applyToDocument(lang: Lang) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === "ar" ? "rtl" : "ltr";
}
applyToDocument(current);

export function getLang(): Lang {
  return current;
}

export function t(key: MessageKey, params?: Record<string, string | number>): string {
  const raw = DICT[current][key] ?? DICT.ar[key] ?? key;
  if (!params) return raw;
  // {n:day|days} picks a word form by count (English); Arabic copy simply doesn't use it.
  const plural = raw.replace(/\{(\w+):([^|}]*)\|([^}]*)\}/g, (m, name: string, one: string, other: string) =>
    name in params ? (Number(params[name]) === 1 ? one : other) : m,
  );
  return plural.replace(/\{(\w+)\}/g, (m, name: string) => (name in params ? String(params[name]) : m));
}

/** Pick between two literals by language — for the few places where data, not UI copy, differs. */
export function pick<T>(arValue: T, enValue: T): T {
  return current === "ar" ? arValue : enValue;
}

/** Owner-editable text with an optional "<key>_en" twin: English readers get it when it exists, otherwise the Arabic original. */
export function localized(settings: Record<string, string> | undefined, key: string): string | undefined {
  if (!settings) return undefined;
  const en = current === "en" ? settings[`${key}_en`]?.trim() : "";
  return en ? en : settings[key];
}

/** For fields that hold Arabic CONTENT (course titles, notes): in an English UI let the browser pick the direction per value. */
export function contentDir(): "auto" | undefined {
  return current === "en" ? "auto" : undefined;
}

type Ctx = { lang: Lang; dir: "rtl" | "ltr"; setLang: (l: Lang) => void };
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(current);

  const setLang = useCallback((next: Lang) => {
    if (next === current) return;
    current = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* not persisted, still applied for this visit */
    }
    applyToDocument(next);
    setLangState(next);
  }, []);

  const value = useMemo<Ctx>(() => ({ lang, dir: lang === "ar" ? "rtl" : "ltr", setLang }), [lang, setLang]);

  // key={lang}: every string re-reads t() after a switch, without threading a hook through each component.
  return (
    <I18nCtx.Provider value={value}>
      <Fragment key={lang}>{children}</Fragment>
    </I18nCtx.Provider>
  );
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}
