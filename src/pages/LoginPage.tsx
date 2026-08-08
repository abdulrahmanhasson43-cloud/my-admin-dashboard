import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldIcon, UsersIcon, StoreIcon, CheckIcon, EyeIcon, EyeOffIcon,
  ArrowLeftIcon, LockIcon,
} from '@/components/icons';
import { sampleBranches } from '@/services/mock';
import { useDeviceType } from '@/hooks/useDeviceType';

type LoginMode = 'owner' | 'employee';

export default function LoginPage() {
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

  const [mode, setMode] = useState<LoginMode>('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [employeeCode, setEmployeeCode] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(sampleBranches[0]?.id ?? '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  /* ============ Mobile App-Like Layout ============ */
  if (isMobile) {
    return (
      <div className="min-h-screen bg-white flex flex-col" dir="rtl">
        {/* Top — dark ink header with logo mark, subtle depth via layered radial highlights */}
        <div
          className="relative pt-[max(3.25rem,env(safe-area-inset-top))] pb-10 px-6 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, var(--vuno-primary) 0%, #000000 100%)' }}
        >
          <div className="absolute inset-0 opacity-[0.15]" style={{
            backgroundImage: 'radial-gradient(circle at 15% 15%, white 0%, transparent 45%), radial-gradient(circle at 85% 30%, white 0%, transparent 35%)',
          }} />
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 rounded-[20px] bg-white flex items-center justify-center mx-auto mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-1 ring-white/20">
              <span className="font-bold text-3xl sf-display" style={{ color: 'var(--vuno-primary)' }}>V</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1 sf-display">فونو</h1>
            <p className="text-white/60 text-sm">لوحة تحكم إدارة الأعمال</p>
          </div>
        </div>

        {/* Form card — pulled up over the header */}
        <div className="flex-1 -mt-7 bg-white rounded-t-[28px] px-6 pt-7 pb-8 flex flex-col shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
          {/* Mode switcher — pill tabs */}
          <div className="flex gap-1 p-1 rounded-2xl bg-[var(--vuno-bg)] mb-6">
            <button
              onClick={() => setMode('owner')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'owner' ? 'bg-white text-[var(--vuno-text)] shadow-sm' : 'text-[var(--vuno-text-muted)]'
              }`}
            >
              <ShieldIcon size={15} /> المالك
            </button>
            <button
              onClick={() => setMode('employee')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'employee' ? 'bg-white text-[var(--vuno-text)] shadow-sm' : 'text-[var(--vuno-text-muted)]'
              }`}
            >
              <UsersIcon size={15} /> موظف
            </button>
          </div>

          <h2 className="text-xl font-bold text-[var(--vuno-text)] mb-1">
            {isSignUp ? 'إنشاء حساب' : mode === 'owner' ? 'تسجيل الدخول' : 'دخول الموظف'}
          </h2>
          <p className="text-sm text-[var(--vuno-text-muted)] mb-5">
            {isSignUp ? 'ابدأ رحلتك مع فونو' : mode === 'owner' ? 'أدخل بياناتك للوصول للوحة التحكم' : 'أدخل كود الموظف والفرع'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 flex-1">
            {mode === 'owner' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-[var(--vuno-text-secondary)] mb-1.5">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:border-[var(--vuno-primary)] transition-colors outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--vuno-text-secondary)] mb-1.5">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pl-11 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:border-[var(--vuno-primary)] transition-colors outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--vuno-text-muted)] p-1"
                    >
                      {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                    </button>
                  </div>
                </div>
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--vuno-text-secondary)] mb-1.5">تأكيد كلمة المرور</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:border-[var(--vuno-primary)] transition-colors outline-none"
                      required
                    />
                  </div>
                )}
                {!isSignUp && (
                  <div className="text-left">
                    <button type="button" className="text-xs font-medium text-[var(--vuno-primary)] hover:underline">
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Employee login — simpler */}
                <div>
                  <label className="block text-xs font-medium text-[var(--vuno-text-secondary)] mb-1.5">الفرع</label>
                  <select
                    value={selectedBranch}
                    onChange={e => setSelectedBranch(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:border-[var(--vuno-primary)] transition-colors outline-none"
                  >
                    {sampleBranches.filter(b => b.status === 'active').map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--vuno-text-secondary)] mb-1.5">كود الموظف</label>
                  <input
                    type="text"
                    value={employeeCode}
                    onChange={e => setEmployeeCode(e.target.value)}
                    placeholder="أدخل كود الموظف"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:border-[var(--vuno-primary)] transition-colors outline-none text-center text-lg tracking-widest"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--vuno-text-secondary)] mb-1.5">الرقم السري</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••"
                    maxLength={4}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:border-[var(--vuno-primary)] transition-colors outline-none text-center text-lg tracking-widest"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'color-mix(in srgb, var(--vuno-primary) 6%, transparent)' }}>
                  <LockIcon size={14} className="text-[var(--vuno-primary)] flex-shrink-0" />
                  <p className="text-[11px] text-[var(--vuno-text-secondary)]">دخول الموظف يقتصر على نقطة البيع والفواتير فقط</p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'var(--vuno-primary)' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الدخول...
                </>
              ) : (
                <>
                  {isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
                  <ArrowLeftIcon size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle sign up / sign in (owner only) */}
          {mode === 'owner' && (
            <p className="text-center text-[var(--vuno-text-muted)] mt-5 text-sm">
              {isSignUp ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[var(--vuno-primary)] font-semibold hover:underline"
              >
                {isSignUp ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </button>
            </p>
          )}

          <button
            onClick={() => navigate('/')}
            className="text-center text-xs text-[var(--vuno-text-muted)] mt-4 hover:text-[var(--vuno-text)] transition-colors"
          >
            ← العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  /* ============ Desktop Professional Layout ============ */
  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left — Branding / Marketing panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{ background: 'var(--vuno-primary)' }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 20%, white 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
        <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl bg-white" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-lg">
              <span className="font-bold text-2xl sf-display" style={{ color: 'var(--vuno-primary)' }}>V</span>
            </div>
            <span className="text-white font-bold text-2xl sf-display tracking-tight">فونو</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight sf-display tracking-tight">
            أدر أعمالك<br />باحترافية كاملة
          </h1>
          <p className="text-white/80 text-base mb-8 leading-relaxed">
            لوحة تحكم متكاملة لإدارة مبيعاتك، مخزونك، فواتيرك، ومصروفاتك —
            صُمم خصيصاً للشركات المصرية.
          </p>
          <div className="space-y-3">
            {[
              'نقطة بيع سريعة مع جميع طرق الدفع',
              'إدارة مخزون وفروع متعددة',
              'تكامل الفاتورة الضريبية الإلكترونية',
              'مساعد ذكي ومساند تقارير مفصلة',
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckIcon size={12} className="text-white" />
                </span>
                <span className="text-white/90 text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-white/60 text-xs">
          <span>+500 عميل نشط</span>
          <span>•</span>
          <span>+2M فاتورة</span>
          <span>•</span>
          <span>99.9% تشغيل</span>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 right-8 text-sm text-[var(--vuno-text-muted)] hover:text-[var(--vuno-text)] transition-colors"
        >
          ← العودة للرئيسية
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo (visible only on small desktops) */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--vuno-primary)' }}>
              <span className="text-white font-bold text-xl sf-display">V</span>
            </div>
            <span className="text-[var(--vuno-text)] font-bold text-xl sf-display">فونو</span>
          </div>

          {/* Mode switcher */}
          <div className="flex gap-1 p-1 rounded-2xl bg-[var(--vuno-bg)] mb-6">
            <button
              onClick={() => setMode('owner')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'owner' ? 'bg-white text-[var(--vuno-text)] shadow-sm' : 'text-[var(--vuno-text-muted)]'
              }`}
            >
              <ShieldIcon size={15} /> المالك
            </button>
            <button
              onClick={() => setMode('employee')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'employee' ? 'bg-white text-[var(--vuno-text)] shadow-sm' : 'text-[var(--vuno-text-muted)]'
              }`}
            >
              <UsersIcon size={15} /> موظف
            </button>
          </div>

          <h2 className="text-2xl font-bold text-[var(--vuno-text)] mb-1 sf-display">
            {isSignUp ? 'إنشاء حساب' : mode === 'owner' ? 'تسجيل الدخول' : 'دخول الموظف'}
          </h2>
          <p className="text-sm text-[var(--vuno-text-muted)] mb-6">
            {isSignUp ? 'ابدأ رحلتك مع فونو' : mode === 'owner' ? 'أدخل بياناتك للوصول للوحة التحكم' : 'أدخل كود الموظف والفرع'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'owner' ? (
                <motion.div
                  key="owner-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-medium text-[var(--vuno-text-secondary)] mb-1.5">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:border-[var(--vuno-primary)] transition-colors outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--vuno-text-secondary)] mb-1.5">كلمة المرور</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 pl-11 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:border-[var(--vuno-primary)] transition-colors outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--vuno-text-muted)] p-1"
                      >
                        {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                      </button>
                    </div>
                  </div>
                  {isSignUp && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--vuno-text-secondary)] mb-1.5">تأكيد كلمة المرور</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:border-[var(--vuno-primary)] transition-colors outline-none"
                        required
                      />
                    </div>
                  )}
                  {!isSignUp && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded accent-[var(--vuno-primary)]" />
                        <span className="text-xs text-[var(--vuno-text-secondary)]">تذكرني</span>
                      </label>
                      <button type="button" className="text-xs font-medium text-[var(--vuno-primary)] hover:underline">
                        نسيت كلمة المرور؟
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="employee-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-medium text-[var(--vuno-text-secondary)] mb-1.5">الفرع</label>
                    <select
                      value={selectedBranch}
                      onChange={e => setSelectedBranch(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:border-[var(--vuno-primary)] transition-colors outline-none"
                    >
                      {sampleBranches.filter(b => b.status === 'active').map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--vuno-text-secondary)] mb-1.5">كود الموظف</label>
                    <input
                      type="text"
                      value={employeeCode}
                      onChange={e => setEmployeeCode(e.target.value)}
                      placeholder="أدخل كود الموظف"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:border-[var(--vuno-primary)] transition-colors outline-none text-center text-lg tracking-widest"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--vuno-text-secondary)] mb-1.5">الرقم السري (4 أرقام)</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••"
                      maxLength={4}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:border-[var(--vuno-primary)] transition-colors outline-none text-center text-lg tracking-widest"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'color-mix(in srgb, var(--vuno-primary) 6%, transparent)' }}>
                    <StoreIcon size={14} className="text-[var(--vuno-primary)] flex-shrink-0" />
                    <p className="text-[11px] text-[var(--vuno-text-secondary)]">دخول الموظف يقتصر على نقطة البيع والفواتير فقط</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'var(--vuno-primary)' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الدخول...
                </>
              ) : (
                <>
                  {isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
                  <ArrowLeftIcon size={16} />
                </>
              )}
            </button>
          </form>

          {mode === 'owner' && (
            <p className="text-center text-[var(--vuno-text-muted)] mt-5 text-sm">
              {isSignUp ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[var(--vuno-primary)] font-semibold hover:underline"
              >
                {isSignUp ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </button>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
