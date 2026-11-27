import { useEffect } from "react";

/**
 * The owner picks one accent colour in /admin; it is stored as a hex string and
 * applied here as CSS custom properties on <html>. Everything else (hover,
 * press, soft fills, focus rings) is derived in index.css from these three
 * numbers, so one setting re-skins the whole site.
 */
export function hexToOklch(hex: string): { l: number; c: number; h: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;

  const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const R = lin(r);
  const G = lin(g);
  const B = lin(b);

  const l_ = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m_ = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s_ = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const Bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(A * A + Bb * Bb);
  let H = (Math.atan2(Bb, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { l: L, c: C, h: H };
}

/** Apply an accent hex to the document. Falls back silently on bad input. */
export function applyAccent(hex: string | null | undefined) {
  if (!hex) return;
  const o = hexToOklch(hex);
  if (!o) return;
  const root = document.documentElement;
  root.style.setProperty("--accent-h", o.h.toFixed(2));
  root.style.setProperty("--accent-c", Math.min(o.c, 0.28).toFixed(4));
  // Keep the accent bright enough to read on pure black.
  root.style.setProperty("--accent-l", Math.max(0.55, Math.min(o.l, 0.78)).toFixed(4));
}

/** Applies the accent whenever the settings query resolves. */
export function useAccent(hex: string | undefined) {
  useEffect(() => {
    if (hex) applyAccent(hex);
  }, [hex]);
}
