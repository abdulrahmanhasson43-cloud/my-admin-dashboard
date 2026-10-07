import type { Product } from '@/types';

// TODO(phase-3): replace with a real Firestore-backed products service.
// storeStock = on the shop floor (what POS actually sells from)
// warehouseStock = backroom reserve (needs a "transfer to store" action to become sellable)
export const sampleProducts: Product[] = [
  { id: '1', name: 'سماعة بلوتوث لاسلكية', category: 'إلكترونيات', price: 250, cost: 180, wholesalePrice: 210, stock: 45, storeStock: 15, warehouseStock: 30, barcode: '123456789', status: 'active' },
  { id: '2', name: 'شاحن سريع 65W', category: 'إلكترونيات', price: 180, cost: 120, wholesalePrice: 150, stock: 8, storeStock: 8, warehouseStock: 0, barcode: '234567890', status: 'active' },
  { id: '3', name: 'كيبل USB-C 2م', category: 'إكسسوارات', price: 45, cost: 25, wholesalePrice: 33, stock: 120, storeStock: 40, warehouseStock: 80, barcode: '345678901', status: 'active' },
  { id: '4', name: 'جراب موبايل سيليكون', category: 'إكسسوارات', price: 65, cost: 35, wholesalePrice: 48, stock: 67, storeStock: 27, warehouseStock: 40, barcode: '456789012', status: 'active' },
  { id: '5', name: 'ماوس لاسلكي', category: 'كمبيوتر', price: 120, cost: 80, wholesalePrice: 98, stock: 23, storeStock: 13, warehouseStock: 10, barcode: '567890123', status: 'active' },
  { id: '6', name: 'كيبورد ميكانيكي', category: 'كمبيوتر', price: 450, cost: 320, wholesalePrice: 375, stock: 12, storeStock: 4, warehouseStock: 8, barcode: '678901234', status: 'active' },
  { id: '7', name: 'شاشة 24 بوصة', category: 'شاشات', price: 3200, cost: 2800, wholesalePrice: 2950, stock: 6, storeStock: 2, warehouseStock: 4, barcode: '789012345', status: 'active' },
  { id: '8', name: 'راوتر واي فاي', category: 'شبكات', price: 380, cost: 290, wholesalePrice: 320, stock: 34, storeStock: 14, warehouseStock: 20, barcode: '890123456', status: 'active' },
];
