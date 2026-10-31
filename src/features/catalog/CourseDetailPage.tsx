import React, { useState } from 'react';
import { Play, Plus, Check, Bookmark, BookmarkCheck } from 'lucide-react';
import { COURSES, findCourse, totalLessons, categoryLabel } from '../../data/catalog';
import { Poster, Rail, LessonState, Avatar, Progress } from '../../shared/ui';
import { categoryTint, hideBroken } from '../../shared/ui/hue';
import { useAuth } from '../auth/AuthProvider';
import { go, useRoute } from '../../shared/lib/router';

const n = (v: number) => v.toLocaleString('ar-EG');

const CourseDetailPage: React.FC = () => {
  const { path } = useRoute();
  const course = findCourse(path.split('/')[2]);
  const { user, progress, saved, toggleSave, completedLessons } = useAuth();
  const [open, setOpen] = useState<number | null>(0);

  if (!course) {
    return (
      <div className="min-h-[70vh] grid place-items-center gutter pt-24">
        <div className="max-w-sm">
          <h1 className="text-[36px]">لم نجد هذه الدورة</h1>
          <p className="text-muted mt-2">ربما نُقلت أو حُذفت.</p>
          <button onClick={() => go('/courses')} className="btn btn-primary mt-5">تصفّح الدورات</button>
        </div>
      </div>
    );
  }

  const lessons = totalLessons(course);
  const pct = progress[course.id] ?? course.progress ?? 0;
  const started = pct > 0 && pct < 100;
  const isSaved = saved.includes(course.id);
  const related = COURSES.filter((c) => c.id !== course.id && c.category === course.category);
  const relatedList = related.length >= 3 ? related : COURSES.filter((c) => c.id !== course.id).slice(0, 6);

  const start = () => {
    const first = course.curriculum[0]?.lessons[0];
    go(`/learn/${course.id}${first ? `?lesson=${first.id}` : ''}`);
  };
  const openLesson = (id: string, free?: boolean) => (user || free ? go(`/learn/${course.id}?lesson=${id}`) : go('/login'));

  return (
    <>
      <section className="relative min-h-[460px] md:min-h-[520px] overflow-hidden flex items-end" style={{ background: categoryTint(course.category, 16) }}>
        <img src={course.image.replace('w=1400', 'w=1600')} alt="" onError={hideBroken} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20 md:bg-gradient-to-l md:from-ink/90 md:via-ink/50 md:to-transparent" />
        <div className="relative gutter w-full pb-8 pt-28 max-w-[720px] md:me-auto md:ms-0">
          <p className="text-[14px] text-white/70 flex gap-4"><span>{categoryLabel(course.category)}</span><span>{course.level}</span></p>
          <h1 className="mt-1">{course.title}</h1>
          <p className="text-[16px] md:text-[18px] text-white/80 mt-3 max-w-[56ch]">{course.tagline}</p>
          <p className="text-[14px] text-white/65 mt-3 flex flex-wrap gap-x-5 gap-y-1">
            <span>{course.rating.toLocaleString('ar-EG', { minimumFractionDigits: 1 })} تقييم ({n(course.reviews)})</span>
            <span>{n(course.students)} متعلّم</span>
            <span>{n(course.hours)} ساعات</span>
            <span>{n(lessons)} درساً</span>
          </p>
          {started && <Progress value={pct} className="mt-4 max-w-sm" />}
          <div className="btn-row mt-5">
            <button onClick={start} className="btn btn-primary btn-lg"><Play className="w-[18px] h-[18px] fill-current" />{started ? 'أكمل التعلّم' : course.free ? 'ابدأ مجاناً' : 'ابدأ الدرس الأول'}</button>
            <button onClick={() => toggleSave(course.id)} aria-pressed={isSaved} className="btn btn-ghost btn-lg">
              {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}{isSaved ? 'في قائمتي' : 'أضف لقائمتي'}
            </button>
          </div>
        </div>
      </section>

      <div className="gutter grid lg:grid-cols-[minmax(0,720px)_300px] gap-x-20 gap-y-10 mt-10">
        <div className="min-w-0 max-w-[720px]">
          <h2 className="text-white">عن الدورة</h2>
          <p className="text-[16px] text-white/75 mt-2">{course.description}</p>

          <h2 className="text-white mt-10">ماذا ستتعلّم</h2>
          <ul className="mt-3 grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {course.outcomes.map((o) => (
              <li key={o} className="flex gap-3 text-[15px] text-white/80"><Check className="w-5 h-5 text-accent shrink-0 mt-0.5" strokeWidth={2.2} />{o}</li>
            ))}
          </ul>

          <h2 className="text-white mt-10">محتوى الدورة</h2>
          <p className="text-[14px] text-muted mt-1">{n(course.curriculum.length)} وحدات، {n(lessons)} درساً</p>
          <div className="mt-3">
            {course.curriculum.map((m, mi) => (
              <div key={m.title} className="border-t border-white/10 last:border-b">
                <button onClick={() => setOpen(open === mi ? null : mi)} aria-expanded={open === mi} className="w-full min-h-[56px] flex items-center justify-between gap-4 py-3 text-start">
                  <span className="text-[16px] font-semibold text-white">{m.title}</span>
                  <span className="flex items-center gap-3 shrink-0 text-[13px] text-muted">{n(m.lessons.length)} دروس<Plus className={`w-5 h-5 transition-transform ${open === mi ? 'rotate-45' : ''}`} /></span>
                </button>
                {open === mi && (
                  <ul className="pb-2">
                    {m.lessons.map((l) => {
                      const locked = !user && !l.free;
                      return (
                        <li key={l.id}>
                          <button onClick={() => openLesson(l.id, l.free)} className="w-full min-h-[48px] flex items-center gap-3 py-2 text-start">
                            <LessonState locked={locked} done={completedLessons.includes(l.id)} />
                            <span className={`flex-1 text-[15px] ${locked ? 'text-white/50' : 'text-white/90'}`}>{l.title}</span>
                            {l.free && !user && <span className="text-[13px] text-mint">مجاني</span>}
                            <span className="text-[13px] text-muted tabular-nums">{l.duration}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
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

      <Rail title="قد يعجبك أيضاً">
        {relatedList.slice(0, 8).map((c) => <Poster key={c.id} course={c} />)}
      </Rail>
    </>
  );
};

export default CourseDetailPage;
