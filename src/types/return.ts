/* ─────────────────────────────────────────────────────────────────────
   Returns domain types — drives the Returns Manager (#9)
   ───────────────────────────────────────────────────────────────────── */

export type ReturnType = 'customer' | 'supplier';

export type ReturnStatus =
  | 'pending'    // قيد المراجعة
  | 'approved'   // تم القبول
  | 'refunded';  // تم الاسترداد

export type ReturnReason =
  | 'defective'       // تالف
  | 'wrong_item'      // غلط طلب
  | 'not_satisfied'   // غير راضٍ
  | 'warranty'        // انتهى الضمان
  | 'expired'         // منتهي الصلاحية
  | 'other';          // أخرى

export interface ReturnItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface ReturnRequest {
  id: string;
  type: ReturnType;
  partyName: string;      // اسم العميل أو المورد
  partyPhone?: string;
  originalInvoiceId: string;
  items: ReturnItem[];
  reason: ReturnReason;
  reasonNote?: string;
  status: ReturnStatus;
  refundAmount: number;
  date: string;           // ISO date YYYY-MM-DD
}

export interface ReturnReasonMeta {
  id: ReturnReason;
  label: string;
}

export interface ReturnStatusMeta {
  id: ReturnStatus;
  label: string;
  color: string;       // hex accent
  badgeBg: string;     // tailwind bg
  badgeText: string;   // tailwind text
}

export const returnReasons: ReturnReasonMeta[] = [
  { id: 'defective', label: 'تالف' },
  { id: 'wrong_item', label: 'غلط طلب' },
  { id: 'not_satisfied', label: 'غير راضٍ' },
  { id: 'warranty', label: 'انتهى الضمان' },
  { id: 'expired', label: 'منتهي الصلاحية' },
  { id: 'other', label: 'أخرى' },
];

export const getReturnReasonLabel = (id: ReturnReason): string =>
  returnReasons.find(r => r.id === id)?.label ?? 'أخرى';

export const returnStatuses: ReturnStatusMeta[] = [
  {
    id: 'pending',
    label: 'قيد المراجعة',
    color: '#FF9500',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-600',
  },
  {
    id: 'approved',
    label: 'تم القبول',
    color: '#007AFF',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-600',
  },
  {
    id: 'refunded',
    label: 'تم الاسترداد',
    color: '#34C759',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-600',
  },
];

export const getReturnStatusMeta = (id: ReturnStatus): ReturnStatusMeta =>
  returnStatuses.find(s => s.id === id) ?? returnStatuses[0];
