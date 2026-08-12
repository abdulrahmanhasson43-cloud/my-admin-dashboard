# لوحة التحكم الرئيسية

> **الملف:** `src/pages/DashboardPage.tsx` · **السطور:** ~606 · **المسار:** `/ (الصفحة الرئيسية)`

## نظرة عامة

صفحة لوحة التحكم هي النقطة المركزية للتطبيق بعد تسجيل الدخول. تعرض ملخصاً شاملاً لأداء المتجر يشمل: إحصائيات المبيعات اليومية والأسبوعية والسنوية عبر رسوم بيانية تفاعلية (AreaChart للمبيعات، BarChart للمقارنة الأسبوعية، PieChart لتوزيع الفئات)، قائمة بأفضل المنتجات مبيعاً، الإجراءات السريعة (heroActions وquickActions)، مركز الإشعارات (NotificationCenter)، وودجت هدف المبيعات (SalesGoalWidget) الذي يعرض التقدم نحو الهدف الشهري، وودجة تنبيهات المخزون الذكية (LowStockAlertsWidget) التي تتنبأ بعدد الأيام قبل نفاد المنتجات وتوفر زر إنشاء أمر شراء مباشر. تستخدم البيانات الوهمية من services/mock ودمجها مع بيانات المنتجات الحقيقية من ProductsContext. توفر تنقلاً سريعاً عبر useNavigate إلى صفحات أخرى مثل POS والمنتجات.

## السياقات (Contexts) المستخدمة

- `useProducts`
- `useAppSettings`
- `useActivityLog`

## المكونات المشتركة المستخدمة

- `NotificationCenter`
- `SalesGoalWidget`
- `LowStockAlertsWidget` (الفكرة #12 — تنبيهات المخزون الذكية مع توقّع النفاد)
- `Recharts (AreaChart/BarChart/PieChart)`
- `Framer Motion`
- `مكونات أيقونات مخصصة`

## خدمات البيانات (Services)

- `salesData`
- `topProducts`
- `sampleInvoices`
- `sampleOrders (from @/services/mock)`
- `sampleExpenses (from @/services/mock/expenses)`

## الثوابت (Constants)

- `heroActions`
- `quickActionsRow1`
- `quickActionsRow2 (from @/constants/dashboardActions)`

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
