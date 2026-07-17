import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  SearchIcon, PlusIcon, ProductsIcon, EditIcon, TrashIcon,
  PackageIcon, BarcodeIcon
} from '@/components/icons';
import { useProducts } from '@/context/products-context-value';
import { useAppSettings } from '@/context/app-settings-context-value';
import ProductFormModal from '@/components/ProductFormModal';
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

  return (
    <div className="space-y-6 animate-fade-in">
      {editingProduct !== undefined && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setEditingProduct(undefined)}
          onSave={handleSave}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي المنتجات', value: sampleProducts.length.toString(), color: 'bg-blue-50 text-blue-500' },
          { label: 'نشط', value: sampleProducts.filter(p => p.status === 'active').length.toString(), color: 'bg-emerald-50 text-emerald-500' },
          { label: 'منخفض المخزون', value: sampleProducts.filter(p => p.storeStock < lowStockThreshold).length.toString(), color: 'bg-red-50 text-red-500' },
          { label: 'متوسط الربح', value: '35%', color: 'bg-orange-50 text-[var(--vuno-primary)]' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.1, 0.3) }}
            className="card-vuno p-4"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <ProductsIcon size={18} />
            </div>
            <p className="text-xs text-[var(--vuno-text-muted)] mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-[var(--vuno-text)]">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--vuno-text-muted)]" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو الباركود..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-white text-sm focus:border-[var(--vuno-primary)] transition-colors"
          />
        </div>
        <button
          onClick={() => setEditingProduct(null)}
          className="self-start px-5 py-2.5 rounded-xl gradient-btn text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <PlusIcon size={16} />
          منتج جديد
        </button>
      </div>

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
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                <PackageIcon size={22} className="text-[var(--vuno-primary)]" />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="p-1.5 rounded-lg hover:bg-orange-50 text-[var(--vuno-primary)] transition-colors"
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
