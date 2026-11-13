import React, { useState } from 'react';
import { COURSES } from '../../../data/catalog';
import { go } from '../../../shared/lib/router';
import { useAuth } from '../../../features/auth/AuthProvider';
import { useWallet } from '../../wallet/ui/WalletProvider';
import { redeemCode } from '../application/codeUseCases';
import { codeRepository, sha256Hex } from '../infrastructure/container';
import { formatCode, normalizeCode } from '../domain/entities';

const FAILS = 'madar.redeem.fails';
const MAX_FAILS = 5;
const WINDOW = 10 * 60_000;
const recentFails = (): number[] => {
  try { return (JSON.parse(localStorage.getItem(FAILS) ?? '[]') as number[]).filter((t) => Date.now() - t < WINDOW); } catch { return []; }
};

/** شاشة «عندي كود»: تفعّل اشتراكاً بكود المدرّس. محاولات خاطئة كثيرة تُوقف المحاولة مؤقتاً. */
const RedeemPage: React.FC = () => {
  const { user } = useAuth();
  const { grantAccess } = useWallet();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ courseId: string; title: string; days: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const top = { paddingTop: 'calc(var(--topbar-h) + env(safe-area-inset-top, 0px) + 20px)' };

  if (!user || user.role !== 'student') {
    return (
      <div className="gutter min-h-[70vh]" style={top}>
        <div className="max-w-md pt-10">
          <h1 className="text-[32px] md:text-[40px]">عندي كود</h1>
          <p className="text-muted mt-3">سجّل دخولك بحساب طالب لتفعّل كود المدرّس.</p>
          <button onClick={() => go('/login')} className="btn btn-primary btn-lg mt-6">تسجيل الدخول</button>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fails = recentFails();
    if (fails.length >= MAX_FAILS) return setError('محاولات خاطئة كثيرة. حاول مرة أخرى بعد بضع دقائق.');
    setBusy(true);
    const r = await redeemCode(codeRepository.list(), value, user.email, new Date(), sha256Hex);
    setBusy(false);
    if (!r.ok) { localStorage.setItem(FAILS, JSON.stringify([...fails, Date.now()])); return setError(r.error); }
    const course = COURSES.find((c) => c.id === r.value.redeemed.courseId);
    if (!course) return setError('الكورس المرتبط بالكود غير متاح حالياً.');
    const err = grantAccess(course, r.value.redeemed.days, `تفعيل كود: ${course.title}`);
    if (err) return setError(err);
    codeRepository.save(r.value.all);
    setDone({ courseId: course.id, title: course.title, days: r.value.redeemed.days });
  };

  return (
    <div className="gutter max-w-md mx-auto pb-12" style={top}>
      <h1 className="text-[30px] md:text-[38px]">عندي كود</h1>
      {done ? (
        <div className="mt-4">
          <p className="text-mint font-semibold">تم تفعيل اشتراكك</p>
          <p className="text-white mt-1">{done.title}</p>
          <p className="text-muted">لمدة {done.days.toLocaleString('ar-EG')} يوماً من اليوم.</p>
          <div className="btn-pair mt-6">
            <button onClick={() => go(`/course/${done.courseId}`)} className="btn btn-primary btn-lg">ادخل الكورس</button>
            <button onClick={() => { setDone(null); setValue(''); }} className="btn btn-ghost btn-lg">كود آخر</button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-2" noValidate>
          <p className="text-muted">اكتب الكود الذي أعطاك إياه المدرّس.</p>
          <input className="field mt-5 font-mono tracking-widest text-[18px]" dir="ltr" value={value} onChange={(e) => setValue(formatCode(normalizeCode(e.target.value).slice(0, 12)))}
            placeholder="XXXX-XXXX-XXXX" autoCapitalize="characters" autoComplete="off" spellCheck={false} aria-label="الكود" />
          {error && <p role="alert" className="text-[14px] text-[#ff8a8a] mt-3">{error}</p>}
          <button type="submit" disabled={busy} className="btn btn-primary btn-lg w-full mt-6">{busy ? 'لحظة…' : 'تفعيل الكود'}</button>
        </form>
      )}
    </div>
  );
};

export default RedeemPage;
