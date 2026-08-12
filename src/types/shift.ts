import type { ComponentType } from 'react';

/**
 * إدارة الورديات (Shift Management) — الفكرة #4
 * كل كاشير يفتح "وردية" بمبلغ افتتاحي، يبيع، ثم يقفلها بمبلغ ختامي.
 */
export interface Shift {
  id: string;
  cashierName: string;
  openingAmount: number;
  closingAmount: number | null;
  startedAt: string;
  closedAt: string | null;
  status: 'open' | 'closed';
  /** إجمالي مبيعات الوردية (يُحسب من الفواتير) */
  totalSales: number;
  /** عدد الفواتير */
  invoiceCount: number;
  /** الفرق بين المبلغ الختامي والمتوقع (يُحسب عند الإغلاق) — الفكرة #14 */
  variance?: number;
  /** المبلغ المتوقع في الصندوق = افتتاحي + مبيعات — الفكرة #14 */
  expectedAmount?: number;
}

/**
 * مركز التنبيهات (Notifications Center) — الفكرة #9
 */
export type NotificationType = 'stock' | 'invoice' | 'supplier' | 'goal' | 'shift' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  /** مسار التنقل عند الضغط على التنبيه */
  link?: string;
}

/**
 * هدف المبيعات الشهري (Sales Goal) — الفكرة #3
 */
export interface SalesGoal {
  /** الشهر بصيغة YYYY-MM */
  month: string;
  target: number;
  /** المبلغ المحقق حتى الآن (يُحسب من المبيعات) */
  achieved: number;
}

/**
 * الأوامر المعلقة في POS (Hold Order) — الفكرة #8
 */
export interface HeldOrder {
  id: string;
  label: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  /** سبب تعليق الطلب (اختياري) */
  reason?: string;
}

/**
 * سجل النشاطات (Activity Log) — فكرة جديدة #34
 */
export interface ActivityEntry {
  id: string;
  type: 'sale' | 'product' | 'stock' | 'supplier' | 'shift' | 'settings';
  description: string;
  amount?: number;
  timestamp: string;
  icon?: ComponentType<{ className?: string; size?: number }>;
}

/**
 * إدخال سجل النشاطات — فكرة جديدة #34
 */
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}
