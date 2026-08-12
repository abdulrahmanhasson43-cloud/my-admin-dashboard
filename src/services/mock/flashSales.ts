/**
 * services/mock/flashSales.ts
 * ============================================================
 *  البيانات الوهمية لعروض الفلاش — الفكرة #38
 *  التواريخ ديناميكية بحيث تكون العروض نشطة عند فتح التطبيق
 * ============================================================
 */

import type { FlashSale } from '@/types';

/**
 * إنشاء تواريخ ISO نسبية للوقت الحالي.
 * @param hoursFromNow عدد الساعات من الآن (موجب = مستقبل، سالب = ماضي)
 */
function isoFromNow(hoursFromNow: number): string {
  const date = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
  return date.toISOString();
}

export const sampleFlashSales: FlashSale[] = [
  {
    id: 'flash-1',
    productId: '1',
    productName: 'سماعة بلوتوث لاسلكية',
    originalPrice: 250,
    salePrice: 200,
    totalQty: 100,
    soldQty: 80,
    startAt: isoFromNow(-1),
    endAt: isoFromNow(3),
    active: true,
  },
  {
    id: 'flash-2',
    productId: '5',
    productName: 'ماوس لاسلكي',
    originalPrice: 120,
    salePrice: 85,
    totalQty: 50,
    soldQty: 35,
    startAt: isoFromNow(-2),
    endAt: isoFromNow(6),
    active: true,
  },
];

/** العرض الفلاش النشط حاليًا (أول عرض نشط) */
export const activeFlashSale: FlashSale | null =
  sampleFlashSales.find(s => {
    const now = Date.now();
    return (
      s.active &&
      now >= new Date(s.startAt).getTime() &&
      now <= new Date(s.endAt).getTime() &&
      s.soldQty < s.totalQty
    );
  }) || null;
