import type { Course, Module } from '../../../core/entities';
import type { CurriculumConfig, Grade, Subject } from './entities';

export const gradesOfStage = (c: CurriculumConfig, stageId: string): Grade[] => c.grades.filter((g) => g.stageId === stageId);
export const subjectsOfStage = (c: CurriculumConfig, stageId: string): Subject[] => c.subjects.filter((s) => s.stageId === stageId);
export const stageOfGrade = (c: CurriculumConfig, gradeId?: string) => c.stages.find((s) => s.id === c.grades.find((g) => g.id === gradeId)?.stageId);
export const subjectsOfGrade = (c: CurriculumConfig, gradeId?: string): Subject[] => {
  const st = stageOfGrade(c, gradeId);
  return st ? subjectsOfStage(c, st.id) : [];
};
export const gradeName = (c: CurriculumConfig, id?: string) => c.grades.find((g) => g.id === id)?.name ?? '';
export const subjectName = (c: CurriculumConfig, id?: string) => c.subjects.find((s) => s.id === id)?.name ?? '';
export const stageName = (c: CurriculumConfig, id?: string) => c.stages.find((s) => s.id === id)?.name ?? '';

type Done = ReadonlySet<string>;

/** نسبة إنجاز وحدة (0–100) من الدروس المكتملة. */
export const unitProgress = (m: Module, done: Done): number =>
  m.lessons.length === 0 ? 0 : Math.round((m.lessons.filter((l) => done.has(l.id)).length / m.lessons.length) * 100);

/** الوحدة الأولى مفتوحة دائماً؛ وكل وحدة تالية تُفتح بعد اكتمال السابقة (لو الترتيب إجباري). */
export const isUnitUnlocked = (modules: Module[], index: number, done: Done, sequential: boolean): boolean =>
  !sequential || index === 0 || unitProgress(modules[index - 1], done) === 100;

export const courseProgress = (c: Course, done: Done): number => {
  const all = c.curriculum.flatMap((m) => m.lessons);
  return all.length === 0 ? 0 : Math.round((all.filter((l) => done.has(l.id)).length / all.length) * 100);
};

/** أول درس غير مكتمل داخل الوحدات المفتوحة. */
export const nextLesson = (c: Course, done: Done) => {
  for (let i = 0; i < c.curriculum.length; i++) {
    if (!isUnitUnlocked(c.curriculum, i, done, c.sequential)) break;
    const l = c.curriculum[i].lessons.find((x) => !done.has(x.id));
    if (l) return l;
  }
  return c.curriculum[0]?.lessons[0];
};
