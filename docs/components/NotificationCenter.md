# NotificationCenter — مركز الإشعارات

> **الملف:** `src/components/NotificationCenter.tsx` · **السطور:** ~215

## نظرة عامة

NotificationCenter يعرض قائمة بالإشعارات (تنبيهات المخزون المنخفض، فتح/إغلاق الورديات، المبيعات، إلخ). يستهلك useNotifications للحصول على قائمة الإشعارات ودوال إدارتها (markAllAsRead, clearAll). يعرض عداداً للإشعارات غير المقروءة، قائمة قابلة للتمرير مع أيقونات ملوّنة حسب النوع، وأزرار لتحديد الكل كمقروء ومسح الكل. يدعم النقر على إشعار للتنقل إلى صفحته المرتبطة (link). تصميم منسدل (dropdown) مع AnimatePresence.

## الصادرات (Exports)

`NotificationCenter (default)`

## المستهلكون (Consumers)

- `DashboardPage`
- `AppLayout`

## السياقات (Contexts) المستخدمة

`useNotifications`

## ملاحظات للمطور

- **إعادة الاستخدام:** هذا المكون مشترك (shared component) مصمم لإعادة الاستخدام عبر صفحات متعددة.
- **التصميم:** يستخدم متغيرات CSS `--vuno-*` للألوان، وفئات Tailwind للتنسيق، و`card-vuno` للبطاقات.
- **التوافق مع React Compiler:** تم التأكد من توافق المكون مع قواعد React Compiler (لا Math.random/Date.now أثناء الـ render، لا useEffect+setState للقيم المشتقة).
- **eslint-disable-next-line:** بعض المكونات تحتوي على تعليقات `eslint-disable-next-line react-refresh/only-export-components` لأنها تصدِّر كيانات غير مكونات (مثل defaultReceiptSettings) وهذا مقصود للتصميم.

## الارتباطات

- [الفهرس الرئيسي للمكونات](../COMPONENTS.md)
- [وثيقة نظام التصميم](../DESIGN-SYSTEM.md)
- [العودة للـ README](../../README.md)
