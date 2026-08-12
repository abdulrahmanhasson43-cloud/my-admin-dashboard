# طبقة البيانات — الخدمات الوهمية (Mock Services)

يحتوي مجلد `src/services/mock/` على **15 ملف** توفّر بيانات أولية وهمية لكل كيان في النظام. هذه الطبقة مصممة لتُستبدل لاحقًا بطبقة API حقيقية دون تغيير مكونات الواجهة.

---

## الفكرة المعمارية

الفصل بين مصدر البيانات والمستهلكين هو مبدأ أساسي. المكونات والسياقات تستهلك البيانات من هذه الطبقة. عند الانتقال إلى API حقيقي:

1. تُستبدل الدوال في هذه الملفات بنداءات `fetch`/`axios`.
2. تُعدّل السياقات لتكون async (مع حالات loading/error).
3. **لا تُلمس مكونات الواجهة** — فهي تستهلك البيانات عبر الـ hooks التي تبقى بنفس التوقيع.

---

## الملفات

| الملف | الكيان | المُصدّر الرئيسي | الاستهلاك |
|------|--------|-----------------|----------|
| `index.ts` | (فهرس) | إعادة تصدير كل الملفات | استيراد مركزي |
| `products.ts` | المنتجات | `sampleProducts` | ProductsContext |
| `categories.ts` | الفئات | `sampleCategories` | ProductsPage, CategoriesPage |
| `clients.ts` | العملاء | `sampleClients` | ClientsPage |
| `suppliers.ts` | الموردون | `sampleSuppliers` | SuppliersPage |
| `branches.ts` | الفروع | `sampleBranches` | BranchContext |
| `inventory.ts` | المخزون | `sampleInventoryItems` | InventoryPage |
| `invoices.ts` | الفواتير | `sampleInvoices` | InvoicePage |
| `orders.ts` | الطلبات | `sampleOrders` | OrdersPage |
| `returns.ts` | المرتجعات | `sampleReturns` | ReturnsPage |
| `expenses.ts` | المصروفات | `sampleExpenses` | ExpensesPage |
| `purchaseOrders.ts` | أوامر الشراء | `samplePurchaseOrders` | PurchaseOrdersPage |
| `dashboard.ts` | لوحة المعلومات | إحصائيات ورسوم | DashboardPage |
| `settings.ts` | الإعدادات | `paymentMethodsList`, إعدادات | AppSettingsContext, SettingsPage |
| `pricingPlans.ts` | خطط الأسعار | `pricingPlans` | LandingPage |
| `profile.ts` | الملف الشخصي | بيانات المستخدم | ProfilePage |
| `staff.ts` | الموظفون | `sampleStaff` | ShiftsPage, SettingsPage |

---

## نمط الاستخدام

كل ملف يُصدّر عادةً:
- `sampleXxx` — مصفوفة من البيانات الأولية
- أحيانًا دوال مساعدة (مثل `createXxx()`, `getXxxById()`)

السياقات تستهلك هذه البيانات كقيمة أولية في `useState`:

```typescript
// في ProductsContext.tsx
import { sampleProducts } from '@/services/mock/products';
const [products, setProducts] = useState<Product[]>(sampleProducts);
```

---

## إضافة كيان جديد

1. أنشئ `src/types/xxx.ts` بتعريفات الأنواع.
2. أضفه إلى `src/types/index.ts` (`export * from './xxx'`).
3. أنشئ `src/services/mock/xxx.ts` بالبيانات الأولية.
4. أضفه إلى `src/services/mock/index.ts`.
5. أنشئ سياقًا (إن لزم) باتباع النمط الثنائي.
6. أنشئ الصفحة في `src/pages/XxxPage.tsx`.
7. أضف المسار في `App.tsx` والتنقل في `src/constants/navigation.ts`.
8. أضف ملف توثيق في `docs/pages/XxxPage.md`.
