import {
  GRADES as RAW_GRADES,
  MATH_LEVELS as RAW_MATH_LEVELS,
  PATHWAYS as RAW_PATHWAYS,
  PAYMENT_METHODS as RAW_PAYMENT_METHODS,
  STAGES as RAW_STAGES,
  TRACKS as RAW_TRACKS,
} from "@shared/domain";
import { getLang, t, type MessageKey } from "./index";

/**
 * Localised view of shared/domain.ts.
 *
 * The shared file stays Arabic-only because the server and its tests read it.
 * Here every `label` is a getter, so it follows the language that is active at
 * the moment it is read — the arrays keep their exact shape and `as const` keys,
 * and pages only change the import path.
 */

type Labelled = { readonly key: string; readonly label: string };

function localise<T extends Labelled>(rows: readonly T[], prefix: string, hint = false): readonly T[] {
  return rows.map((row) => {
    const copy = { ...row } as T;
    Object.defineProperty(copy, "label", {
      enumerable: true,
      get: () => t(`${prefix}.${row.key}` as MessageKey),
    });
    if (hint) {
      Object.defineProperty(copy, "hint", {
        enumerable: true,
        get: () => t(`${prefix}.${row.key}.hint` as MessageKey),
      });
    }
    return copy;
  });
}

export const STAGES = localise(RAW_STAGES, "stage") as unknown as typeof RAW_STAGES;
export const GRADES = localise(RAW_GRADES, "grade") as unknown as typeof RAW_GRADES;
export const TRACKS = localise(RAW_TRACKS, "track") as unknown as typeof RAW_TRACKS;
export const PATHWAYS = localise(RAW_PATHWAYS, "pathway") as unknown as typeof RAW_PATHWAYS;
export const MATH_LEVELS = localise(RAW_MATH_LEVELS, "level") as unknown as typeof RAW_MATH_LEVELS;
export const PAYMENT_METHODS = localise(RAW_PAYMENT_METHODS, "method", true) as unknown as typeof RAW_PAYMENT_METHODS;

const find = <T extends Labelled>(rows: readonly T[], key: string | null | undefined) =>
  rows.find((r) => r.key === key)?.label;

export const gradeLabel = (key: string | null | undefined) => find(GRADES, key) ?? "—";
export const stageLabel = (key: string | null | undefined) => find(STAGES, key) ?? "—";
export const trackLabel = (key: string | null | undefined) => find(TRACKS, key) ?? "—";
export const pathwayLabel = (key: string | null | undefined) => find(PATHWAYS, key) ?? "";
export const mathLevelLabel = (key: string | null | undefined) => find(MATH_LEVELS, key) ?? "";
export const methodLabel = (key: string | null | undefined) => find(PAYMENT_METHODS, key) ?? "—";

/** 1,200 ج.م  /  EGP 1,200 — Latin digits in both languages, so rows never mix ٢٦ with 1,200. */
export function egp(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const text = n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  });
  return getLang() === "ar" ? `${text} ج.م` : `EGP ${text}`;
}

export function shortDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(getLang() === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
