# إدارة المخزون والتحويلات

> **الملف:** `src/pages/InventoryPage.tsx` · **السطور:** ~604 · **المسار:** `/inventory`

## نظرة عامة

صفحة المخزون تتيح مراقبة مخزون المتجر والمستودع. تعرض المنتجات مع كمياتها في كل موقع، وتدعم وضعين للعرض: قائمة (list) ومرئي (visual). الميزة الرئيسية هي نظام التحويل بين المواقع (Transfer) باستخدام HTML5 Native Drag & Drop: السحب من متجر إلى مستودع أو العكس، مع تأكيد التحويل. الدوال الرئيسية: requestTransfer (بدء طلب تحويل)، confirmTransfer (تأكيد)، transferToStore (نقل للمتجر). تعرض StatsRow إحصائيات (إجمالي القيمة، منتجات منخفضة، تحويلات معلقة). تدعم تصدير البيانات إلى Excel عبر exportToExcel. تستخدم useDeviceType للتكيف مع حجم الشاشة.

## السياقات (Contexts) المستخدمة

- `useProducts`
- `useAppSettings`

## المكونات المشتركة المستخدمة

- `StatsRow`
- `SearchBar`
- `QRCodeButton`
- `Framer Motion`
- `useDeviceType`
- `مكونات أيقونات مخصصة`

## خدمات البيانات (Services)

- `— (تعتمد على ProductsContext)`

## الثوابت (Constants)

لا توجد ثوابت مستخدمة في هذه الصفحة.

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
