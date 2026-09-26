export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalPurchases: number;
  lastVisit: string;
  status: 'active' | 'inactive';
}

/** A single entry in a client's activity timeline (drives the Side Panel timeline tab). */
export interface ClientActivity {
  id: string;
  clientId: string;
  type: 'purchase' | 'visit' | 'call' | 'return' | 'note';
  description: string;
  amount?: number;
  date: string; // ISO date
}
