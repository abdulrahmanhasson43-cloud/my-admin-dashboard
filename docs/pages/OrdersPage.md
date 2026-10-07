# إدارة الطلبات (Kanban)

> **الملف:** `src/pages/OrdersPage.tsx` · **السطور:** ~54 (كانت 556) · **المسار:** `/orders`

## نظرة عامة

صفحة الطلبات تعرض الطلبات في لوحة Kanban تفاعلية بأعمدة تمثل حالات الطلب (جديد/قيد التنفيذ/جاهز/مكتمل/ملغي). تستخدم HTML5 Native Drag & Drop (بدون مكتبات خارجية) لنقل الطلبات بين الأعمدة عبر تحديث حالتها. تستخدم PAYMENT_ICONS كخريطة ثابتة (Record<PaymentMethod, ComponentType>) بدلاً من استدعاء دالة تُنشئ مكوناً أثناء الـ render (إصلاح لقاعدة React Compiler). تتضمن TimeFilter لتصفية الطلبات حسب الفترة الزمنية، وrelativeTime لعرض الوقت النسبي (منذ X دقيقة). تستخدم generateId وgenerateNumericId لإنشاء معرفات فريدة للطلبات الجديدة بدلاً من Math.random/Date.now.

## السياقات (Contexts) المستخدمة

- `— (تستخدم بيانات وهمية مباشرة)`

## المكونات المشتركة المستخدمة

- `StatsRow`
- `Framer Motion`
- `مكونات أيقونات مخصصة`

## خدمات البيانات (Services)

- `sampleKanbanOrders (from @/services/mock/orders)`

## الثوابت (Constants)

لا توجد ثوابت مستخدمة في هذه الصفحة.

## ملاحظات للمطور

- **التقسيم (نسخة 30):** الصفحة بقت تركيب بس. الواجهة في `components/orders/`، وحالتها في `useOrdersBoard` و`useNewOrderForm`، والقواعد النقية (`relativeTime` و`filterOrdersByTime` والتجميع و`parseItemInput`) في `lib/orders.ts`، وخريطة الأيقونات `ORDER_PAYMENT_ICONS` في `constants/orderPaymentIcons.ts`. ملاحظة الوصف فوق عن `PAYMENT_ICONS` و`TimeFilter` و`relativeTime` يقصد أماكنها الجديدة دي.

- **النمط المتبع:** هذه الصفحة تتبع نمط الصفحات في Vuno — مكون افتراضي (default export)، استيراد من `@/` alias، استخدام متغيرات CSS `--vuno-*` للألوان، وFramer Motion لحركات الدخول.
- **التوافق مع React Compiler:** تم التأكد من عدم استخدام `Math.random()` أو `Date.now()` أثناء الـ render (تستخدم `generateId` / `generateNumericId` بدلاً منها)، وعدم استخدام `useEffect` + `setState` للقيم المشتقة (تستخدم `useMemo` بدلاً من ذلك).
- **دعم RTL:** الواجهة بالكامل بالعربية مع `dir="rtl"`، باستثناء الأرقام والهواتف التي تستخدم `dir="ltr"` و`tabular-nums`.
- **الاستجابة (Responsiveness):** بعض الصفحات تستخدم `useDeviceType` للتكيف مع أحجام الشاشات المختلفة (موبايل/تابلت/ديسكتوب).

## الارتباطات

- [الفهرس الرئيسي للصفحات](../PAGES.md)
- [وثيقة المكونات المشتركة](../COMPONENTS.md)
- [وثيقة السياقات (Contexts)](../CONTEXTS.md)
- [العودة للـ README](../../README.md)
