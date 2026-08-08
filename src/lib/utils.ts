import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
  let [datePart, timePart] = raw.split(' ');
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
