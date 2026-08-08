export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalPurchases: number;
  lastVisit: string;
  status: 'active' | 'inactive';
}
