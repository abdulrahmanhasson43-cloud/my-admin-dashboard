import type { Course, Module } from '../../../core/entities';
import type { CurriculumConfig } from '../domain/entities';
import { DEFAULT_LABELS } from '../domain/defaults';

/* ===== المنهج الافتراضي: مدرّس رياضيات واحد، للمرحلتين الإعدادية والثانوية (يعدّله السوبر أدمن) ===== */

const ORD = ['الأول', 'الثاني', 'الثالث'];
const STAGES = [
  { id: 'prep', name: 'المرحلة الإعدادية', suffix: 'الإعدادي' },
  { id: 'secondary', name: 'المرحلة الثانوية', suffix: 'الثانوي' },
];

export const SEED_CONFIG: CurriculumConfig = {
  stages: STAGES.map((s) => ({ id: s.id, name: s.name })),
  grades: STAGES.flatMap((s) => ORD.map((o, i) => ({ id: `${s.id}-${i + 1}`, stageId: s.id, name: `الصف ${o} ${s.suffix}` }))),
  subjects: STAGES.map((s) => ({ id: `${s.id}-math`, stageId: s.id, name: 'الرياضيات' })),
  terms: [{ id: 'tm-1', name: 'الترم الأول' }, { id: 'tm-2', name: 'الترم الثاني' }],
  termsEnabled: true,
  labels: { ...DEFAULT_LABELS },
};

/* ===== باقات المدرّس لكل صف. المحتوى أمثلة بديلة يستبدلها المدرّس ===== */

const UNITS: Record<string, string[]> = {
  'prep-1': ['الأعداد النسبية', 'القوى والجذور', 'الجبر والمعادلات', 'الهندسة والتحويلات', 'الإحصاء', 'الاحتمال'],
  'prep-2': ['الأعداد والعلاقات', 'كثيرات الحدود', 'المعادلات والمتباينات', 'الهندسة والتشابه', 'المثلثات', 'الإحصاء'],
  'prep-3': ['الجبر والدوال', 'المعادلات التربيعية', 'المثلثات', 'الهندسة التحليلية', 'الدائرة', 'الإحصاء'],
  'secondary-1': ['الجبر', 'حساب المثلثات', 'الهندسة التحليلية', 'الدوال', 'الإحصاء', 'التفاضل'],
  'secondary-2': ['التفاضل', 'التكامل', 'الهندسة الفراغية', 'الجبر والمصفوفات', 'المتجهات', 'الإحصاء'],
  'secondary-3': ['التفاضل والتكامل', 'الهندسة الفراغية', 'الإحصاء', 'الجبر', 'المتجهات', 'الاحتمال'],
};

const OFFERINGS = [
  { key: 'full', name: 'الشرح الكامل', units: (g: string) => UNITS[g], lessons: ['مقدّمة الوحدة', 'الشرح والأمثلة', 'تدريبات وتمارين', 'مراجعة الوحدة'], sequential: true, days: 120, factor: 1, isNew: false },
  { key: 'review', name: 'المراجعة النهائية', units: () => ['ملخص القوانين', 'أهم المسائل', 'نماذج مراجعة'], lessons: ['القوانين الأساسية', 'أهم المسائل', 'أخطاء شائعة', 'نموذج مراجعة'], sequential: false, days: 45, factor: 0.6, isNew: true },
  { key: 'exams', name: 'حل الامتحانات', units: () => ['امتحانات الترم الأول', 'امتحانات الترم الثاني'], lessons: ['نموذج ١', 'نموذج ٢', 'نموذج ٣', 'نموذج ٤', 'نموذج ٥', 'نموذج ٦'], sequential: false, days: 90, factor: 0.7, isNew: false },
];
const BASE_PRICE: Record<string, number> = { prep: 150, secondary: 250 };
const IMAGES = ['1434030216411-0b793f4b4173', '1635070041078-e363dbe005cb', '1481627834876-b7833e8f5570'];
const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=72`;

export interface SeedTeacher { name: string; title: string; photo: string }

const buildUnits = (prefix: string, names: string[], lessons: string[]): Module[] =>
  names.map((title, mi) => ({
    title,
    termId: mi < names.length / 2 ? 'tm-1' : 'tm-2',
    lessons: lessons.map((t, li) => ({
      id: `${prefix}-m${mi + 1}-l${li + 1}`,
      title: t,
      duration: `${6 + ((mi * 7 + li * 3) % 16)}:${String((li * 17 + 9) % 60).padStart(2, '0')}`,
      free: mi === 0 && li === 0,
    })),
  }));

export const buildSeedCourses = (teacher: SeedTeacher): Course[] => {
  const out: Course[] = [];
  SEED_CONFIG.grades.forEach((g, gi) => {
    OFFERINGS.forEach((o, oi) => {
      const n = gi * 13 + oi * 7;
      const id = `${g.id}-${o.key}`;
      const names = o.units(g.id);
      out.push({
        id,
        title: `${o.name} — ${g.name}`,
        offering: o.name,
        tagline: `${o.name} لمادة الرياضيات مع تدريبات بعد كل درس`,
        description: `${o.name} لمادة الرياضيات — ${g.name}. تغطّي المحتوى بالترتيب مع أمثلة محلولة وتدريبات، وتساعدك على الاستعداد للامتحان.`,
        gradeId: g.id,
        subjectId: `${g.id.split('-')[0]}-math`,
        sequential: o.sequential,
        termPrice: Math.round((BASE_PRICE[g.stageId] * o.factor) / 10) * 10,
        accessDays: o.days,
        instructor: teacher.name,
        instructorTitle: teacher.title,
        instructorAvatar: teacher.photo,
        rating: 4.5 + (n % 5) / 10,
        reviews: 120 + n * 9,
        students: 1200 + ((n * 137) % 9000),
        hours: names.length * 3,
        image: img(IMAGES[(gi + oi) % IMAGES.length]),
        isNew: o.isNew,
        tags: ['الرياضيات', g.name, o.name],
        outcomes: names.slice(0, 4).map((u) => `تتقن وحدة «${u}»`),
        curriculum: buildUnits(id, names, o.lessons),
      });
    });
  });
  return out;
};
