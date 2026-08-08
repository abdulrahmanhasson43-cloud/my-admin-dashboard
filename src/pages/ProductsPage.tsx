import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon, ProductsIcon, EditIcon, TrashIcon,
  PackageIcon, BarcodeIcon, DownloadIcon
} from '@/components/icons';
import { useProducts } from '@/context/products-context-value';
import { useAppSettings } from '@/context/app-settings-context-value';
import ProductFormModal from '@/components/ProductFormModal';
import StatsRow from '@/components/StatsRow';
import SearchBar from '@/components/SearchBar';
import QRCodeButton from '@/components/QRCodeButton';
import { exportToExcel } from '@/lib/export-utils';
import type { Product } from '@/types';

export default function ProductsPage() {
  const { products: sampleProducts, addProduct, updateProduct, deleteProduct } = useProducts();
  const { lowStockThreshold } = useAppSettings();
  const [search, setSearch] = useState('');
  // undefined = modal closed, null = adding a new product, Product = editing that product
  const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(undefined);

  const filtered = sampleProducts.filter(p =>
    p.name.includes(search) || p.barcode.includes(search)
  );

  const handleSave = (data: Omit<Product, 'id'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      addProduct(data);
    }
    setEditingProduct(undefined);
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`متأكد إنك عايز تحذف "${product.name}"؟`)) {
      deleteProduct(product.id);
    }
  };

  const stats = [
    { label: 'إجمالي المنتجات', value: sampleProducts.length.toString(), icon: ProductsIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
    { label: 'نشط', value: sampleProducts.filter(p => p.status === 'active').length.toString(), icon: ProductsIcon, color: 'bg-emerald-50 text-emerald-500' },
    { label: 'منخفض المخزون', value: sampleProducts.filter(p => p.storeStock < lowStockThreshold).length.toString(), icon: PackageIcon, color: 'bg-red-50 text-red-500' },
    { label: 'متوسط الربح', value: '35%', icon: ProductsIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
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
        qrValue={`VUNO:PRODUCTS:${sampleProducts.length}`}
        qrLabel="QR Code — المنتجات"
        actions={
          <>
            <button
              onClick={() => {
                const rows = sampleProducts.map((p, i) => ({
                  '#': i + 1,
                  'اسم المنتج': p.name,
                  'الباركود': p.barcode,
                  'السعر': p.price,
                  'تكلفة': p.cost ?? 0,
                  'المخزون': p.storeStock,
                  'الحالة': p.status === 'active' ? 'نشط' : 'غير نشط',
                }));
                exportToExcel(rows, 'المنتجات', 'المنتجات');
              }}
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
          </>
        }
      />

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.3) }}
            className="card-vuno p-5 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--vuno-surface-pearl)] flex items-center justify-center">
                <PackageIcon size={22} className="text-[var(--vuno-primary)]" />
              </div>
              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <QRCodeButton
                  value={`VUNO:PRODUCT:${product.id}:${product.name}:${product.price}EGP:${product.barcode}`}
                  label={`QR Code — ${product.name}`}
                  iconSize={14}
                  title="عرض QR Code"
                />
                <button
                  onClick={() => setEditingProduct(product)}
                  className="p-1.5 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-primary)] transition-colors"
                  aria-label="تعديل"
                >
                  <EditIcon size={14} />
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                  aria-label="حذف"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-[var(--vuno-text)] mb-1">{product.name}</h3>
            <p className="text-sm text-[var(--vuno-text-muted)] mb-3">{product.category}</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-[var(--vuno-primary)]">{product.price} EGP</span>
              <span className={`text-xs px-2 py-1 rounded-lg ${product.storeStock < lowStockThreshold ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {product.storeStock} بالمتجر
              </span>
            </div>

            {/* Store vs warehouse breakdown — read-only here; transfers happen in صفحة المخزون */}
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xs px-2 py-1 rounded-lg bg-[var(--vuno-bg)] text-[var(--vuno-text-secondary)]">
                {product.warehouseStock} بالمخزن
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-[var(--vuno-text-muted)]">
              <BarcodeIcon size={12} />
              {product.barcode}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
