// Shared domain vocabulary — used by both the server and the UI so a grade key
// can never mean two different things on the two sides.

export const STAGES = [
  { key: "prep", label: "الإعدادية" },
  { key: "secondary", label: "الثانوية" },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];

export const GRADES = [
  { key: "prep-1", label: "أولى إعدادي", stage: "prep" },
  { key: "prep-2", label: "تانية إعدادي", stage: "prep" },
  { key: "prep-3", label: "تالتة إعدادي", stage: "prep" },
  { key: "sec-1", label: "أولى ثانوي", stage: "secondary" },
  { key: "sec-2", label: "تانية ثانوي", stage: "secondary" },
  { key: "sec-3", label: "تالتة ثانوي", stage: "secondary" },
] as const;

export type GradeKey = (typeof GRADES)[number]["key"];

export const TRACKS = [
  { key: "general", label: "ثانوية عامة" },
  { key: "baccalaureate", label: "البكالوريا المصرية" },
] as const;

export const PATHWAYS = [
  { key: "math", label: "مسار الرياضيات" },
  { key: "science", label: "مسار العلوم" },
  { key: "engineering", label: "مسار الهندسة" },
  { key: "business", label: "مسار إدارة الأعمال" },
  { key: "arts", label: "مسار الآداب والفنون" },
] as const;

export const MATH_LEVELS = [
  { key: "standard", label: "رياضيات أساسية" },
  { key: "advanced", label: "رياضيات متقدمة" },
] as const;

export const PAYMENT_METHODS = [
  { key: "instapay", label: "InstaPay", hint: "تحويل فوري من تطبيق بنكك", manual: true },
  { key: "wallet", label: "محفظة موبايل", hint: "فودافون كاش / اتصالات كاش / أورنج كاش", manual: true },
  { key: "fawry", label: "فوري", hint: "كود دفع من أي منفذ فوري", manual: false },
  { key: "card", label: "بطاقة بنكية", hint: "فيزا / ماستركارد", manual: false },
] as const;

export type PaymentMethodKey = (typeof PAYMENT_METHODS)[number]["key"];

export function gradeLabel(key: string | null | undefined): string {
  return GRADES.find((g) => g.key === key)?.label ?? "—";
}

export function stageLabel(key: string | null | undefined): string {
  return STAGES.find((s) => s.key === key)?.label ?? "—";
}

export function trackLabel(key: string | null | undefined): string {
  return TRACKS.find((t) => t.key === key)?.label ?? "—";
}

export function pathwayLabel(key: string | null | undefined): string {
  return PATHWAYS.find((p) => p.key === key)?.label ?? "";
}

export function mathLevelLabel(key: string | null | undefined): string {
  return MATH_LEVELS.find((m) => m.key === key)?.label ?? "";
}

export function methodLabel(key: string | null | undefined): string {
  return PAYMENT_METHODS.find((m) => m.key === key)?.label ?? "—";
}

/** 1,200 ج.م — Latin digits, Arabic currency, RTL-safe. */
export function egp(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  // Whole pounds print without decimals; a part pound keeps one digit so a
  // 12.5 never silently becomes 13.
  const whole = Number.isInteger(n);
  return `${n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: whole ? 0 : 2,
  })} ج.م`;
}

/** True when the grade key belongs to the given stage. */
export function isGradeOfStage(
  gradeKey: string | null | undefined,
  stage: string | null | undefined,
): boolean {
  const g = GRADES.find((x) => x.key === gradeKey);
  return Boolean(g && g.stage === stage);
}

/** 12:04 — for lesson durations. */
export function duration(sec: number): string {
  if (!sec || sec < 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}:${String(m % 60).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function shortDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  // `-u-nu-latn` forces Latin digits: money is already formatted with
  // `en-US` numerals, and mixing ٢٦ with 1,200 in one row reads as a mistake.
  return d.toLocaleDateString("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysLeft(iso: string | Date | null | undefined): number {
  if (!iso) return 0;
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86_400_000));
}

/** Turn a YouTube/Vimeo watch URL into an embeddable one; pass mp4 through. */
export function toEmbedUrl(url: string | null | undefined): {
  kind: "iframe" | "video" | "none";
  src: string;
} {
  const raw = (url ?? "").trim();
  if (!raw) return { kind: "none", src: "" };

  // A lesson's video URL is entered by the owner but still treated as untrusted
  // input: only http(s) may reach an iframe src. Allowing `javascript:` (or a
  // data: URL) here would be a stored-XSS hole in the player.
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { kind: "none", src: "" };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { kind: "none", src: "" };
  }

  const yt = raw.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt)
    return {
      kind: "iframe",
      src: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1`,
    };
  const vimeo = raw.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };
  if (/\.(mp4|webm|ogg|m4v)(\?|$)/i.test(raw)) return { kind: "video", src: raw };
  return { kind: "iframe", src: raw };
}
