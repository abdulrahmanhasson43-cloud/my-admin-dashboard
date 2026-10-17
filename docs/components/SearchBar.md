# SearchBar — شريط البحث

> **الملف:** `src/components/SearchBar.tsx` · **السطور:** ~59

## نظرة عامة

SearchBar هو مكون بحث مشترك قابل لإعادة الاستخدام. مكون controlled يستقبل value وonChange عبر props. يعرض حقلاً مع أيقونة بحث وزر مسح. يدعم placeholder مخصص. تصميم بسيط وموحد مع متغيرات --vuno-* للألوان. يُستخدم في معظم صفحات القوائم لتوفير واجهة بحث متسقة. مكون خفيف (59 سطر) يركز على البساطة وإعادة الاستخدام.

## الصادرات (Exports)

`SearchBar (default)`

## المستهلكون (Consumers)

- `ProductsPage`
- `InventoryPage`
- `ClientsPage`
- `SuppliersPage`
- `ExpensesPage`
- `InvoicePage`
- `BranchesPage`
- `PurchaseOrdersPage`

## السياقات (Contexts) المستخدمة

`— (controlled component)`

## ملاحظات للمطور

- **إعادة الاستخدام:** هذا المكون مشترك (shared component) مصمم لإعادة الاستخدام عبر صفحات متعددة.
- **التصميم:** يستخدم متغيرات CSS `--vuno-*` للألوان، وفئات Tailwind للتنسيق، و`card-vuno` للبطاقات.
- **التوافق مع React Compiler:** تم التأكد من توافق المكون مع قواعد React Compiler (لا Math.random/Date.now أثناء الـ render، لا useEffect+setState للقيم المشتقة).
- **eslint-disable-next-line:** بعض المكونات تحتوي على تعليقات `eslint-disable-next-line react-refresh/only-export-components` لأنها تصدِّر كيانات غير مكونات (مثل defaultReceiptSettings) وهذا مقصود للتصميم.

## الارتباطات

- [الفهرس الرئيسي للمكونات](../COMPONENTS.md)
- [وثيقة نظام التصميم](../DESIGN-SYSTEM.md)
- [العودة للـ README](../../README.md)
