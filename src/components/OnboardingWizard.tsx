import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  RocketIcon, CheckIcon, XIcon, StoreIcon,
  ProductsIcon, ReceiptIcon, ShiftManagementIcon,
} from '@/components/icons';

const STORAGE_KEY = 'vuno_onboarding_done';

const steps = [
  {
    id: 'welcome',
    icon: RocketIcon,
    title: 'مرحبًا بك في Vuno! 🎉',
    description: 'نظام إدارة المتاجر المتكامل. سنساعدك على إعداد متجرك في دقائق معدودة. لنبدأ رحلتك نحو إدارة احترافية لمتجرك.',
  },
  {
    id: 'store',
    icon: StoreIcon,
    title: 'معلومات متجرك',
    description: 'أضف معلومات متجرك الأساسية من صفحة الإعدادات: اسم المتجر، الشعار، العملة، ونسبة الضريبة. هذه المعلومات تظهر على الفواتير والتقارير.',
  },
  {
    id: 'products',
    icon: ProductsIcon,
    title: 'أضف منتجاتك',
    description: 'من صفحة المنتجات يمكنك إضافة منتجاتك مع الأسعار، الباركود، ومستويات المخزون. ابدأ بأهم المنتجات التي تبيعها يوميًا.',
  },
  {
    id: 'pos',
    icon: ReceiptIcon,
    title: 'ابدأ البيع',
    description: 'استخدم نقطة البيع (POS) لإنشاء الفواتير بسرعة. امسح الباركود أو اضغط على المنتج لإضافته للسلة، ثم اختر طريقة الدفع.',
  },
  {
    id: 'shifts',
    icon: ShiftManagementIcon,
    title: 'إدارة الورديات',
    description: 'فتح وإغلاق الورديات يساعدك على متابعة مبيعات كل كاشير. ابدأ وردية في بداية اليوم وأغلقها في النهاية لتتبع المبيعات والنقدية.',
  },
];

// eslint-disable-next-line react-refresh/only-export-components
export function isOnboardingDone(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(!isOnboardingDone());
  const navigate = useNavigate();

  if (!visible) return null;

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleFinish = () => {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* ignore */ }
    setVisible(false);
    navigate('/dashboard');
  };

  const handleSkip = () => {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* ignore */ }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          dir="rtl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-[var(--vuno-surface)] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            {/* Progress bar */}
            <div className="h-1 bg-[var(--vuno-border)]">
              <motion.div
                className="h-full"
                style={{ background: 'var(--vuno-primary)' }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
              />
            </div>

            {/* Skip button */}
            <div className="flex justify-end p-3">
              <button
                onClick={handleSkip}
                className="p-1.5 rounded-full hover:bg-[var(--vuno-bg)] transition-colors"
                aria-label="تخطي"
              >
                <XIcon size={18} className="text-[var(--vuno-text-muted)]" />
              </button>
            </div>

            {/* Icon */}
            <div className="text-center px-8 pb-2">
              <motion.div
                key={step.id}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)' }}
              >
                <Icon size={36} className="text-[var(--vuno-primary)]" />
              </motion.div>

              <h2 className="font-bold text-[20px] text-[var(--vuno-text)] mb-2">{step.title}</h2>
              <p className="text-[14px] text-[var(--vuno-text-secondary)] leading-relaxed">{step.description}</p>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 py-5">
              {steps.map((s, i) => (
                <div
                  key={s.id}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === currentStep ? '24px' : '8px',
                    background: i <= currentStep ? 'var(--vuno-primary)' : 'var(--vuno-border)',
                  }}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="px-8 pb-8">
              <button
                onClick={handleNext}
                className="w-full h-12 rounded-full text-white font-semibold text-[15px] flex items-center justify-center gap-2"
                style={{ background: 'var(--vuno-primary)' }}
              >
                {isLast ? (
                  <>
                    <CheckIcon size={18} />
                    ابدأ الآن
                  </>
                ) : (
                  'التالي'
                )}
              </button>
              {currentStep > 0 && !isLast && (
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="w-full mt-2 text-[13px] text-[var(--vuno-text-muted)] hover:text-[var(--vuno-text)] transition-colors"
                >
                  السابق
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
