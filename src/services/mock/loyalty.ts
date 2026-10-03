/**
 * services/mock/loyalty.ts
 * ============================================================
 *  البيانات الوهمية لنظام الولاء — الأفكار 35-36
 *  (#35) CLV data — قيمة العميل
 *  (#36) Loyalty points — معاملات النقاط
 * ============================================================
 */

import type {
  PointsEarnTransaction,
  PointsRedeemTransaction,
  LoyaltySummary,
} from '@/types';
import { getLoyaltyLevel, getNextLoyaltyLevel } from '@/types';

/* ─────────────────────────────────────────────────────────────
   #36 — Points Transactions (معاملات النقاط)
   ───────────────────────────────────────────────────────────── */

/** معاملات كسب النقاط */
export const pointsEarned: PointsEarnTransaction[] = [
  { id: 'pe-1', clientId: '1', invoiceId: 'INV-2025-001', points: 125, date: '2026-08-01' },
  { id: 'pe-2', clientId: '1', invoiceId: 'INV-2025-015', points: 85, date: '2026-07-15' },
  { id: 'pe-3', clientId: '1', invoiceId: 'INV-2025-022', points: 60, date: '2026-06-20' },
  { id: 'pe-4', clientId: '2', invoiceId: 'INV-2025-002', points: 340, date: '2026-08-05' },
  { id: 'pe-5', clientId: '2', invoiceId: 'INV-2025-018', points: 180, date: '2026-07-22' },
  { id: 'pe-6', clientId: '3', invoiceId: 'INV-2025-003', points: 78, date: '2026-08-03' },
  { id: 'pe-7', clientId: '4', invoiceId: 'INV-2025-004', points: 210, date: '2026-07-28' },
  { id: 'pe-8', clientId: '7', invoiceId: 'INV-2025-007', points: 450, date: '2026-08-08' },
  { id: 'pe-9', clientId: '7', invoiceId: 'INV-2025-020', points: 320, date: '2026-07-30' },
];

/** معاملات استبدال النقاط */
export const pointsRedeemed: PointsRedeemTransaction[] = [
  { id: 'pr-1', clientId: '1', reward: 'خصم 50 جنيه', pointsSpent: 100, date: '2026-07-10' },
  { id: 'pr-2', clientId: '2', reward: 'خصم 120 جنيه', pointsSpent: 200, date: '2026-06-15' },
  { id: 'pr-3', clientId: '7', reward: 'منتج مجاني', pointsSpent: 500, date: '2026-07-05' },
];

/**
 * حساب نقاط العميل الحالية (المكتسبة - المستبدلة)
 */
export function getClientPoints(clientId: string): number {
  const earned = pointsEarned
    .filter(p => p.clientId === clientId)
    .reduce((sum, p) => sum + p.points, 0);
  const redeemed = pointsRedeemed
    .filter(p => p.clientId === clientId)
    .reduce((sum, p) => sum + p.pointsSpent, 0);
  return earned - redeemed;
}

/**
 * الحصول على ملخص نقاط العميل الكامل
 */
export function getLoyaltySummary(clientId: string): LoyaltySummary {
  const currentPoints = getClientPoints(clientId);
  const redeemedPoints = pointsRedeemed
    .filter(p => p.clientId === clientId)
    .reduce((sum, p) => sum + p.pointsSpent, 0);
  const totalEarned = currentPoints + redeemedPoints;
  const level = getLoyaltyLevel(currentPoints);
  const nextLevel = getNextLoyaltyLevel(currentPoints);
  const pointsToNext = nextLevel ? nextLevel.minPoints - currentPoints : 0;

  return {
    currentPoints,
    redeemedPoints,
    totalEarned,
    level,
    nextLevel,
    pointsToNext,
  };
}

/**
 * حساب نقاط فاتورة (1 جنيه = 0.1 نقطة)
 */
export function calcInvoicePoints(amount: number): number {
  return Math.floor(amount * 0.1);
}
