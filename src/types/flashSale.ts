/**
 * types/flashSale.ts
 * ============================================================
 *  الفكرة #38 — Flash Sales (عروض فلاش محدودة بالوقت)
 *  عرض خاص بعدّ تنازلي وكمية محدودة
 * ============================================================
 */

/** عرض فلاش — منتج بسعر مخفّض لفترة محدودة */
export interface FlashSale {
  id: string;
  productId: string;
  productName: string;
  originalPrice: number;
  salePrice: number;
  /** الكمية المتاحة للعرض */
  totalQty: number;
  /** الكمية المباعة حتى الآن */
  soldQty: number;
  /** تاريخ بداية العرض (ISO) */
  startAt: string;
  /** تاريخ نهاية العرض (ISO) */
  endAt: string;
  active: boolean;
}

/** هل العرض ما زال نشطًا؟ (داخل النطاق الزمني + له كمية متبقية) */
export function isFlashSaleActive(sale: FlashSale): boolean {
  if (!sale.active) return false;
  const now = Date.now();
  const start = new Date(sale.startAt).getTime();
  const end = new Date(sale.endAt).getTime();
  return now >= start && now <= end && sale.soldQty < sale.totalQty;
}

/** الكمية المتبقية */
export function remainingQty(sale: FlashSale): number {
  return Math.max(0, sale.totalQty - sale.soldQty);
}

/** نسبة التقدّم (كم بيع حتى الآن) */
export function saleProgress(sale: FlashSale): number {
  if (sale.totalQty === 0) return 0;
  return Math.min(100, Math.round((sale.soldQty / sale.totalQty) * 100));
}

/** العدّاد التنازلي — ساعات، دقائق، ثواني */
export interface Countdown {
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

/** حساب الوقت المتبقي حتى تاريخ معيّن */
export function getRemaining(endIso: string): Countdown {
  const diff = new Date(endIso).getTime() - Date.now();
  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, done: true };
  }
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds, done: false };
}
