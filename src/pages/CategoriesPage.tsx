import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusIcon, EditIcon, TrashIcon, PackageIcon, ArrowLeftIcon } from '@/components/icons';
import { sampleCategories } from '@/services/mock';
import { useProducts } from '@/context/products-context-value';
import QRCodeButton from '@/components/QRCodeButton';

// لوون موحّد واحد لجميع الفئات (بدلاً من الألوان العشوائية)
const UNIFIED_CATEGORY_COLOR = 'var(--vuno-primary)';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { products, deleteProduct } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [categories, setCategories] = useState(sampleCategories);
  // الفئة المختارة لعرض محتتوياتها
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const addCategory = () => {
    if (!newName.trim()) return;
    setCategories(prev => [...prev, {
      id: Date.now().toString(),
      name: newName,
      productCount: 0,
      color: UNIFIED_CATEGORY_COLOR
    }]);
    setNewName('');
    setShowForm(false);
  };

  const deleteCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('متأكد إنك عايز تحذف الفئة دي؟')) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleDeleteProduct = (productId: string, productName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`متأكد إنك عايز تحذف "${productName}" من الفئة؟`)) {
      deleteProduct(productId);
    }
  };

  // المنتجات التي تنتمي للفئة المختارة
  const selectedCategory = categories.find(c => c.name === selectedCat);
  const selectedProducts = selectedCat
    ? products.filter(p => p.category === selectedCat)
    : [];

  // عرض تفاصيل الفئة المختارة (محتتوياتها)
  if (selectedCat && selectedCategory) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* رأس صفحة التفاصيل */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setSelectedCat(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)] transition-colors active-scale"
          >
            <ArrowLeftIcon size={16} className="rotate-180" />
            رجوع للفئات
          </button>

          <div className="flex items-center gap-2">
            <QRCodeButton
              value={`VUNO:CATEGORY:${selectedCategory.id}:${selectedCategory.name}`}
              label={`QR Code — ${selectedCategory.name}`}
              iconSize={18}
              title="عرض QR Code للفئة"
            />
            <button
              onClick={() => navigate('/products')}
              className="px-5 py-2.5 rounded-full text-white font-medium flex items-center gap-2 btn-primary-pill hover:opacity-90 transition-opacity"
            >
              <PlusIcon size={16} />
              إضافة منتج
            </button>
          </div>
        </div>

        {/* بطاقة معلومات الفئة — بدون أيقونة، تصميم نظيف */}
        <div className="card-vuno p-6">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-[var(--vuno-text)] truncate sf-display">{selectedCategory.name}</h2>
            <div className="flex items-center gap-2 text-sm text-[var(--vuno-text-muted)] mt-1">
              <PackageIcon size={14} />
              {selectedProducts.length} منتج
            </div>
          </div>
        </div>

        {/* قائمة المنتجات داخل الفئة — مع زر حذف لكل منتج */}
        <div className="card-vuno overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--vuno-border-light)]">
            <h3 className="font-bold text-[var(--vuno-text)]">المنتجات داخل الفئة</h3>
          </div>

          {selectedProducts.length === 0 ? (
            <div className="p-10 text-center text-[var(--vuno-text-muted)]">
              <PackageIcon size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">لا توجد منتجات في هذه الفئة بعد</p>
              <button
                onClick={() => navigate('/products')}
                className="mt-4 px-5 py-2.5 rounded-full text-white font-medium inline-flex items-center gap-2 btn-primary-pill hover:opacity-90 transition-opacity"
              >
                <PlusIcon size={16} />
                إضافة أول منتج
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--vuno-border-light)]">
              {selectedProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  className="flex items-center justify-between p-4 hover:bg-[var(--vuno-bg)]/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)' }}>
                      <PackageIcon size={20} className="text-[var(--vuno-primary)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--vuno-text)] truncate">{p.name}</p>
                      <p className="text-xs text-[var(--vuno-text-muted)]">{p.barcode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-left">
                      <p className="text-sm font-bold text-[var(--vuno-primary)]">{p.price} EGP</p>
                      <p className="text-xs text-[var(--vuno-text-muted)]">{p.storeStock} بالمتجر</p>
                    </div>
                    <QRCodeButton
                      value={`VUNO:PRODUCT:${p.id}:${p.name}:${p.price}EGP:${p.barcode}`}
                      label={`QR Code — ${p.name}`}
                      iconSize={16}
                      title="عرض QR Code للمنتج"
                    />
                    {/* زر حذف المنتج من الفئة */}
                    <button
                      onClick={(e) => handleDeleteProduct(p.id, p.name, e)}
                      className="p-2 rounded-lg text-[var(--vuno-danger)] hover:bg-red-50 transition-colors flex-shrink-0"
                      aria-label="حذف المنتج"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // عرض قائمة الفئات الرئيسي — بدون أيقونات فئات
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div />
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-full text-white font-medium flex items-center gap-2 btn-primary-pill hover:opacity-90 transition-opacity"
        >
          <PlusIcon size={16} />
          فئة جديدة
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="card-vuno p-5"
        >
          <h3 className="font-bold text-[var(--vuno-text)] mb-4">إضافة فئة جديدة</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="اسم الفئة"
              className="flex-1 min-w-0 px-4 py-3 rounded-full border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:outline-none focus:border-[var(--vuno-primary)]"
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={addCategory} className="px-6 py-3 rounded-full text-white font-medium btn-primary-pill hover:opacity-90 transition-opacity">
                إضافة
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-3 rounded-full border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)] transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* شبكة الفئات — بطاقات نظيفة بدون أيقونات، عدّاد المنتجات + أزرار تعديل/حذف */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.1, 0.3) }}
            onClick={() => setSelectedCat(cat.name)}
            className="card-vuno p-6 hover:border-[var(--vuno-primary)] transition-all group text-right flex flex-col active-scale"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <PackageIcon size={16} className="text-[var(--vuno-text-muted)]" />
                <span className="text-xs text-[var(--vuno-text-muted)]">{cat.productCount} منتج</span>
              </div>
              {/* أزرار التعديل والحذف — مرئية دائماً على الموبايل، تظهر عند المرور على الديسكتوب */}
              <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <span
                  onClick={(e) => { e.stopPropagation(); }}
                  className="p-1.5 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-text-secondary)] transition-colors"
                >
                  <EditIcon size={14} />
                </span>
                <button
                  onClick={(e) => deleteCategory(cat.id, e)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--vuno-danger)] transition-colors"
                  aria-label="حذف الفئة"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-[var(--vuno-text)] mb-1 truncate sf-display">{cat.name}</h3>
            {/* شريط التقدّم باللون الموحّد */}
            <div className="mt-3 h-1.5 rounded-full bg-[var(--vuno-bg)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((cat.productCount / 100) * 100, 100)}%` }}
                transition={{ delay: Math.min(i * 0.1, 0.3) + 0.3, duration: 0.5 }}
                className="h-full rounded-full"
                style={{ backgroundColor: UNIFIED_CATEGORY_COLOR }}
              />
            </div>
          </motion.button>
        ))}
      </div>

      {/* تلميح للمستخدم */}
      <p className="text-xs text-[var(--vuno-text-muted)] text-center">
        اضغط على أي فئة لعرض محتتوياتها ومنتجاتها
      </p>
    </div>
  );
}
