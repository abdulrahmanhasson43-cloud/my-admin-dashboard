import { useState } from 'react';
import type { Product } from '@/types';

/**
 * usePosDialogs — which POS overlay is open. Pure open/close flags, no rules.
 *
 * The variant picker is "open" exactly when it has a product, so the two can
 * never disagree (the page used to keep an `open` flag and a product separately).
 */
export function usePosDialogs() {
  const [cartOpen, setCartOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [heldOrdersOpen, setHeldOrdersOpen] = useState(false);
  const [holdPopupOpen, setHoldPopupOpen] = useState(false);
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);

  return {
    cartOpen, setCartOpen,
    scannerOpen, setScannerOpen,
    heldOrdersOpen, setHeldOrdersOpen,
    holdPopupOpen, setHoldPopupOpen,
    customerPickerOpen, setCustomerPickerOpen,
    variantProduct, setVariantProduct,
  };
}
