import type { Label, LabelKey } from './entities';

/** الجمع هنا نكرة (دروس، مواد). للعناوين استعمل definite() فتصير «الدروس». */
export const DEFAULT_LABELS: Record<LabelKey, Label> = {
  stage: { one: 'مرحلة', many: 'مراحل' },
  grade: { one: 'صف', many: 'صفوف' },
  subject: { one: 'مادة', many: 'مواد' },
  term: { one: 'ترم', many: 'ترمات' },
  course: { one: 'كورس', many: 'كورسات' },
  unit: { one: 'وحدة', many: 'وحدات' },
  lesson: { one: 'درس', many: 'دروس' },
};

/** إضافة «ال» التعريف لو لم تكن موجودة. */
export const definite = (word: string) => (word.startsWith('ال') ? word : `ال${word}`);
