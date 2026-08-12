import type { Supplier } from '@/types';

// TODO(phase-3): replace with a real Firestore-backed suppliers service.
export const sampleSuppliers: Supplier[] = [
  { id: '1', name: 'شركة التقنية الحديثة', phone: '01001234567', email: 'tech@supplier.com', products: 45, totalOrders: 120, status: 'active' },
  { id: '2', name: 'مؤسسة الإكسسوارات', phone: '01112345678', email: 'acc@supplier.com', products: 78, totalOrders: 89, status: 'active' },
  { id: '3', name: 'مصر للكمبيوتر', phone: '01223456789', email: 'pc@supplier.com', products: 32, totalOrders: 56, status: 'active' },
  { id: '4', name: 'الشاشات العالمية', phone: '01034567890', email: 'screens@supplier.com', products: 15, totalOrders: 34, status: 'inactive' },
  { id: '5', name: 'شبكات الشرق الأوسط', phone: '01145678901', email: 'net@supplier.com', products: 23, totalOrders: 67, status: 'active' },
];
