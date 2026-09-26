# Vuno — قائمة التعديلات والإضافات (الأفكار 21–30 + طلبات المستخدم)

هذه قائمة كاملة بكل التعديلات والإضافات التي تمت على مشروع Vuno، مرتبة حسب الملف. تم التحقق من نجاح البناء (`tsc -b` + `vite build`) بدون أي أخطاء.

---

## أولاً: ملفات جديدة تم إنشاؤها

### 1. `src/components/WhatsAppShareModal.tsx` (الفكرة 21)
نافذة مشاركة عبر واتساب تتيح اختيار نوع الرسالة (فاتورة، تذكير دفع، عرض خاص، حالة الطلب، طلب تقييم) مع معاينة الرسالة قبل الإرسال، وبناء رابط `wa.me` تلقائيًا.

### 2. `src/components/WhatsAppShareButton.tsx` (الفكرة 21)
زر يشغّل نافذة `WhatsAppShareModal`، يمكن استخدامه كأيقونة صغيرة أو زر pill كامل العرض.

### 3. `src/components/ProductVariantSelector.tsx` (الفكرة 30)
نافذة منبثقة لاختيار variants المنتج (دوائر الألوان، أزرار المقاسات S/M/L/XL، الكمية، السعر) مع تأكيد الإضافة للسلة.

### 4. `src/components/VariantCard.tsx` (الفكرة 30)
بطاقة بصرية مدمجة تعرض variants المنتج (ألوان/مقاسات) بشكل مختصر داخل بطاقات المنتجات.

### 5. `src/components/DailyClosingReport.tsx` (الفكرة 25)
تقرير إقفال اليوم الشامل: صف إحصائيات (إجمالي المبيعات، عدد الفواتير، عدد العملاء، تفصيل الدفع)، مخطط دائري لطرق الدفع، مخطط أعمدة للمبيعات حسب الساعة، أكثر 5 منتجات مبيعًا، تنبيهات (مخزون منخفض، مصاريف اليوم)، تسوية الوردية (افتتاح/إغلاق/مبيعات/الفرق)، إجراءات (طباعة/PDF/واتساب).

### 6. `src/components/CustomerSelection.tsx` (طلب المستخدم C)
نظام اختيار العميل عند الدفع: عميل مسجل (بحث بالهاتف من قاعدة البيانات) أو عميل مؤقت (شراء لمرة واحدة بإدخال الاسم/الهاتف).

### 7. `src/components/Chatbot.tsx` (طلب المستخدم E)
مساعد ذكي عائم في الزاوية السفلية: زر دائري بأيقونة chatbot مع نقطة نبض خضراء، نافذة دردشة مع رأس (اسم/حالة اتصال)، منطقة رسائل قابلة للتمرير، مؤشر كتابة، أسئلة مقترحة، حقل إدخال + زر إرسال. الواجهة جاهزة وسيتم ربط الـ API لاحقًا من لوحة Super Admin. يتضمن ردود تجريبية لـ 6 مواضيع.

### 8. `src/pages/DailyClosingReportPage.tsx` (الفكرة 25)
غلاف صفحة يعرض مكوّن `DailyClosingReport` داخل تخطيط التطبيق.

### 9. `src/pages/PublicInvoicePage.tsx` (الفكرة 29)
صفحة فاتورة عامة قابلة للمشاركة عبر رابط مباشر `/public/invoice/:invoiceId`، لا تتطلب تسجيل دخول، تعرض تفاصيل الفاتورة + رمز QR للتحقق. تُعرض خارج تخطيط التطبيق (بدون sidebar/header).

---

## ثانياً: ملفات معدّلة

### 1. `src/types/product.ts` (الفكرة 30)
- إضافة `VariantValue` و `ProductVariant` interfaces.
- إضافة حقل `variants?: ProductVariant[]` على `Product`.
- إضافة حقل `selectedVariants?: Record<string, string>` على `CartItem`.

