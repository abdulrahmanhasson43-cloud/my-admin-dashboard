import type { PurchaseOrder } from '@/types';

// TODO(phase-3): replace with a real Firestore-backed purchase orders service.
export const sampleOrders: PurchaseOrder[] = [
  { id: 'PO-001', supplier: 'شركة التقنية الحديثة', items: 25, total: 12500, status: 'pending', date: '2025-01-15' },
  { id: 'PO-002', supplier: 'مؤسسة الإكسسوارات', items: 40, total: 8900, status: 'approved', date: '2025-01-14' },
  { id: 'PO-003', supplier: 'مصر للكمبيوتر', items: 15, total: 22400, status: 'received', date: '2025-01-13' },
  { id: 'PO-004', supplier: 'شبكات الشرق الأوسط', items: 20, total: 7800, status: 'pending', date: '2025-01-12' },
  { id: 'PO-005', supplier: 'شركة التقنية الحديثة', items: 30, total: 15600, status: 'approved', date: '2025-01-11' },
];
