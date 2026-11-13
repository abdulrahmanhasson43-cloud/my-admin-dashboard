import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { CurriculumConfig, Label, LabelKey } from '../domain/entities';
import { gradeName, stageName, subjectName } from '../domain/rules';
import type { Result, UsageCounter } from '../application/editConfig';
import { curriculumRepository } from '../infrastructure/container';
import { COURSES } from '../../../data/catalog';

interface Ctx {
  config: CurriculumConfig;
  labels: Record<LabelKey, Label>;
  /** يطبّق نتيجة تعديل؛ يرجع نص الخطأ أو null عند النجاح. */
  apply: (next: Result<CurriculumConfig> | CurriculumConfig) => string | null;
  usage: UsageCounter;
  gradeName: (id?: string) => string;
  subjectName: (id?: string) => string;
  stageName: (id?: string) => string;
}

const CurriculumContext = createContext<Ctx | null>(null);

/** يحسب كم كورساً/وحدة يعتمد على عنصر قبل السماح بحذفه. */
const usage: UsageCounter = (kind, id) => {
  if (kind === 'grades') return COURSES.filter((c) => c.gradeId === id).length;
  if (kind === 'subjects') return COURSES.filter((c) => c.subjectId === id).length;
  if (kind === 'terms') return COURSES.reduce((n, c) => n + c.curriculum.filter((m) => m.termId === id).length, 0);
  return 0;
};

export const CurriculumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<CurriculumConfig>(() => curriculumRepository.load());

  const apply = useCallback<Ctx['apply']>((next) => {
    const value = 'ok' in next ? (next.ok ? next.value : null) : next;
    if (!value) return 'ok' in next && !next.ok ? next.error : 'تعذّر الحفظ.';
    setConfig(value);
    curriculumRepository.save(value);
    return null;
  }, []);

  const value = useMemo<Ctx>(() => ({
    config, labels: config.labels, apply, usage,
    gradeName: (id) => gradeName(config, id), subjectName: (id) => subjectName(config, id), stageName: (id) => stageName(config, id),
  }), [config, apply]);

  return <CurriculumContext.Provider value={value}>{children}</CurriculumContext.Provider>;
};

export const useCurriculum = () => {
  const ctx = useContext(CurriculumContext);
  if (!ctx) throw new Error('useCurriculum must be used within CurriculumProvider');
  return ctx;
};

/** كل المسميات (مرحلة/صف/مادة/ترم/كورس/وحدة/درس) بالمفرد والجمع كما يضبطها السوبر أدمن. */
export { definite } from '../domain/defaults';

export const useLabels = () => useCurriculum().labels;
