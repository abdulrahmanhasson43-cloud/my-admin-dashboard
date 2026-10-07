import type { PurchaseOrder, PurchaseOrderKanban } from '@/types';

// TODO(phase-3): replace with a real Firestore-backed purchase orders service.
export const sampleOrders: PurchaseOrder[] = [
  { id: 'PO-001', supplier: 'شركة التقنية الحديثة', items: 25, total: 12500, status: 'pending', date: '2025-01-15' },
  { id: 'PO-002', supplier: 'مؤسسة الإكسسوارات', items: 40, total: 8900, status: 'approved', date: '2025-01-14' },
  { id: 'PO-003', supplier: 'مصر للكمبيوتر', items: 15, total: 22400, status: 'received', date: '2025-01-13' },
  { id: 'PO-004', supplier: 'شبكات الشرق الأوسط', items: 20, total: 7800, status: 'pending', date: '2025-01-12' },
  { id: 'PO-005', supplier: 'شركة التقنية الحديثة', items: 30, total: 15600, status: 'approved', date: '2025-01-11' },
];

/* ─────────────────────────────────────────────────────────────
   #39 — Purchase Order Kanban (5 مراحل)
   أوامر شراء بمراحل: تم الطلب → في الطريق → وصل → فحص → استلام
   ───────────────────────────────────────────────────────────── */

export const samplePurchaseKanbanOrders: PurchaseOrderKanban[] = [
  {
    id: 'POK-001',
    supplier: 'شركة التقنية الحديثة',
    items: [
      { productId: '1', name: 'سماعة بلوتوث لاسلكية', quantity: 50, unitCost: 180 },
      { productId: '2', name: 'شاحن سريع 65W', quantity: 30, unitCost: 120 },
    ],
    total: 12600,
    status: 'ordered',
    date: '2026-08-08',
    expectedDelivery: '2026-08-15',
    notes: 'طلب عاجل — تكملة مخزون',
  },
  {
    id: 'POK-002',
    supplier: 'مؤسسة الإكسسوارات',
    items: [
      { productId: '3', name: 'كابل USB-C 2م', quantity: 100, unitCost: 25 },
      { productId: '4', name: 'جراب موبايل سيليكون', quantity: 80, unitCost: 35 },
    ],
    total: 5300,
    status: 'ordered',
    date: '2026-08-07',
    expectedDelivery: '2026-08-14',
  },
  {
    id: 'POK-003',
    supplier: 'مصر للكمبيوتر',
    items: [
      { productId: '5', name: 'ماوس لاسلكي', quantity: 40, unitCost: 80 },
      { productId: '6', name: 'كيبورد ميكانيكي', quantity: 20, unitCost: 320 },
    ],
    total: 9600,
    status: 'in_transit',
    date: '2026-08-05',
    expectedDelivery: '2026-08-12',
    notes: 'شحنة في الطريق من الإسكندرية',
  },
  {
    id: 'POK-004',
    supplier: 'شركة التقنية الحديثة',
    items: [
      { productId: '7', name: 'شاشة 24 بوصة', quantity: 10, unitCost: 2800 },
    ],
    total: 28000,
    status: 'arrived',
    date: '2026-08-03',
    expectedDelivery: '2026-08-10',
    notes: 'وصلت للمخزن — بانتظار الفحص',
  },
  {
    id: 'POK-005',
    supplier: 'مؤسسة الإكسسوارات',
    items: [
      { productId: '3', name: 'كابل USB-C 2م', quantity: 200, unitCost: 22 },
    ],
    total: 4400,
    status: 'inspecting',
    date: '2026-08-02',
    expectedDelivery: '2026-08-09',
    notes: 'جاري فحص الجودة',
  },
  {
    id: 'POK-006',
    supplier: 'مصر للكمبيوتر',
    items: [
      { productId: '8', name: 'راوتر واي فاي', quantity: 25, unitCost: 290 },
    ],
    total: 7250,
    status: 'received',
    date: '2026-07-28',
    expectedDelivery: '2026-08-04',
    notes: 'تم الاستلام وإضافة للمخزون',
  },
];
