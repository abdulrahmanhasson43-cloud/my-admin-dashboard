import type { InventoryItem } from '@/types';

// TODO(phase-3): replace with a real Firestore-backed inventory service.
export const sampleInventory: InventoryItem[] = [
  { id: '1', name: 'سماعة بلوتوث لاسلكية', category: 'إلكترونيات', quantity: 45, minStock: 10, unitPrice: 250, barcode: '123456' },
  { id: '2', name: 'شاحن سريع 65W', category: 'إلكترونيات', quantity: 8, minStock: 15, unitPrice: 180, barcode: '234567' },
  { id: '3', name: 'كيبل USB-C 2م', category: 'إكسسوارات', quantity: 120, minStock: 20, unitPrice: 45, barcode: '345678' },
  { id: '4', name: 'جراب موبايل سيليكون', category: 'إكسسوارات', quantity: 67, minStock: 25, unitPrice: 65, barcode: '456789' },
  { id: '5', name: 'ماوس لاسلكي', category: 'كمبيوتر', quantity: 23, minStock: 10, unitPrice: 120, barcode: '567890' },
  { id: '6', name: 'كيبورد ميكانيكي', category: 'كمبيوتر', quantity: 12, minStock: 5, unitPrice: 450, barcode: '678901' },
  { id: '7', name: 'شاشة 24 بوصة', category: 'شاشات', quantity: 6, minStock: 8, unitPrice: 3200, barcode: '789012' },
  { id: '8', name: 'راوتر واي فاي', category: 'شبكات', quantity: 34, minStock: 10, unitPrice: 380, barcode: '890123' },
];
