import React, { useMemo } from 'react';
import type { Course } from '../../core/entities';
import { go } from '../../shared/lib/router';
import { Rail, Avatar } from '../../shared/ui';
import { subjectTint, hideBroken } from '../../shared/ui/hue';
import { useCurriculum } from '../../modules/curriculum/ui/CurriculumProvider';
import { num } from '../../shared/lib/format';

interface Collection { id: string; title: string; courses: Course[]; href: string }

/** قوائم مجمّعة بأسلوب Plex: ملصقات متراصّة كالمروحة، عنوان، المدرّس الأبرز، وعدد الكورسات. */
export const Collections: React.FC<{ courses: Course[]; title?: string }> = ({ courses, title = 'قوائم شائعة' }) => {
  const { config, labels, gradeName, subjectName } = useCurriculum();
  const list = useMemo<Collection[]>(() => {
    const out: Collection[] = [];
    const byRating = [...courses].sort((a, b) => b.rating - a.rating).slice(0, 5);
    if (byRating.length >= 3) out.push({ id: 'top-rated', title: `أعلى ${labels.course.many} تقييماً`, courses: byRating, href: '/courses' });
    const subjectIds = Array.from(new Set(courses.map((c) => c.subjectId))).slice(0, 3);
    subjectIds.forEach((sid) => {
      const items = courses.filter((c) => c.subjectId === sid).sort((a, b) => b.students - a.students).slice(0, 5);
      if (items.length >= 2) out.push({ id: sid, title: `أكثر مدرّسي ${subjectName(sid)} متابعة`, courses: items, href: `/courses?subject=${sid}` });
    });
    const fresh = courses.filter((c) => c.isNew).slice(0, 5);
    if (fresh.length >= 2) out.push({ id: 'fresh', title: `${labels.course.many} جديدة هذا الأسبوع`, courses: fresh, href: '/courses' });
    return out;
  }, [courses, labels, config.subjects]);

  if (list.length === 0) return null;
  return (
    <Rail title={title}>
      {list.map((col) => {
        const lead = col.courses[0];
        const fan = col.courses.slice(0, 4);
        return (
          <article key={col.id} onClick={() => go(col.href)} onKeyDown={(e) => e.key === 'Enter' && go(col.href)} role="link" tabIndex={0} aria-label={col.title}
            className="w-[300px] sm:w-[340px] rounded-[26px] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-4 cursor-pointer">
            <div className="relative h-[178px] sm:h-[200px]" aria-hidden>
              {fan.map((c, k) => (
                <div key={c.id} className="absolute top-0 overflow-hidden rounded-xl shadow-[0_8px_24px_rgba(0,0,0,.5)]"
                  style={{ insetInlineStart: `${k * 24}%`, width: k === 0 ? '44%' : '38%', height: k === 0 ? '100%' : `${96 - k * 6}%`, top: k === 0 ? 0 : `${k * 3}%`, zIndex: 10 - k, background: subjectTint(c.subjectId) }}>
                  <img src={c.image} alt="" loading="lazy" onError={hideBroken} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <h3 className="mt-4 text-[19px] font-bold leading-snug text-white line-clamp-2 min-h-[52px]">{col.title}</h3>
            <div className="mt-3 flex items-center gap-3">
              <Avatar src={lead.instructorAvatar} name={lead.instructor} size={40} />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-white truncate">{lead.instructor}</p>
                <p className="text-[13px] text-muted truncate">{num(col.courses.length)} {col.courses.length > 10 ? labels.course.one : labels.course.many}، {gradeName(lead.gradeId)}</p>
              </div>
            </div>
          </article>
        );
      })}
    </Rail>
  );
};
