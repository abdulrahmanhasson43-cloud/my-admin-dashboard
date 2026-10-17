import type { TransferHistoryEntry } from '@/context/products-context-value';
import type { Product } from '@/types';
import WarehousePanel from './WarehousePanel';
import StorePanel from './StorePanel';
import TransferTimeline from './TransferTimeline';

interface VisualTransferViewProps {
  /** The products currently shown (after search and category). */
  products: Product[];
  lowStockThreshold: number;
  dragProduct: Product | null;
  onDragStart: (product: Product) => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onQuickTransfer: (product: Product, quantity: number) => void;
  transferHistory: TransferHistoryEntry[];
}

/** "نقل بصري": warehouse on one side, shop on the other, drag between them, history underneath. */
export default function VisualTransferView({
  products, lowStockThreshold, dragProduct, onDragStart, onDragEnd, onDrop, onQuickTransfer, transferHistory,
}: VisualTransferViewProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WarehousePanel products={products} onDragStart={onDragStart} onDragEnd={onDragEnd} onQuickTransfer={onQuickTransfer} />
        <StorePanel products={products} lowStockThreshold={lowStockThreshold} dragProduct={dragProduct} onDrop={onDrop} />
      </div>
      <TransferTimeline transferHistory={transferHistory} />
    </div>
  );
}
