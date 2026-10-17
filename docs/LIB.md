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

### formatThousands(amount: number): string

يعرض مبلغًا بالآلاف بخانة عشرية واحدة (`1500` ← `"1.5K"`، والسالب بيحتفظ بعلامته) علشان يتحط بعده رمز العملة (`${formatThousands(x)} ج.م`). كان نفس السطر منسوخًا في 7 أماكن (الطلبات والمرتجعات والفواتير والعملاء والتحليلات وأوامر الشراء وتقويم المصروفات) و`formatStockValue`، دلوقتي في مكان واحد (اختباراته في `utils.test.ts`). **ملاحظة:** الصفحات مش متفقة على الرمز، بعضها `ج.م` وبعضها `EGP`، وده نص واجهة قرارك.

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

> **ملاحظة معمارية:** في `OrdersPage.tsx`، لتفادي تحذير "Cannot create components during render"، استُخدمت خريطة ثابتة `PAYMENT_ICONS` بدلًا من استدعاء هذه الدالة أثناء الـ render. الدالة هنا مناسبة للاستخدام خارج الـ render (مثل خريطة على بيانات ثابتة).

---

## 4. pricing.ts — الضريبة وحسابات البيع

**المسار:** `src/lib/pricing.ts` — دوال نقية بلا React ولا تخزين، ومغطاة باختبارات في `pricing.test.ts`.

- `VAT_PERCENT` (14) و`VAT_RATE` (0.14): مصدر واحد لنسبة الضريبة. كانت مكتوبة يدويًا في `POSPage` و`InvoicePage` و`ThermalReceipt`.
- `roundMoney(value)`: تقريب لأقرب قرش (خانتين عشريتين)، والنص `.5` بيتقرّب بعيد عن الصفر (`1.005` ← `1.01`، وده اللي `Math.round(1.005 * 100) / 100` بيغلط فيه). السالب (المرتجعات) بيتقرّب بالتماثل، ومبيرجعش `-0`، وأي `NaN` أو `Infinity` بيعدّي زي ما هو.
- `calcSubtotal(lines)`: مجموع `price × quantity`، وكل سطر بيتقرّب للقرش قبل الجمع.
- `calcSaleTotals(subtotal, { discountPercent, taxRate })`: يُرجع `{ subtotal, discount, taxable, tax, total }`. الخصم يُطرح قبل الضريبة. **كل رقم راجع قرش كامل**: الخصم يتقرّب، بعدين الضريبة تتحسب على الباقي وتتقرّب، والإجمالي = الباقي + الضريبة (متقرّب). قبل كده 99.99 + 14% كانت بتتخزّن 113.9886 والشاشة بتعرض 113.99، فالعميل اللي بيدفع الرقم المعروض كان "ليه باقي" 0.0014.

> **القاعدة:** أي مبلغ بيتخزّن أو بيتقارن (إجمالي، باقي، مرتجع) لازم يعدّي على `roundMoney` أو على دوال الملف ده. عرض المبلغ بـ`toLocaleString()` لوحده مش تقريب.

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

## inventory.ts — قواعد المخزون

دوال نقية (بدون React) ومعاها 45 اختبار في `inventory.test.ts`:

