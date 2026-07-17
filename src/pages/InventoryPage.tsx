import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  SearchIcon, PackageIcon, TrendingUpIcon, AlertTriangleIcon, TransferIcon,
  XIcon, CheckCircleIcon
} from '@/components/icons';
import { useProducts } from '@/context/products-context-value';
import { useAppSettings } from '@/context/app-settings-context-value';
import type { Product } from '@/types';

export default function InventoryPage() {
  const { products, transferToStore, pendingTransfers, requestTransfer, confirmTransfer, cancelTransfer } = useProducts();
  const { lowStockThreshold, multiBranchEnabled, transferRequiresConfirmation } = useAppSettings();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [transferProduct, setTransferProduct] = useState<Product | null>(null);
  const [transferQty, setTransferQty] = useState('');

  const categories = ['الكل', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(item => {
    const matchSearch = item.name.includes(search) || item.barcode.includes(search);
    const matchCat = selectedCategory === 'الكل' || item.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const lowStock = products.filter(p => p.storeStock < lowStockThreshold);
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.cost, 0);
  const totalItems = products.reduce((sum, p) => sum + p.stock, 0);

  // Confirmation requirement only makes sense once multi-branch is on —
  // for a single-location merchant a transfer is just an internal note.
  const needsConfirmation = multiBranchEnabled && transferRequiresConfirmation;

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي المنتجات', value: products.length.toString(), icon: PackageIcon, color: 'text-blue-500 bg-blue-50' },
          { label: 'إجمالي الكمية', value: totalItems.toLocaleString(), icon: TrendingUpIcon, color: 'text-emerald-500 bg-emerald-50' },
          { label: 'قيمة المخزون (بسعر الشراء)', value: `${(totalValue / 1000).toFixed(1)}K EGP`, icon: TrendingUpIcon, color: 'text-[var(--vuno-primary)] bg-orange-50' },
          { label: 'منخفض المخزون بالمتجر', value: lowStock.length.toString(), icon: AlertTriangleIcon, color: 'text-red-500 bg-red-50' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.1, 0.3) }}
              className="card-vuno p-4"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <Icon size={18} />
              </div>
              <p className="text-xs text-[var(--vuno-text-muted)] mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-[var(--vuno-text)]">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-vuno p-4 border-r-4 border-red-400 bg-red-50/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangleIcon size={18} className="text-red-500" />
            <h3 className="font-bold text-red-600">تنبيه: منتجات منخفضة المخزون بالمتجر</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(item => (
              <span key={item.id} className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-medium">
                {item.name} ({item.storeStock} بالمتجر{item.warehouseStock > 0 ? ` · ${item.warehouseStock} بالمخزن` : ''})
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Pending transfers awaiting confirmation */}
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
                  <div>
                    <p className="text-sm font-semibold text-[var(--vuno-text)]">{product?.name ?? 'منتج محذوف'}</p>
                    <p className="text-xs text-[var(--vuno-text-muted)]">نقل {t.quantity} قطعة من المخزن للمتجر · {t.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
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

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--vuno-text-muted)]" />
          <input
            type="text"
            placeholder="ابحث عن منتج..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-white text-sm focus:border-[var(--vuno-primary)] transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'gradient-btn text-white'
                  : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table — real product data, store vs warehouse breakdown */}
      <div className="card-vuno overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-[var(--vuno-border)]">
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">المنتج</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">الفئة</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">بالمتجر</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">بالمخزن</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">الإجمالي</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">الحالة</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const isLow = item.storeStock < lowStockThreshold;
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.05, 0.3) }}
                    className="border-b border-[var(--vuno-border-light)] last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                          <PackageIcon size={14} className="text-[var(--vuno-primary)]" />
                        </div>
                        <span className="text-sm font-medium text-[var(--vuno-text)]">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--vuno-text-secondary)]">{item.category}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[var(--vuno-text)]">{item.storeStock}</td>
                    <td className="px-4 py-3 text-sm text-[var(--vuno-text-secondary)]">{item.warehouseStock}</td>
                    <td className="px-4 py-3 text-sm text-[var(--vuno-text-muted)]">{item.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        isLow ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {isLow ? 'منخفض' : 'متوفر'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setTransferProduct(item)}
                        disabled={item.warehouseStock === 0}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--vuno-primary)] border border-[var(--vuno-primary)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-orange-50 transition-colors"
                        aria-label="نقل مخزون"
                        title="نقل مخزون"
                      >
                        <TransferIcon size={14} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
                هيتحط "معلّق" لحد ما تأكده من صفحة المخزون.
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
