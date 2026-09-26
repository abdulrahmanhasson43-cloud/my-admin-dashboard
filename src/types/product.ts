/** Variant value — a single option inside a variant group.
    For colours we store a hex value so the UI can render a colour
    circle; for sizes we just use the label (S / M / L / XL …). */
export interface VariantValue {
  id: string;
  label: string;
  /** Optional hex colour — only used when variant type === 'color' */
  color?: string;
}

/** A variant group — e.g. "اللون" (color) or "المقاس" (size). */
export interface ProductVariant {
  id: string;
  /** 'color' renders colour circles, 'size' renders pill buttons */
  type: 'color' | 'size';
  name: string;
  values: VariantValue[];
}

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
  /** Optional product variants (idea #30) — colour / size groups */
  variants?: ProductVariant[];
}

export interface CartItem extends Product {
  quantity: number;
  /** Which variant values were chosen (idea #30) — maps variantId → valueId */
  selectedVariants?: Record<string, string>;
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
