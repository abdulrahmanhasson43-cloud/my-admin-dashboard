export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  products: number;
  totalOrders: number;
  status: 'active' | 'inactive';
}
