# SectionCard — بطاقة قسم

> **الملف:** `src/components/SectionCard.tsx` · **السطور:** ~13

## نظرة عامة

SectionCard هو مكون بسيط جداً (13 سطر) يوفر بطاقة قسم موحدة. يستقبل title وchildren وicon (اختياري). يعرض عنوان القسم مع أيقونة ومحتوى القسم في بطاقة بأسلوب card-vuno. يُستخدم في SettingsPage وProfilePage لتنظيم الإعدادات في أقسام مرئية واضحة. مكون تقديمي خفيف يضمن اتساق تصميم بطاقات الأقسام عبر التطبيق.

## الصادرات (Exports)

`SectionCard (default)`

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