### 2. `src/types/shift.ts`
- إضافة حقل `reason?: string` على `HeldOrder` (إصلاح خطأ نوع مسبق).

### 3. `src/index.css` (الأفكار 22، 23)
- إضافة كلاس `.no-print` لإخفاء العناصر عند الطباعة.
- إضافة CSS لطابعات الحرارة الحرارية `.thermal-58` (58mm) و `.thermal-80` (80mm): خط Courier New أحادي المسافة، 12px، ارتفاع سطر 1.4، عرض 58mm/80mm، padding 4mm، عبر `@media print`.
- إضافة تحسينات اللمس `@media (pointer: coarse)`: `touch-manipulation`، `select-none-touch`، إلغاء التوهج عند التركيز على الأجهزة اللمسية.

### 4. `src/context/app-settings-context-value.ts` + `src/context/AppSettingsContext.tsx` (الفكرة 26)
- إضافة `autoBackupEnabled` و `setAutoBackupEnabled` و `lastBackupAt` و `setLastBackupAt` إلى قيمة الـ context.
- إضافة `useState` لحالتي `autoBackupEnabled` (افتراضي false) و `lastBackupAt` (افتراضي null) في الـ provider.

### 5. `src/components/icons/index.tsx` (الأفكار 21، 24، 30، طلب E)
- إضافة `ChatbotIcon` (فقاعة كلام بعينين وابتسامة).
- إضافة `CloseIcon` (علامة X).
- إضافة `UserPlusIcon` (مستخدم مع علامة + لعميل مؤقت).
- (ملاحظة: `SendIcon` كان موجودًا مسبقًا وأُزيل النسخة المكررة).

### 6. `src/hooks/useKeyboardShortcuts.ts` (الفكرة 24)
إعادة كتابة كاملة لإضافة اختصارات Ctrl:
- `Ctrl+F`: تركيز بحث POS (عبر `data-pos-search`).
- `Ctrl+Enter`: دفع سريع (يرسل حدث `quick-pay` للـ POS).
- `Ctrl+N`: فاتورة جديدة (مسح السلة + التنقل لـ /pos).
- `Ctrl+P`: طباعة (يرسل حدث `print` في /invoices أو /pos).
- `Ctrl+1/2/3`: تنقل للرئيسية/POS/المنتجات.
- `+`/`-`: زيادة/تقليل الكمية (POS فقط، خارج حقول الإدخال).
- `Delete`/`Backspace`: حذف المنتج المحدد (POS فقط).
- `Ctrl+K`: يُترك لـ CommandPalette.
- إشعارات toast عبر `sonner` عند تفعيل كل اختصار (مدة 1800ms، أعلى المنتصف).
- استخدام `CustomEvent('vuno:pos-shortcut')` للتواصل بين الـ hook العام وصفحة POS.
- الاحتفاظ بالاختصارات القديمة (Alt + أوتار "g").

### 7. `src/components/NotificationCenter.tsx` (الفكرة 28)
- إضافة نوع `FilterTab`: `'all' | 'unread' | 'stock' | 'invoice'`.
- إضافة 4 تبويبات تصفية: الكل / غير مقروء / مخزون / فواتير، مع شارات عدد.
- إضافة حالة `activeFilter` و `filteredNotifications` المشتقة منها.
- عرض التبويبات بين شريط الإجراءات وقائمة الإشعارات (قابلة للتمرير أفقيًا).
- رسالة فارغة تتكيف مع التصنيف النشط.
- تقليل max-height من 360px إلى 300px.

