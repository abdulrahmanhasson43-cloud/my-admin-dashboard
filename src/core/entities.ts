/** كيانات النطاق (Domain) — أنواع خالصة بلا أي اعتماد على React أو على مصدر البيانات. */

/** مصدر الفيديو: يوتيوب (للمحتوى المجاني كحلول الواجبات) أو ملف/رابط على سيرفر المنصة (للمدفوع). */
export type VideoSource = { kind: 'youtube'; id: string } | { kind: 'hosted'; url: string };

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  free?: boolean;
  completed?: boolean;
  video?: VideoSource;
}

export interface Module {
  title: string;
  /** الترم الذي تتبعه الوحدة (اختياري؛ يُستخدم لو الترمات مفعّلة). */
  termId?: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  tagline: string;
  description: string;
  /** الصف والمادة اللذان يتبعهما الكورس (معرّفات من إعدادات المنهج). */
  /** نوع الباقة عند المدرّس: «الشرح الكامل»، «المراجعة النهائية»، «حل الامتحانات»... */
  offering: string;
  gradeId: string;
  subjectId: string;
  /** لو true: الوحدة التالية لا تُفتح قبل إنهاء السابقة. */
  sequential: boolean;
  /** سعر الترم الواحد بالجنيه، ومدة الوصول بعد الشراء بالأيام (لكل ترم). */
  termPrice: number;
  accessDays: number;
  instructor: string;
  instructorTitle: string;
  instructorAvatar: string;
  rating: number;
  reviews: number;
  students: number;
  hours: number;
  image: string;
  badge?: string;
  free?: boolean;
  isNew?: boolean;
  progress?: number;
  tags: string[];
  outcomes: string[];
  curriculum: Module[];
}
