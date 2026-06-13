export type Page = 'overview' | 'merchants' | 'shipments' | 'commissions' | 'settings';

export type MerchantStatus = 'active' | 'suspended' | 'pending';
export type ShipmentStatus = 'in-transit' | 'delivered' | 'delayed' | 'returned' | 'pending';

export interface Merchant {
  id: string;
  name: string;
  email: string;
  phone: string;
  store: string;
  shipmentsCount: number;
  totalRevenue: number;
  commission: number;
  status: MerchantStatus;
  joinDate: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  merchantId: string;
  merchantName: string;
  customer: string;
  agent: string;
  status: ShipmentStatus;
  date: string;
  amount: number;
  commission: number;
  from: string;
  to: string;
}

export interface MonthlyData {
  month: string;
  shipments: number;
  revenue: number;
}
