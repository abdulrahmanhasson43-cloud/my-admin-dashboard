import React, { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { COURSES } from '../../../data/catalog';
import { go, useRoute } from '../../../shared/lib/router';
import { useAuth } from '../../../features/auth/AuthProvider';
import { useCurriculum } from '../../curriculum/ui/CurriculumProvider';
import { useSite } from '../../site/ui/SiteProvider';
import { useWallet, egp } from './WalletProvider';
import { ALL_TERMS } from '../domain/entities';
import { daysLeft, isActive } from '../domain/rules';
import { createTopupRequest } from '../application/topupRequests';
import { topupRepository } from '../infrastructure/topupRepository';
import { REFERENCE_MAX, type TopupStatus } from '../domain/topup';

const fmt = (iso: string) => new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
const STATUS: Record<TopupStatus, { label: string; cls: string }> = {
  pending: { label: 'قيد المراجعة', cls: 'text-gold' }, approved: { label: 'تمت الموافقة', cls: 'text-mint' }, rejected: { label: 'مرفوض', cls: 'text-[#ff8a8a]' },
};

const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const { query } = useRoute();
  const { wallet, topUp } = useWallet();
  const { config } = useCurriculum();
  const { site } = useSite();
  const pay = site.payments;
  const methods = useMemo(() => pay.methods.filter((m) => m.enabled), [pay.methods]);
  const need = Number(new URLSearchParams(query).get('need')) || 0;
  const [methodId, setMethodId] = useState<string>('');
  const method = methods.find((m) => m.id === methodId) ?? methods[0];
  const [amount, setAmount] = useState<number>(0);
  const [custom, setCustom] = useState('');
  const [reference, setReference] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [version, setVersion] = useState(0);
  const now = new Date();
  const active = useMemo(() => wallet.enrollments.filter((e) => isActive(e, new Date())), [wallet.enrollments]);

  const top = { paddingTop: 'calc(var(--topbar-h) + env(safe-area-inset-top, 0px) + 20px)' };
  if (!user || user.role !== 'student') {
    return (
      <div className="gutter min-h-[70vh]" style={top}>
        <div className="max-w-md pt-10">
          <h1 className="text-[32px] md:text-[40px]">المحفظة</h1>
          <p className="text-muted mt-3">المحفظة للطلاب. سجّل دخولك بحساب طالب لشحن رصيدك والاشتراك في الكورسات.</p>
          <button onClick={() => go('/login')} className="btn btn-primary btn-lg mt-6">تسجيل الدخول</button>
        </div>
      </div>
    );
  }

  const presetDefault = need > 0 ? Math.max(method?.min ?? 10, Math.ceil(need / 10) * 10) : (pay.presets[1] ?? pay.presets[0] ?? 100);
  const value = custom ? Number(custom) : amount || presetDefault;
  const fee = method ? Math.ceil((value * method.feePct) / 100) : 0;
  const mine = topupRepository.list().filter((r) => r.studentEmail === user.email);

  const submit = () => {
    if (!method) return;
    if (method.kind === 'demo') {
      const err = topUp(value, { min: method.min, max: method.max, description: `شحن المحفظة — ${method.name}` });
      setMsg(err ? { ok: false, text: err } : { ok: true, text: `تم شحن ${egp(value)}. رصيدك الآن ${egp(wallet.balance + value)}.` });
      if (!err) setCustom('');
      return;
    }
    const r = createTopupRequest(topupRepository.list(), { studentEmail: user.email, studentName: user.name, methodId: method.id, methodName: method.name, amount: value, fee, reference, min: method.min, max: method.max }, new Date());
    if (!r.ok) return setMsg({ ok: false, text: r.error });
    topupRepository.save(r.value); setReference(''); setCustom(''); setVersion((v) => v + 1);
    setMsg({ ok: true, text: 'تم إرسال طلب الشحن. سيُضاف الرصيد بعد مراجعته وستجد حالته بالأسفل.' });
  };
  const termName = (id: string) => (id === ALL_TERMS ? 'كل الترمات' : config.terms.find((t) => t.id === id)?.name ?? '');

  return (
    <div className="gutter pb-10 max-w-3xl mx-auto" style={top} data-v={version}>
      <p className="text-[15px] text-muted">رصيد المحفظة</p>
      <p className="text-[48px] md:text-[56px] font-extrabold leading-tight text-white tabular-nums">{egp(wallet.balance)}</p>
      {need > 0 && wallet.balance < need && <p className="text-[15px] text-gold mt-1">تحتاج {egp(need - wallet.balance)} إضافية لإتمام الاشتراك.</p>}

      <section className="mt-8">
        <h2 className="text-white">اشحن رصيدك</h2>
        {!pay.enabled || methods.length === 0 ? (
          <p className="text-muted mt-2">{pay.note || 'الشحن غير متاح حالياً. يمكنك تفعيل كود اشتراك من المدرّس.'}</p>
        ) : (
          <>
            {pay.note && <p className="text-[14px] text-white/70 mt-2 max-w-[60ch]">{pay.note}</p>}
            {methods.length > 1 && (
              <div className="flex flex-wrap gap-2 mt-3" role="radiogroup" aria-label="طريقة الدفع">
                {methods.map((m) => (
                  <button key={m.id} role="radio" aria-checked={method?.id === m.id} onClick={() => { setMethodId(m.id); setMsg(null); }}
                    className={`h-11 px-5 rounded-full text-[15px] font-semibold transition-colors ${method?.id === m.id ? 'bg-white text-ink' : 'bg-white/10 text-white hover:bg-white/15'}`}>{m.name}</button>
                ))}
              </div>
            )}
            {method && (
              <>
                <div className="flex flex-wrap gap-2 mt-4" role="radiogroup" aria-label="مبلغ الشحن">
                  {pay.presets.filter((a) => a >= method.min && a <= method.max).map((a) => (
                    <button key={a} role="radio" aria-checked={!custom && (amount || presetDefault) === a} onClick={() => { setAmount(a); setCustom(''); setMsg(null); }}
                      className={`h-11 px-5 rounded-full text-[15px] font-semibold transition-colors ${!custom && (amount || presetDefault) === a ? 'bg-white text-ink' : 'bg-white/10 text-white hover:bg-white/15'}`}>
                      {a.toLocaleString('ar-EG')}
                    </button>
                  ))}
                </div>
                <input className="field mt-3 max-w-xs" inputMode="numeric" value={custom} onChange={(e) => { setCustom(e.target.value.replace(/\D/g, '')); setMsg(null); }}
                  placeholder={`أو اكتب مبلغاً (من ${method.min.toLocaleString('ar-EG')} إلى ${method.max.toLocaleString('ar-EG')})`} aria-label="مبلغ آخر" />

                {method.kind === 'manual' && (
                  <div className="mt-5 rounded-2xl bg-surface p-4 max-w-xl">
                    {method.account && <p className="text-[15px] text-white">حوّل على: <span dir="ltr" className="font-bold tabular-nums select-all">{method.account}</span>{method.holder && <span className="text-muted"> — {method.holder}</span>}</p>}
                    {method.instructions && <p className="text-[14px] text-white/75 mt-2">{method.instructions}</p>}
                    {fee > 0 && <p className="text-[14px] text-gold mt-2">رسوم الطريقة {method.feePct.toLocaleString('ar-EG')}٪: المطلوب تحويله {egp(value + fee)} ليُضاف {egp(value)} لرصيدك.</p>}
                    <input className="field mt-3" value={reference} maxLength={REFERENCE_MAX} onChange={(e) => setReference(e.target.value)} placeholder="رقم العملية أو آخر ٤ أرقام من رقم المحوِّل" aria-label="مرجع التحويل" />
                  </div>
                )}

                {msg && <p role="status" className={`mt-3 text-[14px] ${msg.ok ? 'text-mint' : 'text-[#ff8a8a]'}`}>{msg.text}</p>}
                <div className="btn-row mt-4 max-w-md">
                  <button onClick={submit} className="btn btn-primary btn-lg">{method.kind === 'demo' ? `اشحن ${egp(value || 0)}` : 'أرسل طلب الشحن'}</button>
                  <button onClick={() => go('/subscribe')} className="btn btn-ghost btn-lg">اشترك في كورس</button>
                </div>
                {method.kind === 'demo' && <p className="text-[13px] text-faint mt-2 max-w-[56ch]">{method.instructions}</p>}
              </>
            )}
          </>
        )}
        {site.features.codes && <button onClick={() => go('/redeem')} className="h-[var(--tap)] mt-2 text-[15px] font-semibold text-accent">عندي كود من المدرّس</button>}
      </section>

      {mine.length > 0 && (
        <section className="mt-10">
          <h2 className="text-white">طلبات الشحن</h2>
          <ul className="mt-2">
            {mine.map((r) => (
              <li key={r.id} className="py-3 border-b border-white/10">
                <div className="flex justify-between gap-3"><span className="text-[15px] text-white">{r.methodName} — {egp(r.amount)}</span><span className={`text-[14px] font-semibold ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span></div>
                <p className="text-[13px] text-muted mt-0.5">{fmt(r.createdAt)}</p>
                {r.note && <p className="text-[13px] text-white/70 mt-0.5">ملاحظة: {r.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-white">اشتراكاتي</h2>
        {active.length === 0 ? <p className="text-muted mt-2">لا توجد اشتراكات فعّالة. اختر كورساً واشترك من رصيدك.</p> : (
          <ul className="mt-2">
            {active.map((e) => {
              const c = COURSES.find((x) => x.id === e.courseId);
              return (
                <li key={e.id}>
                  <button onClick={() => go(`/course/${e.courseId}`)} className="w-full min-h-[64px] flex items-center justify-between gap-4 py-3 text-start border-b border-white/10">
                    <span className="min-w-0">
                      <span className="block font-semibold text-white truncate">{c?.title ?? e.courseId}</span>
                      <span className="block text-[13px] text-muted">{termName(e.termId)} مع {c?.instructor}</span>
                    </span>
                    <span className="text-[13px] text-muted shrink-0 text-end">ينتهي {fmt(e.endsAt)}<br />متبقي {daysLeft(e, now).toLocaleString('ar-EG')} يوماً</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-white">سجلّ العمليات</h2>
        {wallet.transactions.length === 0 ? <p className="text-muted mt-2">لا توجد عمليات بعد.</p> : (
          <ul className="mt-2">
            {wallet.transactions.map((t) => {
              const plus = t.type === 'topup' || t.type === 'refund' || t.type === 'grant';
              return (
                <li key={t.id} className="flex items-center gap-3 min-h-[60px] py-2 border-b border-white/10">
                  <span className={`grid place-items-center w-9 h-9 rounded-full shrink-0 ${plus ? 'bg-mint/15 text-mint' : 'bg-white/10 text-white/80'}`}>{plus ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}</span>
                  <span className="min-w-0 flex-1"><span className="block text-[15px] text-white truncate">{t.description}</span><span className="block text-[13px] text-muted">{fmt(t.at)}</span></span>
                  <span className={`text-[16px] font-bold tabular-nums ${plus ? 'text-mint' : 'text-white'}`}>{t.type === 'grant' ? 'بكود' : `${plus ? '+' : '−'}${egp(t.amount)}`}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default WalletPage;
