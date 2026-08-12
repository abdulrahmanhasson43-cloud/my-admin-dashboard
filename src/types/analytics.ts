/**
 * types/analytics.ts
 * ============================================================
 *  الأفكار 31-33 و 40 — أنواع التحليلات
 *  (#31) Sales Heatmap — خريطة حرارية للمبيعات
 *  (#32) Top & Bottom Performers — أفضل وأسوأ المنتجات
 *  (#33) Compare Periods — مقارنة الفترات
 *  (#40) Price History Chart — تاريخ الأسعار
 * ============================================================
 */

import type React from 'react';

/** نوع الأيقونة المتوافق مع المشروع — React.FC بمُدخلات اختيارية */
export type IconComponent = React.FC<{ className?: string; size?: number }>;

/* ─────────────────────────────────────────────────────────────
   #31 — Sales Heatmap (الخريطة الحرارية للمبيعات)
   ───────────────────────────────────────────────────────────── */

/** خلية واحدة في الخريطة الحرارية — تمثّل ساعة في يوم */
export interface HeatmapCell {
  /** اليوم: 0 = السبت … 6 = الجمعة */
  day: number;
  /** الساعة: 8 … 22 */
  hour: number;
  /** عدد الفواتير في تلك الخلية */
  count: number;
  /** إجمالي المبيعات بالجنيه */
  revenue: number;
}

/** الأيام بالعربية — السبت إلى الجمعة */
export const DAYS_AR = [
  'السبت',
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
];

/** النطاق الزمني المعروض: 8 صباحًا → 10 مساءً */
export const HOURS_RANGE = Array.from({ length: 15 }, (_, i) => i + 8); // 8..22

/** رؤى مستخرجة من بيانات الخريطة الحرارية */
export interface HeatmapInsights {
  /** أقوى وقت (أعلى مبيعات) */
  peak: { day: number; hour: number; count: number; revenue: number };
  /** أضعف وقت (أقل مبيعات) */
  low: { day: number; hour: number; count: number; revenue: number };
  /** إجمالي الفواتير */
  totalInvoices: number;
  /** إجمالي الإيرادات */
  totalRevenue: number;
}

/** بيانات الخريطة الحرارية الكاملة + الرؤى */
export interface HeatmapData {
  cells: HeatmapCell[][];
  insights: HeatmapInsights;
}

/* ─────────────────────────────────────────────────────────────
   #32 — Top & Bottom Performers (أفضل وأسوأ المنتجات)
   ───────────────────────────────────────────────────────────── */

/** منتج مع إحصائيات الأداء */
export interface PerformerProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  /** عدد القطع المباعة */
  sold: number;
  /** إجمالي الإيرادات */
  revenue: number;
  /** نسبة التغيّر مقارنة بالفترة السابقة */
  change: number;
}

/** بيانات الأداء الكاملة */
export interface PerformersData {
  top: PerformerProduct[];
  bottom: PerformerProduct[];
}

/* ─────────────────────────────────────────────────────────────
   #33 — Compare Periods (مقارنة الفترات)
   ───────────────────────────────────────────────────────────── */

/** مقاييس فترة واحدة */
export interface PeriodMetrics {
  period: string;
  sales: number;
  invoices: number;
  profit: number;
  expenses: number;
}

/** فرق منتج بين فترتين */
export interface ProductDelta {
  id: string;
  name: string;
  currentSold: number;
  previousSold: number;
  delta: number;
  deltaPercent: number;
}

/** نتيجة المقارنة بين فترتين */
export interface CompareResult {
  current: PeriodMetrics;
  previous: PeriodMetrics;
  deltas: {
    sales: number;
    invoices: number;
    profit: number;
    expenses: number;
  };
  increased: ProductDelta[];
  decreased: ProductDelta[];
}

/* ─────────────────────────────────────────────────────────────
   #34 — Live Activity Feed (تغذية الأنشطة الحية)
   ملاحظة: نوع ActivityEntry مُعرّف بالفعل في types/shift.ts
   ───────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────
   #40 — Price History Chart (تاريخ الأسعار)
   ───────────────────────────────────────────────────────────── */

/** نقطة في تاريخ سعر المنتج */
export interface PriceHistoryPoint {
  date: string;
  supplier: string;
  price: number;
}

/** رؤية مستخرجة من تاريخ الأسعار */
export interface PriceInsight {
  lowest: { price: number; supplier: string; date: string };
  highest: { price: number; supplier: string; date: string };
  average: number;
  changePercent: number;
}

/** بيانات تاريخ الأسعار الكاملة + الرؤى */
export interface PriceHistoryData {
  points: PriceHistoryPoint[];
  insight: PriceInsight;
}
