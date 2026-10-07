import { useOrders } from '@/hooks/useOrders';
import { useOrdersBoard } from '@/hooks/useOrdersBoard';
import { summarizeOrders } from '@/lib/orders';
import OrdersStats from '@/components/orders/OrdersStats';
import OrdersErrorBanner from '@/components/orders/OrdersErrorBanner';
import OrdersToolbar from '@/components/orders/OrdersToolbar';
import KanbanBoard from '@/components/orders/KanbanBoard';
import MobileOrdersList from '@/components/orders/MobileOrdersList';
import NewOrderModal from '@/components/orders/NewOrderModal';

export default function OrdersPage() {
  // Data + mutations flow entirely through OrderService (via useOrders()).
  // This page has zero knowledge of where orders actually live, and the
  // screen's own state (filters, drag and drop, the modal) is in useOrdersBoard.
  const { orders, isLoading, error, refetch, moveOrderToStatus, createOrder } = useOrders();
  const board = useOrdersBoard({ orders, moveOrderToStatus, createOrder });

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
      <OrdersStats summary={summarizeOrders(orders)} />

      {/* مؤشّر الخطأ والتحميل — يعرض أي فشل في القراءة أو المعالجة بدلاً من ابتلاعه صامتاً */}
      {error && <OrdersErrorBanner error={error} onRetry={() => { refetch().catch(() => {}); }} />}
      {isLoading && orders.length === 0 && (
        <p className="text-[13px] text-[var(--vuno-text-secondary)] mt-5">جارٍ التحميل…</p>
      )}

      {/* Time filter + Add button */}
      <OrdersToolbar
        timeFilter={board.timeFilter}
        onTimeFilterChange={board.setTimeFilter}
        onNewOrder={board.openNewModal}
      />

      <KanbanBoard
        ordersByStatus={board.ordersByStatus}
        onDrop={board.handleDrop}
        onDragStart={board.setDraggedId}
        onAddOrder={board.openNewModal}
      />

      <MobileOrdersList
        statusFilter={board.statusFilter}
        onStatusFilterChange={board.setStatusFilter}
        ordersByStatus={board.ordersByStatus}
        orders={board.mobileOrders}
      />

      {board.showNewModal && (
        <NewOrderModal onClose={board.closeNewModal} onCreate={board.handleCreate} />
      )}
    </div>
  );
}
