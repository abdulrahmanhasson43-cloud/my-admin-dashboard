# DataBackupSection — قسم النسخ الاحتياطي

> **الملف:** `src/components/DataBackupSection.tsx` · **السطور:** ~153

## نظرة عامة

DataBackupSection هو قسم مخصص للنسخ الاحتياطي والاستعادة في صفحة الإعدادات. يتيح: تصدير جميع البيانات من localStorage إلى ملف JSON (Backup)، استيراد البيانات من ملف JSON (Restore)، ومسح جميع البيانات (Reset). يعرض حجم البيانات الحالية وتاريخ آخر نسخة احتياطية. يستخدم localStorage مباشرة لقراءة/كتابة جميع المفاتيح. يتضمن تأكيدات عبر window.confirm للعمليات الخطرة (الاستعادة والمسح). تصميم أنيق مع أيقونات وأزرار واضحة.

## الصادرات (Exports)

`DataBackupSection (default)`

## المستهلكون (Consumers)

- `SettingsPage`

## السياقات (Contexts) المستخدمة

`— (يستخدم localStorage مباشرة)`

## ملاحظات للمطور

- **إعادة الاستخدام:** هذا المكون مشترك (shared component) مصمم لإعادة الاستخدام عبر صفحات متعددة.
- **التصميم:** يستخدم متغيرات CSS `--vuno-*` للألوان، وفئات Tailwind للتنسيق، و`card-vuno` للبطاقات.
- **التوافق مع React Compiler:** تم التأكد من توافق المكون مع قواعد React Compiler (لا Math.random/Date.now أثناء الـ render، لا useEffect+setState للقيم المشتقة).
- **eslint-disable-next-line:** بعض المكونات تحتوي على تعليقات `eslint-disable-next-line react-refresh/only-export-components` لأنها تصدِّر كيانات غير مكونات (مثل defaultReceiptSettings) وهذا مقصود للتصميم.

## الارتباطات

- [الفهرس الرئيسي للمكونات](../COMPONENTS.md)
- [وثيقة نظام التصميم](../DESIGN-SYSTEM.md)
- [العودة للـ README](../../README.md)
