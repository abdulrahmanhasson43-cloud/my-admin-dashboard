export interface PurchaseOrder {
  id: string;
  supplier: string;
  items: number;
  total: number;
  status: 'pending' | 'approved' | 'received';
  date: string;
}

/* ─────────────────────────────────────────────────────────────
   #39 — Purchase Order Pipeline (خط أنابيب Kanban بـ 5 مراحل)
   ───────────────────────────────────────────────────────────── */

import type { IconComponent } from './analytics';

/** مراحل أمر الشراء في الـ Kanban */
export type PurchaseOrderStatus =
  | 'ordered'
  | 'in_transit'
  | 'arrived'
  | 'inspecting'
  | 'received';

/** عنصر داخل أمر شراء Kanban */
export interface PurchaseOrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitCost: number;
}

/** أمر شراء Kanban — النسخة الموسّعة (5 مراحل) */
export interface PurchaseOrderKanban {
  id: string;
  supplier: string;
  items: PurchaseOrderItem[];
  total: number;
  status: PurchaseOrderStatus;
  date: string;
  expectedDelivery: string;
  notes?: string;
}

/** وصف كل مرحلة في الـ Kanban */
export interface PurchaseOrderStatusMeta {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: IconComponent;
}

/** ترتيب المراحل */
export const purchaseOrderStatuses: PurchaseOrderStatus[] = [
  'ordered',
  'in_transit',
  'arrived',
  'inspecting',
  'received',
];
