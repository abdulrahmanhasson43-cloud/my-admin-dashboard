import React from 'react';
import { Check } from 'lucide-react';
import { useCurriculum, definite } from './CurriculumProvider';
import { gradesOfStage } from '../domain/rules';

export interface Academic { gradeId?: string; termId?: string }

/**
 * اختيار السنة الدراسية والترم بشكل منظّم: كل مرحلة بعنوانها وتحتها سنواتها في شبكة أزرار متساوية،
 * ثم أقراص الترم. الاختيار الحالي يُلخَّص في سطر واحد.
 */
export const AcademicPicker: React.FC<{ value: Academic; onChange: (v: Academic) => void }> = ({ value, onChange }) => {
  const { config, labels, gradeName } = useCurriculum();
  const termName = config.terms.find((t) => t.id === value.termId)?.name;

  return (
    <div>
      <div role="radiogroup" aria-label={definite(labels.grade.many)} className="space-y-6">
        {config.stages.map((stage) => {
          const grades = gradesOfStage(config, stage.id);
          if (grades.length === 0) return null;
          return (
            <section key={stage.id} aria-label={stage.name}>
              <div className="flex items-baseline justify-between mb-2.5">
                <h3 className="text-[15px] font-bold text-white">{stage.name}</h3>
                <span className="text-[13px] text-muted">{grades.length.toLocaleString('ar-EG')} {grades.length > 10 ? labels.grade.one : labels.grade.many}</span>
              </div>
              <div className={`grid gap-2.5 ${grades.length === 3 ? 'grid-cols-3' : grades.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                {grades.map((g) => {
                  const on = value.gradeId === g.id;
                  return (
                    <button key={g.id} type="button" role="radio" aria-checked={on} onClick={() => onChange({ ...value, gradeId: g.id })}
                      className={`relative min-h-[64px] px-2 rounded-xl text-[14px] sm:text-[15px] font-semibold leading-snug text-center transition-colors ${on ? 'bg-white text-black' : 'bg-white/[0.08] text-white hover:bg-white/[0.14]'}`}>
                      {g.name}
                      {on && <Check className="absolute top-2 end-2 w-4 h-4" strokeWidth={3} aria-hidden />}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {config.termsEnabled && (
        <section className="mt-6" aria-label={definite(labels.term.one)}>
          <h3 className="text-[15px] font-bold text-white mb-2.5">{definite(labels.term.one)} الدراسي</h3>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={definite(labels.term.one)}>
            {config.terms.map((t) => {
              const on = value.termId === t.id;
              return (
                <button key={t.id} type="button" role="radio" aria-checked={on} onClick={() => onChange({ ...value, termId: t.id })}
                  className={`h-11 px-5 rounded-full text-[15px] font-semibold transition-colors ${on ? 'bg-white text-black' : 'bg-white/[0.08] text-white hover:bg-white/[0.14]'}`}>{t.name}</button>
              );
            })}
          </div>
        </section>
      )}

      <p className="mt-5 text-[14px] min-h-[22px]" aria-live="polite">
        {value.gradeId ? <span className="text-white">اخترت: <b>{gradeName(value.gradeId)}</b>{config.termsEnabled && termName ? <> — <b>{termName}</b></> : null}</span> : <span className="text-muted">اختر سنتك الدراسية{config.termsEnabled ? ' والترم' : ''}.</span>}
      </p>
    </div>
  );
};
