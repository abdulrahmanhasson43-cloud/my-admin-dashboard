import { useState } from 'react';
import { motion } from 'framer-motion';
import { PricingIcon, CheckIcon } from '@/components/icons';
import { pricingPlans as plans } from '@/services/mock';

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState('2');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--vuno-text)] mb-2">اختر باقتك</h2>
        <p className="text-[var(--vuno-text-muted)]">باقات تناسب كل الأعمال من الصغيرة للكبيرة</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.1, 0.3) }}
            onClick={() => setSelectedPlan(plan.id)}
            className={`card-vuno p-6 cursor-pointer transition-all ${
              selectedPlan === plan.id
                ? 'ring-2 ring-[var(--vuno-primary)] shadow-lg'
                : 'hover:shadow-md'
            } ${plan.popular ? 'relative' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-btn text-white text-xs font-bold">
                الأكثر شيوعاً
              </div>
            )}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                <PricingIcon size={28} className="text-[var(--vuno-primary)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--vuno-text)] mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-extrabold text-gradient">{plan.price}</span>
                <span className="text-[var(--vuno-text-muted)]">EGP / {plan.period}</span>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, fi) => (
                <li key={fi} className="flex items-center gap-2 text-sm text-[var(--vuno-text)]">
                  <CheckIcon size={16} className="text-emerald-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                selectedPlan === plan.id
                  ? 'gradient-btn text-white'
                  : 'border border-[var(--vuno-border)] text-[var(--vuno-text)] hover:bg-gray-50'
              }`}
            >
              {selectedPlan === plan.id ? 'الباقة الحالية' : 'اختر الباقة'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
