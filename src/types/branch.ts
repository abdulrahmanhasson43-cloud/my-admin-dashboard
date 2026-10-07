export interface Branch {
  id: string;
  name: string;
  address: string;
  employees: number;
  sales: number;
  status: 'active' | 'inactive';
}
