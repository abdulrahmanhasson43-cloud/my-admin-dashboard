import React, { useMemo, useState } from 'react';
import { COURSES, totalLessons } from '../../data/catalog';
import { Poster } from '../../shared/ui';
import { useAuth } from '../auth/AuthProvider';
import { go } from '../../shared/lib/router';

type Tab = 'progress' | 'saved' | 'certificates';

const MyLearningPage: React.FC = () => {
  const { user, progress, saved, completedLessons } = useAuth();
  const [tab, setTab] = useState<Tab>('progress');
  const pctOf = (id: string, base?: number) => progress[id] ?? base ?? 0;

  const inProgress = useMemo(() => COURSES.filter((c) => pctOf(c.id, c.progress) > 0 && pctOf(c.id, c.progress) < 100).sort((a, b) => pctOf(b.id, b.progress) - pctOf(a.id, a.progress)), [progress]);
  const savedCourses = useMemo(() => COURSES.filter((c) => saved.includes(c.id)), [saved]);
  const completed = useMemo(() => COURSES.filter((c) => pctOf(c.id, c.progress) >= 100), [progress]);

  const top = { paddingTop: 'calc(var(--topbar-h) + env(safe-area-inset-top, 0px) + 20px)' };

  if (!user) {
    return (
      <div className="gutter min-h-[70vh]" style={top}>
        <div className="max-w-md pt-10">
          <h1 className="text-[32px] md:text-[40px]">مساراتي</h1>
          <p className="text-muted mt-3">سجّل دخولك لترى دوراتك الجارية، وقائمتك المحفوظة، وشهاداتك.</p>
          <div className="btn-pair mt-6">
            <button onClick={() => go('/login')} className="btn btn-primary btn-lg">تسجيل الدخول</button>
            <button onClick={() => go('/courses')} className="btn btn-ghost btn-lg">تصفّح الدورات</button>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'progress', label: 'قيد التقدّم', count: inProgress.length },
    { key: 'saved', label: 'قائمتي', count: savedCourses.length },
    { key: 'certificates', label: 'الشهادات', count: completed.length },
  ];
  const list = tab === 'progress' ? inProgress : tab === 'saved' ? savedCourses : completed;
  const empty = {
    progress: ['لم تبدأ أي دورة بعد', 'ابدأ بدرس مجاني من المكتبة وسنحفظ لك مكانك.'],
    saved: ['قائمتك فارغة', 'اضغط «أضف لقائمتي» في أي دورة لتجدها هنا.'],
    certificates: ['لا شهادات بعد', 'تصلك الشهادة تلقائياً عند إتمام كل دروس الدورة.'],
  }[tab];

  return (
    <div className="gutter pb-10 min-h-[70vh]" style={top}>
      <h1 className="text-[32px] md:text-[40px]">مساراتي</h1>
      <p className="text-muted mt-1">{completedLessons.length.toLocaleString('ar-EG')} درساً مكتملاً حتى الآن</p>

      <div className="mt-4 flex gap-6 border-b border-white/10" role="tablist">
        {tabs.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)} className={`h-[var(--tap)] -mb-px text-[15px] font-medium border-b-2 transition-colors ${tab === t.key ? 'text-white border-accent' : 'text-white/55 border-transparent hover:text-white'}`}>
            {t.label} <span className="text-white/40 text-[13px]">{t.count.toLocaleString('ar-EG')}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="py-14 max-w-md">
          <h2 className="text-white">{empty[0]}</h2>
          <p className="text-muted mt-2">{empty[1]}</p>
          <button onClick={() => go('/courses')} className="btn btn-primary mt-5">تصفّح الدورات</button>
        </div>
      ) : tab === 'certificates' ? (
        <ul className="mt-2 max-w-2xl">
          {list.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-4 py-4 border-b border-white/10">
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">{c.title}</p>
                <p className="text-[14px] text-muted">{c.instructor} · {totalLessons(c).toLocaleString('ar-EG')} درساً</p>
              </div>
              <button className="btn btn-ghost !h-10 !px-4 !text-[15px] shrink-0" onClick={() => go(`/course/${c.id}`)}>عرض الدورة</button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 sm:gap-x-4 gap-y-7">
          {list.map((c) => <Poster key={c.id} course={c} fluid progress={tab === 'progress' ? pctOf(c.id, c.progress) : undefined} />)}
        </div>
      )}
    </div>
  );
};

export default MyLearningPage;
