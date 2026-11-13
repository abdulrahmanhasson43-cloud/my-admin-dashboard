import React, { useMemo, useState } from 'react';
import { go } from '../../shared/lib/router';
import { PageHeader } from '../../shared/studio/StudioShell';
import { LineChart, MetricTabs, PeriodTabs, num, type MetricDef } from '../../shared/studio/charts';
import { demoSeries, stableNumber } from '../../modules/analytics/infrastructure/demoSeries';
import { lastDays, summarize } from '../../modules/analytics/domain/series';
import { useTeacherScope } from './scope';

export const completionOf = (courseId: string) => stableNumber(`${courseId}:completion`, 28, 88);
export const viewsOf = (courseId: string) => stableNumber(`${courseId}:views`, 240, 4200);

const OverviewPage: React.FC = () => {
  const { teacherName, courses, isAssistant } = useTeacherScope();
  const [days, setDays] = useState(28);
  const [metric, setMetric] = useState('views');

  const series = useMemo(() => {
    const base = stableNumber(teacherName, 60, 140);
    const avg = courses.length ? Math.round(courses.reduce((n, c) => n + c.termPrice, 0) / courses.length) : 150;
    const students = demoSeries(`${teacherName}:students`, 180, Math.max(2, Math.round(base / 18)));
    return {
      views: demoSeries(`${teacherName}:views`, 180, base),
      students,
      lessons: demoSeries(`${teacherName}:lessons`, 180, Math.round(base * 0.35)),
      revenue: students.map((p) => ({ date: p.date, value: p.value * avg })),
    };
  }, [teacherName, courses]);

  const defs: { key: keyof typeof series; label: string; unit?: string }[] = [
    { key: 'views', label: 'المشاهدات' },
    { key: 'students', label: 'طلاب جدد' },
    { key: 'lessons', label: 'دروس مكتملة' },
    ...(isAssistant ? [] : [{ key: 'revenue' as const, label: 'الأرباح', unit: ' ج.م' }]),
  ];
  const metrics: MetricDef[] = defs.map((d) => { const s = summarize(series[d.key], days); return { key: d.key, label: d.label, value: s.total, deltaPct: s.deltaPct, unit: d.unit }; });
  const current = defs.find((d) => d.key === metric) ?? defs[0];

  const top = [...courses].sort((a, b) => viewsOf(b.id) - viewsOf(a.id)).slice(0, 5);
  const lowCompletion = courses.filter((c) => completionOf(c.id) < 40).length;
  const expiring = stableNumber(`${teacherName}:expiring`, 3, 14);

  return (
    <>
      <PageHeader title={`أهلاً ${teacherName.split(' ')[0] || ''}`} sub="هذه نظرة سريعة على أداء كورساتك."
        action={<button onClick={() => go('/teacher/codes')} className="btn btn-primary !h-11 !px-5 !text-[15px]">+ توليد أكواد</button>} />
      <PeriodTabs value={days} onChange={setDays} />
      <div className="mt-2"><MetricTabs metrics={metrics} value={current.key} onChange={setMetric} /></div>
      <div className="mt-5"><LineChart points={lastDays(series[current.key], days)} label={current.label} unit={current.unit} /></div>

      <div className="grid lg:grid-cols-2 gap-x-14 gap-y-10 mt-10">
        <section>
          <h2 className="text-white">أكثر كورساتك مشاهدة</h2>
          {top.length === 0 ? <p className="text-muted mt-2">لا توجد كورسات بعد.</p> : (
            <ol className="mt-2">
              {top.map((c, i) => (
                <li key={c.id}>
                  <button onClick={() => go('/teacher/content')} className="w-full min-h-[56px] flex items-center gap-3 py-2 text-start border-b border-white/10">
                    <span className="w-5 text-[15px] font-bold text-white/40 tabular-nums">{num(i + 1)}</span>
                    <span className="flex-1 min-w-0"><span className="block text-[15px] text-white truncate">{c.title}</span><span className="block text-[13px] text-muted">إكمال {num(completionOf(c.id))}٪</span></span>
                    <span className="text-[15px] font-semibold text-white tabular-nums">{num(viewsOf(c.id))}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>
        <section>
          <h2 className="text-white">يحتاج انتباهك</h2>
          <ul className="mt-2">
            <li><button onClick={() => go('/teacher/students')} className="w-full min-h-[56px] flex items-center justify-between gap-3 py-2 text-start border-b border-white/10"><span className="text-[15px] text-white">{num(expiring)} اشتراكات تنتهي خلال ٧ أيام</span><span className="text-[14px] text-accent font-semibold">عرض الطلاب</span></button></li>
            <li><button onClick={() => go('/teacher/content')} className="w-full min-h-[56px] flex items-center justify-between gap-3 py-2 text-start border-b border-white/10"><span className="text-[15px] text-white">{num(lowCompletion)} كورسات نسبة إكمالها أقل من ٤٠٪</span><span className="text-[14px] text-accent font-semibold">عرض المحتوى</span></button></li>
          </ul>
        </section>
      </div>
      <p className="text-[13px] text-faint mt-10">الأرقام في هذه اللوحة تجريبية إلى أن تُربط المنصة بقاعدة بيانات حقيقية.</p>
    </>
  );
};

export default OverviewPage;
