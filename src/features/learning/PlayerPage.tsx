import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Play,
  Pause,
  Volume2,
  Maximize,
  Settings,
  ListVideo,
  ChevronLeft,
  Lock,
  Award,
} from 'lucide-react';
import { findCourse, totalLessons } from '../../data/catalog';
import { Progress, LessonState, Pill } from '../../shared/ui';
import { useAuth } from '../auth/AuthProvider';
import { go, useRoute } from '../../shared/lib/router';

const Player: React.FC = () => {
  const { path, query } = useRoute();
  const courseId = path.split('/')[2];
  const course = findCourse(courseId);
  const { user, progress, completedLessons, completeLesson } = useAuth();

  const flatLessons = useMemo(
    () => course?.curriculum.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m.title }))) ?? [],
    [course]
  );

  const initialId = new URLSearchParams(query).get('lesson') ?? flatLessons[0]?.id;
  const [activeId, setActiveId] = useState(initialId);
  const [playing, setPlaying] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (initialId) setActiveId(initialId);
  }, [initialId]);

  if (!course) {
    return (
      <div className="min-h-[70vh] grid place-items-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-white">الدورة غير موجودة</h1>
          <button onClick={() => go('/courses')} className="btn btn-primary mt-5">
            تصفّح الدورات
          </button>
        </div>
      </div>
    );
  }

  const index = Math.max(0, flatLessons.findIndex((l) => l.id === activeId));
  const active = flatLessons[index] ?? flatLessons[0];
  const done = completedLessons.includes(active.id);
  const pct = progress[course.id] ?? 0;
  const total = totalLessons(course);

  const selectLesson = (id: string) => {
    setActiveId(id);
    setPlaying(false);
    setSidebarOpen(false);
    window.history.replaceState(null, '', `#/learn/${course.id}?lesson=${id}`);
  };

  const next = () => {
    if (index < flatLessons.length - 1) selectLesson(flatLessons[index + 1].id);
  };
  const prev = () => {
    if (index > 0) selectLesson(flatLessons[index - 1].id);
  };

  const markComplete = () => {
    completeLesson(course.id, active.id, total);
    setTimeout(next, 300);
  };

  return (
    <div className="min-h-screen pt-16 bg-ink">
      <div className="max-w-[1600px] mx-auto lg:grid lg:grid-cols-[1fr_360px]">
        {/* ======================= منطقة المشاهدة ======================= */}
        <div className="min-w-0">
          {/* شريط علوي */}
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-white/8">
            <button
              onClick={() => go(`/course/${course.id}`)}
              className="flex items-center gap-1.5 text-[12px] text-muted hover:text-white transition-colors shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">الدورة</span>
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-[13.5px] font-bold text-white truncate">{course.title}</h1>
              <p className="text-[11px] text-muted truncate">{active.module}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-muted">{pct}%</span>
              <div className="w-24"><Progress value={pct} /></div>
            </div>
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              className="lg:hidden btn btn-ghost !py-1.5 !px-2.5"
              aria-label="قائمة الدروس"
            >
              <ListVideo className="w-4 h-4" />
            </button>
          </div>

          {/* المشغّل */}
          <div className="relative aspect-video bg-black group">
            <img
              src={course.image}
              alt={active.title}
              className="w-full h-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

            {/* زر التشغيل المركزي */}
            <button
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}
              className="absolute inset-0 grid place-items-center"
            >
              <span
                className={`grid place-items-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 text-ink shadow-2xl transition-all duration-300 ${
                  playing ? 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100' : 'hover:scale-105'
                }`}
              >
                {playing ? (
                  <Pause className="w-7 h-7 fill-ink" strokeWidth={0} />
                ) : (
                  <Play className="w-8 h-8 fill-ink translate-x-[2px]" strokeWidth={0} />
                )}
              </span>
            </button>

            {/* معلومات الدرس */}
            <div className="absolute top-4 right-4 left-4 flex items-start justify-between gap-3 pointer-events-none">
              <div className="bg-black/45 backdrop-blur rounded-lg px-3 py-1.5">
                <p className="text-[12px] font-bold text-white">{active.title}</p>
                <p className="text-[10.5px] text-white/60 mt-0.5">الدرس {index + 1} من {flatLessons.length} • {active.duration}</p>
              </div>
              {done && <Pill tone="free"><Check className="w-3 h-3" /> مكتمل</Pill>}
            </div>

            {/* شريط التحكم */}
            <div className="absolute bottom-0 inset-x-0 px-3 sm:px-4 pb-3 pt-8 bg-gradient-to-t from-black/85 to-transparent">
              <div className="h-1 w-full rounded-full bg-white/25 overflow-hidden mb-2.5">
                <div className="h-full brand-gradient" style={{ width: playing ? '38%' : '6%' }} />
              </div>
              <div className="flex items-center gap-3 text-white">
                <button onClick={() => setPlaying((p) => !p)} aria-label="تشغيل/إيقاف">
                  {playing ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5 fill-current" strokeWidth={0} />}
                </button>
                <button aria-label="الصوت"><Volume2 className="w-4.5 h-4.5" /></button>
                <span className="text-[11px] text-white/70 font-mono" dir="ltr">
                  {playing ? '04:12' : '00:00'} / {active.duration}
                </span>
                <div className="mr-auto flex items-center gap-3">
                  <button aria-label="الإعدادات"><Settings className="w-4.5 h-4.5" /></button>
                  <button aria-label="ملء الشاشة"><Maximize className="w-4.5 h-4.5" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* أزرار أسفل المشغّل */}
          <div className="px-4 sm:px-6 py-4 border-b border-white/8 flex flex-wrap items-center gap-2.5">
            <button
              onClick={markComplete}
              disabled={done}
              className={`btn ${done ? 'btn-quiet !text-mint !border-mint/40' : 'btn-primary'} text-[13px]`}
            >
              <Check className="w-4 h-4" />
              {done ? 'تم إكمال الدرس' : 'علّم كمكتمل'}
            </button>
            <div className="mr-auto flex items-center gap-2">
              <button onClick={prev} disabled={index === 0} className="btn btn-ghost !py-2 !px-3 text-[12.5px] disabled:opacity-40">
                <ChevronLeft className="w-4 h-4 rotate-180" />
                السابق
              </button>
              <button
                onClick={next}
                disabled={index === flatLessons.length - 1}
                className="btn btn-ghost !py-2 !px-3 text-[12.5px] disabled:opacity-40"
              >
                التالي
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* وصف الدرس */}
          <div className="px-4 sm:px-6 py-5">
            <h2 className="text-[15px] font-extrabold text-white mb-2">عن هذا الدرس</h2>
            <p className="text-[13px] text-white/65 leading-relaxed">
              في هذا الدرس نتناول «{active.title}» ضمن وحدة «{active.module}». ستتعرّف على المفاهيم الأساسية
              مع أمثلة عملية وتمارين قصيرة تساعدك على التطبيق الفوري. يمكنك إعادة المشاهدة في أي وقت.
            </p>
            {pct >= 100 && (
              <div className="mt-4 flex items-center gap-3 card p-4 border-mint/30">
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-mint/15 text-mint">
                  <Award className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-[13px] font-bold text-white">أكملت الدورة! 🎉</p>
                  <p className="text-[11.5px] text-muted">شهادتك جاهزة في صفحة «مساراتي».</p>
                </div>
                <button onClick={() => go('/my-learning')} className="btn btn-ghost !py-2 !px-3 text-[12px] mr-auto">
                  عرض الشهادة
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ======================= قائمة الدروس ======================= */}
        <aside
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } lg:block border-r border-white/8 bg-ink-2/60 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto`}
        >
          <div className="p-4 border-b border-white/8">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-extrabold text-white">محتوى الدورة</h2>
              <span className="text-[11px] text-muted">{flatLessons.length} درس</span>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <Progress value={pct} />
              <span className="text-[10.5px] text-muted shrink-0">{pct}%</span>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {course.curriculum.map((mod, mi) => (
              <div key={mod.title}>
                <div className="px-4 py-2.5 bg-white/[0.02]">
                  <p className="text-[11px] font-bold text-white/55">
                    الوحدة {mi + 1} • {mod.title}
                  </p>
                </div>
                <ul>
                  {mod.lessons.map((l) => {
                    const isActive = l.id === active.id;
                    const isDone = completedLessons.includes(l.id);
                    const locked = !l.free && !user && !isDone;
                    return (
                      <li key={l.id}>
                        <button
                          onClick={() => !locked && selectLesson(l.id)}
                          disabled={locked}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-right transition-colors ${
                            isActive
                              ? 'bg-accent/12 border-r-2 border-accent'
                              : locked
                              ? 'opacity-55 cursor-not-allowed'
                              : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          {locked ? (
                            <span className="grid place-items-center w-6 h-6 rounded-full bg-white/8 text-muted shrink-0">
                              <Lock className="w-3 h-3" />
                            </span>
                          ) : (
                            <LessonState done={isDone} />
                          )}
                          <span className={`flex-1 min-w-0 text-[12.5px] truncate ${isActive ? 'text-white font-semibold' : 'text-white/70'}`}>
                            {l.title}
                          </span>
                          <span className="text-[10.5px] text-muted shrink-0">{l.duration}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="p-4">
            <p className="text-[13px] text-muted leading-relaxed">خصّص ٢٠ دقيقة يومياً وأكمل درساً واحداً على الأقل. الاستمرارية أهم من السرعة.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Player;
