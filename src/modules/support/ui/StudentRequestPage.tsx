import React, { useState } from 'react';
import { go } from '../../../shared/lib/router';
import { useAuth } from '../../../features/auth/AuthProvider';
import { useCurriculum } from '../../curriculum/ui/CurriculumProvider';
import { AcademicPicker, type Academic } from '../../curriculum/ui/AcademicPicker';
import { createRequest } from '../application/requests';
import { REASON_MAX } from '../domain/entities';
import { supportRepository } from '../infrastructure/container';

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'قيد المراجعة', cls: 'text-gold' },
  approved: { label: 'تمت الموافقة', cls: 'text-mint' },
  rejected: { label: 'مرفوض', cls: 'text-[#ff8a8a]' },
};

/** صفحة الطالب: السنة والترم الحاليان للعرض فقط، ونموذج طلب تعديل يصل لفريق الدعم. */
const StudentRequestPage: React.FC = () => {
  const { user } = useAuth();
  const { config, gradeName } = useCurriculum();
  const [target, setTarget] = useState<Academic>({ gradeId: user?.gradeId, termId: user?.termId });
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [version, setVersion] = useState(0);

  const top = { paddingTop: 'calc(var(--topbar-h) + env(safe-area-inset-top, 0px) + 24px)' };
  if (!user || user.role !== 'student') {
    return <div className="gutter min-h-[60vh]" style={top}><p className="text-muted">هذه الصفحة للطلاب فقط.</p></div>;
  }
  const mine = supportRepository.list().filter((r) => r.studentEmail === user.email);
  const termName = (id?: string) => config.terms.find((t) => t.id === id)?.name;

  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const r = createRequest(supportRepository.list(), { student: user, requestedGradeId: target.gradeId, requestedTermId: target.termId, reason }, new Date());
    if (!r.ok) return setError(r.error);
    supportRepository.save(r.value); setSent(true); setReason(''); setVersion((v) => v + 1);
  };

  return (
    <div className="gutter pb-12 max-w-xl mx-auto" style={top} data-v={version}>
      <h1 className="text-[30px] md:text-[38px]">طلب تعديل السنة أو الترم</h1>
      <p className="text-muted mt-2">سنتك الدراسية وترمك يُحدَّدان عند التسجيل ولا يمكنك تغييرهما بنفسك. أرسل طلباً لفريق الدعم وسيراجعه وينفّذه.</p>

      <div className="mt-6 py-4 border-y border-white/10 text-[15px]">
        <div className="flex justify-between py-1"><span className="text-muted">السنة الحالية</span><span className="font-semibold text-white">{gradeName(user.gradeId) || '—'}</span></div>
        {config.termsEnabled && <div className="flex justify-between py-1"><span className="text-muted">الترم الحالي</span><span className="font-semibold text-white">{termName(user.termId) ?? '—'}</span></div>}
      </div>

      <form onSubmit={submit} className="mt-6" noValidate>
        <h2 className="text-[18px] text-white mb-3">المطلوب بعد التعديل</h2>
        <AcademicPicker value={target} onChange={setTarget} />
        <label htmlFor="why" className="block text-[15px] font-bold text-white mt-6 mb-1">سبب الطلب</label>
        <textarea id="why" rows={3} maxLength={REASON_MAX} value={reason} onChange={(e) => setReason(e.target.value)} className="field resize-y" placeholder="مثال: سجّلت في السنة الخطأ" />
        {error && <p role="alert" className="mt-3 text-[14px] text-[#ff8a8a]">{error}</p>}
        {sent && <p role="status" className="mt-3 text-[14px] text-mint">تم إرسال طلبك لفريق الدعم. ستجد حالته بالأسفل.</p>}
        <div className="btn-pair mt-5">
          <button type="submit" className="btn btn-primary btn-lg">إرسال الطلب</button>
          <button type="button" onClick={() => go('/')} className="btn btn-ghost btn-lg">رجوع</button>
        </div>
      </form>

      <section className="mt-10">
        <h2 className="text-[18px] text-white">طلباتي</h2>
        {mine.length === 0 ? <p className="text-muted mt-2">لا توجد طلبات بعد.</p> : (
          <ul className="mt-2">
            {mine.map((r) => (
              <li key={r.id} className="py-3 border-b border-white/10">
                <div className="flex justify-between gap-3"><span className="text-[15px] text-white">{[r.requestedGradeId && gradeName(r.requestedGradeId), termName(r.requestedTermId)].filter(Boolean).join(' — ')}</span><span className={`text-[14px] font-semibold ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span></div>
                <p className="text-[13px] text-muted mt-0.5">{r.reason}</p>
                {r.note && <p className="text-[13px] text-white/70 mt-0.5">ردّ الدعم: {r.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default StudentRequestPage;
