import React, { useMemo, useState } from 'react';
import { PageHeader } from '../../shared/studio/StudioShell';
import { LineChart, PeriodTabs, num } from '../../shared/studio/charts';
import { demoSeries } from '../../modules/analytics/infrastructure/demoSeries';
import { lastDays, summarize } from '../../modules/analytics/domain/series';
import { teacherRows } from './data';

const FinancePage: React.FC = () => {
  const [days, setDays] = useState(28);
  const revenue = useMemo(() => demoSeries('platform:revenue', 180, 2400), []);
  const s = summarize(revenue, days);
  const rows = teacherRows();
  const sum = rows.reduce((n, r) => n + r.revenue30, 0) || 1;
  return (
    <>
      <PageHeader title="المالية" sub="إيرادات الاشتراكات على مستوى المنصة." />
      <PeriodTabs value={days} onChange={setDays} />
      <p className="mt-3 text-[34px] md:text-[42px] font-extrabold text-white tabular-nums leading-tight">{num(s.total)} ج.م</p>
      <p className={`text-[14px] ${s.deltaPct >= 0 ? 'text-mint' : 'text-[#ff8a8a]'}`}>{s.deltaPct >= 0 ? '▲' : '▼'} {num(Math.abs(s.deltaPct))}٪ عن الفترة السابقة</p>
      <div className="mt-5"><LineChart points={lastDays(revenue, days)} label="الإيرادات" unit=" ج.م" /></div>
      <section className="mt-10 max-w-2xl">
        <h2 className="text-white">توزيع المبيعات حسب المدرّس (٣٠ يوماً)</h2>
        <ul className="mt-2">
          {rows.map((r) => (
            <li key={r.name} className="flex items-center gap-3 min-h-[52px] py-2 border-b border-white/10">
              <span className="flex-1 text-[15px] text-white truncate">{r.name}</span>
              <span className="text-[13px] text-muted tabular-nums">{num(Math.round((r.revenue30 / sum) * 100))}٪</span>
              <span className="w-28 text-end text-[15px] font-semibold text-white tabular-nums">{num(r.revenue30)} ج.م</span>
            </li>
          ))}
        </ul>
      </section>
      <p className="text-[13px] text-faint mt-8">الأرقام تجريبية. التسويات والسحب تُضاف مع ربط بوابة الدفع.</p>
    </>
  );
};

export default FinancePage;
