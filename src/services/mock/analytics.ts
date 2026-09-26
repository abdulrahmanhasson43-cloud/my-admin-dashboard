/**
 * services/mock/analytics.ts
 * ============================================================
 *  البيانات الوهمية للتحليلات — الأفكار 31-33 و 40
 *  (#31) Heatmap data — بيانات الخريطة الحرارية
 *  (#32) Performers data — بيانات الأداء
 *  (#33) Compare data — بيانات مقارنة الفترات
 *  (#40) Price History data — بيانات تاريخ الأسعار
 * ============================================================
 */

import type {
  HeatmapCell,
  PerformerProduct,
  PeriodMetrics,
  PriceHistoryPoint,
} from '@/types';
import { sampleProducts } from './products';

/* ─────────────────────────────────────────────────────────────
   #31 — Heatmap Data
   خريطة حرارية: أيام الأسبوع × ساعات اليوم
   ───────────────────────────────────────────────────────────── */

/**
 * توليد بيانات الخريطة الحرارية بشكل واقعي.
 * كل خلية تحتوي على عدد الفواتير والإيرادات في تلك الساعة من ذلك اليوم.
 * النمط: الذروة في المساء (5م-9م) وأيام الجمعة/الخميس أقوى.
 */
function generateHeatmapCells(): HeatmapCell[][] {
  const cells: HeatmapCell[][] = [];
  // لكل يوم (0=السبت ... 6=الجمعة)
  for (let day = 0; day < 7; day++) {
    const row: HeatmapCell[] = [];
    for (let hour = 8; hour <= 22; hour++) {
      // عامل الذروة: المساء (17-21) أعلى
      const eveningBoost = hour >= 17 && hour <= 21 ? 1.8 : 1;
      // عامل اليوم: الجمعة (6) والخميس (5) أعلى
      const dayBoost = day === 6 ? 1.5 : day === 5 ? 1.3 : 1;
      // عامل الصباح الباكر (8-9) أقل
      const morningPenalty = hour <= 9 ? 0.4 : 1;
      // قيمة عشوائية أساسية
      const base = 2 + Math.floor(Math.random() * 5);
      const count = Math.max(0, Math.round(base * eveningBoost * dayBoost * morningPenalty));
      const revenue = count * (150 + Math.floor(Math.random() * 400));
      row.push({ day, hour, count, revenue });
    }
    cells.push(row);
  }
  return cells;
}

export const heatmapCells: HeatmapCell[][] = generateHeatmapCells();

/* ─────────────────────────────────────────────────────────────
   #32 — Performers Data
   أفضل وأسوأ المنتجات
   ───────────────────────────────────────────────────────────── */

export const topPerformers: PerformerProduct[] = [
  { id: '1', name: 'سماعة بلوتوث لاسلكية', category: 'إلكترونيات', price: 250, sold: 245, revenue: 61250, change: 18 },
  { id: '5', name: 'ماوس لاسلكي', category: 'كمبيوتر', price: 120, sold: 180, revenue: 21600, change: 12 },
  { id: '3', name: 'كابل USB-C 2م', category: 'إكسسوارات', price: 45, sold: 320, revenue: 14400, change: 25 },
  { id: '4', name: 'جراب موبايل سيليكون', category: 'إكسسوارات', price: 65, sold: 150, revenue: 9750, change: 8 },
  { id: '2', name: 'شاحن سريع 65W', category: 'إلكترونيات', price: 180, sold: 95, revenue: 17100, change: -5 },
];

export const bottomPerformers: PerformerProduct[] = [
  { id: '7', name: 'شاشة 24 بوصة', category: 'شاشات', price: 3200, sold: 3, revenue: 9600, change: -22 },
  { id: '8', name: 'راوتر واي فاي', category: 'شبكات', price: 380, sold: 12, revenue: 4560, change: -15 },
  { id: '6', name: 'كيبورد ميكانيكي', category: 'كمبيوتر', price: 450, sold: 8, revenue: 3600, change: -10 },
  { id: '2', name: 'شاحن سريع 65W', category: 'إلكترونيات', price: 180, sold: 15, revenue: 2700, change: -5 },
  { id: '1', name: 'سماعة بلوتوث لاسلكية', category: 'إلكترونيات', price: 250, sold: 20, revenue: 5000, change: 3 },
];

/* ─────────────────────────────────────────────────────────────
   #33 — Compare Periods Data
   مقارنة فترتين
   ───────────────────────────────────────────────────────────── */

export const periodData: Record<string, PeriodMetrics> = {
  '2026-07': { period: '2026-07', sales: 72450, invoices: 353, profit: 5250, expenses: 1240 },
  '2026-06': { period: '2026-06', sales: 65200, invoices: 310, profit: 4800, expenses: 980 },
  '2026-05': { period: '2026-05', sales: 58900, invoices: 285, profit: 4100, expenses: 1100 },
  '2026-04': { period: '2026-04', sales: 62300, invoices: 298, profit: 4500, expenses: 850 },
  '2026-03': { period: '2026-03', sales: 54000, invoices: 260, profit: 3900, expenses: 1050 },
  '2026-02': { period: '2026-02', sales: 48700, invoices: 235, profit: 3400, expenses: 920 },
  '2026-01': { period: '2026-01', sales: 51200, invoices: 248, profit: 3700, expenses: 1100 },
};

/** قائمة الفترات المتاحة للمقارنة */
export const availablePeriods = Object.keys(periodData).sort().reverse();

/* ─────────────────────────────────────────────────────────────
   #40 — Price History Data
   تاريخ الأسعار لكل منتج من كل مورد
   ───────────────────────────────────────────────────────────── */

/** الموردون المتاحون */
export const priceSuppliers = ['مؤسسة الإكسسوارات', 'شركة التقنية الحديثة', 'مصر للكمبيوتر'];

/**
 * توليد تاريخ أسعار لمنتج معيّن.
 * يحاكي تغيّر السعر عبر الأشهر من يناير إلى أغسطس 2026.
 */
function generatePriceHistory(productId: string): PriceHistoryPoint[] {
  const product = sampleProducts.find(p => p.id === productId);
  if (!product) return [];

  const basePrice = product.cost;
  const points: PriceHistoryPoint[] = [];
  const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'];

  for (const month of months) {
    // كل مورد له سعر مختلف قليلاً
    for (const supplier of priceSuppliers) {
      // نسبة تذبذب عشوائية ±15%
      const variation = 1 + (Math.random() - 0.5) * 0.3;
      const supplierFactor = supplier === 'مصر للكمبيوتر' ? 0.92 : supplier === 'مؤسسة الإكسسوارات' ? 1.05 : 1.0;
      const price = Math.round((basePrice * variation * supplierFactor) / 5) * 5;
      points.push({ date: `${month}-15`, supplier, price });
    }
  }
  return points;
}

/** تاريخ الأسعار لكل منتج (مفتاح = معرّف المنتج) */
export const mockPriceHistory: Record<string, PriceHistoryPoint[]> = {
  '1': generatePriceHistory('1'),
  '2': generatePriceHistory('2'),
  '3': generatePriceHistory('3'),
  '5': generatePriceHistory('5'),
  '6': generatePriceHistory('6'),
};
