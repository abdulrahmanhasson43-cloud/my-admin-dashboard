import React, { useState } from 'react';
import type { Result } from '../../../core/result';
import { PageHeader } from '../../../shared/studio/StudioShell';
import { useAuth } from '../../../features/auth/AuthProvider';
import { useSite } from '../../site/ui/SiteProvider';
import { AddButton, Chips, Collapsible, ErrorLine, ItemTools, Row, Section, StepperRow, Switch, TextField, ToggleRow } from '../../site/ui/controls';
import { moveItem, setPayments } from '../../site/application/editSite';
import type { PaymentMethod, SiteSettings } from '../../site/domain/entities';
import { topUp as topUpUseCase } from '../application/walletUseCases';
import { resolveTopupRequest } from '../application/topupRequests';
import { walletRepository } from '../infrastructure/container';
import { topupRepository } from '../infrastructure/topupRepository';
import type { TopupRequest } from '../domain/topup';

const egp = (n: number) => `${n.toLocaleString('ar-EG')} ج.م`;
const when = (iso: string) => new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' });
const uid = () => Math.random().toString(36).slice(2, 8);

/** طلبات الشحن اليدوي: الموافقة تضيف المبلغ لمحفظة الطالب فوراً وتسجّل العملية. */
const TopupInbox: React.FC = () => {
  const [list, setList] = useState<TopupRequest[]>(() => topupRepository.list());
  const [tab, setTab] = useState<'pending' | 'done'>('pending');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const shown = list.filter((r) => (tab === 'pending' ? r.status === 'pending' : r.status !== 'pending'));
  const pending = list.filter((r) => r.status === 'pending').length;

  const act = (r: TopupRequest, status: 'approved' | 'rejected') => {
    setError(null);
    const now = new Date();
    const res = resolveTopupRequest(topupRepository.list(), r.id, status, notes[r.id] ?? '', now);
    if (!res.ok) return setError(res.error);
    if (status === 'approved') {
      const credited = topUpUseCase(walletRepository.load(r.studentEmail), r.amount, now, { min: 1, max: Number.MAX_SAFE_INTEGER, description: `شحن المحفظة — ${r.methodName}` });
      if (!credited.ok) return setError(credited.error);
      walletRepository.save(r.studentEmail, credited.value);
    }
    topupRepository.save(res.value.list); setList(res.value.list);
  };

  return (
    <Section title="طلبات الشحن" help="الطلاب الذين حوّلوا المبلغ بإحدى الطرق اليدوية. راجع الإيصال أو رقم العملية ثم وافق أو ارفض.">
      <Chips aria="حالة الطلبات" value={tab} options={[{ value: 'pending', label: `قيد المراجعة (${pending.toLocaleString('ar-EG')})` }, { value: 'done', label: 'المنتهية' }]} onChange={(v) => setTab(v as 'pending' | 'done')} />
      <div className="mt-3"><ErrorLine error={error} /></div>
      {shown.length === 0 ? <p className="text-muted mt-3">{tab === 'pending' ? 'لا توجد طلبات شحن بانتظار المراجعة.' : 'لا توجد طلبات منتهية بعد.'}</p> : (
        <ul className="divide-y divide-white/10">
          {shown.map((r) => (
            <li key={r.id} className="py-4">
              <div className="flex justify-between gap-3">
                <span className="min-w-0"><span className="block text-[16px] text-white font-semibold truncate">{r.studentName}</span><span className="block text-[13px] text-muted truncate" dir="ltr" style={{ textAlign: 'start' }}>{r.studentEmail}</span></span>
                <span className="text-[16px] font-bold text-white tabular-nums shrink-0">{egp(r.amount)}</span>
              </div>
              <p className="text-[14px] text-white/80 mt-1">{r.methodName}{r.fee > 0 ? ` — شاملة رسوم ${egp(r.fee)}` : ''} — المرجع: <span dir="ltr" className="tabular-nums">{r.reference}</span></p>
              <p className="text-[13px] text-muted">{when(r.createdAt)}</p>
              {r.status === 'pending' ? (
                <>
                  <input className="field mt-2" placeholder="ملاحظة للطالب (اختياري)" aria-label="ملاحظة" value={notes[r.id] ?? ''} onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })} />
                  <div className="btn-pair mt-3 max-w-sm">
                    <button className="btn btn-primary" onClick={() => act(r, 'approved')}>موافقة وإضافة الرصيد</button>
                    <button className="btn btn-ghost" onClick={() => act(r, 'rejected')}>رفض</button>
                  </div>
                </>
              ) : <p className={`text-[14px] font-semibold mt-1 ${r.status === 'approved' ? 'text-mint' : 'text-[#ff8a8a]'}`}>{r.status === 'approved' ? 'تمت الموافقة' : 'مرفوض'}{r.note ? ` — ${r.note}` : ''}</p>}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
};

/** صفحة المالك للدفع والشحن: تشغيل الشحن، طرق الدفع بكل تفاصيلها، المبالغ السريعة، وصندوق طلبات الشحن. */
const OwnerPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const { site, apply } = useSite();
  const [error, setError] = useState<string | null>(null);
  const pay = site.payments, methods = pay.methods;
  const save = (r: Result<SiteSettings> | SiteSettings) => setError(apply(r));
  const setMethods = (next: PaymentMethod[]) => save(setPayments(site, { methods: next }));
  const patch = (id: string, p: Partial<PaymentMethod>) => setMethods(methods.map((m) => (m.id === id ? { ...m, ...p } : m)));
  if (!user || user.role !== 'admin') return null;

  return (
    <>
      <PageHeader title="الدفع والشحن" sub="أنت تحدّد كيف يشحن الطلاب رصيدهم: أي طريقة تعمل، برقم من، وبأي حد أدنى وأقصى ورسوم." />
      <ErrorLine error={error} />

      <Section title="الشحن بشكل عام">
        <ToggleRow label="تشغيل شحن المحفظة" help="لو أوقفته لن يرى الطلاب أي طريقة شحن" on={pay.enabled} onChange={(v) => save(setPayments(site, { enabled: v }))} />
        <Row label="المبالغ السريعة" help="أرقام مفصولة بفاصلة، تظهر كأزرار للطالب">
          <TextField value={pay.presets.join(', ')} aria="المبالغ السريعة" ltr ph="50, 100, 200" onCommit={(v) => {
            const nums = v.split(/[,،\s]+/).filter(Boolean).map(Number);
            save(setPayments(site, { presets: nums.every((n) => Number.isInteger(n) && n > 0) ? nums : [NaN] }));
          }} />
        </Row>
        <Row label="ملاحظة أعلى صفحة الشحن" help="تظهر للطالب فوق طرق الدفع (اختياري)"><TextField value={pay.note} aria="ملاحظة الشحن" multiline onCommit={(v) => save(setPayments(site, { note: v }))} /></Row>
      </Section>

      <Section title="طرق الدفع" help="«شحن تجريبي» يضيف الرصيد فوراً بلا دفع حقيقي: أوقفه عند التشغيل الفعلي. الطرق اليدوية يحوّل فيها الطالب ويرسل طلباً، وتراجعه أنت بالأسفل. الدفع الإلكتروني الفوري بالبطاقة يحتاج ربط بوابة دفع على الخادم.">
        {methods.map((m, i) => (
          <Collapsible key={m.id} title={<span className={m.enabled ? '' : 'opacity-50'}>{m.name}</span>} tools={<>
            <Switch on={m.enabled} label={`تشغيل ${m.name}`} onChange={(v) => patch(m.id, { enabled: v })} />
            <ItemTools index={i} count={methods.length} name={m.name} onMove={(d) => setMethods(moveItem(methods, i, d))} onDelete={m.id === 'demo' ? undefined : () => setMethods(methods.filter((x) => x.id !== m.id))} />
          </>}>
            <Row label="الاسم"><TextField value={m.name} aria="اسم طريقة الدفع" onCommit={(v) => patch(m.id, { name: v })} /></Row>
            <Row label="النوع"><Chips aria="نوع الطريقة" value={m.kind} options={[{ value: 'manual', label: 'يدوية (تحويل + مراجعة)' }, { value: 'demo', label: 'تجريبية (فورية)' }]} onChange={(v) => patch(m.id, { kind: v as PaymentMethod['kind'] })} /></Row>
            {m.kind === 'manual' && (
              <>
                <Row label="رقم التحويل / الحساب"><TextField value={m.account} aria="رقم الحساب" ltr ph="01xxxxxxxxx" onCommit={(v) => patch(m.id, { account: v })} /></Row>
                <Row label="اسم صاحب الحساب" help="يظهر للطالب بجانب الرقم"><TextField value={m.holder} aria="صاحب الحساب" onCommit={(v) => patch(m.id, { holder: v })} /></Row>
              </>
            )}
            <StepperRow label="الحد الأدنى للشحن" aria={`الحد الأدنى ${m.name}`} value={m.min} min={1} max={100000} step={5} unit="ج.م" onChange={(n) => patch(m.id, { min: n })} />
            <StepperRow label="الحد الأقصى للعملية" aria={`الحد الأقصى ${m.name}`} value={m.max} min={1} max={1000000} step={50} unit="ج.م" onChange={(n) => patch(m.id, { max: n })} />
            <StepperRow label="رسوم الطريقة" help="نسبة يدفعها الطالب فوق المبلغ" aria={`رسوم ${m.name}`} value={m.feePct} min={0} max={50} step={0.5} unit="٪" onChange={(n) => patch(m.id, { feePct: n })} />
            <Row label="التعليمات للطالب"><TextField value={m.instructions} aria="تعليمات الدفع" multiline onCommit={(v) => patch(m.id, { instructions: v })} /></Row>
            <Row label="رابط الشعار" help="صورة مباشرة https:// — اتركه فارغاً ليظهر الاسم نصاً"><TextField value={m.logo} aria="رابط الشعار" ltr ph="https://" onCommit={(v) => patch(m.id, { logo: v.trim() })} /></Row>
            <ToggleRow label="يظهر في فوتر الموقع" help="لو كانت الطريقة مفعّلة وغير تجريبية" on={m.showInFooter} onChange={(v) => patch(m.id, { showInFooter: v })} />
          </Collapsible>
        ))}
        <AddButton label="إضافة طريقة دفع" onClick={() => setMethods([...methods, { id: uid(), name: 'طريقة جديدة', kind: 'manual', enabled: false, account: '', holder: '', min: 10, max: 5000, feePct: 0, instructions: '', logo: '', showInFooter: true }])} />
      </Section>

      <TopupInbox />
    </>
  );
};

export default OwnerPaymentsPage;
