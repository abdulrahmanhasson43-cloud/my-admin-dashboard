import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * يدمج فئات Tailwind CSS بذكاء — يحل التعارضات بين الفئات المتضاربة
 * (مثل `px-2` و`px-4`) باستخدام tailwind-merge، ويدعم الاسترطاب الشرطي
 * عبر clsx. يُستخدم في كل مكان تقريباً عبر التطبيق لدمج فئات CSS.
 *
 * @example
 * cn("px-2 py-1", condition && "bg-red-500", "px-4") // → "py-1 bg-red-500 px-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * يولّد معرّف فريد بصيغة `prefix-<timestamp>-<random>`.
 * مُصمّم ليُستدعى من معالجات الأحداث (event handlers) وليس أثناء
 * مرحلة العرض (render) — تجنّبًا لتحذيرات React Compiler المتعلقة
 * بنقاء المكونات (purity). يضمن عدم تكرار المعرّفات حتى لو نُشئ
 * عدة عناصر في نفس المللي ثانية بفضل الجزء العشوائي.
 */
export function generateId(prefix: string): string {
  const random = Math.floor(Math.random() * 1e6).toString(36);
  return `${prefix}-${Date.now()}-${random}`;
}

/**
 * يولّد معرّف تسلسلي بسيط بصيغة `PREFIX-NNNN` باستخدام رقم عشوائي
 * ضمن نطاق محدد. مناسب لمعرّفات قصيرة سهلة القراءة (طلبات، مرتجعات).
 * مثل generateId، يُستدعى فقط من معالجات الأحداث.
 */
export function generateNumericId(prefix: string, min: number, max: number): string {
  return `${prefix}-${Math.floor(min + Math.random() * (max - min))}`;
}

/**
 * ينسّق تاريخ/وقت الفاتورة بالإنجليزي بشكل مرتّب (اسم شهر مختصر، صباحًا/
 * مساءً بالإنجليزي) بدل عرض الـISO الخام. يقبل صيغ زي "2025-01-15 14:30"
 * أو "2025-01-15" أو "15-01-2025".
 */
export function formatEnglishDate(raw: string, withTime = true): string {
  if (!raw) return raw;
  const [datePart, timePart] = raw.split(' ');
  let date: Date | null = null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    date = new Date(`${datePart}T${timePart || '00:00'}:00`);
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(datePart)) {
    const [d, m, y] = datePart.split('-');
    date = new Date(`${y}-${m}-${d}T${timePart || '00:00'}:00`);
  }

  if (!date || isNaN(date.getTime())) return raw;

  const datePretty = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (!withTime || !timePart) return datePretty;

  const timePretty = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${datePretty} · ${timePretty}`;
}

/**
 * ينسّق تاريخ/وقت الفاتورة بالعربي (اسم الشهر عربي، صباحًا/مساءً) مع أرقام
 * لاتينية عادية عشان تفضل متسقة مع باقي أرقام الموقع (الأسعار، الكميات).
 * يقبل صيغ زي "2025-01-15 14:30" أو "2025-01-15" أو "15-01-2025".
 */
export function formatArabicDate(raw: string, withTime = true): string {
  if (!raw) return raw;
  const [datePart, timePart] = raw.split(' ');
  let date: Date | null = null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    date = new Date(`${datePart}T${timePart || '00:00'}:00`);
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(datePart)) {
    const [d, m, y] = datePart.split('-');
    date = new Date(`${y}-${m}-${d}T${timePart || '00:00'}:00`);
  }

  if (!date || isNaN(date.getTime())) return raw;

  const datePretty = date.toLocaleDateString('ar-EG-u-nu-latn', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (!withTime || !timePart) return datePretty;

  const timePretty = date.toLocaleTimeString('ar-EG-u-nu-latn', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${datePretty} - ${timePretty}`;
}
