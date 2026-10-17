import type { ReturnRequest } from '@/types/return';

const today = new Date();
const dateStr = (daysAgo: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

// TODO(phase-3): replace with a real Firestore-backed returns service.
export const sampleReturns: ReturnRequest[] = [
  {
    id: 'RET-001',
    type: 'customer',
    partyName: 'أحمد محمد',
    partyPhone: '01001234567',
    originalInvoiceId: 'INV-2025-001',
    items: [
      { productId: '1', name: 'سماعة بلوتوث لاسلكية', quantity: 1, price: 250 },
    ],
    reason: 'defective',
    reasonNote: 'السماعة لا تشحن',
    status: 'pending',
    refundAmount: 250,
    date: dateStr(0),
  },
  {
    id: 'RET-002',
    type: 'customer',
    partyName: 'سارة إبراهيم',
    partyPhone: '01145678901',
    originalInvoiceId: 'INV-2025-005',
    items: [
      { productId: '3', name: 'كابل USB-C 2م', quantity: 2, price: 45 },
    ],
    reason: 'wrong_item',
    reasonNote: 'الطول غير مناسب',
    status: 'approved',
    refundAmount: 90,
    date: dateStr(1),
  },
  {
    id: 'RET-003',
    type: 'customer',
    partyName: 'خالد محمود',
    partyPhone: '01034567890',
    originalInvoiceId: 'INV-2025-004',
    items: [
      { productId: '4', name: 'جراب موبايل سيليكون', quantity: 1, price: 65 },
    ],
    reason: 'not_satisfied',
    status: 'refunded',
    refundAmount: 65,
    date: dateStr(2),
  },
  {
    id: 'RET-004',
    type: 'supplier',
    partyName: 'شركة التقنية الحديثة',
    originalInvoiceId: 'PO-2025-003',
    items: [
      { productId: '2', name: 'شاحن سريع 65W', quantity: 5, price: 180 },
    ],
    reason: 'defective',
    reasonNote: '3 قطع لا تعمل',
    status: 'pending',
    refundAmount: 900,
    date: dateStr(0),
  },
  {
    id: 'RET-005',
    type: 'supplier',
    partyName: 'مورد الإكسسوارات',
    originalInvoiceId: 'PO-2025-007',
    items: [
      { productId: '3', name: 'كابل USB-C 2م', quantity: 10, price: 45 },
    ],
    reason: 'expired',
    reasonNote: 'تاريخ انتهاء قريب',
    status: 'approved',
    refundAmount: 450,
    date: dateStr(3),
  },
  {
    id: 'RET-006',
    type: 'customer',
    partyName: 'نور الدين',
    partyPhone: '01067890123',
    originalInvoiceId: 'INV-2025-007',
    items: [
      { productId: '7', name: 'شاشة 24 بوصة', quantity: 1, price: 3200 },
    ],
    reason: 'warranty',
    reasonNote: 'بكسل ميت ضمن الضمان',
    status: 'refunded',
    refundAmount: 3200,
    date: dateStr(5),
  },
];
