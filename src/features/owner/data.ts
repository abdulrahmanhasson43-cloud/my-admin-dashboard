import { COURSES } from '../../data/catalog';
import { stableNumber } from '../../modules/analytics/infrastructure/demoSeries';

export interface TeacherRow { name: string; courses: number; students: number; revenue30: number }

/** ملخّص المدرّسين مجمّعاً من الكورسات (تجريبي). */
export const teacherRows = (): TeacherRow[] => {
  const map = new Map<string, TeacherRow>();
  for (const c of COURSES) {
    const row = map.get(c.instructor) ?? { name: c.instructor, courses: 0, students: 0, revenue30: 0 };
    row.courses += 1;
    row.students += c.students;
    row.revenue30 += Math.round(c.termPrice * stableNumber(`${c.id}:sales30`, 6, 40));
    map.set(c.instructor, row);
  }
  return [...map.values()].sort((a, b) => b.revenue30 - a.revenue30);
};
