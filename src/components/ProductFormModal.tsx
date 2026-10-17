import { useEffect, useState } from 'react';
import type { Product } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { InvalidProductError, type ProductField } from '@/services/product';
import { toErrorMessage } from '@/lib/utils';
import { XIcon, BarcodeIcon } from '@/components/icons';

interface ProductFormModalProps {
  product: Product | null; // null = adding a new product, otherwise editing
  onClose: () => void;
  /**
   * Persists the product. Returns a promise so the modal can await the real
   * outcome before closing: a rejected save keeps the modal open and surfaces
   * the error inline (issue #4) instead of silently discarding the user's work.
   */
  onSave: (data: Omit<Product, 'id'>) => Promise<void>;
}

const makeEmptyForm = (defaultCategory: string) => ({
  name: '',
  category: defaultCategory,
  price: '',
  wholesalePrice: '',
  cost: '',
  storeStock: '',
  warehouseStock: '',
  barcode: '',
  status: 'active' as 'active' | 'inactive',
});

function generateBarcode(): string {
  return String(Math.floor(100000000 + Math.random() * 900000000));
}

export default function ProductFormModal({ product, onClose, onSave }: ProductFormModalProps) {
  // Categories come from the clean Categories service (never the mock layer).
  const { categories } = useCategories();
  const [form, setForm] = useState(() => product ? {
    name: product.name,
    category: product.category,
    price: String(product.price),
    wholesalePrice: String(product.wholesalePrice),
    cost: String(product.cost),
    storeStock: String(product.storeStock),
    warehouseStock: String(product.warehouseStock),
    barcode: product.barcode,
    status: product.status,
  } : makeEmptyForm(categories[0]?.name ?? ''));
  // A single general error (e.g. an unexpected failure) plus per-field errors
  // so a validation rejection from the service can highlight the exact input.
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ProductField, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Once categories finish loading, default a new product to the first one.
  useEffect(() => {
    if (product || form.category || categories.length === 0) return;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setForm(f => ({ ...f, category: categories[0].name }));
    });
    return () => {
      cancelled = true;
    };
  }, [product, categories, form.category]);

  const clearFieldError = (field: ProductField) =>
    setFieldErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Client-side guard rails give instant feedback; the service still owns
    // the authoritative validation (defence in depth).
    if (!form.name.trim()) {
      setFieldErrors({ name: 'اكتب اسم المنتج' });
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setFieldErrors({ price: 'سعر البيع لازم يكون رقم أكبر من صفر' });
      return;
    }

    const storeStock = Number(form.storeStock) || 0;
    const warehouseStock = Number(form.warehouseStock) || 0;

    setIsSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price) || 0,
        wholesalePrice: Number(form.wholesalePrice) || 0,
        cost: Number(form.cost) || 0,
        storeStock,
        warehouseStock,
        stock: storeStock + warehouseStock,
        barcode: form.barcode.trim() || generateBarcode(),
        status: form.status,
      });
    } catch (err) {
      // A validation error carries the offending field; bind it inline.
      if (err instanceof InvalidProductError && err.field) {
        setFieldErrors({ [err.field]: err.message });
      } else {
        setError(toErrorMessage(err));
      }
      setIsSaving(false);
      return;
    }
    setIsSaving(false);
  };

  const inputClass = "w-full h-11 px-4 rounded-[12px] bg-white text-[14px] text-[var(--vuno-text)] focus:outline-none focus:border-[var(--vuno-primary)] transition-colors";
  const inputBorder = { border: '1px solid var(--vuno-border)' };
  const errorBorder = { border: '1px solid var(--vuno-danger)' };
  const labelClass = "text-[12px] text-[var(--vuno-text-secondary)] mb-1.5 block";
  const fieldErrorClass = "text-[12px] text-[var(--vuno-danger)] mt-1 block";

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-[70] animate-in fade-in duration-200"
      />
      <div className="fixed bottom-0 inset-x-0 z-[75] bg-white rounded-t-[24px] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
        <div className="w-10 h-1 rounded-full bg-[var(--vuno-border)] mx-auto mt-3 mb-1" />
        <div className="flex items-center justify-between px-5 pt-2 pb-3 sticky top-0 bg-white border-b border-[var(--vuno-border-light)]">
          <h3 className="font-semibold text-[16px] text-[var(--vuno-text)]">
            {product ? 'تعديل المنتج' : 'منتج جديد'}
          </h3>
          <button onClick={onClose} type="button" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--vuno-bg)]">
            <XIcon size={16} className="text-[var(--vuno-text-secondary)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 pb-8 space-y-4 max-w-xl mx-auto">
          <div>
            <label className={labelClass}>اسم المنتج</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => { setForm(f => ({ ...f, name: e.target.value })); clearFieldError('name'); }}
              placeholder="مثلاً: سماعة بلوتوث لاسلكية"
              className={inputClass}
              style={fieldErrors.name ? errorBorder : inputBorder}
              autoFocus
            />
            {fieldErrors.name && <span className={fieldErrorClass}>{fieldErrors.name}</span>}
          </div>

          <div>
            <label className={labelClass}>الفئة</label>
            <select
              value={form.category}
              onChange={(e) => { setForm(f => ({ ...f, category: e.target.value })); clearFieldError('category'); }}
              className={inputClass}
              style={fieldErrors.category ? errorBorder : inputBorder}
            >
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            {fieldErrors.category && <span className={fieldErrorClass}>{fieldErrors.category}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>سعر البيع (EGP)</label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={form.price}
                onChange={(e) => { setForm(f => ({ ...f, price: e.target.value })); clearFieldError('price'); }}
                placeholder="0"
                className={inputClass}
                style={fieldErrors.price ? errorBorder : inputBorder}
              />
              {fieldErrors.price && <span className={fieldErrorClass}>{fieldErrors.price}</span>}
            </div>
            <div>
              <label className={labelClass}>سعر الجملة (EGP)</label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={form.wholesalePrice}
                onChange={(e) => { setForm(f => ({ ...f, wholesalePrice: e.target.value })); clearFieldError('wholesalePrice'); }}
                placeholder="0"
                className={inputClass}
                style={fieldErrors.wholesalePrice ? errorBorder : inputBorder}
              />
              {fieldErrors.wholesalePrice && <span className={fieldErrorClass}>{fieldErrors.wholesalePrice}</span>}
            </div>
          </div>

          <div>
            <label className={labelClass}>سعر الشراء (EGP)</label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={form.cost}
              onChange={(e) => { setForm(f => ({ ...f, cost: e.target.value })); clearFieldError('cost'); }}
              placeholder="0"
              className={inputClass}
              style={fieldErrors.cost ? errorBorder : inputBorder}
            />
            {fieldErrors.cost && <span className={fieldErrorClass}>{fieldErrors.cost}</span>}
          </div>

          <div>
            <p className="text-[12px] text-[var(--vuno-text-secondary)] mb-2">الكمية — مقسّمة بين المتجر والمخزن</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>في المتجر (متاح للبيع)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={form.storeStock}
                  onChange={(e) => { setForm(f => ({ ...f, storeStock: e.target.value })); clearFieldError('storeStock'); }}
                  placeholder="0"
                  className={inputClass}
                  style={fieldErrors.storeStock ? errorBorder : inputBorder}
                />
                {fieldErrors.storeStock && <span className={fieldErrorClass}>{fieldErrors.storeStock}</span>}
              </div>
              <div>
                <label className={labelClass}>في المخزن (احتياطي)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={form.warehouseStock}
                  onChange={(e) => { setForm(f => ({ ...f, warehouseStock: e.target.value })); clearFieldError('warehouseStock'); }}
                  placeholder="0"
                  className={inputClass}
                  style={fieldErrors.warehouseStock ? errorBorder : inputBorder}
                />
                {fieldErrors.warehouseStock && <span className={fieldErrorClass}>{fieldErrors.warehouseStock}</span>}
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>الباركود</label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={form.barcode}
                onChange={(e) => { setForm(f => ({ ...f, barcode: e.target.value })); clearFieldError('barcode'); }}
                placeholder="اتركه فاضي عشان يتولّد تلقائي"
                className={inputClass}
                style={fieldErrors.barcode ? errorBorder : inputBorder}
              />
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, barcode: generateBarcode() }))}
                className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)' }}
                aria-label="توليد باركود"
              >
                <BarcodeIcon size={17} className="text-[var(--vuno-primary)]" />
              </button>
            </div>
            {fieldErrors.barcode && <span className={fieldErrorClass}>{fieldErrors.barcode}</span>}
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-[13px] font-medium text-[var(--vuno-text)]">المنتج نشط ومتاح للبيع</span>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, status: f.status === 'active' ? 'inactive' : 'active' }))}
              className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
              style={{ background: form.status === 'active' ? 'var(--vuno-primary)' : 'var(--vuno-border)' }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                style={{ right: form.status === 'active' ? '2px' : 'calc(100% - 22px)' }}
              />
            </button>
          </div>

          {error && <p className="text-[12px] text-[var(--vuno-danger)]">{error}</p>}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-12 rounded-full text-white font-semibold text-[16px] transition-transform active:scale-95 mt-2 disabled:opacity-60 disabled:active:scale-100"
            style={{ background: 'var(--vuno-primary)' }}
          >
            {isSaving ? 'جارٍ الحفظ…' : (product ? 'حفظ التعديلات' : 'إضافة المنتج')}
          </button>
        </form>
      </div>
    </>
  );
}
