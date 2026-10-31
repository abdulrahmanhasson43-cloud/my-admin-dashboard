import React, { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth, Role } from './AuthProvider';
import { go, useRoute } from '../../shared/lib/router';
import { Logo } from '../../shared/ui';

const ROLES: { key: Role; label: string }[] = [
  { key: 'student', label: 'طالب' },
  { key: 'teacher', label: 'مدرّس' },
  { key: 'admin', label: 'مشرف' },
];

const DEMO: Record<Role, { email: string; password: string }> = {
  student: { email: 'student@madar.app', password: '123456' },
  teacher: { email: 'teacher@madar.app', password: '123456' },
  admin: { email: 'admin@madar.app', password: '123456' },
};

const GoogleMark: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z" />
    <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.9 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);

const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const { query } = useRoute();
  const isSignup = useMemo(() => new URLSearchParams(query).get('mode') === 'signup', [query]);

  const [role, setRole] = useState<Role>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setError(''); }, [isSignup, role]);
  useEffect(() => { if (user) go(user.role === 'student' ? '/my-learning' : '/admin'); }, [user]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isSignup) {
      if (!name.trim()) return setError('اكتب اسمك الكامل.');
      if (!email.trim()) return setError('اكتب بريدك الإلكتروني.');
      if (password.length < 6) return setError('كلمة المرور ٦ أحرف على الأقل.');
      return setError('إنشاء الحسابات غير مفعّل في هذه النسخة التجريبية. جرّب أحد الحسابات التجريبية من تسجيل الدخول.');
    }
    if (!email.trim() || !password) return setError('اكتب البريد الإلكتروني وكلمة المرور.');
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password, role);
      setLoading(false);
      if (!res.ok) setError(res.error ?? 'تعذّر تسجيل الدخول.');
      else go(role === 'student' ? '/my-learning' : '/admin');
    }, 300);
  };

  const fillDemo = () => { setEmail(DEMO[role].email); setPassword(DEMO[role].password); setError(''); };
  const google = () => setError('الدخول بحساب جوجل سيعمل بعد ربط المنصة بالخادم. غير مفعّل في هذه النسخة.');

  return (
    <div className="relative min-h-screen">
      <img src={`${import.meta.env.BASE_URL}hero-sm.jpg`} srcSet={`${import.meta.env.BASE_URL}hero-sm.jpg 1100w, ${import.meta.env.BASE_URL}hero.jpg 1920w`} sizes="100vw" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-ink/80 md:bg-gradient-to-l md:from-ink md:via-ink/90 md:to-ink/40" />

      <div className="relative gutter" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 4px)' }}>
        <Logo onClick={() => go('/')} size={24} />
      </div>

      <main className="relative gutter pt-10 pb-16 md:pt-16 w-full max-w-[420px] md:me-0 md:ms-[max(var(--gutter),10vw)]">
        <h1 className="text-[32px] md:text-[40px]">{isSignup ? 'أنشئ حسابك' : 'مرحباً بعودتك'}</h1>
        <p className="text-muted mt-2">{isSignup ? 'ابدأ بدرس مجاني، وتحفظ مدار تقدّمك.' : 'سجّل دخولك لتكمل من حيث توقّفت.'}</p>

        {!isSignup && (
          <div className="flex gap-6 mt-8 border-b border-white/15" role="tablist" aria-label="نوع الحساب">
            {ROLES.map((r) => (
              <button key={r.key} role="tab" aria-selected={role === r.key} onClick={() => setRole(r.key)}
                className={`h-[var(--tap)] -mb-px text-[15px] font-medium border-b-2 transition-colors ${role === r.key ? 'text-white border-accent' : 'text-white/55 border-transparent hover:text-white'}`}>
                {r.label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-2" noValidate>
          {isSignup && <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم الكامل" autoComplete="name" aria-label="الاسم الكامل" />}
          <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" autoComplete="email" inputMode="email" aria-label="البريد الإلكتروني" />
          <div className="relative">
            <input className="field pe-12" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" autoComplete={isSignup ? 'new-password' : 'current-password'} aria-label="كلمة المرور" />
            <button type="button" onClick={() => setShow((v) => !v)} className="icon-btn absolute end-0 top-1/2 -translate-y-1/2" aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
              {show ? <EyeOff className="w-5 h-5" strokeWidth={1.75} /> : <Eye className="w-5 h-5" strokeWidth={1.75} />}
            </button>
          </div>

          {error && <p role="alert" className="text-[14px] text-[#ff8a8a] pt-2">{error}</p>}

          <div className="pt-5 space-y-3">
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">{loading ? 'لحظة…' : isSignup ? 'إنشاء الحساب' : 'تسجيل الدخول'}</button>
            <button type="button" onClick={google} className="btn btn-ghost btn-lg w-full"><GoogleMark />المتابعة بحساب جوجل</button>
          </div>
        </form>

        <div className="mt-6 text-[14px] text-muted space-y-1">
          {!isSignup && <p>تجرّب المنصة؟ <button onClick={fillDemo} className="text-accent font-medium h-[var(--tap)] px-1">استخدم حساب {ROLES.find((r) => r.key === role)?.label} التجريبي</button></p>}
          <p>
            {isSignup ? 'لديك حساب؟' : 'ليس لديك حساب؟'}
            <button onClick={() => go(isSignup ? '/login' : '/login?mode=signup')} className="text-accent font-medium h-[var(--tap)] px-1">{isSignup ? 'سجّل دخولك' : 'أنشئ حساباً'}</button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
