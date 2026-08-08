import type { Branch } from '@/types';

// TODO(phase-3): replace with a real Firestore-backed branches service.
export const sampleBranches: Branch[] = [
  { id: '1', name: 'الفرع الرئيسي - القاهرة', address: '123 شارع التحرير، وسط البلد، القاهرة', employees: 12, sales: 125000, status: 'active' },
  { id: '2', name: 'فرع الإسكندرية', address: '45 شارع سعد زغلول، وسط البلد، الإسكندرية', employees: 8, sales: 78000, status: 'active' },
  { id: '3', name: 'فرع الجيزة', address: '78 شارع الهرم، المهندسين، الجيزة', employees: 6, sales: 45000, status: 'active' },
  { id: '4', name: 'فرع الشرقية', address: '15 شارع الجمهورية، الزقازيق، الشرقية', employees: 4, sales: 23000, status: 'inactive' },
];
