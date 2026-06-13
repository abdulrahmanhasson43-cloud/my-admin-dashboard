import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface Price {
  public: number;
  retail: number;
  wholesale1: number;
  wholesale2: number;
  wholesale3: number;
  vip: number;
  cost: number;
}

export interface Product {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  icon: string;
  stock: number;
  minStock: number;
  unit: string;
  barcode?: string;
  expiryDate?: string;
  batchNumber?: string;
  prices: Price;
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  merchantId: string;
  name: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  accessCode: string;
  priceCategory: "public" | "retail" | "wholesale1" | "wholesale2" | "wholesale3" | "vip";
  creditLimit: number;
  totalDebt: number;
  notes?: string;
  status: "active" | "inactive" | "blocked";
  lastOrderDate?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  merchantId: string;
  name: string;
  company?: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  totalDebt: number;
  rating: number;
  notes?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  merchantId: string;
  customerId: string;
  customerName: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCost: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: "cash" | "bank_transfer" | "whatsapp_pay" | "deferred" | "partial";
  status: "new" | "processing" | "delivering" | "delivered" | "returned" | "cancelled";
  notes?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  merchantId: string;
  type: "sale" | "purchase" | "payment_in" | "payment_out" | "expense";
  amount: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

interface StoreContextType {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  orders: Order[];
  transactions: Transaction[];
  addProduct: (product: Omit<Product, "id" | "createdAt">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, "id" | "createdAt">) => Promise<void>;
  addOrder: (order: Omit<Order, "id" | "orderNumber" | "createdAt">) => Promise<Order>;
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<void>;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    merchantId: "store-001",
    name: "قفازات طبية لاتكس",
    description: "قفازات طبية معقمة للاستخدام الواحد، مقاسات متعددة",
    icon: "🧤",
    stock: 150,
    minStock: 20,
    unit: "علبة",
    prices: { public: 45, retail: 40, wholesale1: 35, wholesale2: 30, wholesale3: 25, vip: 28, cost: 20 },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-002",
    merchantId: "store-001",
    name: "ضمادات طبية",
    description: "ضمادات معقمة مقاس 10×10 سم",
    icon: "🩹",
    stock: 8,
    minStock: 15,
    unit: "علبة",
    prices: { public: 30, retail: 27, wholesale1: 24, wholesale2: 21, wholesale3: 18, vip: 20, cost: 12 },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-003",
    merchantId: "store-001",
    name: "جهاز قياس ضغط الدم",
    description: "جهاز رقمي لقياس ضغط الدم، دقيق وسهل الاستخدام",
    icon: "🩺",
    stock: 25,
    minStock: 5,
    unit: "جهاز",
    prices: { public: 350, retail: 320, wholesale1: 290, wholesale2: 270, wholesale3: 250, vip: 260, cost: 180 },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-004",
    merchantId: "store-001",
    name: "محقنة 5 مل",
    description: "محقنات طبية معقمة للاستخدام الواحد",
    icon: "💉",
    stock: 300,
    minStock: 50,
    unit: "علبة 100",
    prices: { public: 25, retail: 22, wholesale1: 19, wholesale2: 16, wholesale3: 14, vip: 15, cost: 8 },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-005",
    merchantId: "store-001",
    name: "مقياس حرارة رقمي",
    description: "مقياس حرارة إبطي رقمي سريع ودقيق",
    icon: "🌡️",
    stock: 40,
    minStock: 10,
    unit: "قطعة",
    prices: { public: 120, retail: 110, wholesale1: 95, wholesale2: 85, wholesale3: 75, vip: 80, cost: 55 },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-006",
    merchantId: "store-001",
    name: "كحول طبي 70%",
    description: "كحول إيثيلي للتعقيم، عبوة 500 مل",
    icon: "🧴",
    stock: 60,
    minStock: 20,
    unit: "زجاجة",
    prices: { public: 18, retail: 16, wholesale1: 13, wholesale2: 11, wholesale3: 9, vip: 10, cost: 6 },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const SEED_CUSTOMERS: Customer[] = [
  {
    id: "customer-001",
    merchantId: "store-001",
    name: "أحمد خالد",
    phone: "01012345678",
    whatsapp: "01012345678",
    address: "شارع النيل، القاهرة",
    accessCode: "FP-2024-001",
    priceCategory: "retail",
    creditLimit: 2000,
    totalDebt: 450,
    status: "active",
    lastOrderDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "customer-002",
    merchantId: "store-001",
    name: "د. سارة محمود",
    phone: "01099887766",
    whatsapp: "01099887766",
    address: "مدينة نصر، القاهرة",
    accessCode: "FP-2024-VIP",
    priceCategory: "vip",
    creditLimit: 10000,
    totalDebt: 0,
    status: "active",
    lastOrderDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "customer-003",
    merchantId: "store-001",
    name: "مستشفى النور",
    phone: "0225678901",
    whatsapp: "01011223344",
    address: "المهندسين، الجيزة",
    accessCode: "FP-2024-HOSP",
    priceCategory: "wholesale1",
    creditLimit: 50000,
    totalDebt: 8750,
    status: "active",
    lastOrderDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

const SEED_SUPPLIERS: Supplier[] = [
  {
    id: "supplier-001",
    merchantId: "store-001",
    name: "شركة فاركو للمستلزمات",
    company: "فاركو",
    phone: "0223456789",
    whatsapp: "01055667788",
    totalDebt: 3500,
    rating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "supplier-002",
    merchantId: "store-001",
    name: "المستورد الطبي",
    company: "ميدكير",
    phone: "0221122334",
    whatsapp: "01033445566",
    totalDebt: 1200,
    rating: 4,
    createdAt: new Date().toISOString(),
  },
];

const SEED_ORDERS: Order[] = [
  {
    id: "order-001",
    merchantId: "store-001",
    customerId: "customer-001",
    customerName: "أحمد خالد",
    orderNumber: "ORD-2024-001",
    items: [
      { productId: "prod-001", productName: "قفازات طبية لاتكس", quantity: 2, unitPrice: 40, total: 80 },
      { productId: "prod-005", productName: "مقياس حرارة رقمي", quantity: 1, unitPrice: 110, total: 110 },
    ],
    subtotal: 190,
    discount: 0,
    deliveryCost: 30,
    total: 220,
    paidAmount: 0,
    remainingAmount: 220,
    paymentMethod: "deferred",
    status: "delivered",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "order-002",
    merchantId: "store-001",
    customerId: "customer-003",
    customerName: "مستشفى النور",
    orderNumber: "ORD-2024-002",
    items: [
      { productId: "prod-001", productName: "قفازات طبية لاتكس", quantity: 20, unitPrice: 35, total: 700 },
      { productId: "prod-004", productName: "محقنة 5 مل", quantity: 10, unitPrice: 19, total: 190 },
    ],
    subtotal: 890,
    discount: 50,
    deliveryCost: 0,
    total: 840,
    paidAmount: 840,
    remainingAmount: 0,
    paymentMethod: "bank_transfer",
    status: "delivered",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "order-003",
    merchantId: "store-001",
    customerId: "customer-002",
    customerName: "د. سارة محمود",
    orderNumber: "ORD-2024-003",
    items: [
      { productId: "prod-003", productName: "جهاز قياس ضغط الدم", quantity: 1, unitPrice: 260, total: 260 },
    ],
    subtotal: 260,
    discount: 0,
    deliveryCost: 0,
    total: 260,
    paidAmount: 260,
    remainingAmount: 0,
    paymentMethod: "cash",
    status: "new",
    createdAt: new Date().toISOString(),
  },
];

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const loadData = useCallback(async () => {
    const storedProducts = await AsyncStorage.getItem("fp_products");
    const storedCustomers = await AsyncStorage.getItem("fp_customers");
    const storedSuppliers = await AsyncStorage.getItem("fp_suppliers");
    const storedOrders = await AsyncStorage.getItem("fp_orders");
    const storedTransactions = await AsyncStorage.getItem("fp_transactions");

    setProducts(storedProducts ? JSON.parse(storedProducts) : SEED_PRODUCTS);
    setCustomers(storedCustomers ? JSON.parse(storedCustomers) : SEED_CUSTOMERS);
    setSuppliers(storedSuppliers ? JSON.parse(storedSuppliers) : SEED_SUPPLIERS);
    setOrders(storedOrders ? JSON.parse(storedOrders) : SEED_ORDERS);
    setTransactions(storedTransactions ? JSON.parse(storedTransactions) : []);

    if (!storedProducts) await AsyncStorage.setItem("fp_products", JSON.stringify(SEED_PRODUCTS));
    if (!storedCustomers) await AsyncStorage.setItem("fp_customers", JSON.stringify(SEED_CUSTOMERS));
    if (!storedSuppliers) await AsyncStorage.setItem("fp_suppliers", JSON.stringify(SEED_SUPPLIERS));
    if (!storedOrders) await AsyncStorage.setItem("fp_orders", JSON.stringify(SEED_ORDERS));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const addProduct = async (product: Omit<Product, "id" | "createdAt">) => {
    const newProduct = { ...product, id: genId(), createdAt: new Date().toISOString() };
    const updated = [...products, newProduct];
    setProducts(updated);
    await AsyncStorage.setItem("fp_products", JSON.stringify(updated));
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    const updated = products.map(p => p.id === id ? { ...p, ...data } : p);
    setProducts(updated);
    await AsyncStorage.setItem("fp_products", JSON.stringify(updated));
  };

  const deleteProduct = async (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    await AsyncStorage.setItem("fp_products", JSON.stringify(updated));
  };

  const addCustomer = async (customer: Omit<Customer, "id" | "createdAt">) => {
    const newCustomer = { ...customer, id: genId(), createdAt: new Date().toISOString() };
    const updated = [...customers, newCustomer];
    setCustomers(updated);
    await AsyncStorage.setItem("fp_customers", JSON.stringify(updated));
  };

  const updateCustomer = async (id: string, data: Partial<Customer>) => {
    const updated = customers.map(c => c.id === id ? { ...c, ...data } : c);
    setCustomers(updated);
    await AsyncStorage.setItem("fp_customers", JSON.stringify(updated));
  };

  const addSupplier = async (supplier: Omit<Supplier, "id" | "createdAt">) => {
    const newSupplier = { ...supplier, id: genId(), createdAt: new Date().toISOString() };
    const updated = [...suppliers, newSupplier];
    setSuppliers(updated);
    await AsyncStorage.setItem("fp_suppliers", JSON.stringify(updated));
  };

  const addOrder = async (orderData: Omit<Order, "id" | "orderNumber" | "createdAt">): Promise<Order> => {
    const orderNum = `ORD-${Date.now()}`;
    const newOrder: Order = { ...orderData, id: genId(), orderNumber: orderNum, createdAt: new Date().toISOString() };
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    await AsyncStorage.setItem("fp_orders", JSON.stringify(updatedOrders));

    for (const item of newOrder.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        await updateProduct(product.id, { stock: Math.max(0, product.stock - item.quantity) });
      }
    }

    if (newOrder.remainingAmount > 0) {
      const updatedCustomers = customers.map(c =>
        c.id === newOrder.customerId
          ? { ...c, totalDebt: c.totalDebt + newOrder.remainingAmount, lastOrderDate: newOrder.createdAt }
          : c
      );
      setCustomers(updatedCustomers);
      await AsyncStorage.setItem("fp_customers", JSON.stringify(updatedCustomers));
    }

    return newOrder;
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(updated);
    await AsyncStorage.setItem("fp_orders", JSON.stringify(updated));
  };

  return (
    <StoreContext.Provider value={{
      products, customers, suppliers, orders, transactions,
      addProduct, updateProduct, deleteProduct,
      addCustomer, updateCustomer,
      addSupplier, addOrder, updateOrderStatus,
      refreshData: loadData,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
