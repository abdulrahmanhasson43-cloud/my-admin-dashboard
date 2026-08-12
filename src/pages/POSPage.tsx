import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  SearchIcon, PlusIcon, MinusIcon, TrashIcon, ReceiptIcon,
  CheckCircleIcon, XIcon, BarcodeIcon, ShoppingCartIcon,
  PauseIcon, ZapIcon, ArchiveIcon, CoinsIcon, UsersIcon
} from '@/components/icons';
import type { Product, CartItem, CompletedSale } from '@/types';
import { useProducts } from '@/context/products-context-value';
import { useAppSettings } from '@/context/app-settings-context-value';
import { useShift } from '@/context/shift-context-value';
import { useSalesGoal } from '@/context/sales-goal-context-value';
import { useHeldOrders } from '@/context/held-orders-context-value';
import { useActivityLog } from '@/context/activity-log-context-value';
import { getPaymentIcon } from '@/lib/payment-icons';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import HoldOrderPopup, { type HoldReason } from '@/components/HoldOrderPopup';
import { ThermalReceipt, ShareReceiptButton, PrintReceiptButton, defaultReceiptSettings } from '@/components/ThermalReceipt';
import CustomerSelection, { type SelectedCustomer } from '@/components/CustomerSelection';
import ProductVariantSelector from '@/components/ProductVariantSelector';
import VariantCard from '@/components/VariantCard';
// الأفكار #36, #37, #38 — Loyalty prompt + Bundle offers + Flash sales banner
import FlashSales from '@/components/flash/FlashSales';
import { sampleFlashSales, sampleBundles } from '@/services/mock';
import { calcDiscountPercent, calcSavings } from '@/types/bundle';
import { calcInvoicePoints } from '@/services/mock';

/* Payment methods are now read from AppSettingsContext (issue #10).
   The hardcoded array is removed — POS reflects whatever the merchant
   toggles on the Settings page. Only enabled methods are shown. */

// Defined outside the component so it isn't treated as part of the
// component's render body by the react-hooks "purity" lint rule — this
// is only ever called from the checkout click handler, never during render.
function generateInvoiceId(): string {
  return 'INV-' + Date.now().toString().slice(-6);
}

