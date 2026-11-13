import React, { useMemo, useState } from 'react';
import { Play, Plus, Check, Bookmark, BookmarkCheck, Lock } from 'lucide-react';
import { COURSES, findCourse, totalLessons } from '../../data/catalog';
import { Rail, LessonState, Avatar } from '../../shared/ui';
import { CoursePoster } from '../../modules/curriculum/ui/CoursePoster';
import { subjectTint, hideBroken } from '../../shared/ui/hue';
import { useAuth } from '../auth/AuthProvider';
import { go, useRoute } from '../../shared/lib/router';
import { useCurriculum, definite } from '../../modules/curriculum/ui/CurriculumProvider';
import { isUnitUnlocked, nextLesson, unitProgress } from '../../modules/curriculum/domain/rules';
import { useWallet, egp } from '../../modules/wallet/ui/WalletProvider';
import { useSite } from '../../modules/site/ui/SiteProvider';

const n = (v: number) => v.toLocaleString('ar-EG');

const CourseDetailPage: React.FC = () => {
  const { path } = useRoute();
  const course = findCourse(path.split('/')[2]);
  const { user, progress, saved, toggleSave, completedLessons } = useAuth();
  const { config, labels, subjectName, gradeName } = useCurriculum();
  const { canWatch, hasAccess } = useWallet();
  const { site } = useSite();
  const done = useMemo(() => new Set(completedLessons), [completedLessons]);

  const next = course ? nextLesson(course, done) : undefined;
  const nextIndex = course ? Math.max(0, course.curriculum.findIndex((m) => m.lessons.some((l) => l.id === next?.id))) : 0;
  const [open, setOpen] = useState<number | null>(nextIndex);

  if (!course) {
    return (
      <div className="min-h-[70vh] grid place-items-center gutter pt-24">
        <div className="max-w-sm">
          <h1 className="text-[36px]">لم نجد هذا {labels.course.one}</h1>
          <p className="text-muted mt-2">ربما نُقل أو حُذف.</p>
          <button onClick={() => go('/courses')} className="btn btn-primary mt-5">تصفّح {labels.course.many}</button>
        </div>
      </div>
    );
  }

  const lessons = totalLessons(course);
  const pct = progress[course.id] ?? 0;
  const started = pct > 0 && pct < 100;
  const isSaved = saved.includes(course.id);
  const enforceOrder = !!user && user.role === 'student' && course.sequential;
  const sameGrade = COURSES.filter((c) => c.id !== course.id && c.gradeId === course.gradeId);

  const isStudent = user?.role === 'student';
  const subscribed = hasAccess(course);
  const start = () => go(`/learn/${course.id}${next ? `?lesson=${next.id}` : ''}`);
  const tryFree = () => go(`/learn/${course.id}?lesson=${course.curriculum[0]?.lessons[0]?.id}`);
  const openLesson = (id: string, free?: boolean, termId?: string) => {
    if (canWatch(course, termId, free)) return go(`/learn/${course.id}?lesson=${id}`);
    if (!user) return go('/login');
    return go(`/subscribe?course=${course.id}${termId ? `&term=${termId}` : ''}`);
  };

  /** الوحدات مجمّعة حسب الترم (لو مفعّل) مع الحفاظ على ترتيبها الأصلي. */
  const groups = (() => {
    if (!config.termsEnabled) return [{ termId: '', title: '', items: course.curriculum.map((m, i) => ({ m, i })) }];
    const out: { termId: string; title: string; items: { m: (typeof course.curriculum)[number]; i: number }[] }[] = [];
    course.curriculum.forEach((m, i) => {
      const tid = m.termId ?? '';
      let g = out.find((x) => x.termId === tid);
      if (!g) { g = { termId: tid, title: config.terms.find((t) => t.id === tid)?.name ?? '', items: [] }; out.push(g); }
      g.items.push({ m, i });
    });
    return out;
  })();

  return (
    <>
      <section className="relative min-h-[460px] md:min-h-[520px] overflow-hidden flex items-end" style={{ background: subjectTint(course.subjectId, 16) }}>
        <img src={course.image.replace('w=900', 'w=1600')} alt="" onError={hideBroken} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20 md:bg-gradient-to-l md:from-ink/90 md:via-ink/50 md:to-transparent" />
        <div className="relative gutter w-full pb-8 pt-28 max-w-[720px] md:me-auto md:ms-0">
          <p className="text-[14px] text-white/70 flex gap-4"><span>{subjectName(course.subjectId)}</span><span>{gradeName(course.gradeId)}</span></p>
          <h1 className="mt-1">{course.title}</h1>
          <p className="text-[16px] md:text-[18px] text-white/80 mt-3 max-w-[56ch]">{course.tagline}</p>
          <p className="text-[14px] text-white/65 mt-3 flex flex-wrap gap-x-5 gap-y-1">
            <span>{course.rating.toLocaleString('ar-EG', { minimumFractionDigits: 1 })} تقييم ({n(course.reviews)})</span>
            <span>{n(course.students)} طالب</span>
            <span>{n(course.hours)} ساعات</span>
            <span>{n(lessons)} {labels.lesson.many}</span>
          </p>
          {started && <p className="text-[14px] text-white/80 mt-3">أنجزت {n(pct)}٪ من المحتوى</p>}
          <div className="btn-row mt-5">
            {isStudent && !subscribed ? (
              <>
                <button onClick={() => go(`/subscribe?course=${course.id}`)} className="btn btn-primary btn-lg">اشترك من {egp(course.termPrice)}</button>
                <button onClick={tryFree} className="btn btn-ghost btn-lg"><Play className="w-[18px] h-[18px] fill-current" />أول {labels.lesson.one} مجاناً</button>
              </>
            ) : (
              <>
            <button onClick={start} className="btn btn-primary btn-lg"><Play className="w-[18px] h-[18px] fill-current" />{started ? 'أكمل من حيث توقّفت' : `ابدأ أول ${labels.lesson.one}`}</button>
            {site.features.saveButton && (<button onClick={() => toggleSave(course.id)} aria-pressed={isSaved} className="btn btn-ghost btn-lg">
              {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}{isSaved ? 'في قائمتي' : 'أضف لقائمتي'}
            </button>)}
              </>
            )}
          </div>
        </div>
      </section>

      <div className="gutter grid lg:grid-cols-[minmax(0,720px)_300px] gap-x-20 gap-y-10 mt-10">
        <div className="min-w-0 max-w-[720px]">
          <h2 className="text-white">عن {labels.course.one}</h2>
          <p className="text-[16px] text-white/75 mt-2">{course.description}</p>

          <h2 className="text-white mt-10">ماذا ستتعلّم</h2>
          <ul className="mt-3 grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {course.outcomes.map((o) => (
              <li key={o} className="flex gap-3 text-[15px] text-white/80"><Check className="w-5 h-5 text-accent shrink-0 mt-0.5" strokeWidth={2.2} />{o}</li>
            ))}
          </ul>

          <h2 className="text-white mt-10">خريطة المنهج</h2>
          <p className="text-[14px] text-muted mt-1">
            {n(course.curriculum.length)} {labels.unit.many}، {n(lessons)} {labels.lesson.many}
            {enforceOrder && ` — تُفتح ${definite(labels.unit.one)} التالية بعد إنهاء السابقة`}
          </p>

          {groups.map((g) => (
            <div key={g.termId || 'all'} className="mt-5">
              {g.title && (
                <div className="flex items-center justify-between gap-3 mb-1">
                  <h3 className="text-[15px] font-bold text-accent">{g.title}</h3>
                  {isStudent && g.termId && !hasAccess(course, g.termId) && (
                    <button onClick={() => go(`/subscribe?course=${course.id}&term=${g.termId}`)} className="h-[var(--tap)] px-1 text-[14px] font-semibold text-white/85">اشترك في {g.title} ({egp(course.termPrice)})</button>
                  )}
                </div>
              )}
              {g.items.map(({ m, i }) => {
                const p = unitProgress(m, done);
                const unlocked = !enforceOrder || isUnitUnlocked(course.curriculum, i, done, true);
                const expanded = open === i && unlocked;
                return (
                  <div key={m.title} className="border-t border-white/10 last:border-b">
                    <button
                      onClick={() => unlocked && setOpen(open === i ? null : i)}
                      aria-expanded={expanded} aria-disabled={!unlocked}
                      className={`w-full min-h-[60px] flex items-center justify-between gap-4 py-3 text-start ${unlocked ? '' : 'cursor-not-allowed'}`}
                    >
                      <span className="min-w-0">
                        <span className={`block text-[16px] font-semibold ${unlocked ? 'text-white' : 'text-white/45'}`}>{m.title}</span>
                        <span className="block text-[13px] text-muted">
                          {unlocked ? `${n(m.lessons.length)} ${labels.lesson.many}` : `تُفتح بعد إنهاء ${definite(labels.unit.one)} السابقة`}
                        </span>
                      </span>
                      <span className="flex items-center gap-3 shrink-0 text-[13px] text-muted">
                        {user && unlocked && <span className={p === 100 ? 'text-mint' : ''}>{p === 100 ? 'مكتملة' : `${n(p)}٪`}</span>}
                        {unlocked ? <Plus className={`w-5 h-5 transition-transform ${expanded ? 'rotate-45' : ''}`} /> : <Lock className="w-[18px] h-[18px]" />}
                      </span>
                    </button>
                    {expanded && (
                      <ul className="pb-2">
                        {m.lessons.map((l) => {
                          const locked = !canWatch(course, m.termId, l.free);
                          return (
                            <li key={l.id}>
                              <button onClick={() => openLesson(l.id, l.free, m.termId)} className="w-full min-h-[48px] flex items-center gap-3 py-2 text-start">
                                <LessonState locked={locked} done={done.has(l.id)} />
                                <span className={`flex-1 text-[15px] ${locked ? 'text-white/50' : 'text-white/90'}`}>{l.title}</span>
                                {l.free && !subscribed && <span className="text-[13px] text-mint">مجاني</span>}
                                <span className="text-[13px] text-muted tabular-nums">{l.duration}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <aside className="lg:pt-1">
          <h2 className="text-white">المدرّس</h2>
          <div className="flex items-center gap-3 mt-3">
            <Avatar src={course.instructorAvatar} name={course.instructor} size={56} />
            <div>
              <p className="font-semibold text-white">{course.instructor}</p>
              <p className="text-[14px] text-muted">{course.instructorTitle}</p>
            </div>
          </div>
        </aside>
      </div>

      {sameGrade.length > 0 && (
        <Rail title={`${labels.course.many} أخرى في ${gradeName(course.gradeId)}`} href={`/courses?grade=${course.gradeId}`}>
          {sameGrade.slice(0, 10).map((c) => <CoursePoster key={c.id} course={c} caption={subjectName(c.subjectId)} sub={c.instructor} />)}
        </Rail>
      )}
    </>
  );
};

export default CourseDetailPage;
