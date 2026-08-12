/**
 * components/purchases/PurchaseOrderKanban.tsx
 * ============================================================
 *  الفكرة #39 — Purchase Order Pipeline (خط أنابيب Kanban بـ 5 مراحل)
 *  عرض أوامر الشراء في 5 أعمدة: طلب → في الطريق → وصل → فحص → مستلم.
 *  كل عمود يعرض بطاقات أوامر الشراء مع إمكانية تحريكها للمرحلة التالية.
 * ============================================================
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PurchaseOrderKanban, PurchaseOrderStatus, PurchaseOrderStatusMeta } from '@/types';
import { purchaseOrderStatuses } from '@/types';
import {
  KanbanIcon,
  TruckIcon,
  PackageIcon,
  CheckIcon,
  ArrowLeftIcon,
  ClockIcon,
  SuppliersIcon,
} from '@/components/icons';
import { cn, formatArabicDate } from '@/lib/utils';

interface PurchaseOrderKanbanProps {
  /** أوامر الشراء بصيغة Kanban */
  orders: PurchaseOrderKanban[];
  /** نقل أمر للمرحلة التالية (اختياري) */
  onAdvance?: (id: string) => void;
  /** نقل أمر للمرحلة السابقة (اختياري) */
  onMoveBack?: (id: string) => void;
  /** اختيار أمر للعرض التفصيلي */
  onSelect?: (order: PurchaseOrderKanban) => void;
  title?: string;
}

/** وصف المراحل — يتم تعريف الأيقونات هنا لأن النوع يتطلبها */
const statusMetaMap: Record<PurchaseOrderStatus, PurchaseOrderStatusMeta> = {
  ordered: {
    label: 'طلب',
    emoji: '📋',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: KanbanIcon,
  },
  in_transit: {
    label: 'في الطريق',
    emoji: '🚚',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: TruckIcon,
  },
  arrived: {
    label: 'وصل',
    emoji: '📦',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: PackageIcon,
  },
  inspecting: {
    label: 'فحص',
    emoji: '🔍',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    icon: ClockIcon,
  },
  received: {
    label: 'مستلم',
    emoji: '✅',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: CheckIcon,
  },
};

function fmtEGP(n: number): string {
  return n.toLocaleString('en-US') + ' ج.م';
}

