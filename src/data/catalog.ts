/**
 * محتوى المنصة التجريبي — بيانات واضحة وقابلة للاستبدال عبر API لاحقاً.
 * الكورسات مولّدة من إعدادات المنهج الافتراضية (modules/curriculum/infrastructure/seed.ts).
 */

import type { Course } from '../core/entities';
import { buildSeedCourses } from '../modules/curriculum/infrastructure/seed';
import { siteRepository } from '../modules/site/infrastructure/container';
export type { Course, Lesson, Module } from '../core/entities';

/** بيانات المدرّس تُقرأ من إعدادات المنصة المحفوظة عند التحميل (تتحدّث بعد إعادة تحميل الصفحة). */
export const COURSES: Course[] = buildSeedCourses(siteRepository.load().teacher);

const av = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=120&h=120&q=70`;

export const INSTRUCTORS = [
  { name: 'سارة العتيبي', title: 'مدرّبة لغة إنجليزية', avatar: av('1494790108377-be9c29b29330'), courses: 6, students: '18 ألف' },
  { name: 'محمود الشريف', title: 'مهندس برمجيات', avatar: av('1507003211169-0a1dd7228f2d'), courses: 4, students: '24 ألف' },
  { name: 'د. أحمد فتحي', title: 'أستاذ فيزياء', avatar: av('1472099645785-5658abf4ff4e'), courses: 5, students: '16 ألف' },
  { name: 'ليلى حداد', title: 'مطوّرة واجهات', avatar: av('1534528741775-53994a69daeb'), courses: 3, students: '15 ألف' },
];

export const TESTIMONIALS = [
  {
    name: 'عبدالله ناصر',
    role: 'طالب هندسة',
    text: 'أول مرة أكمل دورة كاملة. الدروس قصيرة ومرتّبة، وأحسّ إني أتقدّم فعلاً مو بس أشاهد.',
    avatar: av('1500648767791-00dcc994a43e'),
  },
  {
    name: 'مريم حسن',
    role: 'أم وطالبة',
    text: 'الواجهة سهلة جداً، أفتح الدرس من الجوال وأكمل من حيث توقفت. بنتي كمان تحب مسار الأطفال.',
    avatar: av('1544005313-94ddf0286df2'),
  },
  {
    name: 'يوسف كريم',
    role: 'مصمم مبتدئ',
    text: 'التصميم يشبه منصات الأفلام، لكن المحتوى تعليمي جداً ومنظّم. تجربة ممتعة بدون تشتيت.',
    avatar: av('1506794778202-cad84cf45f1d'),
  },
];

export const FAQ: { q: string; a: string }[] = [
  {
    q: 'كيف أبدأ؟',
    a: 'أنشئ حساباً مجانياً واختر صفّك الدراسي، وستجد مواد صفّك جاهزة. أول درس في كل كورس مفتوح للتجربة.',
  },
  {
    q: 'ماذا يحدث لو غيّرت صفّي؟',
    a: 'تقدر تغيّر صفّك من قائمة حسابك في أي وقت، وتظهر لك مواد الصف الجديد.',
  },
  {
    q: 'هل أقدر أنتقل مباشرة إلى الوحدة التالية؟',
    a: 'الوحدات مرتّبة: تُفتح الوحدة التالية بعد إنهاء السابقة، إلا لو قرّر المدرّس غير ذلك.',
  },
  {
    q: 'هل أستطيع المشاهدة من الجوال؟',
    a: 'نعم، الموقع يعمل على الجوال والتابلت واللابتوب.',
  },
];

export const STATS = [
  { value: '+120', label: 'دورة تعليمية' },
  { value: '+45', label: 'مدرّب معتمد' },
  { value: '98%', label: 'رضا المتعلّمين' },
  { value: '4.9', label: 'متوسط التقييم' },
];

export const findCourse = (id?: string) => COURSES.find((c) => c.id === id);
export const totalLessons = (c: Course) => c.curriculum.reduce((n, m) => n + m.lessons.length, 0);