### 8. `src/components/DataBackupSection.tsx` (الفكرة 26)
- استخراج `performBackup(silent)` كـ `useCallback` مشترك بين التصدير اليدوي والنسخ الاحتياطي التلقائي.
- إضافة `useEffect` للنسخ الاحتياطي التلقائي: يفحص `vuno_last_auto_backup` في localStorage كل ساعة، ويشغّل نسخًا إذا مرّ أكثر من 24 ساعة.
- إضافة `handleToggleAutoBackup()` مع إشعارات toast (نجاح عند التفعيل، معلومات عند الإيقاف).
- إضافة مفتاح تبديل (toggle switch) بأيقونة ClockIcon ونص حالة وزر متحرك (أخضر عند التفعيل، حركة translateX ملائمة لـ RTL).

### 9. `src/pages/POSPage.tsx` (الأفكار 22، 24، 30 + طلبات المستخدم B، C)
- **الاستيرادات**: إضافة `useEffect`، `UsersIcon`، `CustomerSelection` + نوع `SelectedCustomer`، `ProductVariantSelector`، `VariantCard`.
- **الحالة**: إضافة `selectedCustomer`، `customerSelectionOpen`، `variantSelectorOpen`، `variantProduct`، `selectedCartItemId`.
- **`addToCart`**: التحقق من variants — إذا كان المنتج له variants يفتح `ProductVariantSelector` بدل الإضافة المباشرة.
- **`addToCartWithVariants`**: دالة جديدة تنشئ مفتاح سلة فريد من اختيارات الـ variants، وتضيف المنتج بحقل `selectedVariants`.
- **مستمع اختصارات لوحة المفاتيح**: `useEffect` يستمع لأحداث `vuno:pos-shortcut` — يعالج `quick-pay`، `clear-cart`، `quantity-increment`، `quantity-decrement`، `remove-selected`، `print`.
- **حقل البحث**: إضافة `data-pos-search="true"` لاستهدافه بـ Ctrl+F.
- **شبكة المنتجات → صفوف بعرض كامل** (طلب المستخدم C): تحويل من `grid grid-cols-2 lg:grid-cols-4` إلى `space-y-2 lg:space-y-2.5 select-none-touch`، كل منتج صف أفقي (أيقونة → اسم/variants → سعر → زر + كبير).
- **تحسينات اللمس**: `active:scale-[0.98]` على الصفوف، `active:scale-90` على الأزرار، `select-none`، أهداف لمس 44px+.
- **عرض الـ variants**: `VariantCard` مدمج للمنتجات ذات variants، نص الفئة لغيرها.
- **واجهة اختيار العميل** (طلب المستخدم C): زر في نافذة السلة (قبل أزرار الإجراءات) يعرض العميل المحدد أو يطالب بالاختيار، يفتح نافذة `CustomerSelection`.
- **نوافذ منبثقة**: `CustomerSelection` و `ProductVariantSelector` في نهاية الـ return مع callbacks + toast.

### 10. `src/pages/ProductsPage.tsx` (طلب المستخدم D + الفكرة 30)
- استيراد `VariantCard`.
- تحويل الشبكة من `grid md:grid-cols-2 lg:grid-cols-3 gap-4` إلى `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 select-none-touch` — بطاقات متوازنة (2 على الموبايل، 3 على اللوحي، 4 على الديسكتوب).
- إعادة تصميم البطاقة: `card-vuno p-3 lg:p-4 flex flex-col` (نسب متوازنة، ليست طويلة جدًا ولا عريضة جدًا).
- أيقونة مدمجة (10x10 موبايل، 11x11 ديسكتوب)، اسم `text-[13px] lg:text-[15px]` بـ `line-clamp-1`.
- إضافة `VariantCard` مدمج للمنتجات ذات variants.
- شريط المخزون ومعلومات المخزون/الباركود مضغوطة في footer مع `mt-auto` لمحاذاة flex.
- تحسينات اللمس: `active:scale-90` على أزرار الإجراءات، `select-none-touch` على الشبكة.

