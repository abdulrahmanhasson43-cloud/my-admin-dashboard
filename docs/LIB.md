# الدوال المساعدة (Lib)

يحتوي مجلد `src/lib/` على **3 ملفات** للدوال المساعدة المشتركة عبر التطبيق.

---

## 1. utils.ts — الدوال العامة

**المسار:** `src/lib/utils.ts`

### cn(inputs: ClassValue[]): string

يجمع بين `clsx` (للشروط المنطقية) و`tailwind-merge` (لإزالة تعارضات Tailwind) في دالة واحدة. هذا هو الأساس لكل تنسيق مكونات shadcn/ui.

```typescript
cn('px-2 py-1', isActive && 'bg-primary', 'px-4')
// → 'py-1 bg-primary px-4' (tailwind-merge أزال px-2 المتعارض)
```

### generateId(prefix: string): string

يولّد معرفًا فريدًا بالصيغة `{prefix}-{timestamp}-{random}`. مصمم ليُستدعى من **معالجات الأحداث** (event handlers) وليس أثناء الـ render — لتفادي تحذيرات React Compiler المتعلقة بالنقاء (purity). يضمن عدم تكرار المعرفات حتى لو نُشئ عدة عناصر في نفس المللي ثانية بفضل الجزء العشوائي.

```typescript
const id = generateId('t'); // → 't-1786374743703-j4f2k'
```

### generateNumericId(prefix: string, min: number, max: number): string

يولّد معرفًا تسلسليًا قصيرًا بالصيغة `{PREFIX}-{NNNN}` باستخدام رقم عشوائي ضمن نطاق محدد. مناسب للمعرفات القصيرة سهلة القراءة (الطلبات، المرتجعات). مثل `generateId`، يُستدعى فقط من معالجات الأحداث.

```typescript
const orderId = generateNumericId('ORD', 1000, 9999); // → 'ORD-4823'
```

### formatEnglishDate(raw: string, withTime = true): string

ينسّق تاريخ/وقت الفاتورة بالإنجليزية بشكل مرتب (اسم شهر مختصر، صباحًا/مساءً بالإنجليزية) بدلًا من عرض الـ ISO الخام. يقبل صيغًا مثل `"2025-01-15 14:30"` أو `"2025-01-15"` أو `"15-01-2025"`.

### formatArabicDate(raw: string, withTime = true): string

ينسّق تاريخ/وقت الفاتورة بالعربية (اسم الشهر عربي، صباحًا/مساءً) مع أرقام لاتينية عادية لتتفق مع باقي أرقام الموقع. نفس قبول الصيغ كما في `formatEnglishDate`.

---

## 2. export-utils.ts — تصدير البيانات

**الممسار:** `src/lib/export-utils.ts`

### exportToExcel(rows, fileName, sheetName): void

يصدّر مجموعة بيانات إلى ملف جدول (xlsx). تعمل على الديسكتوب والجوال — تُبنى `Blob` من مصفوفة `ArrayBuffer` وتُستخدم `URL.createObjectURL` + عنصر `<a download>` بدلًا من أي آلية تعتمد على نظام التشغيل.

> الواجهة مستقلة عن Excel — لا تذكر "Excel" في أي مكان مرئي للمستخدم؛ نستخدم "تصدير" فقط.

```typescript
exportToExcel(
  [{ name: 'منتج أ', price: 100 }, { name: 'منتج ب', price: 200 }],
  'تقرير-المنتجات',
  'المنتجات'
);
```

---

## 3. payment-icons.ts — أيقونات طرق الدفع

**المسار:** `src/components/payment-icons.ts` (انتقل من `src/lib/` لأنه يستورد أيقونات الواجهة؛ طبقة `lib` لا تعتمد على الواجهة).

### getPaymentIcon(id: string): ComponentType<IconProps>

يحلّ معرّف طريقة دفع إلى مكوّن الأيقونة المناسب. يُرجع `WalletIcon` كاحتياطي للمعرفات غير المعروفة.

```typescript
const Icon = getPaymentIcon('cash'); // → CashIcon
```

> **ملاحظة معمارية:** في `OrdersPage.tsx`، لتفادي تحذير "Cannot create components during render"، استُخدمت خريطة ثابتة `ORDER_PAYMENT_ICONS` (في `constants/orderPaymentIcons.ts`) بدلًا من استدعاء هذه الدالة أثناء الـ render. الدالة هنا مناسبة للاستخدام خارج الـ render (مثل خريطة على بيانات ثابتة).

---

## 4. pricing.ts — الضريبة وحسابات البيع

**المسار:** `src/lib/pricing.ts` — دوال نقية بلا React ولا تخزين، ومغطاة باختبارات في `pricing.test.ts`.

- `VAT_PERCENT` (14) و`VAT_RATE` (0.14): مصدر واحد لنسبة الضريبة. كانت مكتوبة يدويًا في `POSPage` و`InvoicePage` و`ThermalReceipt`.
- `calcSubtotal(lines)`: مجموع `price × quantity`.
- `calcSaleTotals(subtotal, { discountPercent, taxRate })`: يُرجع `{ subtotal, discount, taxable, tax, total }`. الخصم يُطرح قبل الضريبة.

---

## 5. storage.ts — الواجهة الوحيدة للتخزين المحلي

**المسار:** `src/lib/storage.ts` + مفاتيح التخزين كلها في `src/constants/storageKeys.ts`.

