import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  PlusIcon, KanbanIcon, PackageIcon, DollarSignIcon, TruckIcon,
  XIcon, CashIcon, CardIcon, WalletIcon, InstaPayIcon,
} from '@/components/icons';
import StatsRow from '@/components/StatsRow';
import { sampleKanbanOrders } from '@/services/mock/orders';
import { generateId, generateNumericId } from '@/lib/utils';
import {
  orderStatuses, getOrderStatusMeta, paymentMethodLabels,
  type Order, type OrderStatus, type OrderPaymentMethod,
} from '@/types/order';

type TimeFilter = 'all' | 'today' | 'week' | 'month';

const TIME_FILTERS: { id: TimeFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'today', label: 'اليوم' },
  { id: 'week', label: 'الأسبوع' },
  { id: 'month', label: 'الشهر' },
];

/* Static map from payment method → icon component. Declared as a plain
   lookup object (not a function call) so React Compiler's purity rule
   does not flag "creating a component during render" when a card reads
   its icon via PAYMENT_ICONS[method]. */
const PAYMENT_ICONS: Record<OrderPaymentMethod, typeof CashIcon> = {
  cash: CashIcon,
  card: CardIcon,
  wallet: WalletIcon,
  instapay: InstaPayIcon,
};

const getPaymentIcon = (method: OrderPaymentMethod) => {
  switch (method) {
    case 'cash': return CashIcon;
    case 'card': return CardIcon;
    case 'wallet': return WalletIcon;
    case 'instapay': return InstaPayIcon;
    default: return CashIcon;
  }
};

/** Format createdAt ISO as a relative Arabic string like "من 10 دقائق". */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `من ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `من ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `من ${days} يوم`;
}

/* ─────────────────────────────────────────────────────────────────────
   OrderCard — a single draggable order in a Kanban column
   ───────────────────────────────────────────────────────────────────── */
