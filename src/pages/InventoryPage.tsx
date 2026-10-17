import { useState } from 'react';
import { useProducts } from '@/context/products-context-value';
import { useAppSettings } from '@/context/app-settings-context-value';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useInventoryFilters } from '@/hooks/useInventoryFilters';
import { useStockTransfers } from '@/hooks/useStockTransfers';
import { exportToExcel } from '@/lib/export-utils';
import {
  buildExportRows,
  inventoryQrValue,
  needsTransferConfirmation,
  summarizeInventory,
  type InventoryViewMode,
} from '@/lib/inventory';
import InventoryStats from '@/components/inventory/InventoryStats';
import LowStockAlert from '@/components/inventory/LowStockAlert';
import PendingTransfersCard from '@/components/inventory/PendingTransfersCard';
import InventoryToolbar from '@/components/inventory/InventoryToolbar';
import ViewModeToggle from '@/components/inventory/ViewModeToggle';
import VisualTransferView from '@/components/inventory/VisualTransferView';
import InventoryCards from '@/components/inventory/InventoryCards';
import InventoryTable from '@/components/inventory/InventoryTable';
import TransferStockModal from '@/components/inventory/TransferStockModal';

/**
 * Inventory: how much of each product is on the shop floor and in the warehouse,
 * what is running low, and moving stock from the warehouse to the shop.
 * The rules are in lib/inventory.ts, the state in the two hooks, the drawing in components/inventory/.
 */
export default function InventoryPage() {
  const { products, pendingTransfers, confirmTransfer, cancelTransfer, transferHistory } = useProducts();
  const { lowStockThreshold, multiBranchEnabled, transferRequiresConfirmation } = useAppSettings();
  const isMobile = useDeviceType() === 'mobile';
  const [viewMode, setViewMode] = useState<InventoryViewMode>('list');

  const filters = useInventoryFilters(products);
  const needsConfirmation = needsTransferConfirmation(multiBranchEnabled, transferRequiresConfirmation);
  const transfers = useStockTransfers(needsConfirmation);
  const summary = summarizeInventory(products, lowStockThreshold);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* بطاقات إحصائية أفقية */}
      <InventoryStats summary={summary} />

      <LowStockAlert
        lowStock={summary.lowStock}
        lowStockThreshold={lowStockThreshold}
        isMobile={isMobile}
        onTransfer={transfers.openTransfer}
      />

      <PendingTransfersCard
        pendingTransfers={pendingTransfers}
        products={products}
        onConfirm={id => { confirmTransfer(id).catch(() => {}); }}
        onCancel={id => { cancelTransfer(id).catch(() => {}); }}
      />

      {/* شريط بحث موحّد + فلتر الفئات */}
      <InventoryToolbar
        search={filters.search}
        onSearchChange={filters.setSearch}
        qrValue={inventoryQrValue(summary.productCount, summary.totalItems)}
        onExport={() => exportToExcel(buildExportRows(products, lowStockThreshold), 'المخزون', 'المخزون')}
        categories={filters.categories}
        selectedCategory={filters.selectedCategory}
        onSelectCategory={filters.setSelectedCategory}
      />

      {/* قائمة / نقل بصري */}
      <ViewModeToggle mode={viewMode} onChange={setViewMode} />

      {viewMode === 'visual' && (
        <VisualTransferView
          products={filters.filtered}
          lowStockThreshold={lowStockThreshold}
          dragProduct={transfers.dragProduct}
          onDragStart={transfers.startDrag}
          onDragEnd={transfers.endDrag}
          onDrop={transfers.dropToStore}
          onQuickTransfer={(product, quantity) => { void transfers.quickTransfer(product, quantity); }}
          transferHistory={transferHistory}
        />
      )}

      {/* المخزون: بطاقات على الموبايل، جدول على الديسكتوب */}
      {viewMode === 'list' && (isMobile ? (
        <InventoryCards products={filters.filtered} lowStockThreshold={lowStockThreshold} onTransfer={transfers.openTransfer} />
      ) : (
        <InventoryTable products={filters.filtered} lowStockThreshold={lowStockThreshold} onTransfer={transfers.openTransfer} />
      ))}

      {transfers.transferProduct && (
        <TransferStockModal
          transferProduct={transfers.transferProduct}
          quantity={transfers.transferQty}
          onQuantityChange={transfers.setTransferQty}
          needsConfirmation={needsConfirmation}
          onClose={transfers.closeTransfer}
          onSubmit={() => { void transfers.submitTransfer(); }}
        />
      )}
    </div>
  );
}
