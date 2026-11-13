import React, { useState } from 'react';
import { go } from '../../shared/lib/router';
import { PageHeader } from '../../shared/studio/StudioShell';
import { DataTable, num } from '../../shared/studio/charts';
import { totalLessons } from '../../data/catalog';
import { useCurriculum } from '../../modules/curriculum/ui/CurriculumProvider';
import { useTeacherScope } from './scope';
import { completionOf } from './OverviewPage';

const ContentPage: React.FC = () => {
  const { courses } = useTeacherScope();
  const { config, labels, gradeName } = useCurriculum();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = courses.find((c) => c.id === openId);

  return (
    <>
      <PageHeader title="المحتوى" sub={`${num(courses.length)} ${labels.course.many}. اضغط على صف لتراه تفصيلاً.`} />
      <DataTable
        rows={courses} rowKey={(c) => c.id} onRow={(c) => setOpenId(openId === c.id ? null : c.id)}
        cols={[
          { label: labels.course.one, render: (c) => <span className="text-white">{c.title}</span> },
          { label: labels.unit.many, render: (c) => num(c.curriculum.length), hideOnMobile: true },
          { label: labels.lesson.many, render: (c) => num(totalLessons(c)), hideOnMobile: true },
          { label: `سعر ${labels.term.one}`, render: (c) => `${num(c.termPrice)} ج.م`, hideOnMobile: true },
          { label: 'الإكمال', render: (c) => `${num(completionOf(c.id))}٪`, align: 'end' },
        ]}
      />
      {open && (
        <section className="mt-6" aria-label={open.title}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-white">{open.title}</h2>
            <button onClick={() => go(`/course/${open.id}`)} className="h-[var(--tap)] px-1 text-[15px] font-semibold text-accent">فتح صفحة {labels.course.one}</button>
          </div>
          <p className="text-[14px] text-muted">{gradeName(open.gradeId)}، مدة الوصول {num(open.accessDays)} يوماً لكل {labels.term.one}</p>
          {open.curriculum.map((m) => (
            <div key={m.title} className="mt-4">
              <p className="text-[15px] font-semibold text-white">{m.title}{config.termsEnabled && m.termId && <span className="text-muted font-normal"> — {config.terms.find((t) => t.id === m.termId)?.name}</span>}</p>
              <ul className="mt-1">{m.lessons.map((l) => <li key={l.id} className="flex justify-between gap-4 py-2 text-[14px] text-white/75 border-b border-white/10"><span>{l.title}</span><span className="text-muted tabular-nums">{l.duration}</span></li>)}</ul>
            </div>
          ))}
        </section>
      )}
    </>
  );
};

export default ContentPage;
