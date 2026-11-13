import React, { useState } from 'react';
import { useAuth } from '../../../features/auth/AuthProvider';
import { useCurriculum } from '../../curriculum/ui/CurriculumProvider';
import { resolveRequest } from '../application/requests';
import { supportRepository } from '../infrastructure/container';
import type { SupportRequest } from '../domain/entities';

const when = (iso: string) => new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });

/** صندوق طلبات الدعم: قيد الانتظار والمنتهية. الموافقة تنفّذ التعديل على حساب الطالب. */
export const SupportInbox: React.FC = () => {
  const { user, applyProfileChange } = useAuth();
  const { config, gradeName } = useCurriculum();
  const [list, setList] = useState<SupportRequest[]>(() => supportRepository.list());
  const [tab, setTab] = useState<'pending' | 'done'>('pending');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const termName = (id?: string) => config.terms.find((t) => t.id === id)?.name;

  const act = (r: SupportRequest, decision: 'approved' | 'rejected') => {
    setError(null);
    if (decision === 'approved') {
      const err = applyProfileChange(r.studentEmail, { gradeId: r.requestedGradeId, termId: r.requestedTermId });
      if (err) return setError(err);
    }
    const res = resolveRequest(supportRepository.list(), r.id, decision, user?.name ?? '', notes[r.id] ?? '', new Date());
    if (!res.ok) return setError(res.error);
    supportRepository.save(res.value.list); setList(res.value.list);
  };

  const shown = list.filter((r) => (tab === 'pending' ? r.status === 'pending' : r.status !== 'pending'));
  const pending = list.filter((r) => r.status === 'pending').length;

  return (
    <>
      <div className="flex gap-6 border-b border-white/10" role="tablist">
        {([['pending', `قيد الانتظار (${pending.toLocaleString('ar-EG')})`], ['done', 'المنتهية']] as const).map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`h-[var(--tap)] -mb-px text-[15px] font-medium border-b-2 ${tab === k ? 'text-white border-accent' : 'text-white/55 border-transparent hover:text-white'}`}>{label}</button>
        ))}
      </div>
      {error && <p role="alert" className="mt-3 text-[14px] text-[#ff8a8a]">{error}</p>}
      {shown.length === 0 ? <p className="text-muted py-8">{tab === 'pending' ? 'لا توجد طلبات قيد الانتظار.' : 'لا توجد طلبات منتهية.'}</p> : (
        <ul>
          {shown.map((r) => (
            <li key={r.id} className="py-4 border-b border-white/10">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[16px] font-bold text-white">{r.studentName} <span className="text-[13px] font-normal text-muted" dir="ltr">{r.studentEmail}</span></p>
                <span className="text-[13px] text-muted">{when(r.createdAt)}</span>
              </div>
              <p className="text-[15px] text-white/90 mt-1">
                من {[gradeName(r.currentGradeId), termName(r.currentTermId)].filter(Boolean).join(' — ') || '—'} إلى <b>{[r.requestedGradeId ? gradeName(r.requestedGradeId) : null, r.requestedTermId ? termName(r.requestedTermId) : null].filter(Boolean).join(' — ')}</b>
              </p>
              <p className="text-[14px] text-white/70 mt-1">السبب: {r.reason}</p>
              {r.status === 'pending' ? (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <input className="field flex-1 min-w-[200px]" placeholder="ملاحظة للطالب (اختياري)" aria-label="ملاحظة" value={notes[r.id] ?? ''} onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))} />
                  <button onClick={() => act(r, 'approved')} className="btn btn-primary !h-10 !px-5 !text-[15px]">موافقة وتنفيذ</button>
                  <button onClick={() => act(r, 'rejected')} className="btn btn-ghost !h-10 !px-5 !text-[15px]">رفض</button>
                </div>
              ) : (
                <p className={`text-[14px] font-semibold mt-2 ${r.status === 'approved' ? 'text-mint' : 'text-[#ff8a8a]'}`}>{r.status === 'approved' ? 'تمت الموافقة' : 'مرفوض'} بواسطة {r.resolvedBy}{r.note ? ` — ${r.note}` : ''}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
