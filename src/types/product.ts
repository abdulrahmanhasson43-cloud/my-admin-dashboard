export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  wholesalePrice: number;
  stock: number; // total = storeStock + warehouseStock, kept in sync automatically
  storeStock: number; // available on the shop floor — this is what POS sells from
  warehouseStock: number; // backroom/warehouse reserve — not directly sellable until transferred
  barcode: string;
  status: 'active' | 'inactive';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CompletedSale {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  date: string;
}
