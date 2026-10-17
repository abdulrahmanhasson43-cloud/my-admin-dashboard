import { useState, useCallback, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import type { Product } from '@/types';
import { useProducts } from '@/context/products-context-value';
import { useAppSettings } from '@/context/app-settings-context-value';
import { calcSaleTotals, calcSubtotal } from '@/lib/pricing';
import { lastLineId } from '@/lib/cart';
import { usePosCatalog } from '@/hooks/usePosCatalog';
import { usePosPayment } from '@/hooks/usePosPayment';
import { usePosCart } from '@/hooks/usePosCart';
import { usePosDialogs } from '@/hooks/usePosDialogs';
import { usePosCheckout } from '@/hooks/usePosCheckout';
import { usePosHeldOrders } from '@/hooks/usePosHeldOrders';
import { usePosShortcuts } from '@/hooks/usePosShortcuts';
import { useFlashSales } from '@/hooks/useFlashSales';
import { useBundles } from '@/hooks/useBundles';
import { useLoyalty } from '@/hooks/useLoyalty';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import HoldOrderPopup from '@/components/HoldOrderPopup';
import CustomerSelection, { type SelectedCustomer } from '@/components/CustomerSelection';
import ProductVariantSelector from '@/components/ProductVariantSelector';
import FlashSales from '@/components/flash/FlashSales';
import SaleCompleteView from '@/components/pos/SaleCompleteView';
import HeldOrdersPanel from '@/components/pos/HeldOrdersPanel';
import BundleOffers from '@/components/pos/BundleOffers';
import CartSheet from '@/components/pos/CartSheet';
import CategoryTabs from '@/components/pos/CategoryTabs';
import PosToolbar from '@/components/pos/PosToolbar';
import ProductList from '@/components/pos/ProductList';
import SaleSuccessOverlay from '@/components/pos/SaleSuccessOverlay';

/**
 * The cashier screen. It only wires things together: the cart, the payment,
 * the checkout and the overlays each live in their own hook (hooks/usePos*),
 * the rules in lib/cart.ts and services/sale, and the pieces of the screen in
 * components/pos.
 */
export default function POSPage() {
  const { products } = useProducts();
  const { paymentMethods } = useAppSettings();
  const { flashSales } = useFlashSales();
  const { bundles } = useBundles();
  const { calcInvoicePoints } = useLoyalty();
  const receiptRef = useRef<HTMLDivElement>(null);

  // Only the payment methods the merchant has enabled in Settings are offered (issue #10).
  const activePaymentMethods = useMemo(() => paymentMethods.filter(m => m.enabled), [paymentMethods]);

  const cart = usePosCart();
  const dialogs = usePosDialogs();
  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | null>(null);

  const { subtotal, tax, total } = calcSaleTotals(calcSubtotal(cart.cart));
  const catalog = usePosCatalog(products);
  const payment = usePosPayment(activePaymentMethods, total);

  const checkout = usePosCheckout({
    cart: cart.cart,
    total,
    effectivePayment: payment.effectivePayment,
    amountPaid: payment.amountPaid,
    paidNumber: payment.paidNumber,
    setSelectedPayment: payment.setSelectedPayment,
    setAmountPaid: payment.setAmountPaid,
    onSaleSettled: () => {
      cart.clear();
      dialogs.setCartOpen(false);
    },
  });

  const held = usePosHeldOrders({
    cart: cart.cart,
    subtotal,
    tax,
    total,
    onHeld: () => {
      dialogs.setHoldPopupOpen(false);
      cart.clear();
      dialogs.setCartOpen(false);
    },
    onResumed: items => {
      cart.replace(items);
      dialogs.setHeldOrdersOpen(false);
      dialogs.setCartOpen(true);
    },
  });

  // A product with variants opens the variant picker first (Idea #30).
  const { add: addPlainProduct } = cart;
  const { setVariantProduct, setScannerOpen } = dialogs;
  const { setSearch } = catalog;
  const addToCart = useCallback((product: Product) => {
    if (product.variants && product.variants.length > 0) {
      setVariantProduct(product);
      return;
    }
    addPlainProduct(product);
  }, [addPlainProduct, setVariantProduct]);

  const closeVariantPicker = () => setVariantProduct(null);

  const handleBarcodeDetected = useCallback((code: string) => {
    setScannerOpen(false);
    const match = products.find(p => p.barcode === code);
    if (match) {
      addToCart(match);
      toast.success('تم العثور على المنتج', { description: match.name });
    } else {
      toast.error('المنتج غير موجود', { description: `باركود: ${code}` });
      setSearch(code);
    }
  }, [products, addToCart, setSearch, setScannerOpen]);

  // Keyboard shortcuts (Idea #24) act on the last line added to the cart.
  usePosShortcuts({
    quickPay: checkout.payNow,
    clearCart: () => {
      cart.clear();
      setSelectedCustomer(null);
      payment.setAmountPaid('');
    },
    increment: () => {
      const id = lastLineId(cart.cart);
      if (id) cart.changeQty(id, 1);
    },
    decrement: () => {
      const id = lastLineId(cart.cart);
      if (id) cart.changeQty(id, -1);
    },
    removeLast: () => {
      const id = lastLineId(cart.cart);
      if (id) cart.remove(id);
    },
    print: () => {
      // Printing only makes sense while the receipt is on screen.
      if (receiptRef.current) window.print();
    },
  });

  if (checkout.completedSale) {
    return <SaleCompleteView sale={checkout.completedSale} receiptRef={receiptRef} onNewSale={checkout.startNewSale} />;
  }

  const activeFlashSales = flashSales.filter(s => s.active);

  return (
    <div className="space-y-3">
      {dialogs.scannerOpen && (
        <BarcodeScannerModal
          onDetected={handleBarcodeDetected}
          onNotFound={(code) => {
            dialogs.setScannerOpen(false);
            toast.info('إضافة منتج جديد', { description: `باركود: ${code} — سيتم إضافته في صفحة المنتجات` });
            catalog.setSearch(code);
          }}
          onClose={() => dialogs.setScannerOpen(false)}
        />
      )}

      {/* Hold Order Popup — الفكرة #12 */}
      {dialogs.holdPopupOpen && (
        <HoldOrderPopup
          total={total}
          itemCount={cart.cart.length}
          onConfirm={held.confirmHold}
          onCancel={() => dialogs.setHoldPopupOpen(false)}
        />
      )}

      <SaleSuccessOverlay visible={checkout.showSuccess} />

      {/* The cart opens from the cart icon, it is not shown inline on the page */}
      {dialogs.cartOpen && (
        <CartSheet
          cart={cart.cart}
          totals={{ subtotal, tax, total }}
          onClose={() => dialogs.setCartOpen(false)}
          onChangeQuantity={cart.changeQty}
          onSetQuantity={cart.setQty}
          onRemove={cart.remove}
          customer={selectedCustomer}
          onPickCustomer={() => dialogs.setCustomerPickerOpen(true)}
          loyaltyPoints={calcInvoicePoints(total)}
          paymentMethods={activePaymentMethods}
          selectedMethod={payment.effectivePayment}
          onSelectMethod={payment.setSelectedPayment}
          amountPaid={payment.amountPaid}
          onAmountPaidChange={payment.setAmountPaid}
          paidNumber={payment.paidNumber}
          change={payment.change}
          onQuickPay={checkout.quickPay}
          onHold={() => {
            if (cart.cart.length > 0) dialogs.setHoldPopupOpen(true);
          }}
          onPay={() => { void checkout.checkoutWithSelected(); }}
          onPayWithAmount={checkout.payWithAmount}
        />
      )}

      <PosToolbar
        search={catalog.search}
        onSearchChange={catalog.setSearch}
        onScan={() => dialogs.setScannerOpen(true)}
        onOpenCart={() => dialogs.setCartOpen(true)}
        cartItemCount={cart.itemCount}
        heldCount={held.heldCount}
        onOpenHeldOrders={() => dialogs.setHeldOrdersOpen(true)}
      />

      {/* Held Orders Panel — الفكرة #8: طلبات معلقة */}
      {dialogs.heldOrdersOpen && (
        <HeldOrdersPanel
          orders={held.heldOrders}
          onClose={() => dialogs.setHeldOrdersOpen(false)}
          onResume={held.resume}
          onDelete={held.deleteHeldOrder}
        />
      )}

      <CategoryTabs
        categories={catalog.categories}
        selected={catalog.selectedCategory}
        onSelect={catalog.setSelectedCategory}
      />

      {/* #38 — Flash Sales Banner (عروض الفلاش النشطة في نقطة البيع) */}
      {activeFlashSales.length > 0 && (
        <FlashSales
          sales={activeFlashSales}
          variant="banner"
          onSelect={(sale) => {
            toast.info('عرض فلاش', { description: sale.productName });
          }}
        />
      )}

      {/* #37 — Bundle Offers (الباقات المتاحة — أضفها للسلة بضغطة) */}
      <BundleOffers bundles={bundles} products={products} onAddProduct={addToCart} />

      <ProductList products={catalog.filteredProducts} quantityFor={cart.quantityFor} onAdd={addToCart} />

      {/* Customer Selection Modal (user request C) */}
      <CustomerSelection
        open={dialogs.customerPickerOpen}
        onClose={() => dialogs.setCustomerPickerOpen(false)}
        onSelect={(customer) => {
          setSelectedCustomer(customer);
          dialogs.setCustomerPickerOpen(false);
          if (customer) {
            const name = customer.type === 'registered' ? customer.client?.name : customer.tempName;
            toast.success(`تم اختيار العميل: ${name}`);
          }
        }}
        current={selectedCustomer}
      />

      {/* Product Variant Selector Modal (Idea #30) */}
      <ProductVariantSelector
        open={dialogs.variantProduct !== null}
        product={dialogs.variantProduct}
        onClose={closeVariantPicker}
        onConfirm={(selectedVariants, quantity) => {
          const product = dialogs.variantProduct;
          if (product) {
            cart.addVariant(product, selectedVariants, quantity);
            toast.success(`تم إضافة ${product.name}`);
          }
          closeVariantPicker();
        }}
      />
    </div>
  );
}
