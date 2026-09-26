import type { PricingPlan } from '@/types';

export const pricingPlans: PricingPlan[] = [
  {
    id: '1',
    name: 'الباقة الأساسية',
    price: 99,
    period: 'شهري',
    features: ['100 منتج', '1 فرع', '1 كاشير', 'فواتير غير محدودة', 'دعم البريد الإلكتروني'],
    popular: false,
  },
  {
    id: '2',
    name: 'الباقة المتوسطة',
    price: 249,
    period: 'شهري',
    features: ['1000 منتج', '3 فروع', '5 كاشير', 'فواتير غير محدودة', 'تقارير متقدمة', 'دعم مباشر'],
    popular: true,
  },
  {
    id: '3',
    name: 'الباقة المتقدمة',
    price: 499,
    period: 'شهري',
    features: ['منتجات غير محدودة', 'فروع غير محدودة', 'كاشير غير محدود', 'API access', 'دعم 24/7', 'نسخ احتياطي يومي'],
    popular: false,
  },
];
