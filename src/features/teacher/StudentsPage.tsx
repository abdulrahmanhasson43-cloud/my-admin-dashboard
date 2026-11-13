import React, { useMemo, useState } from 'react';
import { PageHeader } from '../../shared/studio/StudioShell';
import { DataTable, num } from '../../shared/studio/charts';
import { demoStudentName, stableNumber } from '../../modules/analytics/infrastructure/demoSeries';
import { useTeacherScope } from './scope';

const StudentsPage: React.FC = () => {
  const { courses } = useTeacherScope();
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(30);

  const roster = useMemo(() => {
    let i = 0;
    return courses.slice(0, 8).flatMap((c) => Array.from({ length: stableNumber(`${c.id}:n`, 4, 9) }, () => {
      const idx = i++;
      return { id: `${c.id}-${idx}`, name: demoStudentName(idx), course: c.title, progress: stableNumber(`${c.id}:${idx}:p`, 3, 100), daysLeft: stableNumber(`${c.id}:${idx}:d`, 4, 115) };
    }));
  }, [courses]);
  const rows = roster.filter((r) => r.name.includes(q.trim()));

  return (
    <>
      <PageHeader title="الطلاب" sub={`${num(roster.length)} طالباً مشتركاً في كورساتك.`} />
      <input className="field max-w-md mb-3" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث باسم الطالب" aria-label="بحث عن طالب" />
      <DataTable
        rows={rows.slice(0, limit)} rowKey={(r) => r.id}
        cols={[
          { label: 'الطالب', render: (r) => <span className="text-white">{r.name}</span> },
          { label: 'الكورس', render: (r) => r.course, hideOnMobile: true },
          { label: 'التقدّم', render: (r) => `${num(r.progress)}٪` },
          { label: 'ينتهي الاشتراك', render: (r) => <span className={r.daysLeft <= 7 ? 'text-gold' : 'text-white/80'}>بعد {num(r.daysLeft)} يوماً</span>, align: 'end' },
        ]}
      />
      {rows.length === 0 && <p className="text-muted py-6">لا يوجد طالب بهذا الاسم.</p>}
      {rows.length > limit && <button onClick={() => setLimit(limit + 30)} className="btn btn-ghost mt-4">عرض المزيد</button>}
      <p className="text-[13px] text-faint mt-8">أسماء الطلاب وأرقامهم تجريبية.</p>
    </>
  );
};

export default StudentsPage;