export default function PurchaseOrderKanban({
  orders,
  onAdvance,
  onMoveBack,
  onSelect,
  title = 'خط أنابيب أوامر الشراء',
}: PurchaseOrderKanbanProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // تقسيم الأوامر حسب المرحلة
  const columns = purchaseOrderStatuses.map((status) => ({
    status,
    meta: statusMetaMap[status],
    orders: orders.filter((o) => o.status === status),
  }));

  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      {/* العنوان + إحصائيات */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[var(--vuno-surface-pearl)] flex items-center justify-center">
            <KanbanIcon size={18} className="text-[var(--vuno-primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--vuno-text)]">{title}</h3>
            <p className="text-[11px] text-[var(--vuno-text-muted)]">
              {totalOrders} أمر · {fmtEGP(totalValue)} إجمالي
            </p>
          </div>
        </div>
      </div>

      {/* أعمدة Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto">
        {columns.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            meta={col.meta}
            orders={col.orders}
            selectedId={selectedId}
            onSelect={(order) => {
              setSelectedId(order.id);
              onSelect?.(order);
            }}
            onAdvance={onAdvance}
            onMoveBack={onMoveBack}
          />
        ))}
      </div>
    </div>
  );
}

/** عمود Kanban واحد */
function KanbanColumn({
  status,
  meta,
  orders,
  selectedId,
  onSelect,
  onAdvance,
  onMoveBack,
}: {
  status: PurchaseOrderStatus;
  meta: PurchaseOrderStatusMeta;
  orders: PurchaseOrderKanban[];
  selectedId: string | null;
  onSelect: (order: PurchaseOrderKanban) => void;
  onAdvance?: (id: string) => void;
  onMoveBack?: (id: string) => void;
}) {
  const Icon = meta.icon;
  const statusIndex = purchaseOrderStatuses.indexOf(status);
  const isFirst = statusIndex === 0;
  const isLast = statusIndex === purchaseOrderStatuses.length - 1;

  return (
    <div className={cn('rounded-2xl border p-3 min-w-[200px]', meta.borderColor, meta.bgColor)}>
      {/* رأس العمود */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Icon size={16} className={meta.color} />
          <span className={cn('text-xs font-bold', meta.color)}>{meta.label}</span>
        </div>
        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white', meta.color)}>
          {orders.length}
        </span>
      </div>

      {/* بطاقات الأوامر */}
      <div className="space-y-2 min-h-[100px]">
        <AnimatePresence mode="popLayout">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              meta={meta}
              isSelected={selectedId === order.id}
              onSelect={() => onSelect(order)}
              onAdvance={onAdvance}
              onMoveBack={onMoveBack}
              isFirst={isFirst}
              isLast={isLast}
            />
          ))}
        </AnimatePresence>
        {orders.length === 0 && (
          <div className="text-center py-6 text-[var(--vuno-text-muted)]">
            <span className="text-lg block mb-1 opacity-30">{meta.emoji}</span>
            <p className="text-[10px]">لا توجد أوامر</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** بطاقة أمر شراء واحد */
function OrderCard({
  order,
  isSelected,
  onSelect,
  onAdvance,
  onMoveBack,
  isFirst,
  isLast,
}: {
  order: PurchaseOrderKanban;
  meta: PurchaseOrderStatusMeta;
  isSelected: boolean;
  onSelect: () => void;
  onAdvance?: (id: string) => void;
  onMoveBack?: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onSelect}
      className={cn(
        'bg-white rounded-xl border p-3 cursor-pointer transition-all hover:shadow-md',
        isSelected ? 'border-[var(--vuno-primary)] ring-1 ring-[var(--vuno-primary)]' : 'border-[var(--vuno-border)]',
      )}
    >
      {/* الرأس: المعرف + المورد */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] font-bold text-[var(--vuno-text)]">{order.id}</span>
        <span className="text-[10px] text-[var(--vuno-text-muted)]">{formatArabicDate(order.date, false)}</span>
      </div>

      <div className="flex items-center gap-1 mb-2">
        <SuppliersIcon size={12} className="text-[var(--vuno-text-muted)]" />
        <span className="text-[11px] text-[var(--vuno-text-secondary)] truncate">{order.supplier}</span>
      </div>

      {/* العناصر */}
      <div className="space-y-0.5 mb-2">
        {order.items.slice(0, 2).map((item) => (
          <div key={item.productId} className="flex items-center justify-between text-[10px]">
            <span className="text-[var(--vuno-text-secondary)] truncate">{item.name}</span>
            <span className="text-[var(--vuno-text-muted)] tabular-nums flex-shrink-0">×{item.quantity}</span>
          </div>
        ))}
        {order.items.length > 2 && (
          <p className="text-[9px] text-[var(--vuno-text-muted)]">+{order.items.length - 2} منتج آخر</p>
        )}
      </div>

      {/* الإجمالي + التسليم المتوقع */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--vuno-border-light)] mb-2">
        <span className="text-[13px] font-bold text-[var(--vuno-primary)] tabular-nums">{fmtEGP(order.total)}</span>
        <div className="flex items-center gap-0.5 text-[9px] text-[var(--vuno-text-muted)]">
          <ClockIcon size={10} />
          <span>التسليم: {formatArabicDate(order.expectedDelivery, false)}</span>
        </div>
      </div>

      {/* أزرار التحريك */}
      {(onAdvance || onMoveBack) && (
        <div className="flex gap-1">
          {!isFirst && onMoveBack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveBack(order.id);
              }}
              className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-[var(--vuno-surface-pearl)] text-[var(--vuno-text-muted)] text-[9px] font-medium hover:bg-[var(--vuno-border-light)] transition-colors"
            >
              <ArrowLeftIcon size={11} className="rotate-180" />
              السابق
            </button>
          )}
          {!isLast && onAdvance && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdvance(order.id);
              }}
              className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-[var(--vuno-primary)] text-white text-[9px] font-medium hover:bg-[var(--vuno-primary-light)] transition-colors"
            >
              التالي
              <ArrowLeftIcon size={11} />
            </button>
          )}
        </div>
      )}

      {/* ملاحظات */}
      {order.notes && (
        <p className="text-[9px] text-[var(--vuno-text-muted)] mt-1.5 italic truncate">📝 {order.notes}</p>
      )}
    </motion.div>
  );
}

export { statusMetaMap };
export type { PurchaseOrderStatusMeta };
