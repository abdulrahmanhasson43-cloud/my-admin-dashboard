# إدارة العملاء

> **الملف:** `src/pages/ClientsPage.tsx` · **السطور:** ~513 · **المسار:** `/clients`

## نظرة عامة

صفحة العملاء تعرض قاعدة بيانات العملاء مع سجل المشتريات والأنشطة لكل عميل (Customer Timeline). تتيح إضافة عميل جديد، عرض تفاصيل العميل، البحث والتصفية، وإنشاء رمز QR لكل عميل. تعرض StatsRow إحصائيات (إجمالي العملاء، عملاء نشطين، متوسط المشتريات). تستخدم clientActivities لعرض Timeline زمني لأنشطة كل عميل (مشتريات، مرتجعات، تفاعلات). تستخدم useDeviceType للتكيف مع الشاشات المختلفة وformatEnglishDate لتنسيق التواريخ. تستخدم useMemo للتصفية والإحصائيات المشتقة.

## السياقات (Contexts) المستخدمة

- `— (تستخدم بيانات وهمية)`

## المكونات المشتركة المستخدمة

- `StatsRow`
- `SearchBar`
- `QRCodeButton`
- `Framer Motion (AnimatePresence)`
- `useDeviceType`
- `مكونات أيقونات مخصصة`

## خدمات البيانات (Services)

- `sampleClients`
- `clientActivities`
- `ClientActivity (from @/services/mock/clients)`

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
