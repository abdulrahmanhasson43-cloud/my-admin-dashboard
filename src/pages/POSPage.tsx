import { useState, useCallback, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import type { Product, CartItem, CompletedSale } from '@/types';
import { useProducts } from '@/context/products-context-value';
import { useAppSettings } from '@/context/app-settings-context-value';
import { useHeldOrders } from '@/context/held-orders-context-value';
import { useActivityLog } from '@/context/activity-log-context-value';
import { calcSaleTotals, calcSubtotal } from '@/lib/pricing';
import { QUICK_PAY_AMOUNTS, heldOrderLabel } from '@/services/sale';
import { usePosCatalog } from '@/hooks/usePosCatalog';
import { usePosPayment } from '@/hooks/usePosPayment';
import { useCompleteSale } from '@/hooks/useCompleteSale';
import { usePosShortcuts } from '@/hooks/usePosShortcuts';
import {
  addProduct, addProductVariant, changeQuantity, setQuantity, removeItem, countUnits, quantityOf,
} from '@/lib/cart';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import HoldOrderPopup, { type HoldReason } from '@/components/HoldOrderPopup';
import CustomerSelection, { type SelectedCustomer } from '@/components/CustomerSelection';
import ProductVariantSelector from '@/components/ProductVariantSelector';
import SaleCompleteView from '@/components/pos/SaleCompleteView';
import HeldOrdersPanel from '@/components/pos/HeldOrdersPanel';
import BundleOffers from '@/components/pos/BundleOffers';
import CartLines from '@/components/pos/CartLines';
import CartSheet from '@/components/pos/CartSheet';
import CartTotals from '@/components/pos/CartTotals';
import LoyaltyPrompt from '@/components/pos/LoyaltyPrompt';
import PaymentMethodPills from '@/components/pos/PaymentMethodPills';
import QuickPayButtons from '@/components/pos/QuickPayButtons';
import AmountPaidInput from '@/components/pos/AmountPaidInput';
import CustomerPickerButton from '@/components/pos/CustomerPickerButton';
import CartActions from '@/components/pos/CartActions';
import SuccessOverlay from '@/components/pos/SuccessOverlay';
import PosToolbar from '@/components/pos/PosToolbar';
import CategoryFilter from '@/components/pos/CategoryFilter';
import ProductList from '@/components/pos/ProductList';
// الأفكار #36, #37, #38 — Loyalty prompt + Bundle offers + Flash sales banner
import FlashSales from '@/components/flash/FlashSales';
import { useFlashSales } from '@/hooks/useFlashSales';
import { useBundles } from '@/hooks/useBundles';
import { useLoyalty } from '@/hooks/useLoyalty';

/* Payment methods are now read from AppSettingsContext (issue #10).
   The hardcoded array is removed — POS reflects whatever the merchant
   toggles on the Settings page. Only enabled methods are shown. */

/** Plays the "payment done" sound; a blocked or missing sound never stops a sale. */
function playSuccessSound(): void {
  try {
    void new Audio('/sounds/payment-success.mp3').play().catch(() => undefined);
  } catch {
    // Audio is optional feedback — ignore failures.
  }
}

export default function POSPage() {
  const { products } = useProducts();
  const { paymentMethods: allPaymentMethods } = useAppSettings();
  // ── Clean service layer (never services/mock directly) ──
  const { flashSales } = useFlashSales();
  const { bundles } = useBundles();
  const { calcInvoicePoints } = useLoyalty();
  // إتمام البيع (المخزون + الوردية + الهدف + السجل) في use case واحد — services/sale
  const completeSale = useCompleteSale();
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
  const { subtotal, tax, total } = calcSaleTotals(calcSubtotal(cart));
  const { search, setSearch, selectedCategory, setSelectedCategory, categories, filteredProducts } =
    usePosCatalog(products);
  const { effectivePayment, setSelectedPayment, amountPaid, setAmountPaid, paidNumber, change } =
    usePosPayment(activePaymentMethods, total);
  const [showSuccess, setShowSuccess] = useState(false);
  // Guards against a double-submit (double-click / Enter spam) while the sale
  // is being persisted — the single most important defence against a double
  // sale now that checkout is an async, awaited operation.
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<CompletedSale | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [showHoldPopup, setShowHoldPopup] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  // Customer selection (user request C)
  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | null>(null);
  const [customerSelectionOpen, setCustomerSelectionOpen] = useState(false);
  // Product variant selector (Idea #30)
  const [variantSelectorOpen, setVariantSelectorOpen] = useState(false);
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  // Selected cart item for keyboard shortcut +/-/Delete (Idea #24)
  const [selectedCartItemId, setSelectedCartItemId] = useState<string | null>(null);

  const cartQuantityFor = (productId: string) => quantityOf(cart, productId);
  const cartItemCount = countUnits(cart);

  const addToCart = (product: Product) => {
    // If product has variants, open the variant selector (Idea #30)
    if (product.variants && product.variants.length > 0) {
      setVariantProduct(product);
      setVariantSelectorOpen(true);
      return;
    }
    setCart(prev => addProduct(prev, product));
  };

  // Add product with selected variants (Idea #30)
  const addToCartWithVariants = (product: Product, selectedVariants: Record<string, string>, quantity: number) => {
    setCart(prev => addProductVariant(prev, product, selectedVariants, quantity));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => changeQuantity(prev, id, delta));
  };

  const setExactQuantity = (id: string, value: number) => {
    setCart(prev => setQuantity(prev, id, value));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => removeItem(prev, id));
  };

  const handleBarcodeDetected = useCallback((code: string) => {
    setScannerOpen(false);
    const match = products.find(p => p.barcode === code);
    if (match) {
      addToCart(match);
      // الفكرة #11: إشعار نجاح العثور على المنتج
      toast.success('تم العثور على المنتج', { description: match.name });
    } else {
      // الفكرة #11: المنتج غير موجود — toast خطأ + اترك البحث للمعالجة اللاحقة
      toast.error('المنتج غير موجود', { description: `باركود: ${code}` });
      setSearch(code);
    }
  }, [products, setSearch]);

  /**
   * Rings up the cart in `paymentMethod`. The method is a parameter (not read
   * from state) because Quick Pay switches to cash and checks out in the SAME
   * click — state set a line earlier is not visible yet, so reading it would
   * charge the previously selected method.
   */
  const checkout = async (paymentMethod: string) => {
    if (cart.length === 0) return;
    // Re-entrancy guard: never let two checkouts race on the same cart.
    if (isCheckingOut) return;

    // The sale is persisted FIRST; the cart is only cleared once the use case
    // confirms it. If it fails the products context has already surfaced the
    // error (banner + toast) and the cart stays intact so the cashier can
    // retry — this is what prevents the "double sale" scenario.
    setIsCheckingOut(true);
    const sale = await completeSale({ cart, paymentMethod });
    if (!sale) {
      setIsCheckingOut(false);
      return;
    }

    // The sale is safely persisted — now the success feedback and the reset.
    playSuccessSound();
    setShowSuccess(true);
    window.setTimeout(() => {
      setCompletedInvoice(sale);
      setShowSuccess(false);
      setCart([]);
      setCartOpen(false);
      setIsCheckingOut(false);
    }, 1200);
  };

  const handleCheckout = () => checkout(effectivePayment);

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
    const label = heldOrderLabel(customerName, cart.length, total);
    holdOrder(label, cart, subtotal, tax, total, reason);
    logActivity('sale', `تم تعليق طلب بقيمة ${total.toLocaleString()} EGP — السبب: ${reason}`);
    toast.success('تم تعليق الطلب', { description: reason });
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
  const handleQuickPay = (amount: number) => {
    if (cart.length === 0) return;
    setAmountPaid(String(amount));
    setSelectedPayment('cash');
    // حساب الباقي
    const changeAmount = amount - total;
    if (changeAmount > 0) {
      toast.success(`الباقي: ${changeAmount.toLocaleString()} جنيه`, {
        description: `المبلغ المدفوع: ${amount.toLocaleString()} | الإجمالي: ${total.toLocaleString()}`,
      });
    } else if (changeAmount === 0) {
      toast.success('تم الدفع بالظبط');
    }
    // تم الدفع مباشرة — المبلغ يغطي الإجمالي
    if (amount >= total) {
      void checkout('cash');
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
      toast.success(`الباقي: ${change.toLocaleString()} جنيه`);
    } else if (change === 0) {
      toast.success('تم الدفع بالظبط');
    }
    void handleCheckout();
    setAmountPaid('');
  };

  // Keyboard shortcuts (Idea #24) — events dispatched by useKeyboardShortcuts
  usePosShortcuts({
    cart,
    amountPaid,
    paidNumber,
    total,
    selectedCartItemId,
    receiptRef,
    payWithAmount: handlePayWithAmount,
    checkout: () => { void handleCheckout(); },
    clearCart: () => {
      setCart([]);
      setSelectedCustomer(null);
      setAmountPaid('');
    },
    changeQuantity: updateQuantity,
    removeFromCart,
    clearSelectedItem: () => setSelectedCartItemId(null),
  });

  if (completedInvoice) {
    return <SaleCompleteView sale={completedInvoice} receiptRef={receiptRef} onNewSale={resetInvoice} />;
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
      <SuccessOverlay show={showSuccess} />

      {/* Cart Modal — opened via the cart icon, not shown inline on the page anymore */}
      {cartOpen && (
        <CartSheet isEmpty={cart.length === 0} onClose={() => setCartOpen(false)}>
          <CartLines
            cart={cart}
            onChangeQuantity={updateQuantity}
            onSetQuantity={setExactQuantity}
            onRemove={removeFromCart}
          />
          <CartTotals subtotal={subtotal} tax={tax} total={total} />

          {/* #36 — Loyalty Points Prompt (تذكير بنقاط الولاء المكسبة) */}
          {selectedCustomer && cart.length > 0 && (
            <LoyaltyPrompt customer={selectedCustomer} points={calcInvoicePoints(total)} total={total} />
          )}

          <PaymentMethodPills
            methods={activePaymentMethods}
            selected={effectivePayment}
            onSelect={setSelectedPayment}
          />
          {/* Quick Pay Buttons — الفكرة #13 (6 مبالغ + حساب الباقي) */}
          <QuickPayButtons amounts={QUICK_PAY_AMOUNTS} total={total} onQuickPay={handleQuickPay} />
          {/* Custom amount input + change display — الفكرة #13 */}
          <AmountPaidInput amountPaid={amountPaid} total={total} change={change} onChange={setAmountPaid} />
          {/* Customer Selection (user request C) */}
          <CustomerPickerButton customer={selectedCustomer} onClick={() => setCustomerSelectionOpen(true)} />
          {/* Action buttons row: Hold Order + Green Pay — الفكرة #13 */}
          <CartActions
            amountPaid={amountPaid}
            paidNumber={paidNumber}
            total={total}
            onHold={handleHoldOrder}
            onPayWithAmount={handlePayWithAmount}
            onCheckout={() => { void handleCheckout(); }}
          />
        </CartSheet>
      )}

      {/* Search + barcode scan + cart — all compact, side by side */}
      <PosToolbar
        search={search}
        onSearchChange={setSearch}
        onOpenScanner={() => setScannerOpen(true)}
        onOpenCart={() => setCartOpen(true)}
        cartItemCount={cartItemCount}
        heldCount={heldCount}
        onOpenHeldOrders={() => setShowHeldOrders(true)}
      />

      {/* Held Orders Panel — الفكرة #8: طلبات معلقة */}
      {showHeldOrders && (
        <HeldOrdersPanel
          orders={heldOrders}
          onClose={() => setShowHeldOrders(false)}
          onResume={handleResumeOrder}
          onDelete={deleteHeldOrder}
        />
      )}

      <CategoryFilter categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

      {/* ════ الجزء 4 — الأفكار #38 + #37 + #36 ════ */}

      {/* #38 — Flash Sales Banner (عروض الفلاش النشطة في نقطة البيع) */}
      {flashSales.some(s => s.active) && (
        <FlashSales
          sales={flashSales.filter(s => s.active)}
          variant="banner"
          onSelect={(sale) => {
            toast.info('عرض فلاش', { description: sale.productName });
          }}
        />
      )}

      {/* #37 — Bundle Offers (الباقات المتاحة — أضفها للسلة بضغطة) */}
      <BundleOffers bundles={bundles} products={products} onAddProduct={addToCart} />

      <ProductList products={filteredProducts} quantityFor={cartQuantityFor} onAdd={addToCart} />
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
