# تعريفات الأنواع (TypeScript Types)

يحتوي مجلد `src/types/` على **15 ملف** لتعريفات الأنواع. الملف `index.ts` يعيد تصدير كل شيء، مما يسمح بالاستيراد من `@/types` بدلًا من مسار كل ملف على حدة.

---

## الملفات

| الملف | الكيان | الوصف |
|------|--------|------|
| `index.ts` | (فهرس) | إعادة تصدير كل الملفات |
| `product.ts` | المنتجات | `Product`, `CartItem`, واجهات المنتج |
| `category.ts` | الفئات | `Category` |
| `client.ts` | العملاء | `Client`, واجهات العميل |
| `supplier.ts` | الموردون | `Supplier` |
| `branch.ts` | الفروع | `Branch` |
| `inventory.ts` | المخزون | `InventoryItem`, `StockStatus` |
| `invoice.ts` | الفواتير | `Invoice`, `InvoiceItem` |
| `order.ts` | الطلبات | `Order`, `OrderItem`, `OrderStatus`, `OrderPaymentMethod` |
| `return.ts` | المرتجعات | `Return`, `ReturnItem`, `ReturnStatus` |
| `expense.ts` | المصروفات | `Expense`, `ExpenseCategory` |
| `purchaseOrder.ts` | أوامر الشراء | `PurchaseOrder`, `PurchaseOrderItem` |
| `shift.ts` | الورديات | `Shift`, `ShiftStatus` |
| `settings.ts` | الإعدادات | `AppSettings`, `PaymentMethodConfig` |
| `pricingPlan.ts` | خطط الأسعار | `PricingPlan` |
| `profile.ts` | الملف الشخصي | `UserProfile` |
| `permissions.ts` | الصلاحيات | `Permission`, `RolePermissions` |
| `navigation.ts` | التنقل | `NavItem`, أنواع القوائم |
| `barcode-detector.d.ts` | (إعلان) | تعريف أنواع BarcodeDetector API (غير مضمن في TS افتراضيًا) |

---

## نمط الاستيراد

```typescript
// من الفهرس (موصى به):
import type { Product, CartItem, Order } from '@/types';

// من ملف محدد (إذا لزم):
import type { Product } from '@/types/product';
```

> استخدم دائمًا `import type` لاستيراد الأنواع فقط — هذا يساعد Vite على إزالة هذه الاستيرادات في الإنتاج (tree-shaking).

---

## أنواع مهمة

### Order (الطلب)

```typescript
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  status: OrderStatus;        // 'new' | 'processing' | 'completed' | 'cancelled'
  paymentMethod: OrderPaymentMethod; // 'cash' | 'card' | 'wallet' | 'instapay'
  total: number;
  createdAt: string;
  timeline: OrderTimelineEvent[];
}
```

`OrderPaymentMethod` هو نوع مهم يُستخدم في الخريطة الثابتة `PAYMENT_ICONS` في `OrdersPage.tsx`.

### PaymentMethodConfig (طريقة الدفع)

معرّف في `settings.ts`، يُستخدم في `AppSettingsContext` كمصدر موحد لطرق الدفع المتاحة في نقطة البيع.

```typescript
interface PaymentMethodConfig {
  id: string;
  label: string;
  enabled: boolean;
}
```

---

## إضافة نوع جديد

1. أنشئ `src/types/xxx.ts` بالتعريفات.
2. أضف `export * from './xxx';` إلى `src/types/index.ts`.
3. استورد من `@/types` في كل مكان.
4. استخدم `export interface` للواجهات و`export type` للأنوات المتحدة (unions) والأسماء المستعارة (aliases).
5. وثّق كل حقل بـ JSDoc `/** ... */` فوقه.
