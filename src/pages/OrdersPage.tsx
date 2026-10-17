import { useState } from 'react';
import { toast } from 'sonner';
import { KanbanIcon, PackageIcon, DollarSignIcon, TruckIcon } from '@/components/icons';
import DataStatus from '@/components/DataStatus';
import StatsRow from '@/components/StatsRow';
import OrdersToolbar from '@/components/orders/OrdersToolbar';
import OrdersBoard from '@/components/orders/OrdersBoard';
import MobileOrdersList from '@/components/orders/MobileOrdersList';
import NewOrderModal from '@/components/orders/NewOrderModal';
import { useOrdersBoard } from '@/hooks/useOrdersBoard';
import { formatThousands } from '@/lib/utils';
import type { CreateOrderInput } from '@/services/order';
import type { OrderStatus } from '@/types/order';
import { getOrderStatusMeta } from '@/constants/orderStatusMeta';

/**
 * Orders: a Kanban board (desktop) or a filterable list (phone) of customer orders; dragging a card
 * to another column moves the order to that status.
 * Data and mutations flow through OrderService (via useOrders), so this page has zero knowledge of
 * where orders actually live. The screen's state is in hooks/useOrdersBoard.ts, what its filters
 * and numbers mean is in lib/orders.ts, and the pieces are in components/orders/.
 */
export default function OrdersPage() {
  const board = useOrdersBoard();
  const [showNewModal, setShowNewModal] = useState(false);

  const handleDrop = async (status: OrderStatus) => {
    try {
      if (await board.dropOn(status)) {
        toast.success(`تم نقل الطلب إلى ${getOrderStatusMeta(status).label}`);
      }
    } catch {
      toast.error('تعذّر نقل الطلب، حاول مرة أخرى');
    }
  };

  const handleCreate = async (input: CreateOrderInput) => {
    try {
      const order = await board.createOrder(input);
      setShowNewModal(false);
      toast.success(`تم إنشاء الطلب ${order.id}`);
    } catch {
      toast.error('تعذّر إنشاء الطلب، تحقق من البيانات المدخلة');
    }
  };

  const { summary } = board;
  const stats = [
    { label: 'إجمالي الطلبات', value: summary.count.toString(), icon: KanbanIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
    { label: 'طلبات جديدة', value: summary.newCount.toString(), icon: PackageIcon, color: 'bg-blue-50 text-blue-600' },
    { label: 'تم التسليم', value: summary.deliveredCount.toString(), icon: TruckIcon, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'إجمالي القيمة', value: `${formatThousands(summary.totalValue)} ج.م`, icon: DollarSignIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
      <StatsRow items={stats} />

      <DataStatus
        spaced
        error={board.error}
        isLoading={board.isLoading}
        isEmpty={board.orders.length === 0}
        onRetry={board.refetch}
      />

      <OrdersToolbar
        timeFilter={board.timeFilter}
        onTimeFilterChange={board.setTimeFilter}
        onNewOrder={() => setShowNewModal(true)}
      />

      <OrdersBoard
        columns={board.columns}
        onDrop={handleDrop}
        onDragStart={board.startDrag}
        onAddOrder={() => setShowNewModal(true)}
      />

      <MobileOrdersList
        columns={board.columns}
        orders={board.listOrders}
        statusFilter={board.statusFilter}
        onStatusFilterChange={board.setStatusFilter}
      />

      {showNewModal && (
        <NewOrderModal onClose={() => setShowNewModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
