import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon, StoreIcon, ReceiptIcon, PackageIcon,
  UsersIcon, BarcodeIcon, TrendingUpIcon
} from '@/components/icons';
import { useEffect } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    { icon: StoreIcon, title: 'نقطة بيع ذكية', desc: 'نظام نقاط بيع سريع وسلس مع دعم جميع طرق الدفع' },
    { icon: PackageIcon, title: 'إدارة المخزون', desc: 'تتبع المنتجات والكميات والتنبيهات عند انخفاض المخزون' },
    { icon: ReceiptIcon, title: 'فواتير احترافية', desc: 'إنشاء وإدارة الفواتير بسهولة مع تقارير مفصلة' },
    { icon: UsersIcon, title: 'إدارة العملاء', desc: 'قاعدة بيانات عملاء متكاملة مع سجل المشتريات' },
    { icon: BarcodeIcon, title: 'دعم الباركود', desc: 'مسح وإدارة المنتجات عبر الباركود بسرعة' },
    { icon: TrendingUpIcon, title: 'تحليلات متقدمة', desc: 'رسوم بيانية وإحصائيات لأداء عملك' },
  ];

  const stats = [
    { value: '+500', label: 'عميل نشط' },
    { value: '+2M', label: 'فاتورة تم إصدارها' },
    { value: '+50K', label: 'منتج مُدار' },
    { value: '99.9%', label: 'نسبة uptime' },
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-white" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--vuno-primary)] rounded-full filter blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--vuno-warning)] rounded-full filter blur-3xl" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.15) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        {/* Navbar */}
        <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-header flex items-center justify-center shadow-lg shadow-orange-500/25">
              <span className="text-white font-extrabold text-2xl">V</span>
            </div>
            <span className="text-[var(--vuno-text)] font-bold text-2xl tracking-tight">Vuno</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">المميزات</a>
            <a href="#stats" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">الإحصائيات</a>
            <a href="#how" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">كيف يعمل</a>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-900 hover:bg-gray-50 transition-all text-sm font-medium"
          >
            تسجيل الدخول
          </button>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 lg:px-12 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-600 text-sm">نظام إدارة متكامل للشركات الصغيرة والمتوسطة</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-[var(--vuno-text)] leading-[1.1] mb-6 tracking-tight">
              العالم غير
              <br />
              <span className="text-gradient">متوقع.</span>
              <br />
              أموالك لازم تكون
              <br />
              <span className="text-gradient">آمنة.</span>
            </h1>

            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Vuno بيمنحك لوحة تحكم كاملة لإدارة مبيعاتك، مخزونك، وفواتيرك — كل حاجة في مكان واحد.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="group px-8 py-4 rounded-full gradient-btn text-white font-semibold text-lg shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                ابدأ الآن مجاناً
                <ArrowLeftIcon size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 rounded-full bg-gray-50 border border-gray-200 text-gray-900 font-semibold text-lg hover:bg-gray-100 transition-all duration-300"
              >
                شاهد العرض التوضيحي
              </button>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <div className="w-6 h-10 rounded-full border-2 border-gray-300 flex items-start justify-center p-2">
              <div className="w-1 h-2 rounded-full bg-gray-400" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.1, 0.3) }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-extrabold text-gradient mb-2">{stat.value}</div>
                <div className="text-[var(--vuno-text-secondary)] text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-[var(--vuno-text)] mb-4">
              كل اللي محتاجه <span className="text-gradient">أعمالك</span>
            </h2>
            <p className="text-[var(--vuno-text-secondary)] max-w-xl mx-auto">
              أدوات قوية وسهلة الاستخدام لإدارة كل aspect من أعمالك
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.1, 0.3) }}
                  className="card-vuno p-6 hover:shadow-lg transition-shadow group"
                >
                  <div className="icon-circle mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--vuno-text)] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[var(--vuno-text-secondary)] leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-[var(--vuno-text)] mb-4">
              كيف يعمل؟
            </h2>
            <p className="text-[var(--vuno-text-secondary)]">ثلاث خطوات بسيطة وانت جاهز</p>
          </div>

          <div className="space-y-8">
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
                transition={{ delay: Math.min(i * 0.1, 0.3) }}
                className="flex items-center gap-6 card-vuno p-6"
              >
                <div className="w-16 h-16 rounded-2xl gradient-header flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-extrabold text-xl">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--vuno-text)] mb-1">{item.title}</h3>
                  <p className="text-[var(--vuno-text-secondary)]">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white relative overflow-hidden border-t border-gray-100">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/2 w-96 h-96 bg-[var(--vuno-primary)] rounded-full filter blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--vuno-text)] mb-6">
            جاهز تبدأ؟
          </h2>
          <p className="text-gray-600 text-lg mb-10">
            انضم لآلاف التجار اللي بيثقوا في Vuno لإدارة أعمالهم
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-10 py-4 rounded-full gradient-btn text-white font-bold text-lg shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300"
          >
            ابدأ مجاناً الآن
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-600 py-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-header flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-[var(--vuno-text)] font-bold text-xl">Vuno</span>
            </div>
            <p className="text-sm">جميع الحقوق محفوظة © 2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


