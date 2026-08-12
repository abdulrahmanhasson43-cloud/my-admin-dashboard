/**
 * types/loyalty.ts
 * ============================================================
 *  الأفكار 35-36 — أنواع نظام الولاء
 *  (#35) Customer Lifetime Value (CLV) — قيمة العميل مدى الحياة
 *  (#36) Loyalty Points System — نظام نقاط الولاء
 * ============================================================
 */

/* ─────────────────────────────────────────────────────────────
   #35 — Customer Lifetime Value (CLV)
   ───────────────────────────────────────────────────────────── */

/** مستوى تصنيف العميل حسب قيمته */
export type CustomerTier = 'vip' | 'excellent' | 'regular' | 'dormant';

/** بيانات CLV لعميل واحد */
export interface CustomerCLV {
  clientId: string;
  totalPurchases: number;
  invoiceCount: number;
  averageInvoice: number;
  firstPurchase: string;
  lastPurchase: string;
  monthsActive: number;
  tier: CustomerTier;
}

/** وصف كل مستوى (الاسم، اللون، الأيقونة) */
export interface TierMeta {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  emoji: string;
}

/** جدول وصف المستويات */
export const tierMeta: Record<CustomerTier, TierMeta> = {
  vip: {
    label: 'VIP',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    emoji: '⭐',
  },
  excellent: {
    label: 'ممتاز',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    emoji: '💎',
  },
  regular: {
    label: 'عادي',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    emoji: '👤',
  },
  dormant: {
    label: 'خامل',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    emoji: '😴',
  },
};

/** تحديد مستوى العميل بناءً على القيمة */
export function getTierMeta(clv: number, lastPurchaseDate: string): TierMeta {
  const monthsSince = (Date.now() - new Date(lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (monthsSince > 3) return tierMeta.dormant;
  if (clv > 10000) return tierMeta.vip;
  if (clv > 5000) return tierMeta.excellent;
  return tierMeta.regular;
}

/* ─────────────────────────────────────────────────────────────
   #36 — Loyalty Points System
   ───────────────────────────────────────────────────────────── */

/** مستوى العميل في نظام النقاط */
export type LoyaltyLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

/** وصف كل مستوى نقاط */
export interface LoyaltyLevelMeta {
  label: string;
  minPoints: number;
  color: string;
  bgColor: string;
  emoji: string;
}

/** جدول مستويات النقاط */
export const loyaltyLevels: LoyaltyLevelMeta[] = [
  { label: 'برونزي', minPoints: 0, color: 'text-amber-700', bgColor: 'bg-amber-100', emoji: '🥉' },
  { label: 'فضي', minPoints: 500, color: 'text-gray-600', bgColor: 'bg-gray-200', emoji: '🥈' },
  { label: 'ذهبي', minPoints: 1500, color: 'text-yellow-600', bgColor: 'bg-yellow-100', emoji: '🥇' },
  { label: 'بلاتيني', minPoints: 3000, color: 'text-cyan-600', bgColor: 'bg-cyan-100', emoji: '🏆' },
];

/** الحصول على مستوى العميل بناءً على نقاطه */
export function getLoyaltyLevel(points: number): LoyaltyLevelMeta {
  for (let i = loyaltyLevels.length - 1; i >= 0; i--) {
    if (points >= loyaltyLevels[i].minPoints) return loyaltyLevels[i];
  }
  return loyaltyLevels[0];
}

/** الحصول على المستوى التالي */
export function getNextLoyaltyLevel(points: number): LoyaltyLevelMeta | null {
  for (const level of loyaltyLevels) {
    if (points < level.minPoints) return level;
  }
  return null; // وصل للحد الأقصى
}

/** معاملة كسب نقاط */
export interface PointsEarnTransaction {
  id: string;
  clientId: string;
  invoiceId: string;
  points: number;
  date: string;
}

/** معاملة استبدال نقاط */
export interface PointsRedeemTransaction {
  id: string;
  clientId: string;
  reward: string;
  pointsSpent: number;
  date: string;
}

/** نوع المكافأة */
export type RewardType = 'discount_50' | 'discount_120' | 'free_product';

/** خيار مكافأة للاستبدال */
export interface RewardOption {
  type: RewardType;
  label: string;
  pointsCost: number;
  description: string;
  emoji: string;
}

/** خيارات المكافآت المتاحة */
export const rewardOptions: RewardOption[] = [
  {
    type: 'discount_50',
    label: 'خصم 50 جنيه',
    pointsCost: 100,
    description: 'خصم مباشر 50 جنيه على فاتورتك القادمة',
    emoji: '💰',
  },
  {
    type: 'discount_120',
    label: 'خصم 120 جنيه',
    pointsCost: 200,
    description: 'خصم مباشر 120 جنيه على فاتورتك القادمة',
    emoji: '💵',
  },
  {
    type: 'free_product',
    label: 'منتج مجاني',
    pointsCost: 500,
    description: 'احصل على منتج مجاني بقيمة حتى 200 جنيه',
    emoji: '🎁',
  },
];

/** ملخص نقاط العميل */
export interface LoyaltySummary {
  currentPoints: number;
  redeemedPoints: number;
  totalEarned: number;
  level: LoyaltyLevelMeta;
  nextLevel: LoyaltyLevelMeta | null;
  pointsToNext: number;
}
