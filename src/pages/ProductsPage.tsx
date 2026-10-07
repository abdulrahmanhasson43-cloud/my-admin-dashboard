import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon, ProductsIcon, EditIcon, TrashIcon,
  PackageIcon, BarcodeIcon, DownloadIcon, CheckIcon
} from '@/components/icons';
import { useProducts } from '@/context/products-context-value';
import { useAppSettings } from '@/context/app-settings-context-value';
import { useNotifications } from '@/context/notifications-context-value';
import { useActivityLog } from '@/context/activity-log-context-value';
import ProductFormModal from '@/components/ProductFormModal';
import StatsRow from '@/components/StatsRow';
import SearchBar from '@/components/SearchBar';
import QRCodeButton from '@/components/QRCodeButton';
import VariantCard from '@/components/VariantCard';
import { exportToExcel } from '@/lib/export-utils';
import type { Product } from '@/types';

/**
 * تحديد لون المخزون بناءً على الكمية وحد التنبيه.
 * أخضر = مخزون كافٍ، أصفر = منخفض، أحمر = نافد تقريبًا.
 */
function getStockColor(stock: number, threshold: number): string {
  if (stock <= 0) return 'var(--vuno-danger)';
  if (stock < threshold / 2) return 'var(--vuno-danger)';
  if (stock < threshold) return 'var(--vuno-warning)';
  return 'var(--vuno-success)';
}

function getStockLabel(stock: number, threshold: number): string {
  if (stock <= 0) return 'نافد';
  if (stock < threshold / 2) return 'حرج';
  if (stock < threshold) return 'منخفض';
  return 'متوفر';
}

