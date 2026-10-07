import type { Order } from '@/types/order';

// Helper: build ISO timestamps relative to now so the "today/this week"
// filters always have data regardless of when the app runs.
const now = new Date();
const iso = (minutesAgo: number) => {
  const d = new Date(now);
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toISOString();
};

// TODO(phase-3): replace with a real Firestore-backed orders service.
export const sampleKanbanOrders: Order[] = [
  {
    id: 'ORD-1001',
    customerName: 'أحمد محمد',
    customerPhone: '01001234567',
    items: [
      { productId: '1', name: 'سماعة بلوتوث لاسلكية', price: 250, quantity: 2 },
      { productId: '3', name: 'كابل USB-C 2م', price: 45, quantity: 3 },
    ],
    total: 635,
    paymentMethod: 'cash',
    status: 'new',
    createdAt: iso(8),
    timeline: [
      { id: 't1', status: 'new', timestamp: iso(8), note: 'تم استلام الطلب' },
    ],
  },
  {
    id: 'ORD-1002',
    customerName: 'سارة إبراهيم',
    customerPhone: '01145678901',
    items: [
      { productId: '5', name: 'ماوس لاسلكي', price: 120, quantity: 1 },
    ],
    total: 120,
    paymentMethod: 'wallet',
    status: 'new',
    createdAt: iso(15),
    timeline: [
      { id: 't1', status: 'new', timestamp: iso(15), note: 'تم استلام الطلب' },
    ],
  },
  {
    id: 'ORD-1003',
    customerName: 'خالد محمود',
    customerPhone: '01034567890',
    items: [
      { productId: '6', name: 'كيبورد ميكانيكي', price: 450, quantity: 1 },
      { productId: '4', name: 'جراب موبايل سيليكون', price: 65, quantity: 2 },
    ],
    total: 580,
    paymentMethod: 'card',
    status: 'preparing',
    createdAt: iso(45),
    timeline: [
      { id: 't1', status: 'new', timestamp: iso(45), note: 'تم استلام الطلب' },
      { id: 't2', status: 'preparing', timestamp: iso(20), note: 'بدأ التجهيز' },
    ],
  },
  {
    id: 'ORD-1004',
    customerName: 'نور الدين',
    customerPhone: '01067890123',
    items: [
      { productId: '8', name: 'راوتر واي فاي', price: 380, quantity: 1 },
      { productId: '3', name: 'كابل USB-C 2م', price: 45, quantity: 1 },
    ],
    total: 425,
    paymentMethod: 'instapay',
    status: 'preparing',
    createdAt: iso(90),
    timeline: [
      { id: 't1', status: 'new', timestamp: iso(90), note: 'تم استلام الطلب' },
      { id: 't2', status: 'preparing', timestamp: iso(60), note: 'بدأ التجهيز' },
    ],
  },
  {
    id: 'ORD-1005',
    customerName: 'فاطمة أحمد',
    customerPhone: '01223456789',
    items: [
      { productId: '7', name: 'شاشة 24 بوصة', price: 3200, quantity: 1 },
    ],
    total: 3200,
    paymentMethod: 'card',
    status: 'shipped',
    createdAt: iso(180),
    timeline: [
      { id: 't1', status: 'new', timestamp: iso(180), note: 'تم استلام الطلب' },
      { id: 't2', status: 'preparing', timestamp: iso(150), note: 'بدأ التجهيز' },
      { id: 't3', status: 'shipped', timestamp: iso(60), note: 'تم التسليم لشركة الشحن' },
    ],
  },
  {
    id: 'ORD-1006',
    customerName: 'محمد علي',
    customerPhone: '01112345678',
    items: [
      { productId: '2', name: 'شاحن سريع 65W', price: 180, quantity: 2 },
      { productId: '1', name: 'سماعة بلوتوث لاسلكية', price: 250, quantity: 1 },
    ],
    total: 610,
    paymentMethod: 'cash',
    status: 'shipped',
    createdAt: iso(240),
    timeline: [
      { id: 't1', status: 'new', timestamp: iso(240), note: 'تم استلام الطلب' },
      { id: 't2', status: 'preparing', timestamp: iso(200), note: 'بدأ التجهيز' },
      { id: 't3', status: 'shipped', timestamp: iso(100), note: 'تم التسليم لشركة الشحن' },
    ],
  },
  {
    id: 'ORD-1007',
    customerName: 'ليلى سامي',
    customerPhone: '01178901234',
    items: [
      { productId: '3', name: 'كابل USB-C 2م', price: 45, quantity: 5 },
    ],
    total: 225,
    paymentMethod: 'wallet',
    status: 'delivered',
    createdAt: iso(600),
    timeline: [
      { id: 't1', status: 'new', timestamp: iso(600), note: 'تم استلام الطلب' },
      { id: 't2', status: 'preparing', timestamp: iso(560), note: 'بدأ التجهيز' },
      { id: 't3', status: 'shipped', timestamp: iso(400), note: 'تم التسليم لشركة الشحن' },
      { id: 't4', status: 'delivered', timestamp: iso(120), note: 'تم التسليم للعميل' },
    ],
  },
  {
    id: 'ORD-1008',
    customerName: 'عمر حسن',
    customerPhone: '01256789012',
    items: [
      { productId: '5', name: 'ماوس لاسلكي', price: 120, quantity: 1 },
      { productId: '4', name: 'جراب موبايل سيليكون', price: 65, quantity: 1 },
    ],
    total: 185,
    paymentMethod: 'cash',
    status: 'delivered',
    createdAt: iso(1440),
    timeline: [
      { id: 't1', status: 'new', timestamp: iso(1440), note: 'تم استلام الطلب' },
      { id: 't2', status: 'preparing', timestamp: iso(1380), note: 'بدأ التجهيز' },
      { id: 't3', status: 'shipped', timestamp: iso(1200), note: 'تم التسليم لشركة الشحن' },
      { id: 't4', status: 'delivered', timestamp: iso(900), note: 'تم التسليم للعميل' },
    ],
  },
];
