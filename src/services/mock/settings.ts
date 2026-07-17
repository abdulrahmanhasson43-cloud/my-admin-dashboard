import type { StaffMember, PaymentMethodConfig } from '@/types';

// TODO(phase-3): replace with real Firestore-backed staff/payment config.
export const staffMembers: StaffMember[] = [
  { id: '1', name: 'أحمد محمد', role: 'مدير', status: 'active' },
  { id: '2', name: 'محمد علي', role: 'كاشير', status: 'active' },
  { id: '3', name: 'فاطمة أحمد', role: 'مبيعات', status: 'active' },
];

export const paymentMethodsList: PaymentMethodConfig[] = [
  { id: 'cash', name: 'كاش', enabled: true },
  { id: 'card', name: 'بطاقة ائتمان', enabled: true },
  { id: 'wallet', name: 'محفظة إلكترونية', enabled: true },
  { id: 'instapay', name: 'إنستاباي', enabled: false },
];
