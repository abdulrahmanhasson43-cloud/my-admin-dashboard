# AppLayout — الهيكل العام للتطبيق

> **الملف:** `src/components/AppLayout.tsx` · **السطور:** ~358

## نظرة عامة

AppLayout هو المكون الأساسي الذي يغلّف جميع صفحات التطبيق. يوفر: شريط علوي (Top Bar) مع اسم المتجر والفرع الحالي وزر تبديل الثيم والإشعارات، قائمة جانبية (Sidebar) للديسكتوب مع روابط التنقل (mainNavItems, moreSections)، شريط سفلي (Bottom Nav) للموبايل (bottomNavItems)، ومنطقة محتوى رئيسية تُعرض فيها الصفحات. يدعم تبديل الثيم (فاتح/داكن) عبر useTheme، وعرض اسم الفرع الحالي عبر useBranch. يتكيف مع حجم الشاشة: قائمة جانبية على الديسكتوب، شريط سفلي على الموبايل. يستخدم useAppSettings لعرض إعدادات مثل اسم المتجر.

## الصادرات (Exports)

`AppLayout (default)`

## المستهلكون (Consumers)

- `App.tsx (يغلّف جميع الصفحات داخل <AppLayout>)`

## السياقات (Contexts) المستخدمة

`useTheme, useAppSettings, useBranch`

## ملاحظات للمطور

- **إعادة الاستخدام:** هذا المكون مشترك (shared component) مصمم لإعادة الاستخدام عبر صفحات متعددة.
- **التصميم:** يستخدم متغيرات CSS `--vuno-*` للألوان، وفئات Tailwind للتنسيق، و`card-vuno` للبطاقات.
- **التوافق مع React Compiler:** تم التأكد من توافق المكون مع قواعد React Compiler (لا Math.random/Date.now أثناء الـ render، لا useEffect+setState للقيم المشتقة).
- **eslint-disable-next-line:** بعض المكونات تحتوي على تعليقات `eslint-disable-next-line react-refresh/only-export-components` لأنها تصدِّر كيانات غير مكونات (مثل defaultReceiptSettings) وهذا مقصود للتصميم.

## الارتباطات

- [الفهرس الرئيسي للمكونات](../COMPONENTS.md)
- [وثيقة نظام التصميم](../DESIGN-SYSTEM.md)
- [العودة للـ README](../../README.md)
