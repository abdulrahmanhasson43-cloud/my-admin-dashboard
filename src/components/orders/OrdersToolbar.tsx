import { PlusIcon } from '@/components/icons';
import { ORDER_TIME_FILTERS, type OrderTimeFilter } from '@/lib/orders';

interface OrdersToolbarProps {
  timeFilter: OrderTimeFilter;
  onTimeFilterChange: (filter: OrderTimeFilter) => void;
  onNewOrder: () => void;
}

/** OrdersToolbar — the time-filter chips and the "new order" button. */
export default function OrdersToolbar({ timeFilter, onTimeFilterChange, onNewOrder }: OrdersToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 mt-5 mb-4">
      <div className="flex gap-2 overflow-x-auto scrollbar-hidden">
        {ORDER_TIME_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => onTimeFilterChange(f.id)}
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
        onClick={onNewOrder}
        className="h-11 px-4 rounded-full text-white font-medium flex items-center gap-2 hover:opacity-90 flex-shrink-0 whitespace-nowrap"
        style={{ background: 'var(--vuno-primary)' }}
      >
        <PlusIcon size={18} />
        <span className="hidden sm:inline">طلب جديد</span>
      </button>
    </div>
  );
}