### 11. `src/pages/InvoicePage.tsx` (الفكرة 21)
- استيراد `WhatsAppShareButton`.
- إضافة زر مشاركة واتساب في نافذة تفاصيل الفاتورة (بعد زر الطباعة، بنمط pill كامل العرض).
- إضافة أزرار أيقونة مشاركة واتساب لعناصر قائمة الفواتير (ديسكتوب وموبايل، بجانب أزرار QR).

### 12. `src/components/AppLayout.tsx` (طلبات المستخدم B، E)
- استيراد وإضافة مكوّن `Chatbot` (portal-based، يظهر على كل الأجهزة).
- **تحسينات الاستجابة** (طلب B): إضافة حاوية `max-w-[1400px] mx-auto` لمحتوى الصفحات على الشاشات الكبيرة جدًا للحفاظ على نسب قريبة من الموبايل/اللوحي بدل التمدد الكامل.
- تحسين padding الهيدر: `px-4 sm:px-5 lg:px-6 xl:px-8` مع `max-w-[1600px] mx-auto` لتوازن أفضل على الديسكتوب.

### 13. `src/constants/navigation.ts` (الفكرة 25)
- استيراد `CoinsIcon`.
- إضافة `{ label: 'تقرير إقفال اليوم', path: '/daily-closing-report', icon: CoinsIcon }` إلى `moreSections` (بعد التقارير).
- إضافة `'/daily-closing-report': 'تقرير إقفال اليوم'` إلى `pageTitles`.

### 14. `src/App.tsx` (الأفكار 25، 29)
- إضافة lazy imports لـ `DailyClosingReportPage` و `PublicInvoicePage`.
- إضافة مسار `/public/invoice/:invoiceId` **خارج** `AppLayout` (صفحة عامة بدون تسجيل دخول).
- إضافة مسار `/daily-closing-report` **داخل** `AppLayout`.

### 15. `src/components/BarcodeScannerModal.tsx` (إصلاح خطأ نوع مسبق)
- تصحيح تمرير `onSubmit` لـ `ManualEntry` ليُغلَّف بدالة سهمية `() => handleManualSubmit(manualCode)` بدل تمريرها مباشرة (تطابق توقيع `() => void`).

---

## ثالثاً: ملخص الأفكار المنفذة

| الفكرة | الوصف | الحالة |
|--------|-------|--------|
| 21 | مشاركة واتساب للفواتير/العروض | ✅ |
| 22 | POS متجاوب للموبايل/اللوحي (touch, FAB, bottom sheet) | ✅ |
| 23 | CSS لطابعات الحرارة 58mm/80mm | ✅ |
| 24 | اختصارات لوحة المفاتيح Ctrl + toast | ✅ |
| 25 | تقرير إقفال اليوم الشامل | ✅ |
| 26 | نسخ احتياطي تلقائي + تصدير | ✅ |
| 27 | معالج الإعداد (موجود مسبقًا — تم التحقق) | ✅ |
| 28 | مركز الإشعارات + تبويبات تصفية | ✅ |
| 29 | QR على الفواتير + صفحة فاتورة عامة | ✅ |
| 30 | variants بصرية (ألوان/مقاسات) + منتقي في POS | ✅ |

## رابعاً: طلبات المستخدم الإضافية

| الطلب | الحالة |
|-------|--------|
| B — تحسين التصميم المتجاوب (تماثل ديسكتوب/موبايل) | ✅ (AppLayout + POS + Products) |
| C — صفوف منتجات بعرض كامل + اختيار العميل في POS | ✅ |
| D — بطاقات منتجات متوازنة | ✅ |
| E — chatbot عائم (UI جاهز، API لاحقًا) | ✅ |

---

## التحقق من البناء
- `npx tsc -b` — ✅ بدون أخطاء أنواع.
- `npx vite build` — ✅ بناء إنتاجي ناجح بدون تحذيرات/أخطاء.
- جميع المكوّنات الجديدة ظهرت في مخرجات البناء (VariantCard, PublicInvoicePage, DailyClosingReportPage, إلخ).
