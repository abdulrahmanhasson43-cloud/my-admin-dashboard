import type { CompletedSale } from '@/types';

/** The sample invoice the settings screen draws in the live receipt preview (so the owner sees what each switch changes). */
export const receiptPreviewInvoice: CompletedSale = {
  id: 'INV-PREVIEW',
  items: [
    { id: '1', name: 'سماعة بلوتوث', category: 'إلكترونيات', price: 250, cost: 180, wholesalePrice: 210, stock: 45, storeStock: 15, warehouseStock: 30, barcode: '123', status: 'active', quantity: 2 },
    { id: '2', name: 'شاحن سريع 65W', category: 'إلكترونيات', price: 180, cost: 120, wholesalePrice: 150, stock: 8, storeStock: 8, warehouseStock: 0, barcode: '456', status: 'active', quantity: 1 },
  ],
  subtotal: 680,
  tax: 95.2,
  total: 775.2,
  paymentMethod: 'cash',
  date: 'معاينة',
};
