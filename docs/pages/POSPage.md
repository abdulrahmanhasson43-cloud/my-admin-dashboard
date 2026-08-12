# نقطة البيع (POS)

> **الملف:** `src/pages/POSPage.tsx` · **السطور:** ~661 · **المسار:** `/pos`

## نظرة عامة

صفحة نقطة البيع هي القلب التشغيلي للتطبيق. تتيح للكاشير مسح الباركود أو اختيار المنتجات يدوياً، إضافة منتجات إلى السلة، تعديل الكميات، اختيار طريقة الدفع، تطبيق الخصومات، وإتمام عملية البيع. عند إتمام البيع: تُسجَّل عملية البيع في ShiftContext (عبر recordSale)، تُحدَّث كمية المخزون في ProductsContext، يُسجَّل النشاط في ActivityLogContext، يُحدَّث تقدم هدف المبيعات في SalesGoalContext، وتُولَّد فاتورة حرارية قابلة للطباعة أو المشاركة عبر ThermalReceipt. تدعم الودجة أيضاً تعليق الطلبات (Held Orders) واستئنافها لاحقاً عبر HeldOrdersContext. تستخدم effectivePayment عبر useMemo (بدلاً من useEffect + setState) لضمان التوافق مع React Compiler. الدالة generateInvoiceId تُولِّد أرقام فواتير فريدة.

## السياقات (Contexts) المستخدمة

- `useProducts`
- `useAppSettings`
- `useShift`
- `useSalesGoal`
- `useHeldOrders`
- `useActivityLog (6 contexts)`

## المكونات المشتركة المستخدمة

- `BarcodeScannerModal`
- `ThermalReceipt (ShareReceiptButton`
- `PrintReceiptButton)`
- `Framer Motion (AnimatePresence)`
- `مكونات أيقونات مخصصة`

## خدمات البيانات (Services)

- `— (لا تستخدم services مباشرة، بل تعتمد على ProductsContext)`

## الثوابت (Constants)

- `defaultReceiptSettings (from ThermalReceipt)`

## ملاحظات للمطور

- **النمط المتبع:** هذه الصفحة تتبع نمط الصفحات في Vuno — مكون افتراضي (default export)، استيراد من `@/` alias، استخدام متغيرات CSS `--vuno-*` للألوان، وFramer Motion لحركات الدخول.
- **التوافق مع React Compiler:** تم التأكد من عدم استخدام `Math.random()` أو `Date.now()` أثناء الـ render (تستخدم `generateId` / `generateNumericId` بدلاً منها)، وعدم استخدام `useEffect` + `setState` للقيم المشتقة (تستخدم `useMemo` بدلاً من ذلك).
- **دعم RTL:** الواجهة بالكامل بالعربية مع `dir="rtl"`، باستثناء الأرقام والهواتف التي تستخدم `dir="ltr"` و`tabular-nums`.
- **الاستجابة (Responsiveness):** بعض الصفحات تستخدم `useDeviceType` للتكيف مع أحجام الشاشات المختلفة (موبايل/تابلت/ديسكتوب).

## الارتباطات

- [الفهرس الرئيسي للصفحات](../PAGES.md)
- [وثيقة المكونات المشتركة](../COMPONENTS.md)
- [وثيقة السياقات (Contexts)](../CONTEXTS.md)
- [العودة للـ README](../../README.md)
