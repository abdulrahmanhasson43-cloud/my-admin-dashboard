export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  unitPrice: number;
  barcode: string;
}
