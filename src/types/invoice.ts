export interface Invoice {
  id: string;
  customer: string;
  amount: number;
  tax: number;
  total: number;
  method: string;
  date: string;
  status: 'paid' | 'pending' | 'cancelled';
  items: number;
}
