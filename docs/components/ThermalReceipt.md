# ThermalReceipt — الفاتورة الحرارية

> **الملف:** `src/components/ThermalReceipt.tsx` · **السطور:** ~401

## نظرة عامة

ThermalReceipt هو مكون الفاتورة الحرارية القابلة للطباعة على طابعات حرارية (58mm و80mm). يعرض الفاتورة بتنسيق حراري: اسم المتجر، التاريخ، رقم الفاتورة، قائمة المنتجات مع الكميات والأسعار، الإجمالي الفرعي، الضريبة، الخصم، الإجمالي النهائي، وطريقة الدفع. يدعم عرضين: 58mm و80mm. يتضمن ShareReceiptButton (مشاركة كصورة عبر Web Share API) وPrintReceiptButton (طباعة عبر window.print). يدعم print CSS مخصص عبر @media print. defaultReceiptSettings يوفر إعدادات افتراضية للفاتورة. يحتوي على eslint-disable-next-line لقاعدة react-refresh/only-export-components (مواقع متعددة).

## الصادرات (Exports)

`ThermalReceipt (default), ShareReceiptButton, PrintReceiptButton, defaultReceiptSettings`

## المستهلكون (Consumers)

- `POSPage`
- `SettingsPage (معاينة)`

## السياقات (Contexts) المستخدمة

`— (يستخدم props)`

## ملاحظات للمطور

- **إعادة الاستخدام:** هذا المكون مشترك (shared component) مصمم لإعادة الاستخدام عبر صفحات متعددة.
- **التصميم:** يستخدم متغيرات CSS `--vuno-*` للألوان، وفئات Tailwind للتنسيق، و`card-vuno` للبطاقات.
- **التوافق مع React Compiler:** تم التأكد من توافق المكون مع قواعد React Compiler (لا Math.random/Date.now أثناء الـ render، لا useEffect+setState للقيم المشتقة).
- **eslint-disable-next-line:** بعض المكونات تحتوي على تعليقات `eslint-disable-next-line react-refresh/only-export-components` لأنها تصدِّر كيانات غير مكونات (مثل defaultReceiptSettings) وهذا مقصود للتصميم.

## الارتباطات

- [الفهرس الرئيسي للمكونات](../COMPONENTS.md)
- [وثيقة نظام التصميم](../DESIGN-SYSTEM.md)
- [العودة للـ README](../../README.md)
