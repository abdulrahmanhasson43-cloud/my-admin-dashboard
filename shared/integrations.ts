// External-service seams (push, WhatsApp, payments, translation).
// Each channel has an adapter interface. The built-in adapters are MOCKS: they
// record what would be sent in an outbox and never touch the network. A live
// adapter plugs into the same interface once real accounts/keys exist.
// Pure functions only. Demo store and server both use this.

export const CHANNEL_KINDS = ["push", "whatsapp", "payment", "translate"] as const;
export type ChannelKind = (typeof CHANNEL_KINDS)[number];

export type ProviderInfo = {
  kind: ChannelKind;
  /** Real provider the live adapter would use. */
  liveProvider: string;
  /** Environment variables the live adapter needs. */
  requiredKeys: string[];
};

export const PROVIDERS: ProviderInfo[] = [
  { kind: "push", liveProvider: "Firebase Cloud Messaging / Web Push (VAPID)", requiredKeys: ["VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY"] },
  { kind: "whatsapp", liveProvider: "WhatsApp Business Cloud API (Meta)", requiredKeys: ["WHATSAPP_TOKEN", "WHATSAPP_PHONE_ID"] },
  { kind: "payment", liveProvider: "Paymob / Fawry", requiredKeys: ["PAYMENT_API_KEY", "PAYMENT_INTEGRATION_ID"] },
  { kind: "translate", liveProvider: "Google Cloud Translation / LLM", requiredKeys: ["TRANSLATE_API_KEY"] },
];

export type OutboxItem = {
  id: string;
  kind: ChannelKind;
  to: string;
  body: string;
  /** "mock_delivered": recorded only. Nothing left the platform. */
  status: "mock_delivered" | "failed";
  at: string;
};

export type AdapterResult = { ok: true; item: OutboxItem } | { ok: false; reason: "no_recipient" | "empty_body" | "bad_kind" };

export function mockSend(
  kind: ChannelKind,
  to: string,
  body: string,
  at: string,
  id: string,
): AdapterResult {
  if (!CHANNEL_KINDS.includes(kind)) return { ok: false, reason: "bad_kind" };
  if (!to.trim()) return { ok: false, reason: "no_recipient" };
  if (!body.trim()) return { ok: false, reason: "empty_body" };
  return { ok: true, item: { id, kind, to: to.trim(), body: body.trim().slice(0, 1000), status: "mock_delivered", at } };
}

/** Egyptian mobile numbers to international digits for wa.me (01012345678 -> 201012345678). */
export function normalizeEgPhone(raw: string): string | null {
  const d = raw.replace(/[^0-9]/g, "");
  if (/^01[0125][0-9]{8}$/.test(d)) return "2" + d;
  if (/^201[0125][0-9]{8}$/.test(d)) return d;
  return null;
}

/** Real, working click-to-chat link: opens WhatsApp with the text prefilled. No API needed. */
export function whatsappLink(phone: string, text: string): string | null {
  const p = normalizeEgPhone(phone);
  return p ? `https://wa.me/${p}?text=${encodeURIComponent(text)}` : null;
}

// ── translation (mock): small glossary, never pretends to be real MT ──────────

const AR_EN: Record<string, string> = {
  "درس": "lesson", "كويز": "quiz", "مذاكرة": "study", "امتحان": "exam", "ملخص": "summary",
  "سؤال": "question", "إجابة": "answer", "معادلة": "equation", "فيديو": "video", "شرح": "explanation",
};
const EN_AR: Record<string, string> = Object.fromEntries(Object.entries(AR_EN).map(([a, e]) => [e, a]));

export function mockTranslate(text: string, target: "ar" | "en"): { text: string; translatedWords: number; mock: true } {
  const dict = target === "en" ? AR_EN : EN_AR;
  let n = 0;
  const out = text.replace(/[\u0600-\u06FF]+|[A-Za-z]+/g, (w) => {
    const hit = dict[w] ?? dict[w.toLowerCase()];
    if (hit) { n++; return hit; }
    return w;
  });
  return { text: out, translatedWords: n, mock: true };
}

// ── payments (mock checkout) ──────────────────────────────────────────────────

export type MockCheckout = { id: string; userId: string; amountEgp: number; status: "pending" | "paid" | "canceled"; createdAt: string; paidAt: string | null };

export const CHECKOUT_MIN = 10;
export const CHECKOUT_MAX = 5000;

export function validCheckoutAmount(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= CHECKOUT_MIN && n <= CHECKOUT_MAX;
}

// ── parent accounts ───────────────────────────────────────────────────────────

export const PARENT_CODE_LEN = 8;
export const MAX_CHILDREN = 6;

export function normalizeParentCode(input: string): string {
  return input.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}
