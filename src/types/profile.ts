/* ─────────────────────────────────────────────────────────────────────
   Profile & Store Branding types — drives the Profile page (#8)
   ───────────────────────────────────────────────────────────────────── */

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl?: string;
}

export interface StoreBranding {
  storeName: string;
  tagline: string;
  logoUrl?: string;
  primaryColor: string;   // hex — drives --vuno-primary
  accentColor: string;    // hex — secondary accent
}

export interface UsageStat {
  label: string;
  used: number;
  total: number;
  unit: string;
}

export interface SubscriptionInfo {
  planName: string;
  price: number;
  period: string;
  renewalDate: string;     // ISO date
  status: 'active' | 'trial' | 'expired';
  usage: UsageStat[];
}

/** Preset color swatches for the color picker */
export interface ColorPreset {
  name: string;
  primary: string;
  accent: string;
}

/* ──────────────────────────────────────────────────────────────────────────
   Domain defaults — the canonical seed values for a fresh account.
   These live in the domain layer (not in services/mock) so that both the UI
   and the repositories depend on the domain, never on a storage detail.
   ────────────────────────────────────────────────────────────────────────── */

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

export const brandColorPresets: ColorPreset[] = [
  { name: 'أزرق فنو', primary: '#0066CC', accent: '#34C759' },
  { name: 'بنفسجي ملكي', primary: '#7C3AED', accent: '#EC4899' },
  { name: 'أخضر زمردي', primary: '#059669', accent: '#F59E0B' },
  { name: 'برتقالي ناري', primary: '#EA580C', accent: '#FBBF24' },
  { name: 'وردي عصري', primary: '#DB2777', accent: '#8B5CF6' },
  { name: 'تركواز', primary: '#0891B2', accent: '#10B981' },
  { name: 'أحمر كلاسيك', primary: '#DC2626', accent: '#1F2937' },
  { name: 'رمادي أنيق', primary: '#4B5563', accent: '#3B82F6' },
];
