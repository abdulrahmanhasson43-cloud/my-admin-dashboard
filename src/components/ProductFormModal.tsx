import { useState } from 'react';
import type { Product } from '@/types';
import { sampleCategories } from '@/services/mock';
import { XIcon, BarcodeIcon } from '@/components/icons';

interface ProductFormModalProps {
  product: Product | null; // null = adding a new product, otherwise editing
  onClose: () => void;
  onSave: (data: Omit<Product, 'id'>) => void;
}

const emptyForm = {
  name: '',
  category: sampleCategories[0]?.name ?? '',
  price: '',
  wholesalePrice: '',
  cost: '',
  storeStock: '',
  warehouseStock: '',
  barcode: '',
  status: 'active' as 'active' | 'inactive',
};

function generateBarcode(): string {
  return String(Math.floor(100000000 + Math.random() * 900000000));
}

export default function ProductFormModal({ product, onClose, onSave }: ProductFormModalProps) {
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
  } : emptyForm);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('اكتب اسم المنتج');
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError('سعر البيع لازم يكون رقم أكبر من صفر');
      return;
    }
    const storeStock = Number(form.storeStock) || 0;
    const warehouseStock = Number(form.warehouseStock) || 0;
    onSave({
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
  };

  const inputClass = "w-full h-11 px-4 rounded-[12px] bg-white text-[14px] text-[var(--vuno-text)] focus:outline-none focus:border-[var(--vuno-primary)] transition-colors";
  const inputBorder = { border: '1px solid var(--vuno-border)' };
  const labelClass = "text-[12px] text-[var(--vuno-text-secondary)] mb-1.5 block";

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
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="مثلاً: سماعة بلوتوث لاسلكية"
              className={inputClass}
              style={inputBorder}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>الفئة</label>
            <select
              value={form.category}
              onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
              className={inputClass}
              style={inputBorder}
            >
              {sampleCategories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>سعر البيع (EGP)</label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={form.price}
                onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0"
                className={inputClass}
                style={inputBorder}
              />
            </div>
            <div>
              <label className={labelClass}>سعر الجملة (EGP)</label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={form.wholesalePrice}
                onChange={(e) => setForm(f => ({ ...f, wholesalePrice: e.target.value }))}
                placeholder="0"
                className={inputClass}
                style={inputBorder}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>سعر الشراء (EGP)</label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={form.cost}
              onChange={(e) => setForm(f => ({ ...f, cost: e.target.value }))}
              placeholder="0"
              className={inputClass}
              style={inputBorder}
            />
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
                  onChange={(e) => setForm(f => ({ ...f, storeStock: e.target.value }))}
                  placeholder="0"
                  className={inputClass}
                  style={inputBorder}
                />
              </div>
              <div>
                <label className={labelClass}>في المخزن (احتياطي)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={form.warehouseStock}
                  onChange={(e) => setForm(f => ({ ...f, warehouseStock: e.target.value }))}
                  placeholder="0"
                  className={inputClass}
                  style={inputBorder}
                />
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
                onChange={(e) => setForm(f => ({ ...f, barcode: e.target.value }))}
                placeholder="اتركه فاضي عشان يتولّد تلقائي"
                className={inputClass}
                style={inputBorder}
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
            className="w-full h-12 rounded-full text-white font-semibold text-[16px] transition-transform active:scale-95 mt-2"
            style={{ background: 'var(--vuno-primary)' }}
          >
            {product ? 'حفظ التعديلات' : 'إضافة المنتج'}
          </button>
        </form>
      </div>
    </>
  );
}
