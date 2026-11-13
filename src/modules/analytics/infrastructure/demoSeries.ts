import type { Point } from '../domain/series';

/** إحصاءات تجريبية حتمية (نفس المدخلات = نفس الأرقام) إلى أن تُربط بقاعدة بيانات حقيقية. */
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export const stableNumber = (key: string, min: number, max: number) => min + (hash(key) % (max - min + 1));

/** سلسلة يومية بطول `days` تنتهي اليوم، بنمط أسبوعي خفيف واتجاه صعودي بسيط. */
export const demoSeries = (key: string, days: number, base: number): Point[] => {
  const r = rng(hash(key));
  const slope = ((hash(`${key}:slope`) % 70) - 20) / 100; // اتجاه مختلف لكل سلسلة (من هبوط خفيف إلى صعود)
  const end = new Date(); end.setHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(end.getTime() - (days - 1 - i) * 86_400_000);
    const weekday = [0.9, 1.05, 1.1, 1.1, 1.0, 0.8, 0.85][d.getDay()];
    const trend = 1 + (i / days - 0.5) * slope;
    return { date: d.toISOString().slice(0, 10), value: Math.max(0, Math.round(base * weekday * trend * (0.75 + r() * 0.5))) };
  });
};

const FIRST = ['محمد', 'أحمد', 'مريم', 'سلمى', 'يوسف', 'نور', 'عمر', 'هدى', 'كريم', 'ليلى', 'آدم', 'جنى', 'زياد', 'رنا', 'مصطفى', 'ملك'];
const LAST = ['حسن', 'إبراهيم', 'سعيد', 'عادل', 'فؤاد', 'مختار', 'رضا', 'نبيل', 'شريف', 'جمال'];
export const demoStudentName = (i: number) => `${FIRST[hash(`f${i}`) % FIRST.length]} ${LAST[hash(`l${i}`) % LAST.length]}`;
