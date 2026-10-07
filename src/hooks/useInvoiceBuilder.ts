import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { Client, Invoice, Product } from '@/types';
import type { CreateInvoiceInput } from '@/services/invoice';
import {
  addProductLine, calcBuilderTotals, changeLineQty, removeLine as removeLineFrom, type BuilderLine,
} from '@/lib/invoiceBuilder';

/** Payment method the builder starts with (and returns to after a reset). */
const DEFAULT_PAYMENT_METHOD = 'كاش';

interface UseInvoiceBuilderArgs {
  products: Product[];
  clients: Client[];
  createInvoice: (input: CreateInvoiceInput) => Promise<Invoice>;
  /** Called after an invoice was created, so the page can close the panel. */
  onSaved: () => void;
}

/**
 * useInvoiceBuilder — everything the "new invoice" panel remembers and does:
 * customer, lines, discount, payment method, the totals, and saving. The
 * arithmetic lives in lib/invoiceBuilder.ts; this hook only holds the state.
 */
export function useInvoiceBuilder({ products, clients, createInvoice, onSaved }: UseInvoiceBuilderArgs) {
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState<BuilderLine[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_METHOD);

  const totals = calcBuilderTotals(lines, discountPct);

  const filteredProducts = useMemo(
    () => products.filter(p => p.name.includes(productSearch) || p.barcode.includes(productSearch)),
    [products, productSearch],
  );

  const selectedCustomer = clients.find(c => c.id === customerId);

  const addProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    setLines(prev => addProductLine(prev, product));
    toast.success(`تمت إضافة ${product.name}`);
  };

  const updateQty = (uid: string, delta: number) => setLines(prev => changeLineQty(prev, uid, delta));
  const removeLine = (uid: string) => setLines(prev => removeLineFrom(prev, uid));

  const resetBuilder = () => {
    setCustomerId('');
    setLines([]);
    setProductSearch('');
    setDiscountPct(0);
    setPaymentMethod(DEFAULT_PAYMENT_METHOD);
  };

  const saveInvoice = async () => {
    if (!customerId) {
      toast.error('يرجى اختيار العميل');
      return;
    }
    if (lines.length === 0) {
      toast.error('يرجى إضافة منتج واحد على الأقل');
      return;
    }
    try {
      const invoice = await createInvoice({
        customer: selectedCustomer?.name ?? '',
        amount: totals.taxable,
        tax: totals.tax,
        total: totals.total,
        method: paymentMethod,
        items: totals.units,
      });
      toast.success(`تم إنشاء الفاتورة ${invoice.id} بنجاح`, {
        description: `الإجمالي: ${totals.total.toLocaleString()} EGP • ${totals.units} منتج`,
      });
      resetBuilder();
      onSaved();
    } catch {
      // The invoices hook has already recorded the error — the page banner shows it.
    }
  };

  return {
    customerId, setCustomerId,
    lines,
    productSearch, setProductSearch,
    discountPct, setDiscountPct,
    paymentMethod, setPaymentMethod,
    subtotal: totals.subtotal,
    discountAmount: totals.discount,
    afterDiscount: totals.taxable,
    taxAmount: totals.tax,
    grandTotal: totals.total,
    totalQty: totals.units,
    filteredProducts,
    selectedCustomer,
    addProduct, updateQty, removeLine, resetBuilder, saveInvoice,
  };
}

export type InvoiceBuilder = ReturnType<typeof useInvoiceBuilder>;
