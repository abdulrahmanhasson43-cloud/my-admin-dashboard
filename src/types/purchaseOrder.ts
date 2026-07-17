export interface PurchaseOrder {
  id: string;
  supplier: string;
  items: number;
  total: number;
  status: 'pending' | 'approved' | 'received';
  date: string;
}
