/**
 * services/mock/bundles.ts
 * ============================================================
 *  البيانات الوهمية للباقات — الفكرة #37
 * ============================================================
 */

import type { Bundle } from '@/types';

export const sampleBundles: Bundle[] = [
  {
    id: 'bundle-1',
    name: 'الباقة الذكية 🎁',
    description: 'سماعة + شاحن + كابل — كل ما تحتاجه لجهازك',
    items: [
      { productId: '1', name: 'سماعة بلوتوث لاسلكية', price: 250, quantity: 1 },
      { productId: '2', name: 'شاحن سريع 65W', price: 180, quantity: 1 },
      { productId: '3', name: 'كابل USB-C 2م', price: 45, quantity: 1 },
    ],
    originalPrice: 475,
    discountedPrice: 350,
    active: true,
    createdAt: '2026-08-01',
  },
  {
    id: 'bundle-2',
    name: 'باقة المكتب 💼',
    description: 'ماوس + كيبورد — تجربة كتابة مريحة',
    items: [
      { productId: '5', name: 'ماوس لاسلكي', price: 120, quantity: 1 },
      { productId: '6', name: 'كيبورد ميكانيكي', price: 450, quantity: 1 },
    ],
    originalPrice: 570,
    discountedPrice: 480,
    active: true,
    createdAt: '2026-07-20',
  },
  {
    id: 'bundle-3',
    name: 'باقة الإكسسوارات 📱',
    description: 'جراب + كابل — حماية كاملة لموبايلك',
    items: [
      { productId: '4', name: 'جراب موبايل سيليكون', price: 65, quantity: 1 },
      { productId: '3', name: 'كابل USB-C 2م', price: 45, quantity: 2 },
    ],
    originalPrice: 155,
    discountedPrice: 120,
    active: true,
    createdAt: '2026-08-05',
  },
];
