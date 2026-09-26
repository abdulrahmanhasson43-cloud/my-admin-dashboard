# SalesGoalWidget — ودجت هدف المبيعات

> **الملف:** `src/components/SalesGoalWidget.tsx` · **السطور:** ~161

## نظرة عامة

SalesGoalWidget يعرض تقدم المبيعات نحو الهدف الشهري. يستهلك useSalesGoal للحصول على الهدف الشهري والمبيعات الحالية. يعرض: شريط تقدم دائري (Circular Progress) بنسبة الإنجاز، المبلغ الحالي مقابل الهدف، النسبة المئوية، والمتبقي. يتغير لون الشريط حسب نسبة الإنجاز (أحمر < 50%، أصفر 50-80%، أخضر > 80%). عند تجاوز الهدف، يعرض رسالة تهنئة. تصميم أنيق مع Framer Motion لتحريك شريط التقدم.

## الصادرات (Exports)

`SalesGoalWidget (default)`

## المستهلكون (Consumers)

- `DashboardPage`

## السياقات (Contexts) المستخدمة

`useSalesGoal`

## ملاحظات للمطور

- **إعادة الاستخدام:** هذا المكون مشترك (shared component) مصمم لإعادة الاستخدام عبر صفحات متعددة.
- **التصميم:** يستخدم متغيرات CSS `--vuno-*` للألوان، وفئات Tailwind للتنسيق، و`card-vuno` للبطاقات.
- **التوافق مع React Compiler:** تم التأكد من توافق المكون مع قواعد React Compiler (لا Math.random/Date.now أثناء الـ render، لا useEffect+setState للقيم المشتقة).
- **eslint-disable-next-line:** بعض المكونات تحتوي على تعليقات `eslint-disable-next-line react-refresh/only-export-components` لأنها تصدِّر كيانات غير مكونات (مثل defaultReceiptSettings) وهذا مقصود للتصميم.

## الارتباطات

- [الفهرس الرئيسي للمكونات](../COMPONENTS.md)
- [وثيقة نظام التصميم](../DESIGN-SYSTEM.md)
- [العودة للـ README](../../README.md)
