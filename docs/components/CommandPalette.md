# CommandPalette — لوحة الأوامر السريعة

> **الملف:** `src/components/CommandPalette.tsx` · **السطور:** ~216

## نظرة عامة

CommandPalette هو لوحة أوامر سريعة (Cmd+K / Ctrl+K) مبنية على مكتبة cmdk. تتيح البحث السريع عن الصفحات والإجراءات والتنقل إليها بلوحة المفاتيح. تعرض قائمة بجميع روابط التنقل (من navigation.ts) مع أيقونات ووصف. تدعم تصفية النتائج أثناء الكتابة، التنقل بالأسهم، والاختيار بـ Enter. تُفتح/تُغلق عبر useCommandPalette hook الذي يستمع لاختصار Ctrl+K/Cmd+K. تصميم أنيق مع AnimatePresence لحركات الفتح/الإغلاق.

## الصادرات (Exports)

`CommandPalette (default)`

## المستهلكون (Consumers)

- `App.tsx (عبر CommandPaletteOverlay)`

## السياقات (Contexts) المستخدمة

`useCommandPalette (من hooks/useCommandPalette)`

## ملاحظات للمطور

- **إعادة الاستخدام:** هذا المكون مشترك (shared component) مصمم لإعادة الاستخدام عبر صفحات متعددة.
- **التصميم:** يستخدم متغيرات CSS `--vuno-*` للألوان، وفئات Tailwind للتنسيق، و`card-vuno` للبطاقات.
- **التوافق مع React Compiler:** تم التأكد من توافق المكون مع قواعد React Compiler (لا Math.random/Date.now أثناء الـ render، لا useEffect+setState للقيم المشتقة).
- **eslint-disable-next-line:** بعض المكونات تحتوي على تعليقات `eslint-disable-next-line react-refresh/only-export-components` لأنها تصدِّر كيانات غير مكونات (مثل defaultReceiptSettings) وهذا مقصود للتصميم.

## الارتباطات

- [الفهرس الرئيسي للمكونات](../COMPONENTS.md)
- [وثيقة نظام التصميم](../DESIGN-SYSTEM.md)
- [العودة للـ README](../../README.md)
