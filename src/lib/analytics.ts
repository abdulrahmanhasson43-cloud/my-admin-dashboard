/**
 * lib/analytics.ts
 * ============================================================
 *  دوال تحليلية صافية (pure functions) للأفكار 31-33 و 35 و 40
 *  (#31) buildHeatmap  — بناء الخريطة الحرارية من الفواتير
 *  (#32) buildPerformers — بناء قائمة الأداء من المبيعات
 *  (#33) comparePeriods — مقارنة فترتين زمنيتين
 *  (#35) computeCLV     — حساب قيمة العميل مدى الحياة
 *  (#40) buildPriceHistory — بناء تاريخ السعر + استخراج الرؤى
 * ============================================================
 */

import type {
  HeatmapCell,
  HeatmapInsights,
  HeatmapData,
  PerformerProduct,
  PerformersData,
  PeriodMetrics,
  ProductDelta,
  CompareResult,
  PriceHistoryPoint,
  PriceInsight,
  PriceHistoryData,
} from '@/types';
import type { CustomerCLV, CustomerTier } from '@/types';
import { getTierMeta } from '@/types';
import type { Invoice } from '@/types';
import type { Client } from '@/types';
import type { CompletedSale } from '@/types';

/* ─────────────────────────────────────────────────────────────
   #31 — buildHeatmap (الخريطة الحرارية)
   ───────────────────────────────────────────────────────────── */

/**
 * يبني خريطة حرارية (7 أيام × 15 ساعة) من قائمة فواتير.
 * كل فاتورة تُسجَّل في خلية اليوم والساعة المناسبين.
 *
 * @param invoices قائمة الفواتير (تُستخدم date فقط للحساب)
 * @returns بيانات الخريطة الكاملة + الرؤى المستخرجة
 */
export function buildHeatmap(invoices: Invoice[]): HeatmapData {
  // تهيئة شبكة 7×15 بقيم صفرية
  const cells: HeatmapCell[][] = [];
  for (let day = 0; day < 7; day++) {
    const row: HeatmapCell[] = [];
    for (let hour = 8; hour <= 22; hour++) {
      row.push({ day, hour, count: 0, revenue: 0 });
    }
    cells.push(row);
  }

  // توزيع الفواتير على الخلايا
  for (const inv of invoices) {
    if (inv.status === 'cancelled') continue;
    const date = new Date(inv.date);
    if (isNaN(date.getTime())) continue;

    const day = date.getDay(); // 0=الأحد ... 6=السبت
    // تحويل: الأحد=6 (ليوافق DAYS_AR حيث 0=السبت)
    const adjustedDay = (day + 1) % 7;
    const hour = date.getHours();
    if (hour < 8 || hour > 22) continue;

    const hourIdx = hour - 8;
    const cell = cells[adjustedDay][hourIdx];
    cell.count += 1;
    cell.revenue += inv.total;
  }

  // استخراج الرؤى
  const insights = extractHeatmapInsights(cells);
  return { cells, insights };
}

/**
 * يستخرج الرؤى من شبكة الخريطة الحرارية (الذروة، الأضعف، الإجماليات).
 */
export function extractHeatmapInsights(cells: HeatmapCell[][]): HeatmapInsights {
  let peak = { day: 0, hour: 8, count: 0, revenue: 0 };
  let low: { day: number; hour: number; count: number; revenue: number } | null = null;
  let totalInvoices = 0;
  let totalRevenue = 0;

  for (const row of cells) {
    for (const cell of row) {
      totalInvoices += cell.count;
      totalRevenue += cell.revenue;
      if (cell.count > peak.count) {
        peak = { ...cell };
      }
      // أول خلية لها بيانات تُعتبر "الأضعف" إذا كان عدد آخر منخفض
      if (cell.count > 0) {
        if (low === null || cell.count < low.count) {
          low = { ...cell };
        }
      }
    }
  }

  // إذا لم نجد خلية بها بيانات، نعيّن الأضعف كأول خلية
  if (low === null) {
    low = { day: 0, hour: 8, count: 0, revenue: 0 };
  }

  return {
    peak,
    low,
    totalInvoices,
    totalRevenue,
  };
}

/* ─────────────────────────────────────────────────────────────
   #32 — buildPerformers (أفضل وأسوأ المنتجات)
   ───────────────────────────────────────────────────────────── */

/**
 * يبني قائمة أفضل وأسوأ المنتجات أداءً من قائمة المبيعات المكتملة.
 *
 * @param sales قائمة المبيعات المكتملة
 * @param topN عدد المنتجات في كل قائمة (افتراضي 5)
 * @returns { top: PerformerProduct[], bottom: PerformerProduct[] }
 */