| الدالة | وظيفتها |
|---|---|
| `listCategories` / `filterProducts` | "الكل" + الفئات بدون تكرار؛ البحث بجزء من الاسم أو الباركود والفئة بالظبط |
| `isLowStock(product, threshold)` | يوصف المنتج: `storeStock < threshold` (المخزن مش داخل، والحد 0 بيقفل التنبيه) |
| `needsRestock(product, threshold)` | يستاهل تنبيه: `isLowStock` **والمنتج نشط**. للتنبيهات والإشعارات وقوايم "محتاج تجديد" |
| `stockLevel(quantity, threshold)` | وصف الرصيد: `out` (صفر أو أقل) / `critical` (أقل من نص الحد) / `low` (أقل من الحد) / `ok`. الحدّين strict (نص الحد بالظبط أو الحد بالظبط ياخد المستوى الأحسن). التسميات والألوان في `constants/stockLevel.ts` |
| `summarizeInventory` / `formatStockValue` | عدد المنتجات والقطع وقيمتها بسعر الشراء والمنخفض؛ وعرض القيمة بالآلاف (`1.5K EGP`، من `formatThousands`) |
| `inventoryQrValue` / `productQrValue` | نص الـQR للمخزون وللمنتج |
| `buildExportRows` | صفوف التصدير بالأعمدة العربية بالترتيب |
| `needsTransferConfirmation` | النقل بيستنى تأكيد لما تعدد الفروع والتأكيد الاتنين شغالين |
| `planQuickTransfer` | السهم والسحب: رفض لو المخزن فاضي، وإلا ينقل لحد اللي في المخزن (أو يطلب تأكيد) |
| `canSubmitTransfer` / `planModalTransfer` | زرار النافذة: من أكبر من 0 لحد اللي في المخزن بالظبط؛ أي حاجة تانية (صفر، سالب، أكبر، فاضي، مش رقم) ما بتعملش حاجة |

## returns.ts — قواعد نموذج "مرتجع جديد"

دوال نقية (بدون React) ومعاها 20 اختبار في `returns.test.ts`، والنموذج في `ReturnsPage` بيوصّلها بالشاشة بس:

| الدالة | وظيفتها |
|---|---|
| `returnableItems(type, invoice, catalog)` | اللي النموذج بيعرضه. **مرتجع عميل لفاتورة محفوظ فيها أسطرها:** المنتجات اللي على الفاتورة (نفس المنتج في سطرين بيتجمّع)، بالسعر اللي اتباع بيه، وأقصى كمية = اللي اتشرى. **غير كده** (فاتورة قديمة من غير أسطر، أو مرتجع مورد): منتجات المحل الحقيقية بأقصى كمية 999. مرتجع المورد بيتسعّر بسعر الشراء (`cost`) مش سعر البيع، وفاتورة العميل ملهاش دعوة بيه |
| `quantityOf` | الكمية اللي الخانة بتعرضها: اللي اتكتب، أو 1 لحد ما المستخدم يكتب |
| `clampQuantity` | من 1 لحد أقصى كمية؛ أي حاجة مش رقم بتبقى 1 |
| `canSubmitReturn(name, count)` | النموذج جاهز للإرسال: اسم مش فاضي ومنتج واحد معلّم على الأقل |
| `buildReturnItems` | أسطر المرتجع للمنتجات المعلّم عليها بس، بترتيب القايمة، بالكمية الفعلية (نفس اللي الخانة بتعرضه، فمفيش "الخانة بتقول 1 والقيمة فاضية") |

**حدّ معروف:** سعر سطر الفاتورة هو السعر قبل خصم الفاتورة وضريبتها، فالاسترداد بيحسب بيه من غير ما يخصم نسبة الخصم أو يضيف الضريبة. لو الفاتورة فيها خصم، المرتجع بيرجّع أكتر من اللي العميل دفعه. السياسة دي (هل الضريبة بتتردّ؟ والخصم بينسّب؟) قرارك، وما اتعملتش.

## orders.ts — قواعد شاشة الطلبات

دوال نقية (بدون React) ومعاها 28 اختبار في `orders.test.ts`. اللي بيعتمد على الساعة بياخد "دلوقتي" كمعامل علشان الاختبار يثبّت الوقت. `useOrdersBoard` و`useNewOrderForm` بيوصّلوها بالشاشة بس:

