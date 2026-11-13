import type { Course } from '../../../core/entities';
import { ALL_TERMS, type Enrollment } from './entities';

const DAY = 86_400_000;

export const priceFor = (course: Course, termId: string, termsCount: number): number =>
  termId === ALL_TERMS ? course.termPrice * termsCount : course.termPrice;

export const accessDaysFor = (course: Course, termId: string, termsCount: number): number =>
  termId === ALL_TERMS ? course.accessDays * termsCount : course.accessDays;

export const isActive = (e: Enrollment, now: Date): boolean =>
  Date.parse(e.startsAt) <= now.getTime() && Date.parse(e.endsAt) > now.getTime();

export const daysLeft = (e: Enrollment, now: Date): number => Math.max(0, Math.ceil((Date.parse(e.endsAt) - now.getTime()) / DAY));

/** هل عند الطالب اشتراك فعّال في هذا الكورس لهذا الترم؟ (ترم غير محدّد = أي ترم) */
export const hasEntitlement = (list: Enrollment[], courseId: string, termId: string | undefined, now: Date): boolean =>
  list.some((e) => e.courseId === courseId && isActive(e, now) && (termId === undefined || e.termId === ALL_TERMS || e.termId === termId));

/** قاعدة الوصول: الدرس المجاني للجميع، وغيره يحتاج اشتراكاً فعّالاً في ترم الوحدة. */
export const canWatchLesson = (list: Enrollment[], courseId: string, unitTermId: string | undefined, lessonFree: boolean | undefined, now: Date): boolean =>
  !!lessonFree || hasEntitlement(list, courseId, unitTermId, now);