export function buildPerformers(sales: CompletedSale[], topN = 5): PerformersData {
  // تجميع المبيعات لكل منتج
  const map = new Map<
    string,
    { id: string; name: string; category: string; price: number; sold: number; revenue: number }
  >();

  for (const sale of sales) {
    for (const item of sale.items) {
      const existing = map.get(item.id);
      if (existing) {
        existing.sold += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        map.set(item.id, {
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          sold: item.quantity,
          revenue: item.price * item.quantity,
        });
      }
    }
  }

  const all = Array.from(map.values()).map((p) => ({
    ...p,
    change: 0, // التغيير يُحسب عند توفر بيانات الفترة السابقة
  })) as PerformerProduct[];

  // ترتيب تنازلي للإيرادات = الأفضل، تصاعدي = الأسوأ
  const sortedByRevenue = [...all].sort((a, b) => b.revenue - a.revenue);
  const top = sortedByRevenue.slice(0, topN);
  const bottom = [...all].sort((a, b) => a.revenue - b.revenue).slice(0, topN);

  return { top, bottom };
}

/**
 * يدمج قائمتين أداء (الحالية والسابقة) ويحسب نسبة التغيير لكل منتج.
 */
export function mergePerformersWithChange(
  current: PerformerProduct[],
  previous: PerformerProduct[],
): PerformerProduct[] {
  const prevMap = new Map(previous.map((p) => [p.id, p]));
  return current.map((p) => {
    const prev = prevMap.get(p.id);
    if (!prev || prev.sold === 0) return { ...p, change: 0 };
    const change = Math.round(((p.sold - prev.sold) / prev.sold) * 100);
    return { ...p, change };
  });
}

/* ─────────────────────────────────────────────────────────────
   #33 — comparePeriods (مقارنة الفترات)
   ───────────────────────────────────────────────────────────── */

/**
 * يقارن فترتين زمنيتين ويُرجع الفروقات + المنتجات التي زادت/انخفضت مبيعاتها.
 *
 * @param current  مقاييس الفترة الحالية
 * @param previous مقاييس الفترة السابقة
 * @param currentProducts  أداء المنتجات في الفترة الحالية
 * @param previousProducts أداء المنتجات في الفترة السابقة
 * @returns نتيجة المقارنة الكاملة
 */
export function comparePeriods(
  current: PeriodMetrics,
  previous: PeriodMetrics,
  currentProducts: PerformerProduct[] = [],
  previousProducts: PerformerProduct[] = [],
): CompareResult {
  const deltas = {
    sales: current.sales - previous.sales,
    invoices: current.invoices - previous.invoices,
    profit: current.profit - previous.profit,
    expenses: current.expenses - previous.expenses,
  };

  // حساب فروقات المنتجات
  const prevMap = new Map(previousProducts.map((p) => [p.id, p]));
  const productDeltas: ProductDelta[] = currentProducts.map((p) => {
    const prev = prevMap.get(p.id);
    const previousSold = prev?.sold ?? 0;
    const delta = p.sold - previousSold;
    const deltaPercent = previousSold === 0 ? 0 : Math.round((delta / previousSold) * 100);
    return {
      id: p.id,
      name: p.name,
      currentSold: p.sold,
      previousSold,
      delta,
      deltaPercent,
    };
  });

  const increased = productDeltas
    .filter((d) => d.delta > 0)
    .sort((a, b) => b.deltaPercent - a.deltaPercent);
  const decreased = productDeltas
    .filter((d) => d.delta < 0)
    .sort((a, b) => a.deltaPercent - b.deltaPercent);

  return { current, previous, deltas, increased, decreased };
}

/* ─────────────────────────────────────────────────────────────
   #35 — computeCLV (قيمة العميل مدى الحياة)
   ───────────────────────────────────────────────────────────── */

/**
 * يحسب قيمة العميل مدى الحياة (CLV) من بياناته وأنشطته.
 *
 * @param client بيانات العميل
 * @param activities أنشطة العميل (لإيجاد أول وآخر شراء وعدد الفواتير)
 * @returns بيانات CLV الكاملة + المستوى
 */