- `readJson(key, fallback)` / `writeJson(key, value)` / `readString` / `writeString`.
- كلها آمنة: لا ترمي خطأ عند امتلاء التخزين أو JSON تالف أو غياب `window`؛ القراءة ترجع القيمة الاحتياطية والكتابة ترجع `false`.
- **ممنوع** استخدام `localStorage` مباشرة في أي ملف آخر. اختبار `tests/architecture.test.ts` يفشل لو حصل.

---

## expenses.ts — قواعد المصروفات

دوال نقية (بدون React) ومعاها اختبارات في `expenses.test.ts`:

| الدالة | وظيفتها |
|---|---|
| `parseExpenseForm(form, date)` | يحوّل نموذج الإضافة لمدخل الخدمة، أو يقول ليه لأ: `blank` (وصف/مبلغ فاضي) أو `amount` (مش رقم أكبر من صفر) |
| `filterExpenses` / `groupByDate` / `indexByDate` | التصفية بالفئة والبحث (الأحدث أولًا)، والتجميع بالتاريخ |
| `summarizeExpenses(expenses, today)` | مصروفات اليوم وعددها والإجمالي والمتوسط |
| `buildCalendarCells(year, month, today)` | خلايا شبكة الشهر (الأحد أولًا) مع الفراغات الأولى |
| `dayDotColors` / `categoryBreakdown` | نقاط الفئات لليوم (أقصى 4)، وتوزيع الفئات للرسم الدائري |
| `dateLabel` / `todayIso` / `expenseExportRows` | "اليوم/أمس/تاريخ طويل"، وصيغة التاريخ، وصفوف Excel |

## invoiceBuilder.ts — قواعد بناء الفاتورة

دوال نقية على سطور الفاتورة (`BuilderLine[]`)، كلها بترجّع قائمة جديدة ومش بتعدّل القديمة: `addProductLine` (منتج موجود → زيادة الكمية)، `changeLineQty` (لا ينزل عن 1)، `removeLine`، `countUnits`، `calcBuilderTotals(lines, discountPercent)` (الخصم يتخصم **قبل** الضريبة). معاها اختبارات.

## permissions.ts — قواعد الصلاحيات

`togglePermission(perms, module, action)` (تشغيل/إيقاف صلاحية؛ آخر صلاحية تتقفل بتشيل القسم كله)، `hasPermission`، `countStaffByRole`، `getRoleMeta` (بيرمي خطأ لدور مش معروف)، وثوابت `ALL_PERMISSION_MODULES` / `ALL_PERMISSION_ACTIONS`. معاها اختبارات.

## pickUniqueId (في utils.ts)

`pickUniqueId(generate, isTaken, fallbackPrefix, attempts = 20)` — بتجرّب `generate()` لحد ما تلاقي رقم محدش واخده (`isTaken` بتسأل الـ repository)، ولو كل المحاولات اتاخدت بترجع رقم زمني (`generateId`) مش ممكن يتكرر. مستخدمة في `InvoiceService` و`ReturnService` لأن أرقامهم القصيرة (900 احتمال) كانت بتتكرر. أي خدمة جديدة برقم قصير لازم تستخدمها.

## 7. orders.ts — قواعد شاشة الطلبات

دوال نقية على `Order[]` (مغطاة في `orders.test.ts`). `relativeTime` و`filterOrdersByTime` بياخدوا `now` كمعامل علشان يتختبروا بوقت ثابت.

| الدالة | وظيفتها |
|---|---|
| `filterOrdersByTime(orders, filter, now)` | اليوم/الأسبوع/الشهر (الحد الأقصى شامل) أو الكل |
| `groupOrdersByStatus(orders)` | قايمة لكل حالة (الأربعة موجودين دايمًا)، الأحدث أولًا |
| `ordersForStatusFilter(filtered, byStatus, filter)` | اللي بتعرضه قايمة الموبايل |
| `sortNewestFirst(orders)` | نسخة مرتبة (مش بتعدّل الأصل) |
| `relativeTime(iso, now?)` | "الآن" / "من X دقيقة/ساعة/يوم" |
| `summarizeOrders(orders)` | العدد والجديد والمُسلَّم والإيراد |
| `countItems(items)` / `itemsTotal(items)` | عدد القطع وإجمالي السعر × الكمية |
| `parseItemInput(name, price, qty)` | سطر المنتج الصالح أو `null` (اسم فاضي أو سعر/كمية صفر أو مش رقم) |

وفيه `ORDER_TIME_FILTERS` (أزرار الفترة) و`OrderTimeFilter`.

## 6. cart.ts — قواعد سلة الكاشير

دوال نقية على `CartItem[]` (بترجّع مصفوفة جديدة ومش بتعدّل القديمة)، ومتغطية باختبارات في `cart.test.ts`.

| الدالة | وظيفتها |
|---|---|
| `addProduct(cart, product)` | يضيف وحدة، ويدمج مع السطر الموجود |
| `addProductVariant(cart, product, variants, qty)` | يضيف تركيبة متغيرات كسطر مستقل (`variantLineId`) |
| `changeQuantity(cart, id, delta)` | يزوّد/ينقّص الكمية ولا ينزل عن 1 |
| `setQuantity(cart, id, value)` | كمية محددة؛ يتجاهل NaN وأي قيمة أقل من 1 |
| `removeItem(cart, id)` | يحذف السطر |
| `countUnits(cart)` / `quantityOf(cart, id)` | عدّ الوحدات |

