/**
 * types/bundle.ts
 * ============================================================
 *  الفكرة #37 — Bundle Builder (منشئ الباقات)
 *  تجميع منتجات في باقة بسعر مخفّض
 * ============================================================
 */

/** عنصر داخل الباقة (مرجع لمنتج + كمية) */
export interface BundleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

/** باقة من المنتجات بسعر مخفّض */
export interface Bundle {
  id: string;
  name: string;
  description: string;
  items: BundleItem[];
  originalPrice: number;
  discountedPrice: number;
  active: boolean;
  createdAt: string;
}

/** حساب السعر الأصلي للباقة (مجموع أسعار العناصر) */
export function calcOriginalPrice(items: BundleItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/** حساب التوفير من الباقة */
export function calcSavings(bundle: Bundle): number {
  return bundle.originalPrice - bundle.discountedPrice;
}

/** نسبة الخصم */
export function calcDiscountPercent(bundle: Bundle): number {
  if (bundle.originalPrice === 0) return 0;
  return Math.round((calcSavings(bundle) / bundle.originalPrice) * 100);
}
