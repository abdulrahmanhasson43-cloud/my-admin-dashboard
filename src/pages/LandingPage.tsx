import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon, StoreIcon, ReceiptIcon, PackageIcon,
  UsersIcon, ShieldIcon, ExpenseIcon,
  AIAssistantIcon, BranchesIcon, CheckIcon,
} from '@/components/icons';
import { useEffect } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    { icon: StoreIcon, title: 'نقطة بيع ذكية', desc: 'نظام نقاط بيع سريع وسلس مع دعم جميع طرق الدفع المحلية' },
    { icon: PackageIcon, title: 'إدارة المخزون', desc: 'تتبع المنتجات والكميات والتنبيهات عند انخفاض المخزون' },
    { icon: ReceiptIcon, title: 'فواتير احترافية', desc: 'إنشاء وإدارة الفواتير بسهولة مع دعم طابعات حرارية 58 و 80 مم' },
    { icon: UsersIcon, title: 'العملاء والموردون', desc: 'قاعدة بيانات متكاملة مع سجل المشتريات ورموز QR' },
    { icon: ExpenseIcon, title: 'المصروفات اليومية', desc: 'سجل مالي شامل لتتبع مصروفاتك وتحليلها' },
    { icon: BranchesIcon, title: 'الفروع والصلاحيات', desc: 'إدارة متعددة الفروع مع نظام أدوار وصلاحيات كامل' },
    { icon: ShieldIcon, title: 'الفاتورة الضريبية', desc: 'تكامل مع الهيئة المصرية للضرائب (ETA) للفوترة الإلكترونية' },
    { icon: AIAssistantIcon, title: 'مساعد ذكي', desc: 'أسئلة فورية عن مبيعاتك ومخزونك ومصروفاتك بالذكاء الاصطناعي' },
  ];

  const stats = [
    { value: '+500', label: 'عميل نشط' },
    { value: '+2M', label: 'فاتورة تم إصدارها' },
    { value: '+50K', label: 'منتج مُدار' },
    { value: '99.9%', label: 'نسبة التشغيل' },
  ];

  const plans = [
    {
      name: 'مجاني',
      price: '0',
      period: 'للأبد',
      desc: 'مثالي للمتاجر الصغيرة',
      features: ['نقطة بيع كاملة', '50 منتج', 'فواتير غير محدودة', 'عميل واحد'],
      cta: 'ابدأ مجاناً',
      highlighted: false,
    },
    {
      name: 'احترافي',
      price: '299',
      period: 'جنيه/شهرياً',
      desc: 'للشركات المتوسطة والنامية',
      features: ['كل ميزات المجاني', 'منتجات غير محدودة', 'فروع متعددة', 'نظام صلاحيات', 'تكامل ضريبي', 'مساعد ذكي'],
      cta: 'ابدأ التجربة',
      highlighted: true,
    },
    {
      name: 'مؤسسات',
      price: '899',
      period: 'جنيه/شهرياً',
      desc: 'للشركات الكبيرة متعددة الفروع',
      features: ['كل ميزات الاحترافي', 'فروع غير محدودة', 'تقارير متقدمة', 'دعم مخصص 24/7', 'تدريب الفريق'],
      cta: 'تواصل معنا',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* ============ Navbar ============ */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-white/70 border-b border-[var(--vuno-border-light)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 lg:px-8 h-16">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'var(--vuno-primary)' }}
            >
              <span className="text-white font-bold text-lg sf-display">V</span>
            </div>
            <span className="text-[var(--vuno-text)] font-bold text-xl tracking-tight sf-display">Vuno</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[var(--vuno-text-secondary)] hover:text-[var(--vuno-text)] transition-colors text-sm font-medium">المميزات</a>
            <a href="#pricing" className="text-[var(--vuno-text-secondary)] hover:text-[var(--vuno-text)] transition-colors text-sm font-medium">الأسعار</a>
            <a href="#how" className="text-[var(--vuno-text-secondary)] hover:text-[var(--vuno-text)] transition-colors text-sm font-medium">كيف يعمل</a>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ background: 'var(--vuno-primary)' }}
          >
            تسجيل الدخول
          </button>
        </div>
      </nav>

      {/* ============ Hero Section ============ */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(29,29,31,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(29,29,31,.12) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07] blur-3xl" style={{ background: 'var(--vuno-primary)' }} />

        <div className="relative max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6" style={{ background: 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)' }}>
              <span className="w-2 h-2 rounded-full bg-[var(--vuno-success)] animate-pulse" />
              <span className="text-[var(--vuno-primary)] text-xs font-medium">نظام إدارة متكامل للشركات المصرية</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-[var(--vuno-text)] leading-[1.15] tracking-tight sf-display mb-5">
              أدر أعمالك<br />
              <span style={{ color: 'var(--vuno-primary)' }}>باحترافية كاملة</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[var(--vuno-text-secondary)] text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
              فونو يمنحك لوحة تحكم كاملة لإدارة مبيعاتك، مخزونك، فواتيرك، ومصروفاتك —
              كل شيء في مكان واحد، صُمم للم cafés والشركات المصرية.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="group w-full sm:w-auto px-8 py-3.5 rounded-full text-white font-semibold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                style={{ background: 'var(--vuno-primary)' }}
              >
                ابدأ الآن مجاناً
                <ArrowLeftIcon size={18} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <a
                href="#features"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-[var(--vuno-border)] text-[var(--vuno-text)] font-semibold text-base hover:bg-[var(--vuno-bg)] transition-colors text-center"
              >
                شاهد المميزات
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 mt-10 text-xs text-[var(--vuno-text-muted)]">
              <div className="flex items-center gap-1.5">
                <CheckIcon size={14} className="text-[var(--vuno-success)]" />
                بدون بطاقة ائتمان
              </div>
              <div className="flex items-center gap-1.5">
                <CheckIcon size={14} className="text-[var(--vuno-success)]" />
                إعداد في دقيقتين
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <CheckIcon size={14} className="text-[var(--vuno-success)]" />
                دعم بالعربية
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ Stats Section ============ */}
      <section id="stats" className="py-16 border-y border-[var(--vuno-border-light)]" style={{ background: 'var(--vuno-bg)' }}>
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.08, 0.25) }}
                className="text-center"
              >
                <div className="text-3xl lg:text-5xl font-bold mb-1.5 sf-display tabular-nums" style={{ color: 'var(--vuno-primary)' }}>
                  {stat.value}
                </div>
                <div className="text-[var(--vuno-text-secondary)] text-xs lg:text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Features Section ============ */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-5xl font-bold text-[var(--vuno-text)] mb-3 sf-display tracking-tight">
              كل اللي محتاجه <span style={{ color: 'var(--vuno-primary)' }}>لأعمالك</span>
            </h2>
            <p className="text-[var(--vuno-text-secondary)] text-sm lg:text-base max-w-xl mx-auto">
              أدوات قوية وسهلة الاستخدام لإدارة كل جانب من أعمالك
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.06, 0.3) }}
                  className="card-vuno p-5 lg:p-6 hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'color-mix(in srgb, var(--vuno-primary) 10%, transparent)', color: 'var(--vuno-primary)' }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className="text-[15px] font-semibold text-[var(--vuno-text)] mb-1.5">{feature.title}</h3>
                  <p className="text-[13px] text-[var(--vuno-text-secondary)] leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ How It Works ============ */}
      <section id="how" className="py-20 lg:py-28 border-y border-[var(--vuno-border-light)]" style={{ background: 'var(--vuno-bg)' }}>
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-5xl font-bold text-[var(--vuno-text)] mb-3 sf-display tracking-tight">
              كيف يعمل؟
            </h2>
            <p className="text-[var(--vuno-text-secondary)] text-sm lg:text-base">ثلاث خطوات بسيطة وأنت جاهز</p>
          </div>

          <div className="space-y-4">
            {[
              { step: '01', title: 'أنشئ حسابك', desc: 'سجل في أقل من دقيقتين وابدأ رحلتك' },
              { step: '02', title: 'أضف منتجاتك', desc: 'أضف منتجاتك وخدماتك بسهولة مع دعم الباركود' },
              { step: '03', title: 'ابدأ البيع', desc: 'افتح نقطة البيع وابدأ إصدار الفواتير فوراً' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.08, 0.25) }}
                className="flex items-center gap-4 sm:gap-6 card-vuno p-5 sm:p-6"
              >
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg sm:text-xl sf-display"
                  style={{ background: 'var(--vuno-primary)' }}
                >
                  {item.step}
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-semibold text-[var(--vuno-text)] mb-0.5">{item.title}</h3>
                  <p className="text-sm text-[var(--vuno-text-secondary)]">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Pricing Section ============ */}
      <section id="pricing" className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-5xl font-bold text-[var(--vuno-text)] mb-3 sf-display tracking-tight">
              خطط <span style={{ color: 'var(--vuno-primary)' }}>بسيطة</span>
            </h2>
            <p className="text-[var(--vuno-text-secondary)] text-sm lg:text-base">اختر الخطة المناسبة لحجم أعمالك</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.08, 0.25) }}
                className={`card-vuno p-6 lg:p-7 relative ${
                  plan.highlighted ? 'border-2 lg:scale-[1.02]' : ''
                }`}
                style={plan.highlighted ? { borderColor: 'var(--vuno-primary)' } : {}}
              >
                {plan.highlighted && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white text-[10px] font-semibold"
                    style={{ background: 'var(--vuno-primary)' }}
                  >
                    الأكثر شعبية
                  </div>
                )}
                <div className="text-center mb-5">
                  <h3 className="text-lg font-semibold text-[var(--vuno-text)] mb-1">{plan.name}</h3>
                  <p className="text-xs text-[var(--vuno-text-muted)] mb-3">{plan.desc}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl lg:text-4xl font-bold text-[var(--vuno-text)] sf-display tabular-nums">{plan.price}</span>
                    <span className="text-xs text-[var(--vuno-text-muted)]">{plan.period}</span>
                  </div>
                </div>
                <div className="space-y-2.5 mb-6">
                  {plan.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'color-mix(in srgb, var(--vuno-primary) 12%, transparent)', color: 'var(--vuno-primary)' }}
                      >
                        <CheckIcon size={10} />
                      </span>
                      <span className="text-[13px] text-[var(--vuno-text-secondary)]">{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-opacity ${
                    plan.highlighted ? 'text-white hover:opacity-90' : 'border border-[var(--vuno-border)] text-[var(--vuno-text)] hover:bg-[var(--vuno-bg)]'
                  }`}
                  style={plan.highlighted ? { background: 'var(--vuno-primary)' } : {}}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA Section ============ */}
      <section className="py-20 lg:py-28 relative overflow-hidden" style={{ background: 'var(--vuno-primary)' }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
        <div className="relative z-10 max-w-3xl mx-auto px-5 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 sf-display tracking-tight">
            جاهز تبدأ؟
          </h2>
          <p className="text-white/80 text-base lg:text-lg mb-8">
            انضم لآلاف التجار الذين يثقون في فونو لإدارة أعمالهم
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-10 py-4 rounded-full bg-white font-bold text-base hover:opacity-90 transition-opacity"
            style={{ color: 'var(--vuno-primary)' }}
          >
            ابدأ مجاناً الآن
          </button>
        </div>
      </section>

      {/* ============ Footer ============ */}
      <footer className="py-10 border-t border-[var(--vuno-border-light)]">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--vuno-primary)' }}
              >
                <span className="text-white font-bold text-sm sf-display">V</span>
              </div>
              <span className="text-[var(--vuno-text)] font-bold text-lg sf-display">Vuno</span>
            </div>
            <p className="text-xs text-[var(--vuno-text-muted)]">جميع الحقوق محفوظة © 2025 فونو</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
