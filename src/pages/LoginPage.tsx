import { motion } from 'framer-motion';
import { CheckIcon, ArrowLeftIcon } from '@/components/icons';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useLoginForm } from '@/hooks/useLoginForm';
import LoginForm from '@/components/login/LoginForm';
import LoginModeSwitcher from '@/components/login/LoginModeSwitcher';
import SignUpToggle from '@/components/login/SignUpToggle';

export default function LoginPage() {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const form = useLoginForm();
  const { mode, setMode, isSignUp, setIsSignUp, title, subtitle, goHome } = form;

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
          <LoginModeSwitcher mode={mode} onChange={setMode} />

          <h2 className="text-xl font-bold text-[var(--vuno-text)] mb-1">
            {title}
          </h2>
          <p className="text-sm text-[var(--vuno-text-muted)] mb-5">
            {subtitle}
          </p>

          <LoginForm form={form} variant="mobile" />

          {/* Toggle sign up / sign in (owner only) */}
          {mode === 'owner' && <SignUpToggle isSignUp={isSignUp} onToggle={() => setIsSignUp(!isSignUp)} />}

          <button
            onClick={goHome}
            className="text-center text-xs text-[var(--vuno-text-muted)] mt-4 hover:text-[var(--vuno-text)] transition-colors inline-flex items-center justify-center gap-1"
          >
            <ArrowLeftIcon size={12} />
            العودة للصفحة الرئيسية
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
          onClick={goHome}
          className="absolute top-6 right-8 text-sm text-[var(--vuno-text-muted)] hover:text-[var(--vuno-text)] transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeftIcon size={14} />
          العودة للرئيسية
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
          <LoginModeSwitcher mode={mode} onChange={setMode} />

          <h2 className="text-2xl font-bold text-[var(--vuno-text)] mb-1 sf-display">
            {title}
          </h2>
          <p className="text-sm text-[var(--vuno-text-muted)] mb-6">
            {subtitle}
          </p>

          <LoginForm form={form} variant="desktop" />

          {mode === 'owner' && <SignUpToggle isSignUp={isSignUp} onToggle={() => setIsSignUp(!isSignUp)} />}
        </motion.div>
      </div>
    </div>
  );
}
