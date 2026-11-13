import React from 'react';
import { PageHeader } from '../../shared/studio/StudioShell';
import { DataTable, num } from '../../shared/studio/charts';
import { teacherRows } from './data';

const TeachersPage: React.FC = () => {
  const rows = teacherRows();
  return (
    <>
      <PageHeader title="المدرّسون" sub={`${num(rows.length)} مدرّساً على المنصة.`} />
      <DataTable rows={rows} rowKey={(t) => t.name} cols={[
        { label: 'المدرّس', render: (t) => <span className="text-white">{t.name}</span> },
        { label: 'الكورسات', render: (t) => num(t.courses), hideOnMobile: true },
        { label: 'الطلاب', render: (t) => num(t.students), hideOnMobile: true },
        { label: 'مبيعات ٣٠ يوماً', render: (t) => `${num(t.revenue30)} ج.م`, align: 'end' },
      ]} />
      <p className="text-[13px] text-faint mt-8">إضافة المدرّسين وتعطيلهم تُضاف مع ربط المصادقة بقاعدة البيانات.</p>
    </>
  );
};

export default TeachersPage;
