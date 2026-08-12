import type { Client } from '@/types';

/* ─────────────────────────────────────────────────────────────────────────────
   Client activity timeline — drives the Side Panel "timeline" tab (#3)
   ───────────────────────────────────────────────────────────────────────────── */
export interface ClientActivity {
  id: string;
  clientId: string;
  type: 'purchase' | 'visit' | 'call' | 'return' | 'note';
  description: string;
  amount?: number;
  date: string;     // ISO date
}

export const clientActivities: ClientActivity[] = [
  // Ahmed — client 1
  { id: 'a1-1', clientId: '1', type: 'purchase', description: 'فاتورة بيع #INV-2045 — 3 منتجات', amount: 1850, date: '2025-01-15' },
  { id: 'a1-2', clientId: '1', type: 'visit', description: 'زيارة المتجر', date: '2025-01-15' },
  { id: 'a1-3', clientId: '1', type: 'call', description: 'مكالمة هاتفية — استفسار عن منتج', date: '2025-01-10' },
  { id: 'a1-4', clientId: '1', type: 'purchase', description: 'فاتورة بيع #INV-1980 — 2 منتجات', amount: 960, date: '2025-01-08' },
  { id: 'a1-5', clientId: '1', type: 'note', description: 'يفضل الدفع نقداً، عميل منتظم', date: '2025-01-05' },
  // Mohamed — client 2
  { id: 'a2-1', clientId: '2', type: 'purchase', description: 'فاتورة بيع #INV-2050 — 5 منتجات', amount: 4200, date: '2025-01-15' },
  { id: 'a2-2', clientId: '2', type: 'visit', description: 'زيارة المتجر', date: '2025-01-15' },
  { id: 'a2-3', clientId: '2', type: 'purchase', description: 'فاتورة بيع #INV-1990 — 8 منتجات', amount: 6800, date: '2025-01-12' },
  { id: 'a2-4', clientId: '2', type: 'call', description: 'مكالمة — تأكيد طلبية', date: '2025-01-11' },
  // Fatma — client 3
  { id: 'a3-1', clientId: '3', type: 'purchase', description: 'فاتورة بيع #INV-2048 — 2 منتجات', amount: 1200, date: '2025-01-14' },
  { id: 'a3-2', clientId: '3', type: 'return', description: 'مرتجع منتج — استبدال مقاس', amount: -350, date: '2025-01-14' },
  { id: 'a3-3', clientId: '3', type: 'visit', description: 'زيارة المتجر', date: '2025-01-14' },
  { id: 'a3-4', clientId: '3', type: 'note', description: 'مهتمة بعروض الأزياء الجديدة', date: '2025-01-09' },
  // Khaled — client 4
  { id: 'a4-1', clientId: '4', type: 'purchase', description: 'فاتورة بيع #INV-2042 — 4 منتجات', amount: 3100, date: '2025-01-14' },
  { id: 'a4-2', clientId: '4', type: 'visit', description: 'زيارة المتجر', date: '2025-01-14' },
  { id: 'a4-3', clientId: '4', type: 'purchase', description: 'فاتورة بيع #INV-2001 — 3 منتجات', amount: 2400, date: '2025-01-11' },
  // Sara — client 5
  { id: 'a5-1', clientId: '5', type: 'call', description: 'مكالمة — شكوى من تأخير الطلب', date: '2025-01-13' },
  { id: 'a5-2', clientId: '5', type: 'purchase', description: 'فاتورة بيع #INV-2015 — 1 منتج', amount: 560, date: '2025-01-13' },
  { id: 'a5-3', clientId: '5', type: 'note', description: 'عميلة غير منتظمة، تحتاج متابعة', date: '2025-01-06' },
  // Omar — client 6
  { id: 'a6-1', clientId: '6', type: 'purchase', description: 'فاتورة بيع #INV-2038 — 6 منتجات', amount: 5400, date: '2025-01-13' },
  { id: 'a6-2', clientId: '6', type: 'visit', description: 'زيارة المتجر', date: '2025-01-13' },
  { id: 'a6-3', clientId: '6', type: 'purchase', description: 'فاتورة بيع #INV-1995 — 4 منتجات', amount: 3200, date: '2025-01-10' },
  { id: 'a6-4', clientId: '6', type: 'call', description: 'مكالمة — استفسار عن خصم جملة', date: '2025-01-08' },
  // Nour — client 7
  { id: 'a7-1', clientId: '7', type: 'purchase', description: 'فاتورة بيع #INV-2055 — 10 منتجات', amount: 9800, date: '2025-01-12' },
  { id: 'a7-2', clientId: '7', type: 'visit', description: 'زيارة المتجر', date: '2025-01-12' },
  { id: 'a7-3', clientId: '7', type: 'purchase', description: 'فاتورة بيع #INV-1988 — 7 منتجات', amount: 7500, date: '2025-01-09' },
  { id: 'a7-4', clientId: '7', type: 'note', description: 'أكبر عميل — VIP، يفضل التواصل عبر واتساب', date: '2025-01-04' },
  // Laila — client 8
  { id: 'a8-1', clientId: '8', type: 'purchase', description: 'فاتورة بيع #INV-1970 — 1 منتج', amount: 320, date: '2025-01-10' },
  { id: 'a8-2', clientId: '8', type: 'note', description: 'عميلة نادرة الزيارة', date: '2025-01-03' },
];

// TODO(phase-3): replace with a real Firestore-backed clients service.
export const sampleClients: Client[] = [
  { id: '1', name: 'أحمد محمد', phone: '01001234567', email: 'ahmed@email.com', totalPurchases: 12500, lastVisit: '2025-01-15', status: 'active' },
  { id: '2', name: 'محمد علي', phone: '01112345678', email: 'mohamed@email.com', totalPurchases: 34200, lastVisit: '2025-01-15', status: 'active' },
  { id: '3', name: 'فاطمة أحمد', phone: '01223456789', email: 'fatma@email.com', totalPurchases: 7800, lastVisit: '2025-01-14', status: 'active' },
  { id: '4', name: 'خالد محمود', phone: '01034567890', email: 'khaled@email.com', totalPurchases: 21500, lastVisit: '2025-01-14', status: 'active' },
  { id: '5', name: 'سارة إبراهيم', phone: '01145678901', email: 'sara@email.com', totalPurchases: 5600, lastVisit: '2025-01-13', status: 'inactive' },
  { id: '6', name: 'عمر حسن', phone: '01256789012', email: 'omar@email.com', totalPurchases: 18900, lastVisit: '2025-01-13', status: 'active' },
  { id: '7', name: 'نور الدين', phone: '01067890123', email: 'nour@email.com', totalPurchases: 45000, lastVisit: '2025-01-12', status: 'active' },
  { id: '8', name: 'ليلى سامي', phone: '01178901234', email: 'laila@email.com', totalPurchases: 3200, lastVisit: '2025-01-10', status: 'inactive' },
];
