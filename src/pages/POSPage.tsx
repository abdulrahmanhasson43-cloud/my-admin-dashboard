import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SearchIcon, PlusIcon, MinusIcon, TrashIcon, ReceiptIcon,
  CashIcon, CardIcon, WalletIcon, InstaPayIcon, CheckCircleIcon, XIcon, BarcodeIcon, ShoppingCartIcon
} from '@/components/icons';
import type { Product, CartItem, CompletedSale } from '@/types';
import { useProducts } from '@/context/products-context-value';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';

const paymentMethods = [
  { id: 'cash', name: 'كاش', icon: CashIcon },
  { id: 'card', name: 'بطاقة', icon: CardIcon },
  { id: 'wallet', name: 'محفظة', icon: WalletIcon },
  { id: 'instapay', name: 'إنستاباي', icon: InstaPayIcon },
];

// Defined outside the component so it isn't treated as part of the
// component's render body by the react-hooks "purity" lint rule — this
// is only ever called from the checkout click handler, never during render.
function generateInvoiceId(): string {
  return 'INV-' + Date.now().toString().slice(-6);
}

export default function POSPage() {
  const { products, sellProducts } = useProducts();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<CompletedSale | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const categories = ['الكل', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.includes(search) || p.barcode.includes(search);
    const matchCategory = selectedCategory === 'الكل' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const cartQuantityFor = (productId: string) => cart.find(i => i.id === productId)?.quantity ?? 0;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const setExactQuantity = (id: string, value: number) => {
    if (!Number.isFinite(value) || value < 1) return;
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.floor(value) } : item));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleBarcodeDetected = useCallback((code: string) => {
    setScannerOpen(false);
    const match = products.find(p => p.barcode === code);
    if (match) {
      addToCart(match);
    } else {
      setSearch(code);
    }
  }, [products]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.14;
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Play success sound
    try {
      const audio = new Audio('/sounds/payment-success.mp3');
      audio.play();
    } catch (e) {
      console.log('Audio play failed', e);
    }

    setShowSuccess(true);

    const invoice: CompletedSale = {
      id: generateInvoiceId(),
      items: [...cart],
      subtotal,
      tax,
      total,
      paymentMethod: selectedPayment,
      date: new Date().toLocaleString('ar-EG'),
    };

    setTimeout(() => {
      sellProducts(cart);
      setCompletedInvoice(invoice);
      setShowSuccess(false);
      setCart([]);
      setCartOpen(false);
    }, 1200);
  };

  const resetInvoice = () => {
    setCompletedInvoice(null);
  };

  if (completedInvoice) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto bg-white border border-[var(--vuno-border)] rounded-[18px] p-8 text-center"
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'color-mix(in srgb, var(--vuno-success) 12%, transparent)' }}>
          <CheckCircleIcon size={32} className="text-[var(--vuno-success)]" />
        </div>
        <h2 className="text-[22px] font-semibold text-[var(--vuno-text)] mb-1 tracking-tight">تم الدفع بنجاح</h2>
        <p className="text-[15px] text-[var(--vuno-text-muted)] mb-6">فاتورة رقم {completedInvoice.id}</p>

        <div className="bg-[var(--vuno-bg)] rounded-[14px] p-4 mb-6 text-right space-y-2">
          {completedInvoice.items.map((item: CartItem, i: number) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-[var(--vuno-text)]">{item.name} × {item.quantity}</span>
              <span className="font-semibold text-[var(--vuno-text)]">{(item.price * item.quantity).toLocaleString()} EGP</span>
            </div>
          ))}
          <div className="border-t border-[var(--vuno-border-light)] pt-2 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--vuno-text-muted)]">الضريبة (14%)</span>
              <span className="text-[var(--vuno-text)]">{completedInvoice.tax.toLocaleString()} EGP</span>
            </div>
            <div className="flex justify-between font-semibold text-[17px] mt-1">
              <span className="text-[var(--vuno-primary)]">الإجمالي</span>
              <span className="text-[var(--vuno-primary)]">{completedInvoice.total.toLocaleString()} EGP</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={resetInvoice}
            className="flex-1 h-11 rounded-full text-white font-semibold text-[15px] transition-transform active:scale-95"
            style={{ background: 'var(--vuno-primary)' }}
          >
            فاتورة جديدة
          </button>
          <button
            onClick={resetInvoice}
            className="w-11 h-11 rounded-full border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] flex items-center justify-center transition-transform active:scale-95"
          >
            <XIcon size={18} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Barcode Scanner */}
      {scannerOpen && (
        <BarcodeScannerModal
          onDetected={handleBarcodeDetected}
          onClose={() => setScannerOpen(false)}
        />
      )}

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{ background: 'var(--vuno-success)' }}
            >
              <CheckCircleIcon size={56} className="text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Modal — opened via the cart icon, not shown inline on the page anymore */}
      {cartOpen && (
        <>
          <div
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/40 z-[70] animate-in fade-in duration-200"
          />
          <div className="fixed bottom-0 inset-x-0 z-[75] bg-white rounded-t-[24px] max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 rounded-full bg-[var(--vuno-border)] mx-auto mt-3 mb-1" />
            <div className="flex items-center justify-between px-5 pt-2 pb-3 sticky top-0 bg-white">
              <h3 className="font-semibold text-[16px] text-[var(--vuno-text)] flex items-center gap-2">
                <ReceiptIcon size={17} />
                سلة المشتريات
              </h3>
              <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--vuno-bg)]">
                <XIcon size={16} className="text-[var(--vuno-text-secondary)]" />
              </button>
            </div>

            <div className="px-5 pb-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-[var(--vuno-bg)] flex items-center justify-center mx-auto mb-3">
                    <ReceiptIcon size={22} className="text-[var(--vuno-text-muted)]" />
                  </div>
                  <p className="text-[var(--vuno-text-muted)] text-[14px]">السلة فارغة</p>
                  <p className="text-[12px] text-[var(--vuno-text-muted)] mt-1">اضغط على منتج لإضافته</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {cart.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-[var(--vuno-bg)] rounded-[14px]"
                      >
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="text-[14px] font-semibold text-[var(--vuno-text)] truncate">{item.name}</p>
                          <p className="text-[12px] text-[var(--vuno-primary)]">{item.price} EGP</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 rounded-full bg-white border border-[var(--vuno-border)] flex items-center justify-center transition-transform active:scale-90"
                          >
                            <MinusIcon size={13} />
                          </button>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => setExactQuantity(item.id, parseInt(e.target.value, 10))}
                            onFocus={(e) => e.target.select()}
                            className="text-[14px] font-semibold w-11 h-8 text-center rounded-lg border border-[var(--vuno-border)] bg-white focus:outline-none focus:border-[var(--vuno-primary)]"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-full bg-white border border-[var(--vuno-border)] flex items-center justify-center transition-transform active:scale-90"
                          >
                            <PlusIcon size={13} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--vuno-danger)] transition-transform active:scale-90"
                            style={{ background: 'color-mix(in srgb, var(--vuno-danger) 10%, transparent)' }}
                          >
                            <TrashIcon size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-[var(--vuno-border-light)] pt-3 space-y-1.5 mb-4">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[var(--vuno-text-muted)]">المجموع</span>
                      <span className="font-semibold text-[var(--vuno-text)]">{subtotal.toLocaleString()} EGP</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[var(--vuno-text-muted)]">الضريبة (14%)</span>
                      <span className="font-semibold text-[var(--vuno-text)]">{tax.toLocaleString()} EGP</span>
                    </div>
                    <div className="flex justify-between text-[16px] font-semibold border-t border-[var(--vuno-border-light)] pt-2">
                      <span className="text-[var(--vuno-text)]">الإجمالي</span>
                      <span className="text-[var(--vuno-primary)]">{total.toLocaleString()} EGP</span>
                    </div>
                  </div>

                  {/* Payment Methods — small stacked rows */}
                  <div className="flex flex-col gap-1.5 mb-4">
                    {paymentMethods.map(method => {
                      const Icon = method.icon;
                      const selected = selectedPayment === method.id;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setSelectedPayment(method.id)}
                          className="w-full flex items-center gap-2 h-9 px-3 rounded-[10px] bg-white transition-all"
                          style={{ border: selected ? '2px solid var(--vuno-primary-dark)' : '1px solid var(--vuno-border)' }}
                        >
                          <Icon size={13} className={selected ? 'text-[var(--vuno-primary)]' : 'text-[var(--vuno-text-muted)]'} />
                          <span className={`text-[12px] ${selected ? 'text-[var(--vuno-primary)] font-semibold' : 'text-[var(--vuno-text-secondary)] font-medium'}`}>
                            {method.name}
                          </span>
                          {selected && (
                            <span className="mr-auto w-3 h-3 rounded-full flex items-center justify-center" style={{ background: 'var(--vuno-primary)' }}>
                              <CheckCircleIcon size={8} className="text-white" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full h-12 rounded-full text-white font-semibold text-[17px] transition-transform active:scale-95"
                    style={{ background: 'var(--vuno-primary)' }}
                  >
                    دفع {total.toLocaleString()} EGP
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Search + barcode scan + cart — all compact, side by side */}
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <SearchIcon size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--vuno-text-muted)]" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو الباركود..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 sm:h-11 pr-10 pl-4 rounded-full bg-white text-[13px] sm:text-[14px] text-[var(--vuno-text)] placeholder:text-[var(--vuno-text-muted)] focus:outline-none focus:border-[var(--vuno-primary)] transition-colors"
            style={{ border: '1px solid rgba(0,0,0,0.08)' }}
          />
        </div>
        <button
          onClick={() => setScannerOpen(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90"
          style={{ background: 'var(--vuno-primary)' }}
          aria-label="مسح باركود"
        >
          <BarcodeIcon size={17} className="text-white" />
        </button>
        <button
          onClick={() => setCartOpen(true)}
          className="relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-white"
          style={{ border: '1px solid rgba(0,0,0,0.08)' }}
          aria-label="سلة المشتريات"
        >
          <ShoppingCartIcon size={17} className="text-[var(--vuno-text)]" />
          {cartItemCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
              style={{ background: 'var(--vuno-primary)' }}
            >
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hidden">
        {categories.map(cat => {
          const selected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-4 h-9 sm:h-10 rounded-full text-[13px] sm:text-[14px] font-medium whitespace-nowrap transition-all bg-white flex-shrink-0"
              style={{
                border: selected ? '2px solid var(--vuno-primary-dark)' : '1px solid var(--vuno-border)',
                color: selected ? 'var(--vuno-primary)' : 'var(--vuno-text-secondary)',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Products Grid — full width now that the cart isn't a persistent side panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-4">
        {filteredProducts.map((product) => {
          const qty = cartQuantityFor(product.id);
          return (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white border border-[var(--vuno-border)] rounded-[16px] p-3 sm:p-4 lg:p-5 text-right transition-transform active:scale-[0.98] min-w-0"
            >
              <div className="flex items-center mb-2 lg:mb-3">
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    background: qty > 0 ? 'var(--vuno-primary)' : 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)',
                  }}
                >
                  {qty > 0 ? (
                    <span className="text-white text-[13px] sm:text-[14px] lg:text-[15px] font-bold tabular-nums">{qty}</span>
                  ) : (
                    <PackageIcon className="text-[var(--vuno-primary)]" size={16} />
                  )}
                </div>
              </div>
              <h4 className="text-[13px] sm:text-[14px] lg:text-[15px] font-semibold text-[var(--vuno-text)] mb-1.5 lg:mb-2 line-clamp-1 leading-tight">{product.name}</h4>
              <div className="flex items-end justify-between gap-1">
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[10px] text-[var(--vuno-text-muted)] leading-none mb-0.5">بيع</div>
                  <div className="text-[14px] sm:text-[15px] lg:text-[17px] font-semibold text-[var(--vuno-primary)] leading-none truncate">{product.price} EGP</div>
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-[9px] sm:text-[10px] text-[var(--vuno-text-muted)] leading-none mb-0.5">جملة</div>
                  <div className="text-[12px] sm:text-[13px] lg:text-[14px] font-medium text-[var(--vuno-text-secondary)] leading-none truncate">{product.wholesalePrice} EGP</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PackageIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m7.5 4.27 9 5.15"/>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/>
      <path d="M12 22V12"/>
    </svg>
  );
}
