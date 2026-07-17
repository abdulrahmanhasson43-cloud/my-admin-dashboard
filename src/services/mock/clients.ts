import type { Client } from '@/types';

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
