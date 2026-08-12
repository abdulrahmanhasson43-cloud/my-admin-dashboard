# BarcodeScannerModal — نافذة مسح الباركود

> **الملف:** `src/components/BarcodeScannerModal.tsx` · **السطور:** ~128

## نظرة عامة

BarcodeScannerModal هو نافذة منبثقة لمحاكاة مسح الباركود. في الوضع الحالي، تعرض حقلاً لإدخال الباركود يدوياً (محاكاة لماسح الباركود الفعلي). عند إدخال باركود، تستدعي callback onScan التي تمررها POSPage للبحث عن المنتج وإضافته للسلة. تحتوي على نقطة تكامل واضحة لربط ماسح باركود فعلي عبر Web API أو مكتبة خارجية في المستقبل. تصميم بسيط مع Framer Motion وزر إغلاق.

## الصادرات (Exports)

`BarcodeScannerModal (default)`

## المستهلكون (Consumers)

- `POSPage`

## السياقات (Contexts) المستخدمة

`— (يستخدم props callbacks)`

## ملاحظات للمطور

- **إعادة الاستخدام:** هذا المكون مشترك (shared component) مصمم لإعادة الاستخدام عبر صفحات متعددة.
- **التصميم:** يستخدم متغيرات CSS `--vuno-*` للألوان، وفئات Tailwind للتنسيق، و`card-vuno` للبطاقات.
- **التوافق مع React Compiler:** تم التأكد من توافق المكون مع قواعد React Compiler (لا Math.random/Date.now أثناء الـ render، لا useEffect+setState للقيم المشتقة).
- **eslint-disable-next-line:** بعض المكونات تحتوي على تعليقات `eslint-disable-next-line react-refresh/only-export-components` لأنها تصدِّر كيانات غير مكونات (مثل defaultReceiptSettings) وهذا مقصود للتصميم.

## الارتباطات

- [الفهرس الرئيسي للمكونات](../COMPONENTS.md)
- [وثيقة نظام التصميم](../DESIGN-SYSTEM.md)
- [العودة للـ README](../../README.md)