| الدالة | وظيفتها |
|---|---|
| `relativeTime(iso, now?)` | عمر الطلب بالكلام: "الآن" لأول دقيقة (أو وقت لسه ما جاش)، وبعدين "من 8 دقيقة" / "من 3 ساعة" / "من 2 يوم" (أعداد صحيحة) |
| `ordersWithin(orders, filter, now)` | الطلبات جوه النافذة الزمنية: اليوم 24 ساعة، الأسبوع 7 أيام، الشهر 30 يوم (`ORDER_TIME_WINDOW_MS`)، **والحد نفسه بيدخل** (طلب عمره 24 ساعة بالظبط لسه "النهارده"). `all` بيرجّع نفس القايمة |
| `newestFirst` | نسخة بأحدث طلب فوق، والطلبات اللي في نفس اللحظة بتفضل بترتيبها |
| `groupByStatus` | عمود لكل حالة (حتى لو فاضي)، وأحدث طلب فوق في كل عمود |
| `ordersForStatusFilter` | قايمة الموبايل: كل الطلبات أو حالة واحدة، الأحدث فوق |
| `summarizeOrders` | أرقام صف الإحصائيات (العدد، الجديد، المسلَّم، مجموع القيمة). بتعدّ **كل** الطلبات مهما كانت الفلاتر |
| `parseOrderItem(draft)` | سطر الطلب من اللي اتكتب: اسم مش فاضي (بيتقصّ)، وسعر وكمية **أكبر من صفر** (مش سالب ولا صفر ولا مش رقم ولا لانهائي). الكمية الكسرية (نص كيلو) مقبولة. الخانة بترجّع `null` لحد ما السطر يكتمل |
| `canSubmitOrder(name, phone, count)` | النموذج جاهز: اسم ورقم هاتف ومنتج واحد على الأقل، **نفس اللي `OrderService` بيطلبه** |
| `previewTotal(items)` | إجمالي النموذج بنفس حساب الخدمة (`calcSubtotal`، لأقرب قرش) |

## settings.ts — قواعد شاشة الإعدادات

دوال وقيم نقية (بدون React) ومعاها 15 اختبار في `settings.test.ts`. الصفحة بتوصّلها بالشاشة بس:

| العنصر | وظيفته |
|---|---|
| `parseLowStockThreshold(typed)` | قيمة حقل "المخزون المنخفض" من اللي اتكتب: **مش بتنزل عن صفر**، والفاضي أو اللي مش رقم = صفر. **الكسر بيفضل زي ما اتكتب** (3.7 يفضل 3.7) |
| `logoUrlFromInput(typed)` / `logoUrlToInput(url)` | حقل الشعار الفاضي معناه "من غير شعار" (`null`) مش عنوان فاضي، والعكس لما بنعرض القيمة المخزّنة |
| `defaultStoreDraft` / `defaultInvoiceDraft` | القيم الابتدائية للنموذجين (من نفس قيم الإيصال الابتدائية، لأنهم نفس المتجر؛ نسبة الضريبة نص لأنها بتتكتب في حقل) |
| `SAVED_NOTICE_MS` | مدة رسالة "تم الحفظ بنجاح" (ثانيتين) |

## pickUniqueId (في utils.ts)

`pickUniqueId(generate, isTaken, fallbackPrefix, attempts = 20)` — بتجرّب `generate()` لحد ما تلاقي رقم محدش واخده (`isTaken` بتسأل الـ repository)، ولو كل المحاولات اتاخدت بترجع رقم زمني (`generateId`) مش ممكن يتكرر. مستخدمة في `InvoiceService` و`ReturnService` لأن أرقامهم القصيرة (900 احتمال) كانت بتتكرر. أي خدمة جديدة برقم قصير لازم تستخدمها.

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
| `lastLineId(cart)` | رقم آخر سطر اتضاف (أو `null` لو السلة فاضية) — اختصارات `+` و`−` و`Delete` بتشتغل عليه |
| `cartFromHeldItems(items)` | يرجّع أسطر السلة من عناصر طلب معلق اتسترد |

## 7. receipt.ts — الفاتورة الحرارية (اللي مش مكوّن)

**المسار:** `src/lib/receipt.ts` — من غير React. `ReceiptSettings` (شكل الإعدادات) و`defaultReceiptSettings`، و`receiptToImage(element)` (PNG عن طريق `html-to-image`)، و`shareReceiptImage(element)` (Web Share على الموبايل وتحميل على الديسكتوب)، و`printReceiptImage(element)`. المكوّن نفسه في `components/ThermalReceipt.tsx`.

