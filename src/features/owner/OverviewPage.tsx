import React, { useMemo, useState } from 'react';
import { go } from '../../shared/lib/router';
import { PageHeader } from '../../shared/studio/StudioShell';
import { LineChart, MetricTabs, PeriodTabs, num, type MetricDef } from '../../shared/studio/charts';
import { demoSeries } from '../../modules/analytics/infrastructure/demoSeries';
import { lastDays, summarize } from '../../modules/analytics/domain/series';
import { teacherRows } from './data';

const OverviewPage: React.FC = () => {
  const [days, setDays] = useState(28);
  const [metric, setMetric] = useState('revenue');
  const series = useMemo(() => ({
    revenue: demoSeries('platform:revenue', 180, 2400),
    students: demoSeries('platform:students', 180, 38),
    subs: demoSeries('platform:subs', 180, 64),
    topups: demoSeries('platform:topups', 180, 3100),
  }), []);
  const defs = [
    { key: 'revenue', label: 'الإيرادات', unit: ' ج.م' },
    { key: 'students', label: 'طلاب جدد' },
    { key: 'subs', label: 'اشتراكات جديدة' },
    { key: 'topups', label: 'شحن المحفظة', unit: ' ج.م' },
  ] as const;
  const metrics: MetricDef[] = defs.map((d) => { const s = summarize(series[d.key], days); return { key: d.key, label: d.label, value: s.total, deltaPct: s.deltaPct, unit: 'unit' in d ? d.unit : undefined }; });
  const current = defs.find((d) => d.key === metric) ?? defs[0];
  const top = teacherRows().slice(0, 5);

  return (
    <>
      <PageHeader title="نظرة عامة" sub="أداء المنصة كلها." />
      <PeriodTabs value={days} onChange={setDays} />
      <div className="mt-2"><MetricTabs metrics={metrics} value={current.key} onChange={setMetric} /></div>
      <div className="mt-5"><LineChart points={lastDays(series[current.key], days)} label={current.label} unit={'unit' in current ? current.unit : ''} /></div>
      <section className="mt-10 max-w-2xl">
        <div className="flex items-center justify-between"><h2 className="text-white">أعلى المدرّسين مبيعاً (٣٠ يوماً)</h2><button onClick={() => go('/owner/teachers')} className="h-[var(--tap)] px-1 text-[15px] font-semibold text-accent">الكل</button></div>
        <ol className="mt-2">
          {top.map((t, i) => (
            <li key={t.name} className="flex items-center gap-3 min-h-[56px] py-2 border-b border-white/10">
              <span className="w-5 text-[15px] font-bold text-white/40 tabular-nums">{num(i + 1)}</span>
              <span className="flex-1 min-w-0"><span className="block text-[15px] text-white truncate">{t.name}</span><span className="block text-[13px] text-muted">{num(t.courses)} كورس</span></span>
              <span className="text-[15px] font-semibold text-white tabular-nums">{num(t.revenue30)} ج.م</span>
            </li>
          ))}
        </ol>
      </section>
      <p className="text-[13px] text-faint mt-10">الأرقام تجريبية إلى أن تُربط المنصة بقاعدة بيانات حقيقية.</p>
    </>
  );
};

export default OverviewPage;
