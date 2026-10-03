import type { Invoice } from '@/types';

// TODO(phase-3): replace with a real Firestore-backed invoices service.
export const sampleInvoices: Invoice[] = [
  { id: 'INV-2025-001', customer: 'أحمد محمد', amount: 1250, tax: 175, total: 1425, method: 'كاش', date: '2025-01-15 14:30', status: 'paid', items: 3 },
  { id: 'INV-2025-002', customer: 'محمد علي', amount: 3400, tax: 476, total: 3876, method: 'بطاقة', date: '2025-01-15 12:15', status: 'paid', items: 5 },
  { id: 'INV-2025-003', customer: 'فاطمة أحمد', amount: 780, tax: 109, total: 889, method: 'محفظة', date: '2025-01-14 16:45', status: 'pending', items: 2 },
  { id: 'INV-2025-004', customer: 'خالد محمود', amount: 2100, tax: 294, total: 2394, method: 'كاش', date: '2025-01-14 10:20', status: 'paid', items: 4 },
  { id: 'INV-2025-005', customer: 'سارة إبراهيم', amount: 560, tax: 78, total: 638, method: 'إنستاباي', date: '2025-01-13 18:00', status: 'paid', items: 1 },
  { id: 'INV-2025-006', customer: 'عمر حسن', amount: 1890, tax: 265, total: 2155, method: 'بطاقة', date: '2025-01-13 11:30', status: 'cancelled', items: 3 },
  { id: 'INV-2025-007', customer: 'نور الدين', amount: 4500, tax: 630, total: 5130, method: 'كاش', date: '2025-01-12 15:00', status: 'paid', items: 7 },
  { id: 'INV-2025-008', customer: 'ليلى سامي', amount: 320, tax: 45, total: 365, method: 'محفظة', date: '2025-01-12 09:45', status: 'paid', items: 1 },
];
