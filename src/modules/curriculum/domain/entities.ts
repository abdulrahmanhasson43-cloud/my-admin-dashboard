/** كيانات المنهج — TypeScript صافٍ بلا React ولا تخزين. الترتيب = ترتيب العناصر في المصفوفة. */

export interface Stage { id: string; name: string }
export interface Grade { id: string; stageId: string; name: string }
/** المادة تتبع مرحلة، فتظهر لكل صفوف هذه المرحلة. */
export interface Subject { id: string; stageId: string; name: string }
export interface Term { id: string; name: string }

export type LabelKey = 'stage' | 'grade' | 'subject' | 'term' | 'unit' | 'lesson' | 'course';
/** المسمى بصيغة المفرد والجمع (لأن جمع العربية لا يُشتق آلياً). */
export interface Label { one: string; many: string }

export interface CurriculumConfig {
  stages: Stage[];
  grades: Grade[];
  subjects: Subject[];
  terms: Term[];
  termsEnabled: boolean;
  labels: Record<LabelKey, Label>;
}

export const LABEL_KEYS: LabelKey[] = ['stage', 'grade', 'subject', 'term', 'course', 'unit', 'lesson'];

export const isCurriculumConfig = (x: unknown): x is CurriculumConfig => {
  const c = x as CurriculumConfig;
  return !!c && Array.isArray(c.stages) && Array.isArray(c.grades) && Array.isArray(c.subjects) && Array.isArray(c.terms)
    && typeof c.termsEnabled === 'boolean' && !!c.labels && LABEL_KEYS.every((k) => typeof c.labels[k]?.one === 'string' && typeof c.labels[k]?.many === 'string');
};
