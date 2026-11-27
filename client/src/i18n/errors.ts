import { t, type MessageKey } from "./index";

/**
 * One place that turns ANY failure into a sentence the person can read, in the
 * language they chose. The server keeps sending its own messages (Arabic from
 * routers/db, English from _core); we map the known ones here and fall back to
 * a friendly generic line by error code, so a raw "TRPCClientError" or a zod
 * JSON blob never reaches the screen.
 */

const KNOWN: Record<string, MessageKey> = {
  "الصفحة دي للمالك أو المشرف فقط.": "srv.staffOnly",
  "الباسورد لازم ٨ حروف على الأقل.": "srv.passwordShort",
  "الكورس مش موجود.": "srv.courseMissing",
  "الدرس مش موجود.": "srv.lessonMissing",
  "الدرس ده محتاج اشتراك ساري في الكورس.": "srv.lessonLocked",
  "لازم تكمّل الدرس اللي قبله وتعدي كويزه الأول.": "srv.gated",
  "كمّل مشاهدة الدرس الأول — الكويز بيفتح بعد ما تتفرج على ٩٠٪ من الفيديو.": "srv.quizEarly",
  "الشهادة مش موجودة — اتأكد من الكود.": "verify.notFound",
  "السؤال مش موجود.": "err.notFound",
  "أقل مبلغ للشحن ٥٠ جنيه.": "srv.topupMin",
  "أقصى مبلغ للشحن ٢٠٠٠٠ جنيه.": "srv.topupMax",
  "ارفع صورة الإيصال الأول — التحويل اليدوي مش بيتعتمد من غيرها.": "srv.receiptRequired",
  "اكتب سبب الرفض.": "srv.reasonRequired",
  "اكتب اسم الكورس.": "srv.titleRequired",
  "نوع الملف مش مدعوم — استخدم صورة (PNG/JPG/WebP) أو PDF.": "srv.fileType",
  "الملف مالوش أثر — جرّب الرفع تاني.": "srv.fileMissing",
  "المفتاح ده مش ملكك.": "srv.fileNotYours",
  "مفتاح غير صالح.": "srv.fileKeyInvalid",
  "الطلب مش في حالة «قيد المراجعة» — يمكن يكون اتعتمد أو اترفض قبل كده.": "srv.topupNotPending",
  "الطلب مش في حالة «قيد المراجعة».": "srv.topupNotPending",
  "الكورس مش متاح للشراء حاليًا.": "srv.courseUnavailable",
  "أنت مشترك في الكورس ده بالفعل.": "srv.alreadyEnrolled",
  "Invalid email or password": "srv.badLogin",
  "Invalid email or password.": "srv.badLogin",
  "That email is already registered — try logging in instead.": "srv.emailTaken",
  "This app does not have user accounts.": "srv.noAccounts",
  "Something went wrong.": "err.server",
};

const BY_CODE: Record<string, MessageKey> = {
  UNAUTHORIZED: "err.unauthorized",
  FORBIDDEN: "err.forbidden",
  NOT_FOUND: "err.notFound",
  BAD_REQUEST: "err.validation",
  CONFLICT: "err.conflict",
  TOO_MANY_REQUESTS: "err.tooMany",
  TIMEOUT: "err.network",
  INTERNAL_SERVER_ERROR: "err.server",
};

const toLatinDigits = (s: string) => s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/٬/g, ",");

function translateMessage(raw: string): string | null {
  const msg = raw.trim();
  if (KNOWN[msg]) return t(KNOWN[msg]);

  // "الرصيد مش كافي. محتاج ١٬٢٠٠ ج.م ورصيدك ٣٠٠ ج.م — اشحن الفرق وارجع."
  const bal = msg.match(/الرصيد مش كافي\. محتاج ([\d٠-٩,٬.]+) ج\.م ورصيدك ([\d٠-٩,٬.]+) ج\.م/);
  if (bal) return t("srv.balance", { need: toLatinDigits(bal[1]), have: toLatinDigits(bal[2]) });

  // zod puts a JSON array of issues in `message` — show the first readable one.
  if (msg.startsWith("[") && msg.endsWith("]")) {
    try {
      const issues = JSON.parse(msg) as { message?: string }[];
      const first = issues.find((i) => typeof i?.message === "string")?.message;
      if (first) return translateMessage(first) ?? t("err.validation");
    } catch {
      /* not JSON after all */
    }
    return t("err.validation");
  }
  return null;
}

const NETWORK = /failed to fetch|networkerror|load failed|network request failed|aborterror|timeout/i;

export function errorText(error: unknown): string {
  if (!error) return t("err.generic");
  const e = error as { message?: unknown; data?: { code?: unknown } | null; shape?: { data?: { code?: unknown } } };
  const message = typeof e.message === "string" ? e.message : "";

  if (NETWORK.test(message)) return t("err.network");

  const known = message ? translateMessage(message) : null;
  if (known) return known;

  const code = e.data?.code ?? e.shape?.data?.code;
  if (typeof code === "string" && BY_CODE[code]) return t(BY_CODE[code]);

  // Anything left is either an unknown English technical string or an Arabic
  // sentence the server wrote on purpose. Arabic ones are shown only to Arabic readers.
  if (message && /[\u0600-\u06FF]/.test(message)) return document.documentElement.lang === "ar" ? message : t("err.generic");
  return t("err.generic");
}
