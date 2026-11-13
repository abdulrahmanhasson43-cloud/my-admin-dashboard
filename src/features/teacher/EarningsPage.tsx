import React, { useMemo, useState } from 'react';
import { PageHeader } from '../../shared/studio/StudioShell';
import { LineChart, PeriodTabs, num } from '../../shared/studio/charts';
import { demoSeries, demoStudentName, stableNumber } from '../../modules/analytics/infrastructure/demoSeries';
import { lastDays, summarize } from '../../modules/analytics/domain/series';
import { useTeacherScope } from './scope';

const EarningsPage: React.FC = () => {
  const { teacherName, courses, isAssistant } = useTeacherScope();
  const [days, setDays] = useState(28);
  const avg = courses.length ? Math.round(courses.reduce((n, c) => n + c.termPrice, 0) / courses.length) : 150;
  const revenue = useMemo(() => demoSeries(`${teacherName}:students`, 180, Math.max(2, Math.round(stableNumber(teacherName, 60, 140) / 18))).map((p) => ({ date: p.date, value: p.value * avg })), [teacherName, avg]);
  const s = summarize(revenue, days);
  const recent = useMemo(() => courses.slice(0, 8).map((c, i) => ({ id: c.id, who: demoStudentName(100 + i), title: c.title, amount: c.termPrice, ago: stableNumber(`${c.id}:ago`, 0, 6) })), [courses]);

  if (isAssistant) return <><PageHeader title="الأرباح" /><p className="text-muted">هذه الصفحة للمدرّس فقط.</p></>;
  const dateAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });

  return (
    <>
      <PageHeader title="الأرباح" sub="إجمالي مبيعات اشتراكاتك." />
      <PeriodTabs value={days} onChange={setDays} />
      <p className="mt-3 text-[34px] md:text-[42px] font-extrabold text-white tabular-nums leading-tight">{num(s.total)} ج.م</p>
      <p className={`text-[14px] ${s.deltaPct >= 0 ? 'text-mint' : 'text-[#ff8a8a]'}`}>{s.deltaPct >= 0 ? '▲' : '▼'} {num(Math.abs(s.deltaPct))}٪ عن الفترة السابقة</p>
      <div className="mt-5"><LineChart points={lastDays(revenue, days)} label="الأرباح" unit=" ج.م" /></div>
      <section className="mt-10">
        <h2 className="text-white">أحدث الاشتراكات</h2>
        <ul className="mt-2">
          {recent.map((r) => (
            <li key={r.id} className="flex items-center gap-3 min-h-[56px] py-2 border-b border-white/10">
              <span className="flex-1 min-w-0"><span className="block text-[15px] text-white truncate">{r.who}</span><span className="block text-[13px] text-muted truncate">{r.title}</span></span>
              <span className="text-[13px] text-muted">{dateAgo(r.ago)}</span>
              <span className="text-[15px] font-semibold text-mint tabular-nums">+{num(r.amount)} ج.م</span>
            </li>
          ))}
        </ul>
      </section>
      <p className="text-[13px] text-faint mt-8">الأرقام تجريبية إلى أن تُربط المنصة ببوابة الدفع.</p>
    </>
  );
};

export default EarningsPage;