export function computeCLV(
  client: Client,
  activities: { type: string; amount?: number; date: string }[] = [],
): CustomerCLV {
  // فلترة أنشطة الشراء فقط
  const purchases = activities
    .filter((a) => a.type === 'purchase' && a.amount)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const invoiceCount = purchases.length || 1;
  const totalPurchases = client.totalPurchases;
  const averageInvoice = Math.round(totalPurchases / invoiceCount);

  // تواريخ أول وآخر شراء
  const firstPurchase = purchases[0]?.date ?? client.lastVisit;
  const lastPurchase = purchases[purchases.length - 1]?.date ?? client.lastVisit;

  // عدد الأشهر النشطة
  const monthsActive = computeMonthsActive(firstPurchase, lastPurchase);

  // تحديد المستوى
  const tierMeta = getTierMeta(totalPurchases, lastPurchase);
  const tier: CustomerTier =
    tierMeta.label === 'VIP'
      ? 'vip'
      : tierMeta.label === 'ممتاز'
        ? 'excellent'
        : tierMeta.label === 'عادي'
          ? 'regular'
          : 'dormant';

  return {
    clientId: client.id,
    totalPurchases,
    invoiceCount,
    averageInvoice,
    firstPurchase,
    lastPurchase,
    monthsActive,
    tier,
  };
}

/**
 * يحسب عدد الأشهر بين تاريخين (بحد أدنى 1).
 */
export function computeMonthsActive(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(1, months + 1);
}

/**
 * يحسب القيمة المتوقعة للعميل في الأشهر القادمة (توقع CLV).
 *
 * @param clv بيانات CLV الحالية
 * @param futureMonths عدد الأشهر المستقبلية للتوقع (افتراضي 12)
 * @returns القيمة المتوقعة بالجنيه
 */
export function forecastCLV(clv: CustomerCLV, futureMonths = 12): number {
  if (clv.monthsActive === 0) return 0;
  const monthlyAverage = clv.totalPurchases / clv.monthsActive;
  return Math.round(monthlyAverage * futureMonths);
}

/* ─────────────────────────────────────────────────────────────
   #40 — buildPriceHistory (تاريخ السعر + الرؤى)
   ───────────────────────────────────────────────────────────── */

/**
 * يبني بيانات تاريخ السعر ويستخرج الرؤى (أقل/أعلى سعر، المتوسط، نسبة التغيير).
 *
 * @param points نقاط تاريخ السعر لمنتج
 * @returns بيانات تاريخ السعر الكاملة + الرؤى
 */
export function buildPriceHistory(points: PriceHistoryPoint[]): PriceHistoryData {
  if (points.length === 0) {
    return {
      points: [],
      insight: {
        lowest: { price: 0, supplier: '', date: '' },
        highest: { price: 0, supplier: '', date: '' },
        average: 0,
        changePercent: 0,
      },
    };
  }

  // ترتيب النقاط حسب التاريخ
  const sorted = [...points].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // إيجاد الأقل والأعلى
  let lowest = sorted[0];
  let highest = sorted[0];
  let sum = 0;

  for (const point of sorted) {
    sum += point.price;
    if (point.price < lowest.price) lowest = point;
    if (point.price > highest.price) highest = point;
  }

  const average = Math.round(sum / sorted.length);

  // نسبة التغيير: من أول سعر إلى آخر سعر (لنفس المورد أو المتوسط)
  const firstPoint = sorted[0];
  const lastPoint = sorted[sorted.length - 1];
  const changePercent =
    firstPoint.price === 0
      ? 0
      : Math.round(((lastPoint.price - firstPoint.price) / firstPoint.price) * 100);

  const insight: PriceInsight = {
    lowest: { price: lowest.price, supplier: lowest.supplier, date: lowest.date },
    highest: { price: highest.price, supplier: highest.supplier, date: highest.date },
    average,
    changePercent,
  };

  return { points: sorted, insight };
}

/**
 * يفلتر نقاط تاريخ السعر حسب مورد معيّن.
 */
export function filterPriceBySupplier(
  points: PriceHistoryPoint[],
  supplier: string,
): PriceHistoryPoint[] {
  return points.filter((p) => p.supplier === supplier);
}

/**
 * يحسب أرخص مورد لمنتج بناءً على آخر سعر لكل مورد.
 */
export function findCheapestSupplier(points: PriceHistoryPoint[]): {
  supplier: string;
  price: number;
} | null {
  if (points.length === 0) return null;

  // أخذ آخر نقطة لكل مورد
  const latestBySupplier = new Map<string, PriceHistoryPoint>();
  for (const point of [...points].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())) {
    latestBySupplier.set(point.supplier, point);
  }

  let cheapest: { supplier: string; price: number } | null = null;
  for (const [supplier, point] of latestBySupplier) {
    if (cheapest === null || point.price < cheapest.price) {
      cheapest = { supplier, price: point.price };
    }
  }

  return cheapest;
}