export default function ProductsPage() {
  const { products, isLoading, error, refresh, addProduct, updateProduct, deleteProduct } = useProducts();
  const { lowStockThreshold } = useAppSettings();
  const { notifyLowStock } = useNotifications();
  const { logActivity } = useActivityLog();
  const [search, setSearch] = useState('');
  // undefined = modal closed, null = adding a new product, Product = editing that product
  const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(undefined);
  // Bulk selection state — الفكرة #2: إجراءات جماعية
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = products.filter(p =>
    p.name.includes(search) || p.barcode.includes(search)
  );

  // فحص المخزون المنخفض تلقائيًا وإرسال تنبيهات (الفكرة #5)
  useEffect(() => {
    const lowStockNames = products
      .filter(p => p.storeStock < lowStockThreshold)
      .map(p => p.name);
    if (lowStockNames.length > 0) {
      notifyLowStock(lowStockNames);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lowStockThreshold]);

  // Async on purpose: the modal awaits this so a rejected save (e.g. a
  // validation error) can be bound to the offending field and the modal stays
  // open. We only close the modal once the write actually succeeded (issue #4).
  const handleSave = async (data: Omit<Product, 'id'>) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
      logActivity('product', `تم تعديل المنتج: ${data.name}`);
    } else {
      await addProduct(data);
      logActivity('product', `تم إضافة منتج جديد: ${data.name}`);
    }
    setEditingProduct(undefined);
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm(`متأكد إنك عايز تحذف "${product.name}"؟`)) {
      try {
        await deleteProduct(product.id);
        logActivity('product', `تم حذف المنتج: ${product.name}`);
      } catch {
        // ProductsContext already surfaced a toast + error state; keep the row.
      }
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filtered.map(p => p.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setBulkMode(false);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`متأكد إنك عايز تحذف ${selectedIds.size} منتج؟`)) {
      const targets = products.filter(p => selectedIds.has(p.id));
      // allSettled so one failed delete doesn't abort the rest, and we still
      // log exactly the rows that were actually removed.
      const results = await Promise.allSettled(targets.map(p => deleteProduct(p.id)));
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          logActivity('product', `تم حذف المنتج: ${targets[index].name}`);
        }
      });
      clearSelection();
    }
  };

  // Retry the failed snapshot read. `refresh` clears `error` on success, so
  // the banner disappears; on failure the promise rejects — catch it here so
  // we never leak an unhandled rejection, and keep the banner up (its message
  // stays the previous one; the context re-read will surface a fresh one on
  // the next attempt).
  const handleRetry = async () => {
    try {
      await refresh();
    } catch {
      // Still failing — banner remains visible.
    }
  };

  const handleBulkExport = () => {
    const productsToExport = selectedIds.size > 0
      ? products.filter(p => selectedIds.has(p.id))
      : products;
    const rows = productsToExport.map((p, i) => ({
      '#': i + 1,
      'اسم المنتج': p.name,
      'الباركود': p.barcode,
      'السعر': p.price,
      'تكلفة': p.cost ?? 0,
      'المخزون': p.storeStock,
      'الحالة': p.status === 'active' ? 'نشط' : 'غير نشط',
    }));
    exportToExcel(rows, 'المنتجات', 'المنتجات');
  };

  const stats = [
    { label: 'إجمالي المنتجات', value: products.length.toString(), icon: ProductsIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
    { label: 'نشط', value: products.filter(p => p.status === 'active').length.toString(), icon: ProductsIcon, color: 'bg-emerald-50 text-emerald-500' },
    { label: 'منخفض المخزون', value: products.filter(p => p.storeStock < lowStockThreshold).length.toString(), icon: PackageIcon, color: 'bg-red-50 text-red-500' },
    { label: 'متوسط الربح', value: '35%', icon: ProductsIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-[12px] border px-4 py-3"
          style={{ borderColor: 'color-mix(in srgb, var(--vuno-danger) 30%, transparent)', background: 'color-mix(in srgb, var(--vuno-danger) 6%, transparent)' }}>
          <p className="text-[13px] text-[var(--vuno-danger)]">{error}</p>
          <button
            onClick={handleRetry}
            className="text-[13px] font-semibold text-[var(--vuno-danger)] underline whitespace-nowrap"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {isLoading && products.length === 0 && (
        <p className="text-[13px] text-[var(--vuno-text-secondary)]">جارٍ تحميل المنتجات…</p>
      )}

      {editingProduct !== undefined && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setEditingProduct(undefined)}
          onSave={handleSave}
        />
      )}

      <StatsRow items={stats} maxCols={4} />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="ابحث بالاسم أو الباركود..."
        qrValue={`VUNO:PRODUCTS:${products.length}`}
        qrLabel="QR Code — المنتجات"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setBulkMode(!bulkMode); clearSelection(); }}
              className={`px-4 py-2.5 rounded-full border font-medium flex items-center gap-2 whitespace-nowrap active:scale-95 flex-shrink-0 transition-colors ${bulkMode ? 'bg-[var(--vuno-primary)] text-white border-[var(--vuno-primary)]' : 'border-black/10 bg-white text-[var(--vuno-ink)]'}`}
            >
              <CheckIcon size={16} />
              تحديد
            </button>
            <button
              onClick={handleBulkExport}
              className="px-4 py-2.5 rounded-full border border-black/10 bg-white text-[var(--vuno-ink)] font-medium flex items-center gap-2 hover:bg-[var(--vuno-parchment)] transition-colors whitespace-nowrap active:scale-95 flex-shrink-0"
            >
              <DownloadIcon size={16} />
              تصدير
            </button>
            <button
              onClick={() => setEditingProduct(null)}
              className="px-5 py-2.5 rounded-full btn-primary-pill text-white font-semibold flex items-center gap-2 whitespace-nowrap active:scale-95 flex-shrink-0"
            >
              <PlusIcon size={16} />
              منتج جديد
            </button>
          </div>
        }
      />

      {/* Bulk Actions Bar — يظهر عند تفعيل وضع التحديد (الفكرة #2) */}
      {bulkMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-vuno p-4 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[var(--vuno-text)]">
              {selectedIds.size} محدد
            </span>
            <button onClick={selectAll} className="text-xs text-[var(--vuno-primary)] font-medium hover:opacity-70">
              تحديد الكل
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkExport}
              disabled={selectedIds.size === 0}
              className="px-4 py-2 rounded-full text-sm font-medium border border-[var(--vuno-border)] text-[var(--vuno-text)] hover:bg-[var(--vuno-bg)] transition-colors disabled:opacity-40"
            >
              تصدير المحدد
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.size === 0}
              className="px-4 py-2 rounded-full text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-40"
            >
              حذف المحدد
            </button>
            <button
              onClick={clearSelection}
              className="px-4 py-2 rounded-full text-sm font-medium text-[var(--vuno-text-muted)] hover:bg-[var(--vuno-bg)] transition-colors"
            >
              إلغاء
            </button>
          </div>
        </motion.div>
      )}

      {/* Products Grid — بطاقات متوازنة (طلب المستخدم D)
          Mobile: 2 columns, Desktop: 3-4 columns (scaled same design).
          Cards are balanced — not too tall, not too wide.
          Same design on mobile and desktop but scaled. */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 select-none-touch">
        {filtered.map((product, i) => {
          const stockColor = getStockColor(product.storeStock, lowStockThreshold);
          const stockLabel = getStockLabel(product.storeStock, lowStockThreshold);
          const isSelected = selectedIds.has(product.id);
          const hasVariants = product.variants && product.variants.length > 0;
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.25) }}
              onClick={() => bulkMode && toggleSelect(product.id)}
              className={`card-vuno p-3 lg:p-4 hover:shadow-md transition-all group relative flex flex-col ${bulkMode ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-[var(--vuno-primary)]' : ''}`}
            >
              {/* Bulk selection checkbox — الفكرة #2 */}
              {bulkMode && (
                <div className="absolute top-2 left-2 z-10">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${isSelected ? 'bg-[var(--vuno-primary)] border-[var(--vuno-primary)]' : 'border-[var(--vuno-border)] bg-white'}`}
                  >
                    {isSelected && <CheckIcon size={14} className="text-white" />}
                  </div>
                </div>
              )}

              {/* Header: icon + actions */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-[var(--vuno-surface-pearl)] flex items-center justify-center flex-shrink-0">
                  <PackageIcon size={20} className="text-[var(--vuno-primary)]" />
                </div>
                {!bulkMode && (
                  <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <QRCodeButton
                      value={`VUNO:PRODUCT:${product.id}:${product.name}:${product.price}EGP:${product.barcode}`}
                      label={`QR Code — ${product.name}`}
                      iconSize={14}
                      title="عرض QR Code"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingProduct(product); }}
                      className="p-1.5 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-primary)] transition-colors active:scale-90"
                      aria-label="تعديل"
                    >
                      <EditIcon size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(product); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors active:scale-90"
                      aria-label="حذف"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Product name + category */}
              <h3 className="font-bold text-[13px] lg:text-[15px] text-[var(--vuno-text)] mb-0.5 line-clamp-1 leading-tight">{product.name}</h3>
              <p className="text-[11px] lg:text-[12px] text-[var(--vuno-text-muted)] mb-2.5 line-clamp-1">{product.category}</p>

              {/* Variants display (Idea #30) */}
              {hasVariants && (
                <div className="mb-2.5">
                  <VariantCard variants={product.variants!} compact />
                </div>
              )}

              {/* Price + stock badge */}
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[15px] lg:text-[17px] font-bold text-[var(--vuno-primary)]">{product.price} EGP</span>
                <span
                  className="text-[10px] lg:text-[11px] px-2 py-0.5 rounded-lg font-medium"
                  style={{ background: `color-mix(in srgb, ${stockColor} 12%, transparent)`, color: stockColor }}
                >
                  {product.storeStock} بالمحل
                </span>
              </div>

              {/* Stock color bar — شريط مرئي لحالة المخزون */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] lg:text-[11px] text-[var(--vuno-text-muted)]">المخزون</span>
                  <span className="text-[10px] lg:text-[11px] font-semibold" style={{ color: stockColor }}>{stockLabel}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--vuno-bg)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((product.storeStock / (lowStockThreshold * 3)) * 100, 100)}%`,
                      background: stockColor,
                    }}
                  />
                </div>
              </div>

              {/* Warehouse stock + barcode — compact footer */}
              <div className="mt-auto flex items-center justify-between gap-1.5 pt-1.5 border-t border-[var(--vuno-border-light)]">
                <span className="text-[10px] lg:text-[11px] text-[var(--vuno-text-secondary)] flex items-center gap-1">
                  <PackageIcon size={11} />
                  {product.warehouseStock}
                </span>
                <span className="text-[10px] lg:text-[11px] text-[var(--vuno-text-muted)] font-mono flex items-center gap-1 truncate">
                  <BarcodeIcon size={11} />
                  <span className="truncate">{product.barcode}</span>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
