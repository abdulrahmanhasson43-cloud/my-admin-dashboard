import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PackageIcon, TrendingUpIcon, AlertTriangleIcon, TransferIcon,
  XIcon, CheckCircleIcon, DownloadIcon, TruckIcon, StoreIcon,
  ClockIcon, ArrowLeftIcon
} from '@/components/icons';
import { useProducts } from '@/context/products-context-value';
import { useAppSettings } from '@/context/app-settings-context-value';
import { useDeviceType } from '@/hooks/useDeviceType';
import StatsRow from '@/components/StatsRow';
import SearchBar from '@/components/SearchBar';
import QRCodeButton from '@/components/QRCodeButton';
import { exportToExcel } from '@/lib/export-utils';
import { toast } from 'sonner';
import type { Product } from '@/types';

export default function InventoryPage() {
  const { products, transferToStore, pendingTransfers, requestTransfer, confirmTransfer, cancelTransfer, transferHistory } = useProducts();
  const { lowStockThreshold, multiBranchEnabled, transferRequiresConfirmation } = useAppSettings();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [transferProduct, setTransferProduct] = useState<Product | null>(null);
  const [transferQty, setTransferQty] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'visual'>('list');
  const [dragProduct, setDragProduct] = useState<Product | null>(null);

  const categories = ['الكل', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(item => {
    const matchSearch = item.name.includes(search) || item.barcode.includes(search);
    const matchCat = selectedCategory === 'الكل' || item.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const lowStock = products.filter(p => p.storeStock < lowStockThreshold);
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.cost, 0);
  const totalItems = products.reduce((sum, p) => sum + p.stock, 0);

  const needsConfirmation = multiBranchEnabled && transferRequiresConfirmation;

  const handleQuickTransfer = (product: Product, qty = 1) => {
    if (product.warehouseStock <= 0) {
      toast.error('لا يوجد مخزون في المستودع');
      return;
    }
    const moveQty = Math.min(qty, product.warehouseStock);
    if (needsConfirmation) {
      requestTransfer(product.id, moveQty);
      toast.success(`تم إرسال طلب نقل ${moveQty} قطعة — بانتظار التأكيد`);
    } else {
      transferToStore(product.id, moveQty);
      toast.success(`تم نقل ${moveQty} قطعة من ${product.name} إلى المتجر`);
    }
  };

  const handleDropToStore = () => {
    if (dragProduct) {
      handleQuickTransfer(dragProduct, 1);
      setDragProduct(null);
    }
  };

  const handleTransferSubmit = () => {
    if (!transferProduct) return;
    const qty = Number(transferQty);
    if (qty > 0 && qty <= transferProduct.warehouseStock) {
      if (needsConfirmation) {
        requestTransfer(transferProduct.id, qty);
      } else {
        transferToStore(transferProduct.id, qty);
      }
    }
    setTransferProduct(null);
    setTransferQty('');
  };

  const stats = [
    { label: 'إجمالي المنتجات', value: products.length.toString(), icon: PackageIcon, color: 'text-[var(--vuno-primary)] bg-[var(--vuno-surface-pearl)]' },
    { label: 'إجمالي الكمية', value: totalItems.toLocaleString(), icon: TrendingUpIcon, color: 'text-emerald-500 bg-emerald-50' },
    { label: 'قيمة المخزون (بسعر الشراء)', value: `${(totalValue / 1000).toFixed(1)}K EGP`, icon: TrendingUpIcon, color: 'text-[var(--vuno-primary)] bg-[var(--vuno-surface-pearl)]' },
    { label: 'منخفض المخزون بالمتجر', value: lowStock.length.toString(), icon: AlertTriangleIcon, color: 'text-red-500 bg-red-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* بطاقات إحصائية أفقية */}
      <StatsRow items={stats} maxCols={4} />

      {/* Low Stock Alert — تصميم هادئ متسق مع باقي الواجهة: بطاقة بيضاء عادية
          مع لمسة برتقالية (warning) خفيفة بدل الإطار الأحمر الصارخ. */}
      {lowStock.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-vuno overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 sm:px-5 py-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--vuno-warning) 14%, transparent)' }}>
              <AlertTriangleIcon size={18} className="text-[var(--vuno-warning)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[var(--vuno-text)] text-[15px]">مخزون منخفض</h3>
              <p className="text-[12px] text-[var(--vuno-text-muted)]">يحتاج تجديد قريبًا · تحت حد {lowStockThreshold} قطعة</p>
            </div>
            <span
              className="flex-shrink-0 min-w-[26px] h-[26px] px-1.5 rounded-full text-xs font-bold flex items-center justify-center"
              style={{ background: 'var(--vuno-warning)', color: 'white' }}
            >
              {lowStock.length}
            </span>
          </div>

          <div className={`px-4 sm:px-5 pb-4 sm:pb-5 ${isMobile ? 'space-y-2' : 'flex flex-wrap gap-2'}`}>
            {lowStock.map(item => (
              isMobile ? (
                <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ background: 'var(--vuno-bg)' }}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--vuno-warning) 14%, transparent)' }}>
                      <PackageIcon size={14} className="text-[var(--vuno-warning)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--vuno-text)] truncate">{item.name}</p>
                      <p className="text-[11px] text-[var(--vuno-text-muted)]">{item.storeStock} بالمتجر{item.warehouseStock > 0 ? ` · ${item.warehouseStock} بالمخزن` : ''}</p>
                    </div>
                  </div>
                  {item.warehouseStock > 0 && (
                    <button
                      onClick={() => setTransferProduct(item)}
                      className="flex-shrink-0 h-8 px-3 rounded-full text-[12px] font-medium text-white active:scale-95 transition-transform"
                      style={{ background: 'var(--vuno-primary)' }}
                    >
                      نقل
                    </button>
                  )}
                </div>
              ) : (
                <span
                  key={item.id}
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: 'var(--vuno-bg)', color: 'var(--vuno-text-secondary)', border: '1px solid var(--vuno-border)' }}
                >
                  <span style={{ color: 'var(--vuno-warning)' }}>●</span> {item.name} ({item.storeStock} بالمتجر{item.warehouseStock > 0 ? ` · ${item.warehouseStock} بالمخزن` : ''})
                </span>
              )
            ))}
          </div>
        </motion.div>
      )}

      {/* Pending transfers */}
      {pendingTransfers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-vuno p-4">
          <h3 className="font-bold text-[var(--vuno-text)] mb-3 flex items-center gap-2">
            <TransferIcon size={16} className="text-[var(--vuno-primary)]" />
            نقلات مخزون معلّقة — محتاجة تأكيد
          </h3>
          <div className="space-y-2">
            {pendingTransfers.map(t => {
              const product = products.find(p => p.id === t.productId);
              return (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--vuno-bg)]">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--vuno-text)] truncate">{product?.name ?? 'منتج محذوف'}</p>
                    <p className="text-xs text-[var(--vuno-text-muted)]">نقل {t.quantity} قطعة من المخزن للمتجر · {t.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => confirmTransfer(t.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50"
                      aria-label="تأكيد"
                    >
                      <CheckCircleIcon size={16} />
                    </button>
                    <button
                      onClick={() => cancelTransfer(t.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50"
                      aria-label="إلغاء"
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* شريط بحث موحّد + فلتر الفئات */}
      <div className="space-y-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="ابحث عن منتج..."
          qrValue={`VUNO:INVENTORY:${products.length}:${totalItems}`}
          qrLabel="QR Code — المخزون"
          actions={
            <button
              onClick={() => {
                const rows = products.map((p, i) => ({
                  '#': i + 1,
                  'اسم المنتج': p.name,
                  'الباركود': p.barcode,
                  'الفئة': p.category,
                  'المخزون (متجر)': p.storeStock,
                  'المخزون (مستودع)': p.warehouseStock,
                  'المخزون (إجمالي)': p.stock,
                  'سعر الشراء': p.cost,
                  'سعر البيع': p.price,
                  'قيمة المخزون': p.stock * p.cost,
                  'الحالة': p.storeStock < lowStockThreshold ? 'منخفض' : 'متوفر',
                }));
                exportToExcel(rows, 'المخزون', 'المخزون');
              }}
              className="px-4 py-2.5 rounded-full border border-black/10 bg-white text-[var(--vuno-ink)] font-medium flex items-center gap-2 hover:bg-[var(--vuno-parchment)] transition-colors whitespace-nowrap active:scale-95 flex-shrink-0"
            >
              <DownloadIcon size={16} />
              تصدير
            </button>
          }
        />
        {/* فلتر الفئات أفقي قابل للتمرير */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                selectedCategory === cat
                  ? 'text-white'
                  : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)]'
              }`}
              style={selectedCategory === cat ? { background: 'var(--vuno-primary)' } : undefined}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* View Toggle — قائمة / نقل بصري */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            viewMode === 'list' ? 'gradient-btn text-white' : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)]'
          }`}
        >
          قائمة المنتجات
        </button>
        <button
          onClick={() => setViewMode('visual')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
            viewMode === 'visual' ? 'gradient-btn text-white' : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)]'
          }`}
        >
          <TruckIcon size={14} />
          نقل بصري
        </button>
      </div>

      {/* ── Visual Two-Panel: Warehouse → Store + Timeline ── */}
      {viewMode === 'visual' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Warehouse Panel (left / source) */}
            <div className="card-vuno p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                    <TruckIcon size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--vuno-text)] text-sm">المستودع</h3>
                    <p className="text-xs text-[var(--vuno-text-muted)]">اسحب المنتجات لنقلها</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-[var(--vuno-text-muted)]">
                  {filtered.filter(p => p.warehouseStock > 0).length} منتج
                </span>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {filtered.filter(p => p.warehouseStock > 0).map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    draggable
                    onDragStart={() => setDragProduct(item)}
                    onDragEnd={() => setDragProduct(null)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[var(--vuno-border)] bg-white cursor-grab active:cursor-grabbing hover:border-[var(--vuno-primary)] transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--vuno-surface-pearl)] flex items-center justify-center flex-shrink-0">
                      <PackageIcon size={14} className="text-[var(--vuno-primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--vuno-text)] truncate">{item.name}</p>
                      <p className="text-xs text-[var(--vuno-text-muted)]">{item.price} EGP</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-600 text-xs font-bold">
                        {item.warehouseStock}
                      </span>
                      <button
                        onClick={() => handleQuickTransfer(item, 1)}
                        className="w-7 h-7 rounded-lg bg-[var(--vuno-primary)] text-white flex items-center justify-center active:scale-90 transition-transform"
                        title="نقل قطعة واحدة"
                      >
                        <ArrowLeftIcon size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {filtered.filter(p => p.warehouseStock > 0).length === 0 && (
                  <div className="py-8 text-center text-sm text-[var(--vuno-text-muted)]">
                    المستودع فارغ — لا توجد منتجات قابلة للنقل
                  </div>
                )}
              </div>
            </div>

            {/* Store Panel (right / drop target) */}
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDropToStore}
              className={`card-vuno p-4 transition-all ${dragProduct ? 'ring-2 ring-[var(--vuno-primary)] border-[var(--vuno-primary)]' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <StoreIcon size={18} className="text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--vuno-text)] text-sm">المتجر</h3>
                    <p className="text-xs text-[var(--vuno-text-muted)]">
                      {dragProduct ? 'أفلت هنا للنقل' : 'المنتجات المعروضة للبيع'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-[var(--vuno-text-muted)]">
                  {filtered.length} منتج
                </span>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {filtered.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--vuno-bg)]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <PackageIcon size={14} className="text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--vuno-text)] truncate">{item.name}</p>
                      <p className="text-xs text-[var(--vuno-text-muted)]">{item.price} EGP</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      item.storeStock < lowStockThreshold ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {item.storeStock}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transfer Timeline */}
          <div className="card-vuno p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--vuno-surface-pearl)] flex items-center justify-center">
                <ClockIcon size={18} className="text-[var(--vuno-primary)]" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--vuno-text)] text-sm">سجل عمليات النقل</h3>
                <p className="text-xs text-[var(--vuno-text-muted)]">آخر {transferHistory.length} عملية</p>
              </div>
            </div>
            {transferHistory.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--vuno-text-muted)]">
                لا توجد عمليات نقل بعد — اسحب منتجاً من المستودع إلى المتجر للبدء
              </div>
            ) : (
              <div className="space-y-0 max-h-64 overflow-y-auto">
                {transferHistory.map((entry, idx) => (
                  <div key={entry.id} className="flex items-start gap-3 py-2.5 border-b border-[var(--vuno-border-light)] last:border-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                        <ArrowLeftIcon size={14} className="text-emerald-500" />
                      </div>
                      {idx < transferHistory.length - 1 && (
                        <div className="absolute top-8 right-1/2 w-px h-full bg-[var(--vuno-border)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-2">
                      <p className="text-sm font-medium text-[var(--vuno-text)] truncate">
                        نقل {entry.quantity} قطعة — {entry.productName}
                      </p>
                      <p className="text-xs text-[var(--vuno-text-muted)] mt-0.5">
                        من المستودع إلى المتجر • {entry.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* المخزون: بطاقات على الموبايل، جدول على الديسكتوب */}
      {viewMode === 'list' && (isMobile ? (
        <div className="space-y-3">
          {filtered.map((item, i) => {
            const isLow = item.storeStock < lowStockThreshold;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                className="card-vuno p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <PackageIcon size={18} className="text-[var(--vuno-primary)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--vuno-text)] truncate">{item.name}</p>
                      <p className="text-xs text-[var(--vuno-text-muted)]">{item.category}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${
                    isLow ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {isLow ? 'منخفض' : 'متوفر'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="rounded-xl bg-[var(--vuno-bg)] p-2.5 text-center">
                    <p className="text-[10px] text-[var(--vuno-text-muted)] mb-0.5">بالمتجر</p>
                    <p className="text-sm font-bold text-[var(--vuno-text)]">{item.storeStock}</p>
                  </div>
                  <div className="rounded-xl bg-[var(--vuno-bg)] p-2.5 text-center">
                    <p className="text-[10px] text-[var(--vuno-text-muted)] mb-0.5">بالمخزن</p>
                    <p className="text-sm font-bold text-[var(--vuno-text)]">{item.warehouseStock}</p>
                  </div>
                  <div className="rounded-xl bg-[var(--vuno-bg)] p-2.5 text-center">
                    <p className="text-[10px] text-[var(--vuno-text-muted)] mb-0.5">الإجمالي</p>
                    <p className="text-sm font-bold text-[var(--vuno-text)]">{item.stock}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTransferProduct(item)}
                    disabled={item.warehouseStock === 0}
                    className="flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-[var(--vuno-primary)] border border-[var(--vuno-primary)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--vuno-bg)] transition-colors text-sm font-medium"
                    aria-label="نقل مخزون"
                  >
                    <TransferIcon size={16} />
                    نقل مخزون
                  </button>
                  <QRCodeButton
                    value={`VUNO:PRODUCT:${item.id}:${item.name}:STOCK:${item.stock}:BC:${item.barcode}`}
                    label={`QR Code — ${item.name}`}
                    iconSize={18}
                    title="عرض QR Code"
                  />
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="card-vuno p-10 text-center text-[var(--vuno-text-muted)]">
              <PackageIcon size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">لا توجد منتجات مطابقة</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card-vuno overflow-hidden">
          <div className="list-header">
            <span className="flex-1 min-w-0">المنتج</span>
            <span className="w-28 flex-shrink-0">الفئة</span>
            <span className="w-20 flex-shrink-0">بالمتجر</span>
            <span className="w-20 flex-shrink-0">بالمخزن</span>
            <span className="w-20 flex-shrink-0">الإجمالي</span>
            <span className="w-20 flex-shrink-0">الحالة</span>
            <span className="w-24 flex-shrink-0">إجراءات</span>
          </div>
          {filtered.map((item, i) => {
            const isLow = item.storeStock < lowStockThreshold;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                className="list-row"
              >
                <span className="flex-1 min-w-0 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PackageIcon size={14} className="text-[var(--vuno-primary)]" />
                  </div>
                  <span className="text-sm font-medium text-[var(--vuno-text)] truncate">{item.name}</span>
                </span>
                <span className="w-28 flex-shrink-0 text-sm text-[var(--vuno-text-secondary)]">{item.category}</span>
                <span className="w-20 flex-shrink-0 text-sm font-semibold text-[var(--vuno-text)]">{item.storeStock}</span>
                <span className="w-20 flex-shrink-0 text-sm text-[var(--vuno-text-secondary)]">{item.warehouseStock}</span>
                <span className="w-20 flex-shrink-0 text-sm text-[var(--vuno-text-muted)]">{item.stock}</span>
                <span className="w-20 flex-shrink-0">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    isLow ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {isLow ? 'منخفض' : 'متوفر'}
                  </span>
                </span>
                <span className="w-24 flex-shrink-0 flex items-center gap-1.5">
                  <QRCodeButton
                    value={`VUNO:PRODUCT:${item.id}:${item.name}:STOCK:${item.stock}:BC:${item.barcode}`}
                    label={`QR Code — ${item.name}`}
                    iconSize={16}
                    title="عرض QR Code"
                  />
                  <button
                    onClick={() => setTransferProduct(item)}
                    disabled={item.warehouseStock === 0}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--vuno-primary)] border border-[var(--vuno-primary)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--vuno-bg)] transition-colors"
                    aria-label="نقل مخزون"
                    title="نقل مخزون"
                  >
                    <TransferIcon size={14} />
                  </button>
                </span>
              </motion.div>
            );
          })}
        </div>
      ))}

      {/* Transfer Stock modal */}
      {transferProduct && (
        <>
          <div
            onClick={() => setTransferProduct(null)}
            className="fixed inset-0 bg-black/40 z-[70] animate-in fade-in duration-200"
          />
          <div className="fixed bottom-0 inset-x-0 sm:inset-x-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:bottom-auto sm:w-full sm:max-w-md z-[75] bg-white rounded-t-[24px] sm:rounded-[20px] p-6 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[var(--vuno-text)]">نقل مخزون — {transferProduct.name}</h3>
              <button onClick={() => setTransferProduct(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--vuno-bg)]">
                <XIcon size={16} className="text-[var(--vuno-text-secondary)]" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-[var(--vuno-bg)] p-3 text-center">
                <p className="text-[11px] text-[var(--vuno-text-muted)] mb-1">بالمتجر الآن</p>
                <p className="text-lg font-bold text-[var(--vuno-text)]">{transferProduct.storeStock}</p>
              </div>
              <div className="rounded-xl bg-[var(--vuno-bg)] p-3 text-center">
                <p className="text-[11px] text-[var(--vuno-text-muted)] mb-1">بالمخزن الآن</p>
                <p className="text-lg font-bold text-[var(--vuno-text)]">{transferProduct.warehouseStock}</p>
              </div>
            </div>

            <label className="block text-xs text-[var(--vuno-text-secondary)] mb-1.5">الكمية المطلوب نقلها للمتجر</label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={transferProduct.warehouseStock}
              autoFocus
              value={transferQty}
              onChange={(e) => setTransferQty(e.target.value)}
              placeholder="0"
              className="w-full h-11 px-4 rounded-xl border border-[var(--vuno-border)] bg-white text-sm mb-2 focus:outline-none focus:border-[var(--vuno-primary)]"
            />

            {needsConfirmation && (
              <p className="text-[11px] text-[var(--vuno-text-muted)] mb-4">
                هيتحط "معلّق" لحد ما تأكد من صفحة المخزون.
              </p>
            )}

            <button
              onClick={handleTransferSubmit}
              disabled={!transferQty || Number(transferQty) <= 0 || Number(transferQty) > transferProduct.warehouseStock}
              className="w-full h-12 rounded-full text-white font-semibold text-[15px] transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              style={{ background: 'var(--vuno-primary)' }}
            >
              {needsConfirmation ? 'إرسال للتأكيد' : 'نقل الآن'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
