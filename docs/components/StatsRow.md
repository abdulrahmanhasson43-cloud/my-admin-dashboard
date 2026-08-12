# StatsRow — صف الإحصائيات

> **الملف:** `src/components/StatsRow.tsx` · **السطور:** ~98

## نظرة عامة

StatsRow هو مكون صف إحصائيات مشترك. يستقبل مصفوفة stats (عنصر لكل إحصائية: label, value, icon, color). يعرض صفاً من بطاقات الإحصائيات بأيقونات ملوّنة وقيم بارزة. يتكيف مع حجم الشاشة (شبكة متجاوبة: 2 أعمدة موبايل، 3-4 تابلت، 4+ ديسكتوب). يُستخدم في معظم صفحات القوائم والتقارير لعرض إحصائيات سريعة في أعلى الصفحة. مكون أساسي لإعادة الاستخدام يضمن اتساق عرض الإحصائيات.

## الصادرات (Exports)

`StatsRow (default)`

## المستهلكون (Consumers)

- `ProductsPage`
- `InventoryPage`
- `ClientsPage`
- `SuppliersPage`
- `ExpensesPage`
- `InvoicePage`
- `BranchesPage`
- `OrdersPage`
- `ReturnsPage`
- `PurchaseOrdersPage`
- `DashboardPage`

## السياقات (Contexts) المستخدمة

لا يستخدم سياقات مباشرة (مكون عرضي/controlled).

## ملاحظات للمطور

- **إعادة الاستخدام:** هذا المكون مشترك (shared component) مصمم لإعادة الاستخدام عبر صفحات متعددة.
- **التصميم:** يستخدم متغيرات CSS `--vuno-*` للألوان، وفئات Tailwind للتنسيق، و`card-vuno` للبطاقات.
- **التوافق مع React Compiler:** تم التأكد من توافق المكون مع قواعد React Compiler (لا Math.random/Date.now أثناء الـ render، لا useEffect+setState للقيم المشتقة).
- **eslint-disable-next-line:** بعض المكونات تحتوي على تعليقات `eslint-disable-next-line react-refresh/only-export-components` لأنها تصدِّر كيانات غير مكونات (مثل defaultReceiptSettings) وهذا مقصود للتصميم.

## الارتباطات

- [الفهرس الرئيسي للمكونات](../COMPONENTS.md)
- [وثيقة نظام التصميم](../DESIGN-SYSTEM.md)
- [العودة للـ README](../../README.md)