function OrderCard({
  order,
  onDragStart,
}: {
  order: Order;
  onDragStart: (id: string) => void;
}) {
  const PayIcon = PAYMENT_ICONS[order.paymentMethod];
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <motion.div
      layout
      draggable
      onDragStart={() => onDragStart(order.id)}
      className="bg-white rounded-2xl border border-[var(--vuno-border)] p-3.5 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow select-none"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-bold text-[15px] text-[var(--vuno-text)]">{order.id}</span>
        <span
          className="text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
          style={{ background: 'color-mix(in srgb, var(--vuno-primary) 10%, transparent)', color: 'var(--vuno-primary)' }}
        >
          <PayIcon size={12} />
          {paymentMethodLabels[order.paymentMethod]}
        </span>
      </div>

      <div className="space-y-0.5 mb-2.5">
        <p className="text-[13px] font-medium text-[var(--vuno-text)] truncate">{order.customerName}</p>
        <p className="text-[12px] text-[var(--vuno-text-muted)]" dir="ltr">{order.customerPhone}</p>
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-[var(--vuno-border)]">
        <div className="flex items-center gap-1.5 text-[12px] text-[var(--vuno-text-secondary)]">
          <PackageIcon size={14} />
          <span>{itemCount} قطعة</span>
        </div>
        <span className="font-bold text-[15px] text-[var(--vuno-primary)]">
          {order.total.toLocaleString()} ج.م
        </span>
      </div>

      <p className="text-[11px] text-[var(--vuno-text-muted)] mt-2">{relativeTime(order.createdAt)}</p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   OrderListRow — flat list row (mobile), no boxed card
   ───────────────────────────────────────────────────────────────────── */
function OrderListRow({ order }: { order: Order }) {
  const PayIcon = PAYMENT_ICONS[order.paymentMethod];
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const statusMeta = getOrderStatusMeta(order.status);

  return (
    <div className="flex items-center justify-between gap-3 py-3.5 border-b border-[var(--vuno-border-light)] last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-[14px] text-[var(--vuno-text)]">{order.id}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1" style={{ background: `${statusMeta.color}1A`, color: statusMeta.color }}>
            <statusMeta.icon size={11} /> {statusMeta.label}
          </span>
        </div>
        <p className="text-[13px] text-[var(--vuno-text-secondary)] truncate">{order.customerName}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[11px] text-[var(--vuno-text-muted)] flex items-center gap-1">
            <PackageIcon size={12} /> {itemCount} قطعة
          </span>
          <span className="text-[11px] text-[var(--vuno-text-muted)] flex items-center gap-1">
            <PayIcon size={12} /> {paymentMethodLabels[order.paymentMethod]}
          </span>
          <span className="text-[11px] text-[var(--vuno-text-muted)]">{relativeTime(order.createdAt)}</span>
        </div>
      </div>
      <span className="font-bold text-[15px] tabular-nums text-[var(--vuno-text)] flex-shrink-0">
        {order.total.toLocaleString()} ج.م
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   KanbanColumn — a single status column that accepts dropped cards
   ───────────────────────────────────────────────────────────────────── */
function KanbanColumn({
  statusMeta,
  orders,
  onDrop,
  onDragStart,
  onAddOrder,
  canAdd,
}: {
  statusMeta: typeof orderStatuses[number];
  orders: Order[];
  onDrop: (status: OrderStatus) => void;
  onDragStart: (id: string) => void;
  onAddOrder?: () => void;
  canAdd?: boolean;
}) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => { e.preventDefault(); setIsOver(false); onDrop(statusMeta.id); }}
      className={`flex flex-col rounded-2xl transition-colors min-h-[200px] ${
        isOver ? 'bg-blue-50/60' : 'bg-[var(--vuno-surface)]'
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3.5 py-3 sticky top-0">
        <div className="flex items-center gap-2">
          <span style={{ color: statusMeta.color }} className="flex-shrink-0">
            <statusMeta.icon size={16} />
          </span>
          <h3 className="font-bold text-[14px] text-[var(--vuno-text)]">{statusMeta.label}</h3>
          <span
            className="text-[12px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${statusMeta.color}1A`, color: statusMeta.color }}
          >
            {orders.length}
          </span>
        </div>
        {canAdd && onAddOrder && (
          <button
            onClick={onAddOrder}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white transition-colors"
            style={{ color: statusMeta.color }}
            aria-label="إضافة طلب جديد"
          >
            <PlusIcon size={16} />
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 px-2.5 pb-3 space-y-2.5 overflow-y-auto">
        {orders.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-[13px] text-[var(--vuno-text-muted)]">
            اسحب الطلبات هنا
          </div>
        ) : (
          orders.map(order => (
            <OrderCard key={order.id} order={order} onDragStart={onDragStart} />
          ))
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   NewOrderModal — create a new order (placed in the "new" column)
   ───────────────────────────────────────────────────────────────────── */
function NewOrderModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (order: Order) => void;
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>('cash');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productQty, setProductQty] = useState('1');
  const [items, setItems] = useState<Order['items']>([]);

  const addItem = () => {
    const price = Number(productPrice);
    const qty = Number(productQty);
    if (!productName.trim() || !price || !qty) return;
    setItems(prev => [...prev, { productId: generateId('p'), name: productName.trim(), price, quantity: qty }]);
    setProductName(''); setProductPrice(''); setProductQty('1');
  };

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleCreate = () => {
    if (!customerName.trim() || items.length === 0) {
      toast.error('أدخل اسم العميل ومنتج واحد على الأقل');
      return;
    }
    const now = new Date().toISOString();
    const order: Order = {
      id: generateNumericId('ORD', 1000, 9999),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items,
      total,
      paymentMethod,
      status: 'new',
      createdAt: now,
      timeline: [{ id: generateId('t'), status: 'new', timestamp: now, note: 'تم استلام الطلب' }],
    };
    onCreate(order);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--vuno-border)]">
          <h3 className="font-bold text-lg text-[var(--vuno-text)]">طلب جديد</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100">
            <XIcon size={20} className="text-[var(--vuno-text-muted)]" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">اسم العميل</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="مثال: أحمد محمد"
              className="w-full h-11 px-4 rounded-xl border border-[var(--vuno-border)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--vuno-primary)]/30"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">رقم الهاتف</label>
            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="01000000000"
              dir="ltr"
              className="w-full h-11 px-4 rounded-xl border border-[var(--vuno-border)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--vuno-primary)]/30"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">طريقة الدفع</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(paymentMethodLabels) as OrderPaymentMethod[]).map(m => {
                const PayIcon = getPaymentIcon(m);
                return (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all ${
                      paymentMethod === m
                        ? 'border-[var(--vuno-primary)] bg-[var(--vuno-surface-pearl)]'
                        : 'border-[var(--vuno-border)] hover:bg-gray-50'
                    }`}
                  >
                    <PayIcon size={18} className={paymentMethod === m ? 'text-[var(--vuno-primary)]' : 'text-[var(--vuno-text-muted)]'} />
                    <span className="text-[11px]">{paymentMethodLabels[m]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">المنتجات</label>
            <div className="flex gap-2 mb-2">
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="اسم المنتج"
                className="flex-1 h-10 px-3 rounded-xl border border-[var(--vuno-border)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--vuno-primary)]/30"
              />
              <input
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                type="number"
                placeholder="السعر"
                className="w-20 h-10 px-3 rounded-xl border border-[var(--vuno-border)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--vuno-primary)]/30"
              />
              <input
                value={productQty}
                onChange={(e) => setProductQty(e.target.value)}
                type="number"
                placeholder="الكمية"
                className="w-16 h-10 px-3 rounded-xl border border-[var(--vuno-border)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--vuno-primary)]/30"
              />
              <button
                onClick={addItem}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ background: 'var(--vuno-primary)' }}
              >
                <PlusIcon size={18} />
              </button>
            </div>
            {items.length > 0 && (
              <div className="space-y-1.5">
                {items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[var(--vuno-surface)] rounded-xl px-3 py-2 text-[13px]">
                    <span className="text-[var(--vuno-text)]">{it.name} × {it.quantity}</span>
                    <span className="font-medium text-[var(--vuno-primary)]">{(it.price * it.quantity).toLocaleString()} ج.م</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--vuno-border)]">
                  <span className="font-bold text-[var(--vuno-text)]">الإجمالي</span>
                  <span className="font-bold text-[var(--vuno-primary)]">{total.toLocaleString()} ج.م</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-[var(--vuno-border)]">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-[var(--vuno-border)] font-medium text-[var(--vuno-text-secondary)] hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 h-11 rounded-xl text-white font-medium hover:opacity-90"
            style={{ background: 'var(--vuno-primary)' }}
          >
            إنشاء الطلب
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(sampleKanbanOrders);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // Capture "now" once per mount and keep it stable. Computing Date.now()
  // directly inside useMemo violates React Compiler's purity rule, and
  // recomputing the time-window filter on every keystroke would be wasteful.
  // useState with a lazy initializer runs the initializer only on the first
  // render and never again, giving us a stable timestamp without an impure
  // call during render or ref access during render.
  const [mountTime] = useState(() => Date.now());
  const filteredOrders = useMemo(() => {
    if (timeFilter === 'all') return orders;
    const now = mountTime;
    const limits = { today: 86400000, week: 604800000, month: 2592000000 };
    return orders.filter(o => now - new Date(o.createdAt).getTime() <= limits[timeFilter]);
  }, [orders, timeFilter, mountTime]);

  const ordersByStatus = useMemo(() => {
    const map: Record<OrderStatus, Order[]> = { new: [], preparing: [], shipped: [], delivered: [] };
    filteredOrders.forEach(o => map[o.status].push(o));
    // newest first within each column
    (Object.keys(map) as OrderStatus[]).forEach(s =>
      map[s].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    );
    return map;
  }, [filteredOrders]);

  const handleDrop = (status: OrderStatus) => {
    if (!draggedId) return;
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== draggedId) return o;
        const entry = { id: generateId('t'), status, timestamp: new Date().toISOString(), note: `تم نقل إلى ${getOrderStatusMeta(status).label}` };
        return { ...o, status, timeline: [...o.timeline, entry] };
      }),
    );
    toast.success(`تم نقل الطلب إلى ${getOrderStatusMeta(status).label}`);
    setDraggedId(null);
  };

  const handleCreate = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setShowNewModal(false);
    toast.success(`تم إنشاء الطلب ${order.id}`);
  };

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const newCount = orders.filter(o => o.status === 'new').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;

  const stats = [
    { label: 'إجمالي الطلبات', value: orders.length.toString(), icon: KanbanIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
    { label: 'طلبات جديدة', value: newCount.toString(), icon: PackageIcon, color: 'bg-blue-50 text-blue-600' },
    { label: 'تم التسليم', value: deliveredCount.toString(), icon: TruckIcon, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'إجمالي القيمة', value: `${(totalRevenue / 1000).toFixed(1)}K ج.م`, icon: DollarSignIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
      <StatsRow items={stats} />

      {/* Time filter + Add button */}
      <div className="flex items-center justify-between gap-3 mt-5 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hidden">
          {TIME_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                timeFilter === f.id
                  ? 'gradient-btn text-white'
                  : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="h-11 px-4 rounded-full text-white font-medium flex items-center gap-2 hover:opacity-90 flex-shrink-0 whitespace-nowrap"
          style={{ background: 'var(--vuno-primary)' }}
        >
          <PlusIcon size={18} />
          <span className="hidden sm:inline">طلب جديد</span>
        </button>
      </div>

      {/* Kanban Board — desktop only; on mobile a tall stack of 4 full
          columns doesn't fit the screen well, so mobile gets a flat
          filterable list instead (below). */}
      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {orderStatuses.map((statusMeta, idx) => (
          <KanbanColumn
            key={statusMeta.id}
            statusMeta={statusMeta}
            orders={ordersByStatus[statusMeta.id]}
            onDrop={handleDrop}
            onDragStart={setDraggedId}
            onAddOrder={() => setShowNewModal(true)}
            canAdd={idx === 0}
          />
        ))}
      </div>

      {/* Mobile — status chips + flat full-width list, no boxed cards */}
      <div className="lg:hidden">
        <div className="flex gap-2 overflow-x-auto scrollbar-hidden mb-3">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all ${
              statusFilter === 'all' ? 'bg-[var(--vuno-text)] text-white' : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)]'
            }`}
          >
            الكل
          </button>
          {orderStatuses.map(s => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3.5 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                statusFilter === s.id ? 'bg-[var(--vuno-text)] text-white' : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)]'
              }`}
            >
              <s.icon size={13} />
              {s.label}
              <span className="opacity-70">({ordersByStatus[s.id].length})</span>
            </button>
          ))}
        </div>

        <div>
          {(statusFilter === 'all' ? filteredOrders : ordersByStatus[statusFilter]).length === 0 ? (
            <div className="flex items-center justify-center py-10 text-[13px] text-[var(--vuno-text-muted)]">
              لا توجد طلبات
            </div>
          ) : (
            (statusFilter === 'all' ? filteredOrders : ordersByStatus[statusFilter])
              .slice()
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(order => <OrderListRow key={order.id} order={order} />)
          )}
        </div>
      </div>

      {showNewModal && (
        <NewOrderModal onClose={() => setShowNewModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
