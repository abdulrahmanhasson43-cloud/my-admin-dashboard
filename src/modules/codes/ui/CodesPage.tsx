import React, { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { Course } from '../../../core/entities';
import { DataTable } from '../../../shared/studio/charts';
import { PageHeader } from '../../../shared/studio/StudioShell';
import { DURATIONS, MAX_BATCH, type AccessCode } from '../domain/entities';
import { generateCodes } from '../application/codeUseCases';
import { codeRepository, randomBytes, sha256Hex } from '../infrastructure/container';

const COUNTS = [1, 5, 10, 20];
const fmt = (iso: string) => new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
const durationName = (d: number) => (d === 30 ? 'شهر' : d === 90 ? '٣ شهور' : d === 120 ? 'ترم (٤ شهور)' : 'سنة');

/** توليد أكواد الاشتراك وعرض حالتها. الكود الخام يظهر مرة واحدة فقط ولا يُحفظ. */
export const CodesPage: React.FC<{ courses: Course[]; createdBy: string }> = ({ courses, createdBy }) => {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '');
  const [days, setDays] = useState<number>(120);
  const [count, setCount] = useState(10);
  const [fresh, setFresh] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [all, setAll] = useState<AccessCode[]>(() => codeRepository.list());
  const ids = useMemo(() => new Set(courses.map((c) => c.id)), [courses]);
  const mine = all.filter((c) => ids.has(c.courseId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const titleOf = (id: string) => courses.find((c) => c.id === id)?.title ?? id;

  const generate = async () => {
    setError(null); setCopied(false);
    const r = await generateCodes({ courseId, days, count, createdBy }, new Date(), sha256Hex, randomBytes);
    if (!r.ok) return setError(r.error);
    const next = [...codeRepository.list(), ...r.value.records];
    codeRepository.save(next); setAll(next); setFresh(r.value.raw);
  };
  const copy = async () => { try { await navigator.clipboard.writeText((fresh ?? []).join('\n')); setCopied(true); } catch { setError('تعذّر النسخ. انسخ الأكواد يدوياً.'); } };

  const chip = (active: boolean) => `h-11 px-5 shrink-0 rounded-full text-[15px] font-semibold transition-colors ${active ? 'bg-white text-ink' : 'bg-white/10 text-white hover:bg-white/15'}`;

  return (
    <>
      <PageHeader title="الأكواد" sub="ولّد أكواد اشتراك لطلابك. كل كود يُفعَّل مرة واحدة فقط." />
      {courses.length === 0 ? <p className="text-muted">لا توجد كورسات لتوليد أكواد لها.</p> : (
        <section className="max-w-xl">
          <label className="block text-[14px] font-semibold text-muted mb-1" htmlFor="code-course">الكورس</label>
          <select id="code-course" value={courseId} onChange={(e) => setCourseId(e.target.value)} className="field !bg-transparent">
            {courses.map((c) => <option key={c.id} value={c.id} className="bg-surface">{c.title}</option>)}
          </select>
          <p className="text-[14px] font-semibold text-muted mt-6 mb-2">مدة الاشتراك</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar" role="radiogroup" aria-label="مدة الاشتراك">
            {DURATIONS.map((d) => <button key={d} role="radio" aria-checked={days === d} onClick={() => setDays(d)} className={chip(days === d)}>{durationName(d)}</button>)}
          </div>
          <p className="text-[14px] font-semibold text-muted mt-6 mb-2">عدد الأكواد</p>
          <div className="flex gap-2" role="radiogroup" aria-label="عدد الأكواد">
            {COUNTS.filter((n) => n <= MAX_BATCH).map((n) => <button key={n} role="radio" aria-checked={count === n} onClick={() => setCount(n)} className={chip(count === n)}>{n.toLocaleString('ar-EG')}</button>)}
          </div>
          {error && <p role="alert" className="text-[14px] text-[#ff8a8a] mt-3">{error}</p>}
          <button onClick={generate} className="btn btn-primary btn-lg w-full mt-6">ولّد {count.toLocaleString('ar-EG')} {count === 1 ? 'كود' : 'أكواد'}</button>
        </section>
      )}

      {fresh && (
        <section className="mt-8 max-w-xl" aria-label="الأكواد الجديدة">
          <h2 className="text-white">أكوادك الجديدة</h2>
          <p className="text-[14px] text-gold mt-1">احفظها الآن: لن تظهر مرة أخرى لأننا لا نخزّن الكود نفسه.</p>
          <ul className="mt-3 font-mono tracking-wider text-[16px] text-white" dir="ltr">
            {fresh.map((c) => <li key={c} className="py-2 border-b border-white/10">{c}</li>)}
          </ul>
          <button onClick={copy} className="btn btn-ghost mt-4">{copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}{copied ? 'تم النسخ' : 'نسخ الكل'}</button>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-white mb-2">سجلّ الأكواد</h2>
        {mine.length === 0 ? <p className="text-muted">لم تولّد أكواداً بعد.</p> : (
          <DataTable
            rows={mine.slice(0, 60)} rowKey={(r) => r.id}
            cols={[
              { label: 'الكود', render: (r) => <span className="font-mono text-white/80" dir="ltr">••••-••••-{r.hint}</span> },
              { label: 'الكورس', render: (r) => titleOf(r.courseId), hideOnMobile: true },
              { label: 'المدة', render: (r) => durationName(r.days), hideOnMobile: true },
              { label: 'الحالة', render: (r) => (r.redeemedBy ? <span className="text-muted">مستخدم {fmt(r.redeemedAt!)}</span> : <span className="text-mint">متاح</span>) },
            ]}
          />
        )}
      </section>
    </>
  );
};
