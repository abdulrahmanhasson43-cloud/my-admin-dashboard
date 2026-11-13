import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { PageHeader } from '../../shared/studio/StudioShell';
import { useAuth, type StaffRole } from '../auth/AuthProvider';

const ROLE_LABEL: Record<StaffRole, string> = { teacher: 'مدرّس', assistant: 'مشرف (مساعد المدرّس)', support: 'فريق الدعم' };

/** حسابات الفريق (مدرّس، مشرف، دعم) يُنشئها المالك وحده. التسجيل الذاتي لا ينشئ إلا حساب طالب. */
const TeamPage: React.FC = () => {
  const { listStaff, createStaff, removeStaff } = useAuth();
  const [rows, setRows] = useState(() => listStaff());
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'support' as StaffRole });
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const refresh = () => setRows(listStaff());

  const add = (e: React.FormEvent) => {
    e.preventDefault(); setOk(false);
    const err = createStaff(form); setError(err);
    if (!err) { setForm({ name: '', email: '', password: '', role: form.role }); setOk(true); refresh(); }
  };

  return (
    <>
      <PageHeader title="الفريق" sub="أنت المالك الوحيد (سوبر أدمن). أنشئ هنا حسابات المدرّس والمشرف وفريق الدعم." />
      <h2 className="text-white text-[18px]">إضافة عضو</h2>
      <form onSubmit={add} className="mt-2 grid md:grid-cols-2 gap-x-8 gap-y-1 max-w-3xl" noValidate>
        <input className="field" placeholder="الاسم" aria-label="اسم العضو" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="field" placeholder="البريد الإلكتروني" aria-label="بريد العضو" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="field" placeholder="كلمة المرور (٨ أحرف على الأقل)" aria-label="كلمة مرور العضو" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="field bg-transparent" aria-label="نوع الحساب" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as StaffRole })}>
          {(Object.keys(ROLE_LABEL) as StaffRole[]).map((r) => <option key={r} value={r} className="bg-surface">{ROLE_LABEL[r]}</option>)}
        </select>
        <div className="md:col-span-2 mt-2">
          {error && <p role="alert" className="text-[14px] text-[#ff8a8a] mb-2">{error}</p>}
          {ok && <p role="status" className="text-[14px] text-mint mb-2">تم إنشاء الحساب.</p>}
          <button type="submit" className="btn btn-primary">إنشاء الحساب</button>
        </div>
      </form>

      <h2 className="text-white text-[18px] mt-10">أعضاء الفريق</h2>
      <ul className="mt-2 max-w-3xl">
        {rows.map((r) => (
          <li key={r.email} className="flex items-center gap-3 min-h-[60px] py-2 border-b border-white/10">
            <div className="min-w-0 flex-1"><p className="text-[16px] text-white font-medium truncate">{r.name}</p><p className="text-[13px] text-muted truncate" dir="ltr" style={{ textAlign: 'start' }}>{r.email}</p></div>
            <span className="text-[14px] text-white/70 shrink-0">{ROLE_LABEL[r.role]}{r.builtIn ? ' (تجريبي)' : ''}</span>
            {!r.builtIn && <button className="icon-btn text-white/60 hover:text-[#ff8a8a]" aria-label={`حذف ${r.name}`} onClick={() => { setError(removeStaff(r.email)); refresh(); }}><Trash2 className="w-[18px] h-[18px]" /></button>}
          </li>
        ))}
      </ul>
    </>
  );
};

export default TeamPage;
