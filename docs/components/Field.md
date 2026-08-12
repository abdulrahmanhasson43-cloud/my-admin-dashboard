# Field — حقل إدخال موحد

> **الملف:** `src/components/Field.tsx` · **السطور:** ~29

## نظرة عامة

Field هو مكون حقل إدخال موحد. يستقبل label, value, onChange, type, placeholder, وhint (اختياري). يعرض تسمية الحقل وحقل الإدخال مع دعم أنواع متعددة (text, number, email, tel, password). يدعم عرض تلميح (hint) تحت الحقل. مكون خفيف (29 سطر) يضمن اتساق تصميم حقول الإدخال في صفحات الإعدادات والملف الشخصي. يستخدم متغيرات --vuno-* للألوان والحدود.

## الصادرات (Exports)

`Field (default)`

## المستهلكون (Consumers)

- `SettingsPage`
- `ProfilePage`

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
