# إدارة المنتجات

> **الملف:** `src/pages/ProductsPage.tsx` · **السطور:** ~323 · **المسار:** `/products`

## نظرة عامة

صفحة إدارة المنتجات تعرض جميع منتجات المتجر في جدول/شبكة قابلة للبحث والتصفية. تتيح إضافة منتج جديد (عبر ProductFormModal)، تعديل منتج موجود، حذف منتج، تحديد المنتجات بالجملة (bulk selection) للإجراءات الجماعية، وتصدير البيانات إلى Excel (عبر exportToExcel). تستخدم getStockColor وgetStockLabel لعرض حالة المخزون بألوان مختلفة (متوفر/منخفض/نفد). عند انخفاض مخزون أي منتج، تستخدم useEffect لإرسال إشعار عبر NotificationsContext. تعرض StatsRow إحصائيات سريعة (إجمالي المنتجات، منتجات منخفضة المخزون، قيمة المخزون). تدمج QRCodeButton لإنشاء رمز QR لكل منتج.

## السياقات (Contexts) المستخدمة

- `useProducts`
- `useAppSettings`
- `useNotifications`
- `useActivityLog`

## المكونات المشتركة المستخدمة

- `ProductFormModal`
- `StatsRow`
- `SearchBar`
- `QRCodeButton`
- `Framer Motion`
- `مكونات أيقونات مخصصة`

## خدمات البيانات (Services)

- `— (تعتمد على ProductsContext للبيانات)`

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