export default function POSPage() {
  const { products, sellProducts } = useProducts();
  const { paymentMethods: allPaymentMethods } = useAppSettings();
  // الفكرة #4/#3/#8/#14: ربط الورديات والأهداف والطلبات المعلقة وسجل النشاطات
  const { recordSale } = useShift();
  const { addAchieved } = useSalesGoal();
  const { heldOrders, holdOrder, resumeOrder, deleteHeldOrder, heldCount } = useHeldOrders();
  const { logActivity } = useActivityLog();

  /* Only show payment methods the merchant has enabled in Settings (issue #10).
     If the currently-selected method gets disabled, fall back to the first
     enabled one. */
  const activePaymentMethods = useMemo(
    () => allPaymentMethods.filter(m => m.enabled),
    [allPaymentMethods],
  );

  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedPayment, setSelectedPayment] = useState('cash');

  /* If the selected payment method is no longer enabled (merchant toggled
     it off in Settings), fall back to the first enabled method. We derive
     the effective method instead of calling setState inside an effect —
     this avoids cascading renders and follows React's "you might not need
     an effect" guidance. The raw `selectedPayment` still records what the
     user clicked, while `effectivePayment` is the value actually used. */
  const effectivePayment = useMemo(() => {
    const stillEnabled = activePaymentMethods.some(m => m.id === selectedPayment);
    if (stillEnabled || activePaymentMethods.length === 0) return selectedPayment;
    return activePaymentMethods[0].id;
  }, [activePaymentMethods, selectedPayment]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<CompletedSale | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [showHoldPopup, setShowHoldPopup] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  // الفكرة #13: المبلغ المدفوع والباقي (الصرف)
  const [amountPaid, setAmountPaid] = useState('');
  const receiptRef = useRef<HTMLDivElement>(null);
  // Customer selection (user request C)
  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | null>(null);
  const [customerSelectionOpen, setCustomerSelectionOpen] = useState(false);
  // Product variant selector (Idea #30)
  const [variantSelectorOpen, setVariantSelectorOpen] = useState(false);
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  // Selected cart item for keyboard shortcut +/-/Delete (Idea #24)
  const [selectedCartItemId, setSelectedCartItemId] = useState<string | null>(null);

  const categories = ['الكل', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.includes(search) || p.barcode.includes(search);
    const matchCategory = selectedCategory === 'الكل' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const cartQuantityFor = (productId: string) => cart.find(i => i.id === productId)?.quantity ?? 0;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    // If product has variants, open the variant selector (Idea #30)
    if (product.variants && product.variants.length > 0) {
      setVariantProduct(product);
      setVariantSelectorOpen(true);
      return;
    }
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

  // Add product with selected variants (Idea #30)
  const addToCartWithVariants = (product: Product, selectedVariants: Record<string, string>, quantity: number) => {
    const variantKey = product.id + '-' + Object.values(selectedVariants).join('-');
    setCart(prev => {
      const existing = prev.find(item => item.id === variantKey);
      if (existing) {
        return prev.map(item =>
          item.id === variantKey ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, id: variantKey, quantity, selectedVariants }];
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
      // الفكرة #11: إشعار نجاح العثور على المنتج
      toast.success('✅ تم العثور على المنتج', { description: match.name });
    } else {
      // الفكرة #11: المنتج غير موجود — toast خطأ + اترك البحث للمعالجة اللاحقة
      toast.error('❌ المنتج غير موجود', { description: `باركود: ${code}` });
      setSearch(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      paymentMethod: effectivePayment,
      date: new Date().toLocaleString('ar-EG'),
    };

    setTimeout(() => {
      sellProducts(cart);
      // الفكرة #4: تسجيل البيع في الوردية الحالية
      recordSale(total);
      // الفكرة #3: تحديث تقدم الهدف اليبعيعي
      addAchieved(total);
      // الفكرة #14: تسجيل النشاط
      logActivity('sale', `تم إتمام بيع بقيمة ${total.toLocaleString()} EGP · ${invoice.id}`);
      setCompletedInvoice(invoice);
      setShowSuccess(false);
      setCart([]);
      setCartOpen(false);
    }, 1200);
  };

  const resetInvoice = () => {
    setCompletedInvoice(null);
  };

  // الفكرة #12: تعليق الطلب — يفتح نافذة تطلب اسم العميل وسبب التعليق
  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    setShowHoldPopup(true);
  };

  // تأكيد التعليق بعد إدخال الاسم والسبب — الفكرة #12
  const confirmHoldOrder = (customerName: string, reason: HoldReason) => {
    const label = customerName
      ? customerName
      : `طلب معلق · ${cart.length} منتج · ${total.toLocaleString()} EGP`;
    holdOrder(label, cart, subtotal, tax, total, reason);
    logActivity('sale', `تم تعليق طلب بقيمة ${total.toLocaleString()} EGP — السبب: ${reason}`);
    toast.success('⏸️ تم تعليق الطلب', { description: reason });
    setShowHoldPopup(false);
    setCart([]);
    setCartOpen(false);
  };

  // استرداد طلب معلق
  const handleResumeOrder = (id: string) => {
    const order = resumeOrder(id);
    if (order) {
      setCart(order.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      } as CartItem)));
      setShowHeldOrders(false);
      setCartOpen(true);
      logActivity('sale', `تم استرداد طلب معلق`);
    }
  };

  // الفكرة #13: Quick Pay — أزرار دفع سريع بمبالغ محددة + حساب الباقي
  const quickPayAmounts = [50, 100, 200, 500, 1000, 2000];
  const paidNumber = parseFloat(amountPaid) || 0;
  const change = paidNumber > 0 ? paidNumber - total : 0;

  const handleQuickPay = (amount: number) => {
    if (cart.length === 0) return;
    setAmountPaid(String(amount));
    setSelectedPayment('cash');
    // حساب الباقي
    const changeAmount = amount - total;
    if (changeAmount > 0) {
      toast.success(`✅ الباقي: ${changeAmount.toLocaleString()} جنيه`, {
        description: `المبلغ المدفوع: ${amount.toLocaleString()} | الإجمالي: ${total.toLocaleString()}`,
      });
    } else if (changeAmount === 0) {
      toast.success('✅ تم الدفع بالظبط');
    }
    // تم الدفع مباشرة — المبلغ يغطي الإجمالي
    if (amount >= total) {
      handleCheckout();
      setAmountPaid('');
    }
  };

  // دفع مع إدخال يلقائي للمبلع المدفوع — الفكرة #13
  const handlePayWithAmount = () => {
    if (cart.length === 0) return;
    if (paidNumber < total) {
      toast.error('المبلغ أقل من الإجمالي', {
        description: `منفضل تدفع ${total.toLocaleString()} أو أكتر`,
      });
      return;
    }
    if (change > 0) {
      toast.success(`✅ الباقي: ${change.toLocaleString()} جنيه`);
    } else if (change === 0) {
      toast.success('✅ تم الدفع بالظبط');
    }
    handleCheckout();
    setAmountPaid('');
  };

  // Keyboard shortcut event listener (Idea #24)
  // Listens for custom events dispatched by useKeyboardShortcuts
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      switch (detail.type) {
        case 'quick-pay':
          if (cart.length > 0) {
            if (amountPaid && paidNumber >= total) {
              handlePayWithAmount();
            } else {
              handleCheckout();
            }
          }
          break;
        case 'clear-cart':
          setCart([]);
          setSelectedCustomer(null);
          setAmountPaid('');
          break;
        case 'quantity-increment':
          if (selectedCartItemId) {
            updateQuantity(selectedCartItemId, 1);
          } else if (cart.length > 0) {
            // Increment last added item
            updateQuantity(cart[cart.length - 1].id, 1);
          }
          break;
        case 'quantity-decrement':
          if (selectedCartItemId) {
            updateQuantity(selectedCartItemId, -1);
          } else if (cart.length > 0) {
            updateQuantity(cart[cart.length - 1].id, -1);
          }
          break;
        case 'remove-selected':
          if (selectedCartItemId) {
            removeFromCart(selectedCartItemId);
            setSelectedCartItemId(null);
          } else if (cart.length > 0) {
            removeFromCart(cart[cart.length - 1].id);
          }
          break;
        case 'print':
          // Trigger print if receipt is visible
          if (receiptRef.current) {
            window.print();
          }
          break;
      }
    };
    window.addEventListener('vuno:pos-shortcut', handler);
    return () => window.removeEventListener('vuno:pos-shortcut', handler);
  }); // Runs on every render to always have fresh cart/amounts

  if (completedInvoice) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[340px] mx-auto"
      >
        {/* Success header — minimal, Apple-style */}
        <div className="text-center mb-5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: 'color-mix(in srgb, var(--vuno-success) 14%, transparent)' }}
          >
            <CheckCircleIcon size={28} className="text-[var(--vuno-success)]" />
          </motion.div>
          <h2 className="text-[20px] font-semibold text-[var(--vuno-text)] tracking-tight">تم الدفع بنجاح</h2>
          <p className="text-[13px] text-[var(--vuno-text-muted)] mt-0.5">
            فاتورة رقم {completedInvoice.id} · {completedInvoice.total.toLocaleString()} EGP
          </p>
        </div>

        {/* Thermal receipt preview — looks like a real receipt */}
        <div className="flex justify-center mb-5">
          <div
            className="rounded-[6px] overflow-hidden"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}
          >
            <ThermalReceipt
              ref={receiptRef}
              invoice={completedInvoice}
              settings={defaultReceiptSettings}
            />
          </div>
        </div>

        {/* Actions — share as image (WhatsApp) + print + new invoice */}
        <div className="flex gap-2.5">
          <ShareReceiptButton receiptRef={receiptRef} />
          <PrintReceiptButton receiptRef={receiptRef} />
          <button
            onClick={resetInvoice}
            className="flex-1 h-11 rounded-full font-semibold text-[15px] transition-transform active:scale-95 flex items-center justify-center gap-2"
            style={{
              border: '1px solid var(--vuno-border)',
              color: 'var(--vuno-text)',
              background: 'var(--vuno-surface)',
            }}
          >
            <PlusIcon size={16} />
            فاتورة جديدة
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
          onNotFound={(code) => {
            setScannerOpen(false);
            toast.info('إضافة منتج جديد', { description: `باركود: ${code} — سيتم إضافته في صفحة المنتجات` });
            setSearch(code);
          }}
          onClose={() => setScannerOpen(false)}
        />
      )}

      {/* Hold Order Popup — الفكرة #12 */}
      {showHoldPopup && (
        <HoldOrderPopup
          total={total}
          itemCount={cart.length}
          onConfirm={confirmHoldOrder}
          onCancel={() => setShowHoldPopup(false)}
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

                  {/* #36 — Loyalty Points Prompt (تذكير بنقاط الولاء المكسبة) */}
                  {selectedCustomer && cart.length > 0 && (
                    <div
                      className="rounded-[14px] p-3 mb-4 flex items-center gap-3"
                      style={{ background: 'var(--vuno-surface-pearl)', border: '1px solid var(--vuno-border)' }}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--vuno-primary)' }}
                      >
                        <CoinsIcon size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[var(--vuno-text)]">
                          سيكسب العميل {calcInvoicePoints(total)} نقطة ولاء
                        </p>
                        <p className="text-[11px] text-[var(--vuno-text-muted)]">
                          {selectedCustomer.client?.name || selectedCustomer.tempName || 'العميل'} · {total.toLocaleString()} EGP × 0.1
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Payment Methods — pill buttons (issue #3 + #10)
                      Converted from stacked rectangles to horizontal pill
                      buttons per DESIGN.md. Reads from settings context. */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {activePaymentMethods.map(method => {
                      const Icon = getPaymentIcon(method.id);
                      const selected = effectivePayment === method.id;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setSelectedPayment(method.id)}
                          className="flex items-center gap-1.5 h-9 px-4 rounded-full transition-all active:scale-95"
                          style={{
                            background: selected ? 'var(--vuno-primary)' : 'var(--vuno-surface)',
                            border: selected ? '1px solid var(--vuno-primary)' : '1px solid var(--vuno-border)',
                            color: selected ? '#fff' : 'var(--vuno-text-secondary)',
                          }}
                        >
                          <Icon size={14} className={selected ? 'text-white' : 'text-[var(--vuno-text-muted)]'} />
                          <span className={`text-[12px] ${selected ? 'font-semibold' : 'font-medium'}`}>
                            {method.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Pay Buttons — الفكرة #13 (6 مبالغ + حساب الباقي) */}
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ZapIcon size={13} className="text-[var(--vuno-primary)]" />
                      <span className="text-[12px] font-semibold text-[var(--vuno-text-secondary)]">دفع سريع</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {quickPayAmounts.map(amount => (
                        <button
                          key={amount}
                          onClick={() => handleQuickPay(amount)}
                          disabled={amount < total}
                          className="h-11 rounded-xl text-[14px] font-bold transition-all active:scale-95 disabled:opacity-30"
                          style={{
                            background: 'var(--vuno-surface)',
                            border: '1px solid var(--vuno-border)',
                            color: 'var(--vuno-primary)',
                          }}
                        >
                          {amount.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom amount input + change display — الفكرة #13 */}
                  <div className="mb-3">
                    <label className="text-[12px] font-semibold text-[var(--vuno-text-secondary)] mb-1.5 block">
                      المبلغ المدفوع
                    </label>
                    <input
                      type="number"
                      dir="ltr"
                      inputMode="decimal"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder={total.toString()}
                      className="w-full h-11 rounded-xl px-4 text-[15px] font-semibold text-left"
                      style={{
                        background: 'var(--vuno-surface)',
                        border: '1px solid var(--vuno-border)',
                        color: 'var(--vuno-text)',
                      }}
                    />
                    {change > 0 && (
                      <div
                        className="mt-2 flex items-center justify-between rounded-xl px-3 py-2"
                        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
                      >
                        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-green-600">
                          <CoinsIcon size={15} /> الباقي للعميل
                        </span>
                        <span className="text-[15px] font-bold text-green-600" dir="ltr">
                          {change.toLocaleString()} EGP
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Customer Selection (user request C) */}
                  <div className="mb-3">
                    <button
                      onClick={() => setCustomerSelectionOpen(true)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl border border-[var(--vuno-border)] hover:border-[var(--vuno-primary)] transition-colors"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)' }}
                      >
                        <UsersIcon size={17} className="text-[var(--vuno-primary)]" />
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        {selectedCustomer ? (
                          <>
                            <p className="text-[13px] font-semibold text-[var(--vuno-text)] truncate">
                              {selectedCustomer.type === 'registered'
                                ? selectedCustomer.client?.name
                                : selectedCustomer.tempName}
                            </p>
                            <p className="text-[11px] text-[var(--vuno-text-muted)] truncate">
                              {selectedCustomer.type === 'registered'
                                ? selectedCustomer.client?.phone
                                : selectedCustomer.tempPhone || 'عميل مؤقت'}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-[13px] font-semibold text-[var(--vuno-text)]">اختيار العميل</p>
                            <p className="text-[11px] text-[var(--vuno-text-muted)]">عميل مسجل أو مؤقت</p>
                          </>
                        )}
                      </div>
                      <span className="text-[11px] text-[var(--vuno-primary)] font-medium flex-shrink-0">تغيير</span>
                    </button>
                  </div>

                  {/* Action buttons row: Hold Order + Green Pay — الفكرة #13 */}
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={handleHoldOrder}
                      className="flex items-center justify-center gap-1.5 h-12 px-5 rounded-full font-semibold text-[14px] transition-transform active:scale-95 flex-shrink-0"
                      style={{
                        background: 'var(--vuno-surface)',
                        border: '1px solid var(--vuno-border)',
                        color: 'var(--vuno-text-secondary)',
                      }}
                    >
                      <PauseIcon size={16} />
                      تعليق
                    </button>
                    {amountPaid ? (
                      <button
                        onClick={handlePayWithAmount}
                        disabled={paidNumber < total}
                        className="flex-1 h-12 rounded-full text-white font-semibold text-[17px] transition-transform active:scale-95 disabled:opacity-50"
                        style={{ background: '#16a34a' }}
                      >
                        دفع {paidNumber.toLocaleString()} EGP
                      </button>
                    ) : (
                      <button
                        onClick={handleCheckout}
                        className="flex-1 h-12 rounded-full text-white font-semibold text-[17px] transition-transform active:scale-95"
                        style={{ background: '#16a34a' }}
                      >
                        دفع {total.toLocaleString()} EGP
                      </button>
                    )}
                  </div>
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
            data-pos-search="true"
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
        {heldCount > 0 && (
          <button
            onClick={() => setShowHeldOrders(true)}
            className="relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 bg-white"
            style={{ border: '1px solid rgba(0,0,0,0.08)' }}
            aria-label="الطلبات المعلقة"
          >
            <ArchiveIcon size={17} className="text-[var(--vuno-text)]" />
            <span
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
              style={{ background: 'var(--vuno-warning)' }}
            >
              {heldCount}
            </span>
          </button>
        )}
      </div>

      {/* Held Orders Panel — الفكرة #8: طلبات معلقة */}
      {showHeldOrders && (
        <>
          <div
            onClick={() => setShowHeldOrders(false)}
            className="fixed inset-0 bg-black/40 z-[70] animate-in fade-in duration-200"
          />
          <div className="fixed bottom-0 inset-x-0 z-[75] bg-white rounded-t-[24px] max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 rounded-full bg-[var(--vuno-border)] mx-auto mt-3 mb-1" />
            <div className="flex items-center justify-between px-5 pt-2 pb-3 sticky top-0 bg-white">
              <h3 className="font-semibold text-[16px] text-[var(--vuno-text)] flex items-center gap-2">
                <ArchiveIcon size={17} />
                الطلبات المعلقة
              </h3>
              <button onClick={() => setShowHeldOrders(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--vuno-bg)]">
                <XIcon size={16} className="text-[var(--vuno-text-secondary)]" />
              </button>
            </div>
            <div className="px-5 pb-6">
              {heldOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-[var(--vuno-bg)] flex items-center justify-center mx-auto mb-3">
                    <ArchiveIcon size={22} className="text-[var(--vuno-text-muted)]" />
                  </div>
                  <p className="text-[var(--vuno-text-muted)] text-[14px]">لا توجد طلبات معلقة</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {heldOrders.map(order => (
                    <div key={order.id} className="card-vuno p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-[var(--vuno-text)] truncate">{order.label}</p>
                          <p className="text-[12px] text-[var(--vuno-text-muted)] mt-0.5">{order.createdAt}</p>
                          {order.reason && (
                            <span
                              className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                              style={{ background: 'color-mix(in srgb, var(--vuno-warning) 12%, transparent)', color: 'var(--vuno-warning)' }}
                            >
                              {order.reason}
                            </span>
                          )}
                        </div>
                        <span className="text-[15px] font-bold text-[var(--vuno-primary)] flex-shrink-0">{order.total.toLocaleString()} EGP</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResumeOrder(order.id)}
                          className="flex-1 h-9 rounded-full text-white font-semibold text-[13px] transition-transform active:scale-95"
                          style={{ background: 'var(--vuno-primary)' }}
                        >
                          استرداد
                        </button>
                        <button
                          onClick={() => deleteHeldOrder(order.id)}
                          className="px-4 h-9 rounded-full font-semibold text-[13px] transition-transform active:scale-95"
                          style={{
                            background: 'color-mix(in srgb, var(--vuno-danger) 10%, transparent)',
                            color: 'var(--vuno-danger)',
                          }}
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

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

      {/* ════ الجزء 4 — الأفكار #38 + #37 + #36 ════ */}

      {/* #38 — Flash Sales Banner (عروض الفلاش النشطة في نقطة البيع) */}
      {sampleFlashSales.some(s => s.active) && (
        <FlashSales
          sales={sampleFlashSales.filter(s => s.active)}
          variant="banner"
          onSelect={(sale) => {
            toast.info('🔥 عرض فلاش', { description: sale.productName });
          }}
        />
      )}

      {/* #37 — Bundle Offers (الباقات المتاحة — أضفها للسلة بضغطة) */}
      {sampleBundles.filter(b => b.active).length > 0 && (
        <div className="card-vuno p-4">
          <div className="flex items-center gap-2 mb-3">
            <ZapIcon size={18} className="text-[var(--vuno-primary)]" />
            <h3 className="text-[14px] font-semibold text-[var(--vuno-text)]">عروض الباقات المجمّعة</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hidden pb-1">
            {sampleBundles.filter(b => b.active).map((bundle) => (
              <button
                key={bundle.id}
                onClick={() => {
                  // أضف جميع منتجات الباقة للسلة
                  bundle.items.forEach((item) => {
                    const prod = products.find(p => p.id === item.productId);
                    if (prod) {
                      for (let q = 0; q < item.quantity; q++) {
                        addToCart(prod);
                      }
                    }
                  });
                  toast.success('🛍️ تمت إضافة الباقة', {
                    description: `${bundle.name} — وفّرت ${calcSavings(bundle).toLocaleString('en-US')} ج.م`,
                  });
                }}
                className="flex-shrink-0 w-56 text-right rounded-[14px] p-3 transition-transform active:scale-95"
                style={{ background: 'var(--vuno-surface-pearl)', border: '1px solid var(--vuno-border)' }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: 'var(--vuno-primary)' }}
                  >
                    خصم {calcDiscountPercent(bundle)}%
                  </span>
                  <p className="text-[13px] font-semibold text-[var(--vuno-text)] line-clamp-1">{bundle.name}</p>
                </div>
                <p className="text-[11px] text-[var(--vuno-text-muted)] line-clamp-1 mb-2">
                  {bundle.items.length} منتجات
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--vuno-text-muted)] line-through">
                    {bundle.originalPrice.toLocaleString('en-US')} ج.م
                  </span>
                  <span className="text-[14px] font-bold text-[var(--vuno-primary)]">
                    {bundle.discountedPrice.toLocaleString('en-US')} ج.م
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products — full-width horizontal rows (user request C)
          Mobile-first: each product is a full-width horizontal row.
          Desktop scales the same row layout (wider, more padding). */}
      <div className="space-y-2 lg:space-y-2.5 select-none-touch">
        {filteredProducts.map((product) => {
          const qty = cartQuantityFor(product.id);
          const hasVariants = product.variants && product.variants.length > 0;
          return (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="w-full flex items-center gap-3 lg:gap-4 bg-white border border-[var(--vuno-border)] rounded-2xl p-3 lg:p-4 text-right transition-transform active:scale-[0.98] min-w-0 select-none"
            >
              {/* Quantity/Icon badge */}
              <div
                className="w-11 h-11 lg:w-14 lg:h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                  background: qty > 0 ? 'var(--vuno-primary)' : 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)',
                }}
              >
                {qty > 0 ? (
                  <span className="text-white text-[16px] lg:text-[18px] font-bold tabular-nums">{qty}</span>
                ) : (
                  <PackageIcon className="text-[var(--vuno-primary)]" size={20} />
                )}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0 text-right">
                <h4 className="text-[14px] lg:text-[16px] font-semibold text-[var(--vuno-text)] truncate leading-tight mb-0.5">{product.name}</h4>
                {hasVariants ? (
                  <VariantCard variants={product.variants!} compact />
                ) : (
                  <span className="text-[11px] lg:text-[12px] text-[var(--vuno-text-muted)]">{product.category}</span>
                )}
              </div>

              {/* Price + large add button */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-left">
                  <div className="text-[16px] lg:text-[18px] font-bold text-[var(--vuno-primary)] leading-none">{product.price}</div>
                  <div className="text-[10px] lg:text-[11px] text-[var(--vuno-text-muted)] leading-none mt-0.5">EGP</div>
                </div>
                {/* Large touch-friendly + button (Idea #22) */}
                <div
                  className="w-11 h-11 lg:w-12 lg:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90"
                  style={{
                    background: qty > 0 ? 'color-mix(in srgb, var(--vuno-success) 15%, transparent)' : 'var(--vuno-primary)',
                  }}
                >
                  <PlusIcon size={22} className={qty > 0 ? 'text-[var(--vuno-success)]' : 'text-white'} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {/* Customer Selection Modal (user request C) */}
      <CustomerSelection
        open={customerSelectionOpen}
        onClose={() => setCustomerSelectionOpen(false)}
        onSelect={(customer) => {
          setSelectedCustomer(customer);
          setCustomerSelectionOpen(false);
          if (customer) {
            const name = customer.type === 'registered' ? customer.client?.name : customer.tempName;
            toast.success(`تم اختيار العميل: ${name}`);
          }
        }}
        current={selectedCustomer}
      />

      {/* Product Variant Selector Modal (Idea #30) */}
      <ProductVariantSelector
        open={variantSelectorOpen}
        product={variantProduct}
        onClose={() => {
          setVariantSelectorOpen(false);
          setVariantProduct(null);
        }}
        onConfirm={(selectedVariants, quantity) => {
          if (variantProduct) {
            addToCartWithVariants(variantProduct, selectedVariants, quantity);
            toast.success(`تم إضافة ${variantProduct.name}`);
          }
          setVariantSelectorOpen(false);
          setVariantProduct(null);
        }}
      />
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
