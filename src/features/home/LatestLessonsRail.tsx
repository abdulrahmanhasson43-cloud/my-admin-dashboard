import React from 'react';
import type { Course } from '../../core/entities';
import { go } from '../../shared/lib/router';
import { Rail, BrandMark } from '../../shared/ui';
import { subjectTint, hideBroken } from '../../shared/ui/hue';
import { useCurriculum } from '../../modules/curriculum/ui/CurriculumProvider';

/** بطاقات أفقية بمدة الدرس على الصورة وعنوانه في أسفلها (أسلوب بطاقات البث في Apple TV). */
export const LatestLessonsRail: React.FC<{ courses: Course[]; title: string }> = ({ courses, title }) => {
  const { subjectName, gradeName } = useCurriculum();
  return (
    <Rail title={title} href="/courses">
      {courses.slice(0, 10).map((c) => {
        const lesson = c.curriculum[0]?.lessons[0];
        return (
          <article key={c.id} onClick={() => go(`/course/${c.id}`)} onKeyDown={(e) => e.key === 'Enter' && go(`/course/${c.id}`)} role="link" tabIndex={0}
            aria-label={`${lesson?.title ?? ''} — ${subjectName(c.subjectId)} — ${c.instructor}`} className="w-[290px] sm:w-[330px] cursor-pointer">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10" style={{ background: subjectTint(c.subjectId) }}>
              <img src={c.image} alt="" loading="lazy" onError={hideBroken} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              {lesson && <span dir="ltr" className="absolute top-2.5 start-2.5 h-7 px-2.5 rounded-full bg-black/60 border border-white/20 text-[13px] font-semibold tabular-nums grid place-items-center">{lesson.duration}</span>}
              <BrandMark className="absolute top-3 end-3 w-[18px] h-[18px] opacity-90" />
              <div className="absolute inset-x-0 bottom-0 p-3.5">
                <p className="text-[20px] font-extrabold leading-tight text-white line-clamp-1">{lesson?.title}</p>
                <p className="text-[13px] text-white/75 line-clamp-1">{subjectName(c.subjectId)}، {gradeName(c.gradeId)}</p>
              </div>
            </div>
          </article>
        );
      })}
    </Rail>
  );
};
