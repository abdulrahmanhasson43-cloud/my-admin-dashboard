import type { UserProfile, StoreBranding, SubscriptionInfo } from '@/types/profile';

// TODO(phase-3): replace with a real Firestore-backed profile service.
export const defaultUserProfile: UserProfile = {
  name: 'أحمد محمد',
  email: 'ahmed.store@email.com',
  phone: '01001234567',
  role: 'المالك',
};

export const defaultStoreBranding: StoreBranding = {
  storeName: 'Vuno تك',
  tagline: 'كل ما تحتاجه من إلكترونيات',
  primaryColor: '#0066CC',
  accentColor: '#34C759',
};

export const defaultSubscription: SubscriptionInfo = {
  planName: 'الباقة المتوسطة',
  price: 249,
  period: 'شهري',
  renewalDate: '2025-02-15',
  status: 'active',
  usage: [
    { label: 'المنتجات', used: 8, total: 50, unit: 'منتج' },
    { label: 'الفروع', used: 1, total: 1, unit: 'فرع' },
    { label: 'الكاشير', used: 1, total: 5, unit: 'كاشير' },
  ],
};
